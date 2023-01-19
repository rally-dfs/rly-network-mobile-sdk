package com.rlynetworkmobilesdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class RlyNetworkMobileSdkModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun hello(promise: Promise) {
    promise.resolve("Hello world")
  }

  @ReactMethod
  fun getBundleId(promise:Promise){
    promise.resolve(reactApplicationContext.packageName)
  }

  companion object {
    const val NAME = "RlyNetworkMobileSdk"
  }
}
