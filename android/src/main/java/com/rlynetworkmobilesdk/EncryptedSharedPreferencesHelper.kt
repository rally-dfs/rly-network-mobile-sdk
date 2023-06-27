package com.rlynetworkmobilesdk

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import androidx.security.crypto.MasterKey.Builder

class EncryptedSharedPreferencesHelper(context: Context) {
  private val sharedPreferences: SharedPreferences
  private val blockstoreClient: BlockstoreClient

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

    blockstoreClient = Blockstore.getClient(this)
  }

  fun save(key: String, mnemonic: String) {
    val storeRequest = StoreBytesData.Builder()
      .setBytes(mnemonic.toByteArray(Charsets.UTF_8))
      .setKeys(Arrays.asList(key))

    blockstoreClient.isEndToEndEncryptionAvailable().addOnSuccessListener { isE2EEAvailable ->
      if (isE2EEAvailable) {
        storeBytesDataBuilder.setShouldBackupToCloud(true)
        Log.d(TAG, "E2EE is available, enable backing up bytes to the cloud.")

        client.storeBytes(storeRequest.build())
            .addOnSuccessListener { result ->
              Log.d(TAG, "stored: ${result.getBytesStored()}")
            }.addOnFailureListener { e ->
              Log.e(TAG, “Failed to store bytes”, e)
            }
      } else {
        Log.d(TAG, "E2EE is not available, only store bytes for D2D restore.")
        val editor = sharedPreferences.edit()
        editor.putString(key, mnemonic)
        editor.commit()
      }
    }
  }

  fun read(key: String): String? {
    return sharedPreferences.getString(key, null)
  }

  fun delete(key: String) {
    val editor = sharedPreferences.edit()
    editor.remove(key)
    editor.commit()
  }
}
