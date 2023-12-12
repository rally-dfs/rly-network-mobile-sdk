import { Contract, ethers } from 'ethers';
import type { SmartAccountManager } from '../../smart_account';
import type { PrefixedHexString } from '../../gsnClient/utils';
import type { NetworkConfig } from '../../network_config/network_config';
import LightAccountFactory from '../../contracts/smartAccounts/lightAccountFactoryData.json';
import LightAccount from '../../contracts/smartAccounts/lightAccountData.json';
import { sendUserOperation, confirmUserOperation } from '../common/common';

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

export const LightAccountManager: SmartAccountManager = {
  getAddress: getAddress,
  getAccount: getAccount,
  sendUserOperation: sendUserOperation,
  getInitCode: getInitCode,
  confirmUserOperation: confirmUserOperation,
};
