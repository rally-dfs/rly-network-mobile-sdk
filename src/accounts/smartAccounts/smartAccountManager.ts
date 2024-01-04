import type { Contract, Wallet, Event } from 'ethers';
import type { Network } from '../../network';
import type { PrefixedHexString } from '../../gsnClient/utils';
import type { UserOperation } from './common/common';

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
  getUserOperationReceipt: (
    userOpHash: PrefixedHexString,
    network: Network
  ) => Promise<any>;
}

export * from './accounts/lightAccountManager';
export * from './accounts/safeAccountManager';
export * from './accounts/kernalAccountManager';
