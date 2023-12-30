import type { Wallet, Contract, BigNumber, Event } from 'ethers';
import type { NetworkConfig } from '../../network';
import type { SmartAccountManager } from './smartAccountManager';
import type { PrefixedHexString } from 'src/gsnClient/utils';
import type { UserOperation } from './common/common';
import {
  LightAccountManager,
  KernelAccountManager,
  SafeAccountManager,
} from './smartAccountManager';
import {
  getBalance,
  getErc20BalanceDisplay,
  getErc20BalanceExact,
  getTransferTx,
  getClaimRlyTx,
} from './common/accountTransaction';

class SmartAccount {
  private owner: Wallet;
  private network: NetworkConfig;
  private smartAccountManager: SmartAccountManager;
  constructor(
    owner: Wallet,
    network: NetworkConfig,
    smartAccountManager: SmartAccountManager
  ) {
    this.owner = owner;
    this.network = network;
    this.smartAccountManager = smartAccountManager;
  }
  async getAccountAddress(): Promise<PrefixedHexString> {
    return this.smartAccountManager.getAccountAddress(
      this.owner.address as PrefixedHexString,
      this.network
    );
  }
  async getAccount(): Promise<Contract> {
    return this.smartAccountManager.getAccount(
      this.owner.address as PrefixedHexString,
      this.network
    );
  }
  async createUserOperation(
    to: PrefixedHexString,
    value: string,
    callData: PrefixedHexString
  ): Promise<UserOperation> {
    return this.smartAccountManager.createUserOperation(
      this.owner,
      to,
      value,
      callData,
      this.network
    );
  }
  async createUserOperationBatch(
    to: PrefixedHexString[],
    value: string[],
    callData: PrefixedHexString[]
  ): Promise<UserOperation> {
    return this.smartAccountManager.createUserOperationBatch(
      this.owner,
      to,
      value,
      callData,
      this.network
    );
  }
  async signUserOperation(userOp: UserOperation): Promise<UserOperation> {
    return this.smartAccountManager.signUserOperation(
      this.owner,
      userOp,
      this.network
    );
  }
  async sendUserOperation(userOp: UserOperation): Promise<PrefixedHexString> {
    return this.smartAccountManager.sendUserOperation(userOp, this.network);
  }

  async confirmUserOperation(
    userOpHash: PrefixedHexString
  ): Promise<Event | null | undefined> {
    return this.smartAccountManager.confirmUserOperation(
      userOpHash,
      this.network
    );
  }

  async createAndSendUserOperation(
    to: PrefixedHexString,
    value: string,
    callData: PrefixedHexString
  ): Promise<PrefixedHexString> {
    return this.smartAccountManager.createAndSendUserOperation(
      this.owner,
      to,
      value,
      callData,
      this.network
    );
  }
  async createAndSendUserOperationBatch(
    to: PrefixedHexString[],
    value: string[],
    callData: PrefixedHexString[]
  ): Promise<PrefixedHexString> {
    return this.smartAccountManager.createAndSendUserOperationBatch(
      this.owner,
      to,
      value,
      callData,
      this.network
    );
  }
  getBalance = getBalance;
  getErc20BalanceDisplay = getErc20BalanceDisplay;
  getErc20BalanceExact = getErc20BalanceExact;
  async transferErc2020(
    to: PrefixedHexString,
    amount: BigNumber,
    tokenAddress?: PrefixedHexString
  ): Promise<PrefixedHexString> {
    tokenAddress = tokenAddress || this.network.contracts.rlyERC20;
    const data = (await getTransferTx(
      to,
      amount,
      this.network,
      tokenAddress
    )) as PrefixedHexString;
    return this.createAndSendUserOperation(tokenAddress, '0', data);
  }

  async claimRly() {
    const data = (await getClaimRlyTx(this.network)) as PrefixedHexString;
    return this.createAndSendUserOperation(
      this.network.contracts.tokenFaucet,
      '0',
      data
    );
  }
}

export class LightAccount extends SmartAccount {
  constructor(owner: Wallet, network: NetworkConfig) {
    super(owner, network, LightAccountManager);
  }
}

export class KernalAccount extends SmartAccount {
  constructor(owner: Wallet, network: NetworkConfig) {
    super(owner, network, KernelAccountManager);
  }
}

export class SafeAccount extends SmartAccount {
  constructor(owner: Wallet, network: NetworkConfig) {
    super(owner, network, SafeAccountManager);
  }
}
