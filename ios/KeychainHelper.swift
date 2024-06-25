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
        if saveToCloud {
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

    func read(service: String, account: String) -> Data? {
        let iCloudData = readFromiCloudKeychain(service: service, account: account)

        if iCloudData != nil {
            return iCloudData
        }

        let localData = readFromDeviceKeychain(service: service, account: account)

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
        SecItemCopyMatching(query, &result)

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
