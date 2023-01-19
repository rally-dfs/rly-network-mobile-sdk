@objc(RlyNetworkMobileSdk)
class RlyNetworkMobileSdk: NSObject {

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
}
