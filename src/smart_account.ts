import type { Contract, Wallet, Event } from 'ethers';
import type { NetworkConfig } from './network_config/network_config';
import type { PrefixedHexString } from './gsnClient/utils';
import type { UserOperation } from './smart_accounts/utils/utils';

export interface SmartAccountManager {
  getAccountAddress: (
    account: PrefixedHexString,
    network: NetworkConfig
  ) => Promise<PrefixedHexString>;
  getAccount(
    account: PrefixedHexString,
    network: NetworkConfig
  ): Promise<Contract>;
  createUserOperation: (
    owner: Wallet,
    to: PrefixedHexString,
    value: string,
    callData: PrefixedHexString,
    network: NetworkConfig
  ) => Promise<UserOperation>;
  createUserOperationBatch: (
    owner: Wallet,
    to: PrefixedHexString[],
    value: string[],
    callData: PrefixedHexString[],
    network: NetworkConfig
  ) => Promise<UserOperation>;
  signUserOperation: (
    owner: Wallet,
    op: UserOperation,
    network: NetworkConfig
  ) => Promise<UserOperation>;
  sendUserOperation: (
    userOp: UserOperation,
    network: NetworkConfig
  ) => Promise<PrefixedHexString>;
  createAndSendUserOperation: (
    owner: Wallet,
    to: PrefixedHexString,
    value: string,
    callData: PrefixedHexString,
    network: NetworkConfig
  ) => Promise<PrefixedHexString>;
  createAndSendUserOperationBatch: (
    owner: Wallet,
    to: PrefixedHexString[],
    value: string[],
    callData: PrefixedHexString[],
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
