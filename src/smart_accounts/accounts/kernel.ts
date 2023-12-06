import { Contract, ethers } from 'ethers';
import type { SmartAccountManager } from '../../smart_account';
import type { PrefixedHexString } from 'src/gsnClient/utils';
import type { NetworkConfig } from '../../network_config/network_config';
import { sendUserOperation, confirmUserOperation } from '../common/common';
import KernalFactory from '../../contracts/smartAccounts/kernalFactoryData.json';
import Kernal from '../../contracts/smartAccounts/kernalData.json';

const getAddress = async (
  account: PrefixedHexString,
  network: NetworkConfig
): Promise<PrefixedHexString> => {
  // ...
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const factory = new Contract(
    network.aa.kernalFactoryAddress,
    KernalFactory.abi,
    provider
  );

  const kernal = new Contract(
    network.aa.kernalImplAddress,
    Kernal.abi,
    provider
  );

  const data = await kernal.interface.encodeFunctionData('initialize', [
    network.aa.kernalECDSAValidatorAddress,
    account,
  ]);

  return factory.getAccountAddress?.(data, 0);
};

const getAccount = async (
  address: PrefixedHexString,
  network: NetworkConfig
): Promise<Contract> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  return new Contract(address, Kernal.abi, provider);
};

export const KernelAccountManager: SmartAccountManager = {
  getAddress: getAddress,
  getAccount: getAccount,
  sendUserOperation: sendUserOperation,
  confirmUserOperation: confirmUserOperation,
};
