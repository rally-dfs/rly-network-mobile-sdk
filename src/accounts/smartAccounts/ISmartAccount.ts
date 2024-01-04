import type { Contract, Event } from 'ethers';
import type { UserOperation } from './common/common';
import type { PrefixedHexString } from '../../gsnClient/utils';

export interface ISmartAccount {
  getAccountAddress(): Promise<PrefixedHexString>;
  getAccount(): Promise<Contract>;
  createUserOperation(
    to: PrefixedHexString,
    value: string,
    callData: PrefixedHexString
  ): Promise<UserOperation>;
  createUserOperationBatch(
    to: PrefixedHexString[],
    value: string[],
    callData: PrefixedHexString[]
  ): Promise<UserOperation>;
  signUserOperation(userOp: UserOperation): Promise<UserOperation>;
  sendUserOperation(userOp: UserOperation): Promise<PrefixedHexString>;
  confirmUserOperation(
    userOpHash: PrefixedHexString
  ): Promise<Event | null | undefined>;
  getUserOperationReceipt(userOpHash: PrefixedHexString): Promise<any>;
  createAndSendUserOperation(
    to: PrefixedHexString,
    value: string,
    callData: PrefixedHexString
  ): Promise<PrefixedHexString>;
  createAndSendUserOperationBatch(
    to: PrefixedHexString[],
    value: string[],
    callData: PrefixedHexString[]
  ): Promise<PrefixedHexString>;
  getBalance(): Promise<any>;
  getErc20BalanceDisplay(tokenAddress?: PrefixedHexString): Promise<any>;
  getErc20BalanceExact(tokenAddress?: PrefixedHexString): Promise<any>;
  transferErc20(
    to: string,
    amount: number,
    tokenAddress?: PrefixedHexString
  ): Promise<PrefixedHexString>;
  claimRly(): Promise<PrefixedHexString>;
}
