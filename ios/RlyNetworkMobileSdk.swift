@objc(RlyNetworkMobileSdk)
class RlyNetworkMobileSdk: NSObject {
    let MNEMONIC_LENGTH = 16
    let SERVICE_KEY = "WALLET_STORAGE"
    let MNEMONIC_ACCOUNT_KEY = "BIP39_MNEMONIC"

    @objc public func hello(
        _ resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) -> Void {
        resolve("Hello World")
    }
    
    @objc public func getBundleId(
        _ resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) -> Void {
        resolve(Bundle.main.bundleIdentifier!)
    }
    
    @objc public func getMnemonic(
      _ resolve: RCTPromiseResolveBlock,
      rejecter reject: RCTPromiseRejectBlock
    ) -> Void {
        let mnemonicData = KeychainHelper.standard.read(service: SERVICE_KEY, account: MNEMONIC_ACCOUNT_KEY)

        if (mnemonicData == nil) {
            reject("mnemonic_retrieval_failure", "failed to get mnemonic from keychain", nil);
        } else {
            let mnemonicString = String(data: mnemonicData!, encoding: .utf8)
            resolve(mnemonicString)
        }
    }
    
    @objc public func generateMnemonic(
      _ resolve: RCTPromiseResolveBlock,
      rejecter reject: RCTPromiseRejectBlock
    ) -> Void {
        var data = [UInt8](repeating: 0, count: MNEMONIC_LENGTH)
        let result = SecRandomCopyBytes(kSecRandomDefault, data.count, &data)
        
        if result == errSecSuccess {
            let mnemonicString = String(cString: mnemonic_from_data(&data, CInt(MNEMONIC_LENGTH)))
            
            if (mnemonic_check(mnemonicString) == 0) {
                reject("mnemonic_generation_failure", "mnemonic failed to pass check", nil);
                return;
            }

            resolve(mnemonicString)
        } else {
            reject("mnemonic_generation_failure", "failed to generate secure bytes", nil);
        }
    }
    
    @objc public func saveMnemonic(
      _ mnemonic: String,
      resolver resolve: RCTPromiseResolveBlock,
      rejecter reject: RCTPromiseRejectBlock
    ) -> Void {
        KeychainHelper.standard.save(mnemonic.data(using: .utf8)!, service: SERVICE_KEY, account: MNEMONIC_ACCOUNT_KEY)

        resolve(true)
    }
    
    @objc public func deleteMnemonic(
      _ mnemonic: String,
      resolver resolve: RCTPromiseResolveBlock,
      rejecter reject: RCTPromiseRejectBlock
    ) -> Void {
        KeychainHelper.standard.delete(service: SERVICE_KEY, account: MNEMONIC_ACCOUNT_KEY)

        resolve(true)
    }
    
    @objc public func getPrivateKeyFromMnemonic(
      _ mnemonic: String,
      resolver resolve: RCTPromiseResolveBlock,
      rejecter reject: RCTPromiseRejectBlock
    ) -> Void {
        if (mnemonic_check(mnemonic) == 0) {
            reject("mnemonic_verification_failure", "mnemonic failed to pass check", nil);
            return;
        }
        
        var seed = [UInt8](repeating: 0, count: (512 / 8));
        seed.withUnsafeMutableBytes { destBytes in
            mnemonic_to_seed(mnemonic, "", destBytes.baseAddress!.assumingMemoryBound(to: UInt8.self), nil)
        }
        
        var node = HDNode();
        hdnode_from_seed(&seed, CInt(seed.count), "secp256k1", &node);

        hdnode_private_ckd(&node, (0x80000000 | (44)));   // 44' - BIP 44 (purpose field)
        hdnode_private_ckd(&node, (0x80000000 | (60)));   // 60' - Ethereum (see SLIP 44)
        hdnode_private_ckd(&node, (0x80000000 | (0)));    // 0'  - Account 0
        hdnode_private_ckd(&node, 0);                     // 0   - External
        hdnode_private_ckd(&node, 0);                     // 0   - Slot #0

        var pkey : [UInt8] = []

        let reflection = Mirror(reflecting: node.private_key)
        for i in reflection.children {
            pkey.append(i.value as! UInt8)
        }
        
        resolve(pkey)
    }
}
