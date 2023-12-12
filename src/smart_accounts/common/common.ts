import { ethers, Wallet, BigNumber, Contract, Event } from 'ethers';
import type { PrefixedHexString } from '../../gsnClient/utils';
import { BundlerJsonRpcProvider } from './bundlerProvider';
import type { SmartAccountManager } from 'src/smart_account';
import type { NetworkConfig } from '../../network_config/network_config';
import EntryPoint from '../../contracts/accountAbstraction/entryPointData.json';

export type UserOperation = {
  sender: PrefixedHexString;
  nonce: BigNumber;
  initCode: PrefixedHexString;
  callData: PrefixedHexString;
  callGasLimit: BigNumber;
  verificationGasLimit: BigNumber;
  preVerificationGas: BigNumber;
  maxFeePerGas: BigNumber;
  maxPriorityFeePerGas: BigNumber;
  paymasterAndData: PrefixedHexString;
  signature: PrefixedHexString;
};

export const userOpDefaults: UserOperation = {
  sender: ethers.constants.AddressZero,
  nonce: ethers.constants.Zero,
  initCode: '0x',
  callData: '0x',
  callGasLimit: BigNumber.from(0),
  verificationGasLimit: BigNumber.from(100000), // default verification gas. will add create2 cost (3200+200*length) if initCode exists
  preVerificationGas: BigNumber.from(21000), // should also cover calldata cost.
  maxFeePerGas: BigNumber.from(0),
  maxPriorityFeePerGas: BigNumber.from(1),
  paymasterAndData: '0x',
  signature: '0x',
};

export const createUserOperation = async (
  account: SmartAccountManager,
  owner: Wallet,
  network: NetworkConfig,
  callData: PrefixedHexString
): Promise<UserOperation> => {
  let op: UserOperation = userOpDefaults;
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);
  const bundlerProvider = new BundlerJsonRpcProvider(network.aa.bundlerRpcUrl);
  const sender = await account.getAddress(
    owner.address as PrefixedHexString,
    network
  );
  const code = await provider.getCode(sender);

  op.sender = sender;

  //if account not created include init code in userop
  if (code === '0x') {
    op.initCode = await account.getInitCode(
      owner.address as PrefixedHexString,
      network
    );
    op.nonce = ethers.constants.Zero;

    const deployerAddress = op.initCode.substring(0, 42);
    const deployerCallData = '0x' + op.initCode.substring(42);

    const initEstimate = await provider.estimateGas({
      to: deployerAddress,
      data: deployerCallData,
    });

    op.verificationGasLimit = op.verificationGasLimit.add(initEstimate);
  } else {
    const scw = await account.getAccount(sender, network);

    op.nonce = await scw.getNonce();
  }

  op.callData = callData;

  const block = await provider.getBlock('latest');
  op.maxFeePerGas = block.baseFeePerGas!.add(op.maxPriorityFeePerGas);

  const { preVerificationGas, verificationGasLimit, callGasLimit } =
    await bundlerProvider.send('eth_estimateUserOperationGas', [
      OpToJSON(op),
      network.aa.entrypointAddress,
    ]);

  op.preVerificationGas = op.preVerificationGas.add(
    BigNumber.from(preVerificationGas)
  );
  op.verificationGasLimit = BigNumber.from(verificationGasLimit);
  op.callGasLimit = BigNumber.from(callGasLimit);

  const chainId = await provider.getNetwork().then((n) => n.chainId);

  const userOpHash = await getUserOpHash(
    op,
    network.aa.entrypointAddress,
    chainId
  );

  const sig = await owner.signMessage(ethers.utils.arrayify(userOpHash));
  op.signature = sig as PrefixedHexString;
  return op;
};

export const sendUserOperation = async (
  userOp: UserOperation,
  network: NetworkConfig
): Promise<PrefixedHexString> => {
  const bundlerProvider = new BundlerJsonRpcProvider(network.aa.bundlerRpcUrl);
  return bundlerProvider.send('eth_sendUserOperation', [
    OpToJSON(userOp),
    network.aa.entrypointAddress,
  ]);
};

export const confirmUserOperation = async (
  userOpHash: PrefixedHexString,
  network: NetworkConfig
): Promise<Event | null | undefined> => {
  const waitTimeoutMs = 30000;
  const waitIntervalMs = 1000;
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);
  const entryPoint = new Contract(
    network.aa.entrypointAddress,
    EntryPoint.abi,
    provider
  );
  const end = Date.now() + waitTimeoutMs;
  const block = await provider.getBlock('latest');
  while (Date.now() < end) {
    const events = await entryPoint.queryFilter(
      // @ts-ignore
      entryPoint.filters.UserOperationEvent(userOpHash),
      Math.max(0, block.number - 100)
    );
    if (events.length > 0) {
      return events[0];
    }
    await new Promise((resolve) => setTimeout(resolve, waitIntervalMs));
  }

  return null;
};

export const getUserOperationReceipt = async (
  userOpHash: PrefixedHexString,
  network: NetworkConfig
) => {
  const bundlerProvider = new BundlerJsonRpcProvider(network.aa.bundlerRpcUrl);
  return bundlerProvider.send('eth_getUserOperationReceipt', [userOpHash]);
};

export const OpToJSON = (op: UserOperation): UserOperation => {
  return Object.keys(op)
    .map((key) => {
      let val = (op as any)[key];
      if (typeof val !== 'string' || !val.startsWith('0x')) {
        val = ethers.utils.hexValue(val);
      }
      return [key, val];
    })
    .reduce(
      (set, [k, v]) => ({
        ...set,
        [k]: v,
      }),
      {}
    ) as UserOperation;
};

export function packUserOp(op: UserOperation, forSignature = true): string {
  if (forSignature) {
    return ethers.utils.defaultAbiCoder.encode(
      [
        'address',
        'uint256',
        'bytes32',
        'bytes32',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'bytes32',
      ],
      [
        op.sender,
        op.nonce,
        ethers.utils.keccak256(op.initCode),
        ethers.utils.keccak256(op.callData),
        op.callGasLimit,
        op.verificationGasLimit,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
        ethers.utils.keccak256(op.paymasterAndData),
      ]
    );
  } else {
    // for the purpose of calculating gas cost encode also signature (and no keccak of bytes)
    return ethers.utils.defaultAbiCoder.encode(
      [
        'address',
        'uint256',
        'bytes',
        'bytes',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'bytes',
        'bytes',
      ],
      [
        op.sender,
        op.nonce,
        op.initCode,
        op.callData,
        op.callGasLimit,
        op.verificationGasLimit,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
        op.paymasterAndData,
        op.signature,
      ]
    );
  }
}

export function getUserOpHash(
  op: UserOperation,
  entryPoint: string,
  chainId: number
): string {
  const userOpHash = ethers.utils.keccak256(packUserOp(op, true));
  const enc = ethers.utils.defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256'],
    [userOpHash, entryPoint, chainId]
  );
  return ethers.utils.keccak256(enc);
}
