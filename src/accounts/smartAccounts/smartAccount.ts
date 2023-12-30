import type { Wallet, Contract, Event } from 'ethers';
import type { Network, NetworkConfig } from '../../network';
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
  private network: Network;
  private config: NetworkConfig;
  private smartAccountManager: SmartAccountManager;
  constructor(
    owner: Wallet,
    network: Network,
    smartAccountManager: SmartAccountManager
  ) {
    this.owner = owner;
    this.network = network;
    this.config = network.config;
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

  async getUserOperationReceipt(userOpHash: PrefixedHexString): Promise<any> {
    return this.smartAccountManager.getUserOperationReceipt(
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
  async getBalance() {
    const address = await this.getAccountAddress();
    return getBalance(address, this.network.config);
  }

  async getErc20BalanceDisplay(tokenAddress?: PrefixedHexString) {
    const address = await this.getAccountAddress();
    return getErc20BalanceDisplay(address, this.network.config, tokenAddress);
  }
  async getErc20BalanceExact(tokenAddress?: PrefixedHexString) {
    const address = await this.getAccountAddress();
    return getErc20BalanceExact(address, this.network.config, tokenAddress);
  }
  async transferErc20(
    to: string,
    amount: number,
    tokenAddress?: PrefixedHexString
  ): Promise<PrefixedHexString> {
    tokenAddress = tokenAddress || this.config.contracts.rlyERC20;
    const data = (await getTransferTx(
      to,
      amount,
      this.config,
      tokenAddress
    )) as PrefixedHexString;
    return this.createAndSendUserOperation(tokenAddress, '0', data);
  }

  async claimRly() {
    const data = (await getClaimRlyTx(this.config)) as PrefixedHexString;
    return this.createAndSendUserOperation(
      this.config.contracts.tokenFaucet,
      '0',
      data
    );
  }
}

export class LightAccount extends SmartAccount {
  constructor(owner: Wallet, network: Network) {
    super(owner, network, LightAccountManager);
  }
}

export class KernalAccount extends SmartAccount {
  constructor(owner: Wallet, network: Network) {
    super(owner, network, KernelAccountManager);
  }
}

export class SafeAccount extends SmartAccount {
  constructor(owner: Wallet, network: Network) {
    super(owner, network, SafeAccountManager);
  }
}
