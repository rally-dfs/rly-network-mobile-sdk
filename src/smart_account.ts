import type { Contract, Wallet, Event } from 'ethers';
import type { Network } from './network';
import type { PrefixedHexString } from './gsnClient/utils';
import type { UserOperation } from './smart_accounts/utils/utils';

export interface SmartAccountManager {
  getAccountAddress: (
    owner: PrefixedHexString,
    network: Network
  ) => Promise<PrefixedHexString>;
  getAccount(account: PrefixedHexString, network: Network): Promise<Contract>;
  createUserOperation: (
    owner: Wallet,
    to: PrefixedHexString,
    value: string,
    callData: PrefixedHexString,
    network: Network
  ) => Promise<UserOperation>;
  createUserOperationBatch: (
    owner: Wallet,
    to: PrefixedHexString[],
    value: string[],
    callData: PrefixedHexString[],
    network: Network
  ) => Promise<UserOperation>;
  signUserOperation: (
    owner: Wallet,
    op: UserOperation,
    network: Network
  ) => Promise<UserOperation>;
  sendUserOperation: (
    userOp: UserOperation,
    network: Network
  ) => Promise<PrefixedHexString>;
  createAndSendUserOperation: (
    owner: Wallet,
    to: PrefixedHexString,
    value: string,
    callData: PrefixedHexString,
    network: Network
  ) => Promise<PrefixedHexString>;
  createAndSendUserOperationBatch: (
    owner: Wallet,
    to: PrefixedHexString[],
    value: string[],
    callData: PrefixedHexString[],
    network: Network
  ) => Promise<PrefixedHexString>;
  confirmUserOperation: (
    userOpHash: PrefixedHexString,
    network: Network
  ) => Promise<Event | null | undefined>;
}

export * from './smart_accounts/accounts/light_account';
export * from './smart_accounts/accounts/safe';
export * from './smart_accounts/accounts/kernel';
