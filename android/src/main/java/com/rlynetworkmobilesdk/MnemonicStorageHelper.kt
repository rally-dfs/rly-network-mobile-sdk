package com.rlynetworkmobilesdk

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import androidx.security.crypto.MasterKey.Builder
import com.facebook.react.bridge.Promise
import com.google.android.gms.auth.blockstore.*

class MnemonicStorageHelper(context: Context) {
  private val sharedPreferences: SharedPreferences
  private val blockstoreClient: BlockstoreClient
  private var isEndToEndEncryptionAvailable: Boolean = false;

  init {
    val masterKey: MasterKey = Builder(context)
      .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
      .build()

    sharedPreferences = EncryptedSharedPreferences.create(
      context,
      "encrypted_mnemonic",
      masterKey,
      EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
      EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
      )

    blockstoreClient = Blockstore.getClient(context)
    blockstoreClient.isEndToEndEncryptionAvailable.addOnSuccessListener { isE2EEAvailable ->
      isEndToEndEncryptionAvailable = isE2EEAvailable
    }
  }

  fun save(key: String, mnemonic: String, useBlockstore: Boolean, forceBlockstore: Boolean, promise: Promise) {
    if (useBlockstore && isEndToEndEncryptionAvailable) {
      val storeRequest = StoreBytesData.Builder()
        .setBytes(mnemonic.toByteArray(Charsets.UTF_8))
        .setKey(key)

      storeRequest.setShouldBackupToCloud(true)

      blockstoreClient.storeBytes(storeRequest.build())
        .addOnSuccessListener {
          promise.resolve(true)
        }.addOnFailureListener { e ->
          promise.reject("cloud_save_failure", "Failed to save to cloud $e")
        }
    } else {
      if (forceBlockstore) {
        promise.reject("cloud_save_disabled", "Failed to save mnemonic. No end to end encryption option is available and force cloud is on");
      } else {
        saveToSharedPref(key, mnemonic)
        promise.resolve(true)
      }
    }
  }

  private fun saveToSharedPref(key: String, mnemonic: String) {
    val editor = sharedPreferences.edit()
    editor.putString(key, mnemonic)
    editor.commit()
  }

  fun read(key: String, promise: Promise) {

    val retrieveRequest = RetrieveBytesRequest.Builder()
      .setKeys(listOf(key))
      .build()

    blockstoreClient.retrieveBytes(retrieveRequest)
      .addOnSuccessListener { result: RetrieveBytesResponse ->
        val blockstoreDataMap = result.blockstoreDataMap

        if (blockstoreDataMap.isEmpty()) {
          promise.resolve(readFromSharedPref(key))
        } else {
          val value = blockstoreDataMap[key]
          if (value != null) {
            promise.resolve(value.bytes.toString(Charsets.UTF_8))
          } else {
            promise.resolve(null)
          }
        }
      }
      .addOnFailureListener {
        promise.resolve(readFromSharedPref(key))
      }
  }

  private fun readFromSharedPref(key: String): String? {
    return sharedPreferences.getString(key, null)
  }

  fun delete(key: String) {
    val retrieveRequest = DeleteBytesRequest.Builder()
      .setKeys(listOf(key))
      .build()

    blockstoreClient.deleteBytes(retrieveRequest)

    val editor = sharedPreferences.edit()
    editor.remove(key)
    editor.commit()
  }
}
