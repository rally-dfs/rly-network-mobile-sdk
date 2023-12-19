import { Contract, ethers, Wallet } from 'ethers';
import type { SmartAccountManager } from '../../smart_account';
import type { PrefixedHexString } from '../../gsnClient/utils';
import type { NetworkConfig } from '../../network_config/network_config';
import LightAccountFactory from '../../contracts/smartAccounts/lightAccountFactoryData.json';
import LightAccount from '../../contracts/smartAccounts/lightAccountData.json';
import {
  sendUserOperation,
  confirmUserOperation,
  createUserOperation as defaultCreateUserOperation,
} from '../common/common';

const getAddress = async (
  account: PrefixedHexString,
  network: NetworkConfig
): Promise<PrefixedHexString> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const factory = new Contract(
    network.aa.lightAccountFactoryAddress,
    LightAccountFactory.abi,
    provider
  );

  return factory.getAddress?.(account, 0);
};

const getAccount = async (
  address: PrefixedHexString,
  network: NetworkConfig
): Promise<Contract> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  return new Contract(address, LightAccount.abi, provider);
};

const getInitCode = async (
  owner: PrefixedHexString,
  network: NetworkConfig
): Promise<PrefixedHexString> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const factory = new Contract(
    network.aa.lightAccountFactoryAddress,
    LightAccountFactory.abi,
    provider
  );

  return ethers.utils.hexConcat([
    network.aa.lightAccountFactoryAddress,
    factory.interface.encodeFunctionData('createAccount', [owner, 0]),
  ]) as PrefixedHexString;
};

const getDummySignature = async (): Promise<PrefixedHexString> => {
  return '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c';
};

const signUserOperation = async (
  owner: Wallet,
  userOpHash: PrefixedHexString
): Promise<PrefixedHexString> => {
  const sig = (await owner.signMessage(
    ethers.utils.arrayify(userOpHash)
  )) as PrefixedHexString;
  return sig;
};

const getExecuteCall = async (
  to: PrefixedHexString,
  value: string,
  callData: PrefixedHexString,
  network: NetworkConfig
): Promise<PrefixedHexString> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const scwImpl = new Contract(
    network.aa.lightAccountImplAddress,
    LightAccount.abi,
    provider
  );

  return (await scwImpl.interface.encodeFunctionData('execute', [
    to,
    ethers.utils.parseEther(value),
    callData,
  ])) as PrefixedHexString;
};

export const LightAccountManager: SmartAccountManager = {
  getAddress: getAddress,
  getAccount: getAccount,
  getInitCode: getInitCode,
  getDummySignature: getDummySignature,
  getExecuteCall: getExecuteCall,
  signUserOperation: signUserOperation,
  sendUserOperation: sendUserOperation,
  confirmUserOperation: confirmUserOperation,
};
