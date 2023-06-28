export type KeyStorageConfig = {
  saveToCloud: boolean;
  rejectOnCloudSaveFailure: boolean;
}

export interface KeyManager {
  getMnemonic: () => Promise<string | null>;
  generateMnemonic: () => Promise<string>;
  saveMnemonic: (mnemonic: string, options?: KeyStorageConfig) => Promise<void>;
  deleteMnemonic: () => Promise<void>;
  getPrivateKeyFromMnemonic: (mnemonic: string) => Promise<Uint8Array>;
}

export type KeychainAccessibilityConstant = number;

export const AFTER_FIRST_UNLOCK: KeychainAccessibilityConstant = 0;
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: KeychainAccessibilityConstant = 1;
export const ALWAYS: KeychainAccessibilityConstant = 2;
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: KeychainAccessibilityConstant = 3;
export const ALWAYS_THIS_DEVICE_ONLY: KeychainAccessibilityConstant = 4;
export const WHEN_UNLOCKED: KeychainAccessibilityConstant = 5;
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY: KeychainAccessibilityConstant = 6;