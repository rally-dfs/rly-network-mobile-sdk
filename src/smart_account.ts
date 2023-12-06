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
  sendUserOperation: (userOp: UserOperation) => Promise<UserOperation>;
  confirmUserOperation: (operation: string) => Promise<string>;
}

export * from './smart_accounts/accounts/light_account';
export * from './smart_accounts/accounts/safe';
export * from './smart_accounts/accounts/kernel';
