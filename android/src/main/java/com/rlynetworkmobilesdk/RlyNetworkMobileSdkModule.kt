package com.rlynetworkmobilesdk

import com.facebook.react.bridge.*
import org.kethereum.bip39.generateMnemonic
import org.kethereum.bip39.validate
import org.kethereum.bip39.dirtyPhraseToMnemonicWords
import org.kethereum.bip39.toSeed
import org.kethereum.bip39.wordlists.WORDLIST_ENGLISH
import org.kethereum.bip39.model.MnemonicWords
import org.kethereum.bip32.model.ExtendedKey
import org.kethereum.bip32.toKey
import org.kethereum.extensions.*
import java.lang.Integer.parseInt

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

  @ReactMethod
  fun getMnemonic(promise:Promise){
    promise.resolve(null)
  }

  @ReactMethod
  fun generateMnemonic(promise:Promise){
    val phrase = generateMnemonic(192, WORDLIST_ENGLISH)
    promise.resolve(phrase)
  }

  @ReactMethod
  fun saveMnemonic(mnemonic:String, promise:Promise){
    if (!MnemonicWords(mnemonic).validate(WORDLIST_ENGLISH)) {
      promise.reject("mnemonic_verification_failure", "mnemonic failed to pass check");
      return;
    }
    promise.resolve(true)
  }

  @ReactMethod
  fun deleteMnemonic(promise:Promise){
    promise.resolve(true)
  }

  @ReactMethod
  fun getPrivateKeyFromMnemonic(mnemonic:String, promise:Promise){
    if (!MnemonicWords(mnemonic).validate(WORDLIST_ENGLISH)) {
      promise.reject("mnemonic_verification_failure", "mnemonic failed to pass check");
      return;
    }

    val words = dirtyPhraseToMnemonicWords(mnemonic)
    val seed = words.toSeed()
    val key = seed.toKey("m/44'/60'/0'/0/0")

    val pkey = key.keyPair.privateKey.key.toHexString()

    val result = WritableNativeArray();

    for (i in 2..64 step 2) {
      val intString = "${pkey[i]}${pkey[i+1]}"
      println(intString)
      result.pushInt(parseInt(intString, 16))
    }

    promise.resolve(result)
  }

  companion object {
    const val NAME = "RlyNetworkMobileSdk"
  }
}
