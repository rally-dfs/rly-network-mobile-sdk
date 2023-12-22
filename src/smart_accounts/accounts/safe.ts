import { Contract, ethers, Wallet } from 'ethers';
import type { SmartAccountManager } from '../../smart_account';
import type { PrefixedHexString } from '../..//gsnClient/utils';
import type { UserOperation, Transaction } from '../utils/utils';
import {
  sendUserOperation,
  confirmUserOperation,
  userOpDefaults,
  estimateUserOperationGas,
  getUserOpHash,
  encodeMultiSendCallData,
} from '../utils/utils';
import type { Network } from '../../network';
import CandideFactory from '../../contracts/smartAccounts/candideFactoryData.json';
import Candide from '../../contracts/smartAccounts/candideData.json';
import MultiSend from '../../contracts/smartAccounts/multiSendData.json';

const getAccountAddress = async (
  owner: PrefixedHexString,
  network: Network
): Promise<PrefixedHexString> => {
  const { config } = network;
  const provider = new ethers.providers.JsonRpcProvider(config.gsn.rpcUrl);

  const factory = new Contract(
    config.aa.candideFactoryAddress,
    CandideFactory.abi,
    provider
  );

  const candide = new Contract(
    config.aa.candideImplAddress,
    Candide.abi,
    provider
  );

  const initializer = await candide.interface.encodeFunctionData(
    'setupWithEntrypoint',
    [
      [owner],
      1,
      ethers.constants.AddressZero,
      '0x',
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      0,
      ethers.constants.AddressZero,
      config.aa.entrypointAddress,
    ]
  );

  const deploymentCode = ethers.utils.solidityPack(
    ['bytes', 'uint256'],
    [await factory.proxyCreationCode(), config.aa.candideImplAddress]
  );
  const salt = ethers.utils.solidityKeccak256(
    ['bytes32', 'uint256'],
    [ethers.utils.solidityKeccak256(['bytes'], [initializer]), 0]
  );
  return ethers.utils.getCreate2Address(
    factory.address,
    salt,
    ethers.utils.keccak256(deploymentCode)
  ) as PrefixedHexString;
};

const getAccount = async (
  address: PrefixedHexString,
  network: Network
): Promise<Contract> => {
  const { config } = network;
  const provider = new ethers.providers.JsonRpcProvider(config.gsn.rpcUrl);

  return new Contract(address, Candide.abi, provider);
};

const createUserOperation = async (
  owner: Wallet,
  to: PrefixedHexString,
  value: string,
  callData: PrefixedHexString,
  network: Network
): Promise<UserOperation> => {
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
): Promise<UserOperation> => {
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
  const signedOp = await signUserOperation(owner, op, network);
  return await sendUserOperation(signedOp, network);
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
  const signedOp = await signUserOperation(owner, op, network);
  return sendUserOperation(signedOp, network);
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

const getInitCode = async (
  owner: PrefixedHexString,
  network: Network
): Promise<PrefixedHexString> => {
  const { config } = network;
  const provider = new ethers.providers.JsonRpcProvider(config.gsn.rpcUrl);

  const factory = new Contract(
    config.aa.candideFactoryAddress,
    CandideFactory.abi,
    provider
  );

  const candide = new Contract(
    config.aa.candideImplAddress,
    Candide.abi,
    provider
  );

  const initializer = await candide.interface.encodeFunctionData(
    'setupWithEntrypoint',
    [
      [owner],
      1,
      ethers.constants.AddressZero,
      '0x',
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      0,
      ethers.constants.AddressZero,
      config.aa.entrypointAddress,
    ]
  );

  return ethers.utils.hexConcat([
    config.aa.candideFactoryAddress,
    factory.interface.encodeFunctionData('createProxyWithNonce', [
      config.aa.candideImplAddress,
      initializer,
      0,
    ]),
  ]) as PrefixedHexString;
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
    config.aa.candideImplAddress,
    Candide.abi,
    provider
  );

  return (await scwImpl.interface.encodeFunctionData(
    'execTransactionFromEntrypoint',
    [
      to,
      ethers.utils.parseEther(value),
      callData,
      0,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      0,
    ]
  )) as PrefixedHexString;
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
    config.aa.candideImplAddress,
    Candide.abi,
    provider
  );

  const multiSend = new Contract(
    config.aa.safeMultiSendAddress,
    MultiSend.abi,
    provider
  );

  let transactions: Transaction[] = [];

  for (let i = 0; i < to.length; i++) {
    transactions.push({
      to: to[i] || (ethers.constants.AddressZero as PrefixedHexString),
      value: ethers.utils.parseEther((value[i] && value[i]) || '0').toString(),
      data: callData[i] || '0x',
      operation: 0,
    });
  }

  const callDataEncoded = encodeMultiSendCallData(transactions);

  const multiSendCallData = await multiSend.interface.encodeFunctionData(
    'multiSend',
    [callDataEncoded]
  );

  // get contract and encode send

  return (await scwImpl.interface.encodeFunctionData(
    'execTransactionBatchFromEntrypoint',
    [
      config.aa.safeMultiSendAddress,
      0,
      multiSendCallData,
      0,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      0,
    ]
  )) as PrefixedHexString;
};

export const SafeAccountManager: SmartAccountManager = {
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
