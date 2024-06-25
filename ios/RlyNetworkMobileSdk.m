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

RCT_EXTERN_METHOD(getMnemonic:
    (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
)

RCT_EXTERN_METHOD(mnemonicBackedUpToCloud:
    (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
)

RCT_EXTERN_METHOD(generateMnemonic:
    (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
)


RCT_EXTERN_METHOD(saveMnemonic:
    (NSString) mnemonic
    saveToCloud: (BOOL) saveToCloud
    rejectOnCloudSaveFailure: (BOOL) rejectOnCloudSaveFailure
    resolver: (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
)


RCT_EXTERN_METHOD(deleteMnemonic:
    (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
)

RCT_EXTERN_METHOD(deleteCloudMnemonic:
    (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
)


RCT_EXTERN_METHOD(getPrivateKeyFromMnemonic:
    (NSString) mnemonic
    resolver: (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
