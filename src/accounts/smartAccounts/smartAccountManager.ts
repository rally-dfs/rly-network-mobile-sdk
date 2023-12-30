import type { Contract, Wallet, Event } from 'ethers';
import type { NetworkConfig } from '../../network';
import type { PrefixedHexString } from '../../gsnClient/utils';
import type { UserOperation } from './common/common';

export interface SmartAccountManager {
  getAccountAddress: (
    owner: PrefixedHexString,
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

export * from './accounts/lightAccountManager';
export * from './accounts/safeAccountManager';
export * from './accounts/kernalAccountManager';
