import type { Contract } from 'ethers';
import type { NetworkConfig } from './network_config/network_config';
import type { PrefixedHexString } from './gsnClient/utils';
import type { UserOperation } from './smart_accounts/common/common';

export interface SmartAccountManager {
  getAddress: (
    account: PrefixedHexString,
    network: NetworkConfig
  ) => Promise<PrefixedHexString>;
  getAccount(
    account: PrefixedHexString,
    network: NetworkConfig
  ): Promise<Contract>;
  getInitCode(
    owner: PrefixedHexString,
    network: NetworkConfig
  ): Promise<PrefixedHexString>;
  sendUserOperation: (
    userOp: UserOperation,
    network: NetworkConfig
  ) => Promise<PrefixedHexString>;
  confirmUserOperation: (
    userOpHash: PrefixedHexString,
    network: NetworkConfig
  ) => Promise<Event | null | undefined>;
}

export * from './smart_accounts/accounts/light_account';
export * from './smart_accounts/accounts/safe';
export * from './smart_accounts/accounts/kernel';
