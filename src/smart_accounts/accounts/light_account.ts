import { Contract, ethers, Wallet } from 'ethers';
import type { SmartAccountManager } from '../../smart_account';
import type { PrefixedHexString } from '../../gsnClient/utils';
import type { Network } from '../../network';
import LightAccountFactory from '../../contracts/smartAccounts/lightAccountFactoryData.json';
import LightAccount from '../../contracts/smartAccounts/lightAccountData.json';
import type { UserOperation } from '../utils/utils';
import {
  sendUserOperation,
  confirmUserOperation,
  estimateUserOperationGas,
  userOpDefaults,
  getUserOpHash,
} from '../utils/utils';

const getAccountAddress = async (
  owner: PrefixedHexString,
  network: Network
): Promise<PrefixedHexString> => {
  const { config } = network;
  const provider = new ethers.providers.JsonRpcProvider(config.gsn.rpcUrl);

  const factory = new Contract(
    config.aa.lightAccountFactoryAddress,
    LightAccountFactory.abi,
    provider
  );

  return factory.getAddress?.(owner, 0);
};

const getAccount = async (
  address: PrefixedHexString,
  network: Network
): Promise<Contract> => {
  const { config } = network;
  const provider = new ethers.providers.JsonRpcProvider(config.gsn.rpcUrl);

  return new Contract(address, LightAccount.abi, provider);
};

const createUserOperation = async (
  owner: Wallet,
  to: PrefixedHexString,
  value: string,
  callData: PrefixedHexString,
  network: Network
) => {
  let op: UserOperation = await fillUserOperation(owner, network);
  op.callData = await getExecuteCall(to, value, callData, network);
  op = await estimateUserOperationGas(op, network);
  return op;
};

const createUserOperationBatch = async (
  owner: Wallet,
  to: PrefixedHexString[],
  value: string[],
  callData: PrefixedHexString[],
  network: Network
) => {
  let op: UserOperation = await fillUserOperation(owner, network);
  op.callData = await getExecuteBatchCall(to, value, callData, network);
  op = await estimateUserOperationGas(op, network);
  return op;
};

const signUserOperation = async (
  owner: Wallet,
  op: UserOperation,
  network: Network
): Promise<UserOperation> => {
  const { config } = network;
  const provider = new ethers.providers.JsonRpcProvider(config.gsn.rpcUrl);
  const chainId = await provider.getNetwork().then((n) => n.chainId);

  const userOpHash = (await getUserOpHash(
    op,
    config.aa.entrypointAddress,
    chainId
  )) as PrefixedHexString;

  const sig = (await owner.signMessage(
    ethers.utils.arrayify(userOpHash)
  )) as PrefixedHexString;
  op.signature = sig as PrefixedHexString;

  return op;
};

const createAndSendUserOperation = async (
  owner: Wallet,
  to: PrefixedHexString,
  value: string,
  callData: PrefixedHexString,
  network: Network
): Promise<PrefixedHexString> => {
  const op = await createUserOperation(owner, to, value, callData, network);
  await signUserOperation(owner, op, network);
  return sendUserOperation(op, network);
};

const createAndSendUserOperationBatch = async (
  owner: Wallet,
  to: PrefixedHexString[],
  value: string[],
  callData: PrefixedHexString[],
  network: Network
): Promise<PrefixedHexString> => {
  const op = await createUserOperationBatch(
    owner,
    to,
    value,
    callData,
    network
  );
  await signUserOperation(owner, op, network);
  return sendUserOperation(op, network);
};

const getInitCode = async (
  owner: PrefixedHexString,
  network: Network
): Promise<PrefixedHexString> => {
  const { config } = network;
  const provider = new ethers.providers.JsonRpcProvider(config.gsn.rpcUrl);

  const factory = new Contract(
    config.aa.lightAccountFactoryAddress,
    LightAccountFactory.abi,
    provider
  );

  return ethers.utils.hexConcat([
    config.aa.lightAccountFactoryAddress,
    factory.interface.encodeFunctionData('createAccount', [owner, 0]),
  ]) as PrefixedHexString;
};

const fillUserOperation = async (owner: Wallet, network: Network) => {
  const { config } = network;
  const provider = new ethers.providers.JsonRpcProvider(config.gsn.rpcUrl);
  let op: UserOperation = userOpDefaults;
  const sender = await getAccountAddress(
    owner.address as PrefixedHexString,
    network
  );
  op.sender = sender;

  const code = await provider.getCode(sender);

  //if account not created include init code in userop
  if (code === '0x') {
    op.initCode = await getInitCode(
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
    const scw = await getAccount(sender, network);
    op.nonce = await scw.getNonce();
  }
  op.signature = await getDummySignature();
  return op;
};

const getDummySignature = async (): Promise<PrefixedHexString> => {
  return '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c';
};

const getExecuteCall = async (
  to: PrefixedHexString,
  value: string,
  callData: PrefixedHexString,
  network: Network
): Promise<PrefixedHexString> => {
  const { config } = network;
  const provider = new ethers.providers.JsonRpcProvider(config.gsn.rpcUrl);

  const scwImpl = new Contract(
    config.aa.lightAccountImplAddress,
    LightAccount.abi,
    provider
  );

  return (await scwImpl.interface.encodeFunctionData('execute', [
    to,
    ethers.utils.parseEther(value),
    callData,
  ])) as PrefixedHexString;
};

const getExecuteBatchCall = async (
  to: PrefixedHexString[],
  value: string[],
  callData: PrefixedHexString[],
  network: Network
): Promise<PrefixedHexString> => {
  const { config } = network;
  const provider = new ethers.providers.JsonRpcProvider(config.gsn.rpcUrl);

  const scwImpl = new Contract(
    config.aa.lightAccountImplAddress,
    [
      {
        inputs: [
          {
            internalType: 'address[]',
            name: 'dest',
            type: 'address[]',
          },
          {
            internalType: 'uint256[]',
            name: 'value',
            type: 'uint256[]',
          },
          {
            internalType: 'bytes[]',
            name: 'func',
            type: 'bytes[]',
          },
        ],
        name: 'executeBatch',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    provider
  );

  return (await scwImpl.interface.encodeFunctionData('executeBatch', [
    to,
    value && value.map((v) => ethers.utils.parseEther(v)),
    callData,
  ])) as PrefixedHexString;
};

export const LightAccountManager: SmartAccountManager = {
  getAccountAddress: getAccountAddress,
  getAccount: getAccount,
  createUserOperation: createUserOperation,
  createUserOperationBatch: createUserOperationBatch,
  signUserOperation: signUserOperation,
  sendUserOperation: sendUserOperation,
  confirmUserOperation: confirmUserOperation,
  createAndSendUserOperation: createAndSendUserOperation,
  createAndSendUserOperationBatch: createAndSendUserOperationBatch,
};
