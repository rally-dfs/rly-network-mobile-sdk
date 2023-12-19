import { Contract, ethers, Wallet } from 'ethers';
import type { SmartAccountManager } from '../../smart_account';
import type { PrefixedHexString } from 'src/gsnClient/utils';
import type { NetworkConfig } from '../../network_config/network_config';
import { sendUserOperation, confirmUserOperation } from '../common/common';
import KernalFactory from '../../contracts/smartAccounts/kernelFactoryData.json';
import Kernel from '../../contracts/smartAccounts/kernelData.json';

const getAddress = async (
  owner: PrefixedHexString,
  network: NetworkConfig
): Promise<PrefixedHexString> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const factory = new Contract(
    network.aa.kernalFactoryAddress,
    KernalFactory.abi,
    provider
  );

  const kernal = new Contract(
    network.aa.kernalImplAddress,
    Kernel.abi,
    provider
  );

  const data = await kernal.interface.encodeFunctionData('initialize', [
    network.aa.kernalECDSAValidatorAddress,
    owner,
  ]);

  return factory.getAccountAddress?.(data, 0);
};

const getAccount = async (
  address: PrefixedHexString,
  network: NetworkConfig
): Promise<Contract> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  return new Contract(address, Kernel.abi, provider);
};

const getInitCode = async (
  owner: PrefixedHexString,
  network: NetworkConfig
): Promise<PrefixedHexString> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const factory = new Contract(
    network.aa.kernalFactoryAddress,
    KernalFactory.abi,
    provider
  );

  const kernal = new Contract(
    network.aa.kernalImplAddress,
    Kernel.abi,
    provider
  );

  const data = await kernal.interface.encodeFunctionData('initialize', [
    network.aa.kernalECDSAValidatorAddress,
    owner,
  ]);

  return ethers.utils.hexConcat([
    network.aa.kernalFactoryAddress,
    factory.interface.encodeFunctionData('createAccount', [
      network.aa.kernalImplAddress,
      data,
      0,
    ]),
  ]) as PrefixedHexString;
};
const getDummySignature = async (): Promise<PrefixedHexString> => {
  return '0x00000000870fe151d548a1c527c3804866fab30abf28ed17b79d5fc5149f19ca0819fefc3c57f3da4fdf9b10fab3f2f3dca536467ae44943b9dbb8433efe7760ddd72aaa1c';
};

const signUserOperation = async (
  owner: Wallet,
  userOpHash: PrefixedHexString
): Promise<PrefixedHexString> => {
  const userSig = await owner.signMessage(ethers.utils.arrayify(userOpHash));
  return ethers.utils.hexConcat([`0x00000000`, userSig]) as PrefixedHexString;
};

const getExecuteCall = async (
  to: PrefixedHexString,
  value: string,
  callData: PrefixedHexString,
  network: NetworkConfig
): Promise<PrefixedHexString> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const scwImpl = new Contract(
    network.aa.kernalImplAddress,
    Kernel.abi,
    provider
  );

  return (await scwImpl.interface.encodeFunctionData('execute', [
    to,
    ethers.utils.parseEther(value),
    callData,
    0,
  ])) as PrefixedHexString;
};

export const KernelAccountManager: SmartAccountManager = {
  getAddress: getAddress,
  getAccount: getAccount,
  getInitCode: getInitCode,
  getDummySignature: getDummySignature,
  getExecuteCall: getExecuteCall,
  signUserOperation: signUserOperation,
  sendUserOperation: sendUserOperation,
  confirmUserOperation: confirmUserOperation,
};
