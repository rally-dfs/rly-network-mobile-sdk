package com.rlynetworkmobilesdk

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import androidx.security.crypto.MasterKey.Builder
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

  fun save(key: String, mnemonic: String, useBlockstore: Boolean, forceBlockstore: Boolean, onSuccess: () -> Unit, onFailure: (message: String) -> Unit) {
    if (useBlockstore && isEndToEndEncryptionAvailable) {
      val storeRequest = StoreBytesData.Builder()
        .setBytes(mnemonic.toByteArray(Charsets.UTF_8))
        .setKey(key)

      storeRequest.setShouldBackupToCloud(true)

      blockstoreClient.storeBytes(storeRequest.build())
        .addOnSuccessListener {
          onSuccess()
        }.addOnFailureListener { e ->
          onFailure("Failed to save to cloud $e")
        }
    } else {
      if (forceBlockstore) {
        onFailure("Failed to save mnemonic. No end to end encryption option is available and force cloud is on");
      } else {
        saveToSharedPref(key, mnemonic)
        onSuccess()
      }
    }
  }

  private fun saveToSharedPref(key: String, mnemonic: String) {
    val editor = sharedPreferences.edit()
    editor.putString(key, mnemonic)
    editor.commit()
  }

  fun read(key: String, onSuccess: (mnemonic: String?, fromBlockstore: Boolean) -> Unit) {

    val retrieveRequest = RetrieveBytesRequest.Builder()
      .setKeys(listOf(key))
      .build()

    blockstoreClient.retrieveBytes(retrieveRequest)
      .addOnSuccessListener { result: RetrieveBytesResponse ->
        val blockstoreDataMap = result.blockstoreDataMap

        if (blockstoreDataMap.isEmpty()) {
          val mnemonic = readFromSharedPref(key)
          onSuccess(mnemonic, false)
        } else {
          val mnemonic = blockstoreDataMap[key]
          if (mnemonic !== null) {
            onSuccess(mnemonic.bytes.toString(Charsets.UTF_8), true)
          } else {
            onSuccess(null, true)
          }
        }
      }
      .addOnFailureListener {
        val mnemonic = readFromSharedPref(key)
        onSuccess(mnemonic, false)
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
