/**
 * Configuration for how the wallet key should be stored. This includes whether to save to cloud and whether to reject if saving to cloud fails.
 *
 * @param saveToCloud Whether to save the mnemonic in a way that is eligible for device OS cloud storage.
 *   If set to `false`, the mnemonic will only be stored on device.
 *
 * @param rejectOnCloudSaveFailure Whether to raise an error if saving to cloud fails.
 *   If set to `false`, the mnemonic will silently fall back to local on-device-only storage.
 *
 * @remarks
 * Please note that when transitioning `KeyStorageConfig.saveToCloud` from `false` to `true`, the wallet will be moved to cross-device sync.
 * This can overwrite a device-only wallet your user might have on a different device. Ensure you properly communicate to end users
 * that moving to cloud storage could cause issues if they currently have different wallets on different devices.
 *
 * **Important Considerations for `saveToCloud`:**
 *
 * 1. Keys are stored using the OS-provided cross-device backup mechanism. This mechanism is controlled by user and app preferences and can be disabled.
 * 2. On Android, the backup mechanism is Blockstore, requiring the user to be logged into their Play account and have a device PIN code or password set.
 * 3. On iOS, the backup mechanism is iCloud Keychain, requiring the user to be logged into iCloud and have iCloud backup enabled.
 */
export interface KeyStorageConfig {
  saveToCloud: boolean;
  rejectOnCloudSaveFailure: boolean;
}
