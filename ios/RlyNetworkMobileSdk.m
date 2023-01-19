#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RlyNetworkMobileSdk, NSObject)

RCT_EXTERN_METHOD(hello:
    (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
)

RCT_EXTERN_METHOD(getBundleId:
    (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
