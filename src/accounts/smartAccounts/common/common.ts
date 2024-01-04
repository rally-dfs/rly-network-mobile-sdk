import { ethers, providers, BigNumber, Contract, Event } from 'ethers';
import type { PrefixedHexString } from '../../../gsnClient/utils';
import { BundlerJsonRpcProvider } from './bundlerProvider';
import type { Network } from '../../../network';
import EntryPoint from '../../../contracts/accountAbstraction/entryPointData.json';

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
  callGasLimit: BigNumber.from(10000000),
  verificationGasLimit: BigNumber.from(110000), // default verification gas. will add create2 cost (3200+200*length) if initCode exists
  preVerificationGas: BigNumber.from(100000), // should also cover calldata cost.
  maxFeePerGas: BigNumber.from(50000),
  maxPriorityFeePerGas: BigNumber.from(1),
  paymasterAndData: '0x',
  signature: '0x',
};

export const estimateUserOperationGas = async (
  op: UserOperation,
  network: Network
): Promise<UserOperation> => {
  const { config } = network;
  const provider = new providers.JsonRpcProvider(config.gsn.rpcUrl);
  const bundlerProvider = new BundlerJsonRpcProvider(config.aa.bundlerRpcUrl);
  const { preVerificationGas, verificationGasLimit, callGasLimit } =
    await bundlerProvider.send('eth_estimateUserOperationGas', [
      OpToJSON(op),
      config.aa.entrypointAddress,
    ]);
  const [fee, block] = await Promise.all([
    provider.send('eth_maxPriorityFeePerGas', []),
    provider.getBlock('latest'),
  ]);

  const tip = ethers.BigNumber.from(fee);
  const buffer = tip.div(100).mul(13);
  const maxPriorityFeePerGas = tip.add(buffer);
  const maxFeePerGas = block.baseFeePerGas
    ? block.baseFeePerGas.mul(2).add(maxPriorityFeePerGas)
    : maxPriorityFeePerGas;
  op.maxFeePerGas = maxFeePerGas;
  op.maxPriorityFeePerGas = maxPriorityFeePerGas;
  op.preVerificationGas = op.preVerificationGas.add(
    BigNumber.from(preVerificationGas)
  );
  op.verificationGasLimit = BigNumber.from(verificationGasLimit);
  op.callGasLimit = BigNumber.from(callGasLimit);
  return op;
};

export const sendUserOperation = async (
  userOp: UserOperation,
  network: Network
): Promise<PrefixedHexString> => {
  const { config } = network;
  const bundlerProvider = new BundlerJsonRpcProvider(config.aa.bundlerRpcUrl);
  return bundlerProvider.send('eth_sendUserOperation', [
    OpToJSON(userOp),
    config.aa.entrypointAddress,
  ]);
};

export const confirmUserOperation = async (
  userOpHash: PrefixedHexString,
  network: Network
): Promise<Event | null | undefined> => {
  const { config } = network;
  const waitTimeoutMs = 30000;
  const waitIntervalMs = 1000;
  const provider = new ethers.providers.JsonRpcProvider(config.gsn.rpcUrl);
  const entryPoint = new Contract(
    config.aa.entrypointAddress,
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
  network: Network
) => {
  const { config } = network;
  const bundlerProvider = new BundlerJsonRpcProvider(config.aa.bundlerRpcUrl);
  // @ts-ignore
  const { receipt } = await bundlerProvider.send(
    'eth_getUserOperationReceipt',
    [userOpHash]
  );
  return receipt;
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
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256'],
    [userOpHash, entryPoint, chainId]
  );
  return ethers.utils.keccak256(encoded);
}

function encodeMultiSendTransaction(tx: Transaction): string {
  const data = tx.data;
  const encoded = ethers.utils.solidityPack(
    ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
    [tx.operation, tx.to, tx.value, data.length, data]
  );
  return encoded.slice(2);
}

export function encodeMultiSendCallData(txs: Transaction[]): string {
  return '0x' + txs.map((tx) => encodeMultiSendTransaction(tx)).join('');
}

export type Transaction = {
  to: PrefixedHexString;
  value: string;
  data: PrefixedHexString;
  operation: number;
};
