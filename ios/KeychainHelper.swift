import Foundation

final class KeychainHelper {
    static let standard = KeychainHelper()
    private init() {}

    func save(
      _ data: Data,
      service: String,
      account: String,
      saveToCloud: Bool
    ) {
        if (saveToCloud) {
            saveToiCloudKeychain(data, service: service, account: account)
        } else {
            saveToDeviceKeychain(data, service: service, account: account)
        }
    }

    func saveToiCloudKeychain(
      _ data: Data,
      service: String,
      account: String
    ) {
        let query = [
            kSecValueData: data,
            kSecAttrService: service,
            kSecAttrAccount: account,
            kSecAttrSynchronizable: true,
            kSecClass: kSecClassGenericPassword,
            kSecAttrAccessible: kSecAttrAccessibleWhenUnlocked,
        ] as CFDictionary

        // Add data in query to keychain
        let status = SecItemAdd(query, nil)

        if status == errSecDuplicateItem {
            // Item already exist, thus update it.
            let query = [
                kSecAttrService: service,
                kSecAttrAccount: account,
                kSecAttrSynchronizable: true,
                kSecClass: kSecClassGenericPassword,
            ] as CFDictionary

            let attributesToUpdate = [kSecValueData: data] as CFDictionary

            // Update existing item
            SecItemUpdate(query, attributesToUpdate)
        }
    }

    func saveToDeviceKeychain(
      _ data: Data,
      service: String,
      account: String
    ) {
        let query = [
            kSecValueData: data,
            kSecAttrService: service,
            kSecAttrAccount: account,
            kSecClass: kSecClassGenericPassword,
            kSecAttrAccessible: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
        ] as CFDictionary

        // Add data in query to keychain
        let status = SecItemAdd(query, nil)

        if status == errSecDuplicateItem {
            // Item already exist, thus update it.
            let query = [
                kSecAttrService: service,
                kSecAttrAccount: account,
                kSecClass: kSecClassGenericPassword,
            ] as CFDictionary

            let attributesToUpdate = [kSecValueData: data] as CFDictionary

            // Update existing item
            SecItemUpdate(query, attributesToUpdate)
        }
    }

    func readDeviceKeychainAttributes(service: String, account: String) -> [String: Any]? {
        let query = [
            kSecAttrService: service,
            kSecAttrAccount: account,
            kSecClass: kSecClassGenericPassword,
            kSecReturnAttributes: true
        ] as CFDictionary

        var result: AnyObject?
        SecItemCopyMatching(query, &result)

        return (result as? [String: Any])
    }

    func shouldMigrateToiCloudKeychain(service: String, account: String) -> Bool {
        let readResult = readDeviceKeychainAttributes(service: service, account: account)

        if (readResult == nil) {
            return false
        }

        let keyAccessibility = readResult?[kSecAttrAccessible as String] as? String

        // This will return true when the following conditions are met
        // Data is found
        // Data is saved with    kSecAttrSynchronizable: false
        // Data is saved with    kSecAttrAccessible: kSecAttrAccessibleWhenUnlocked,
        // These conditions are met with data intended to be saved to cloud on iOS
        // with RLY SDK versions prior to this fix

        return keyAccessibility == (kSecAttrAccessibleWhenUnlocked as String)
    }


    func read(service: String, account: String) -> Data? {
        let iCloudData = readFromiCloudKeychain(service: service, account: account) ;

        if (iCloudData != nil) {
            return iCloudData
        }

        let localData = readFromDeviceKeychain(service: service, account: account)

        // Auto migrate data to iCloud Keychain when appropriate conditions are met
        if (localData != nil && shouldMigrateToiCloudKeychain(service: service, account: account)) {
            saveToiCloudKeychain(localData!, service: service, account: account)
        }

        return localData
    }

    func readFromDeviceKeychain(service: String, account: String) -> Data? {
        let query = [
            kSecAttrService: service,
            kSecAttrAccount: account,
            kSecClass: kSecClassGenericPassword,
            kSecReturnData: true,
        ] as CFDictionary

        var result: AnyObject?
        let status = withUnsafeMutablePointer(to: &result) {
            SecItemCopyMatching(query, UnsafeMutablePointer($0))
        }

        return (result as? Data)
    }

    func readFromiCloudKeychain(service: String, account: String) -> Data? {
        let query = [
            kSecAttrService: service,
            kSecAttrAccount: account,
            kSecAttrSynchronizable: true,
            kSecClass: kSecClassGenericPassword,
            kSecReturnData: true,
        ] as CFDictionary

        var result: AnyObject?
        SecItemCopyMatching(query, &result)

        return (result as? Data)
    }

    func delete(service: String, account: String) {
        deleteFromDeviceKeychain(service: service, account: account)
        deleteFromiCloudKeychain(service: service, account: account)
    }

    func deleteFromDeviceKeychain(service: String, account: String) {
        let query = [
            kSecAttrService: service,
            kSecAttrAccount: account,
            kSecClass: kSecClassGenericPassword,
            ] as CFDictionary

        // Delete item from keychain
        SecItemDelete(query)
    }

    func deleteFromiCloudKeychain(service: String, account: String) {
        let query = [
            kSecAttrService: service,
            kSecAttrAccount: account,
            kSecAttrSynchronizable: true,
            kSecClass: kSecClassGenericPassword,
            ] as CFDictionary

        // Delete item from keychain
        SecItemDelete(query)
    }
}
