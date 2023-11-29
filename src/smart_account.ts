import type { Contract } from 'ethers';

export interface SmartAccountManager {
  getAddress: (address?: string, salt?: number) => Promise<string>;
  createAccount: (address?: string, salt?: number) => Promise<string>;
  getAccount(address: string): Promise<Contract>;
  sendUserOperation: (operation: string) => Promise<string>;
  confirmUserOperation: (operation: string) => Promise<string>;
  transferOwnership?: (newOwner: string) => Promise<string>;
}

export * from './smart_accounts/light_account';
export * from './smart_accounts/safe';
export * from './smart_accounts/kernel';
