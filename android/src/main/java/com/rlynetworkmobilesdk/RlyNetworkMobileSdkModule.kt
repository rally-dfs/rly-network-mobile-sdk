package com.rlynetworkmobilesdk

import android.content.Context
import androidx.security.crypto.MasterKey
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
  private val prefHelper: EncryptedSharedPreferencesHelper
  private val MNEMONIC_PREFERENCE_KEY = "BIP39_MNEMONIC"


  init {
    prefHelper = EncryptedSharedPreferencesHelper(reactContext.applicationContext)
  }

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
    val mnemonic = prefHelper.read(MNEMONIC_PREFERENCE_KEY)
    promise.resolve(mnemonic)
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

    prefHelper.save(MNEMONIC_PREFERENCE_KEY, mnemonic)
    promise.resolve(true)
  }

  @ReactMethod
  fun deleteMnemonic(promise:Promise){
    prefHelper.delete(MNEMONIC_PREFERENCE_KEY)
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

    val privateKey = key.keyPair.privateKey.key.toByteArray()

    val result = WritableNativeArray();
    // and 0xFF fixes twos complement integer representation and
    // ensures unsigned int values pass through since
    // we cannot directly cast bytes to unsigned int
    privateKey.forEach { result.pushInt(it.toInt() and 0xFF) }
    promise.resolve(result)
  }

  companion object {
    const val NAME = "RlyNetworkMobileSdk"
  }
}
