package com.rlynetworkmobilesdk

import android.content.Context
import android.content.SharedPreferences
import java.io.IOException
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import androidx.security.crypto.MasterKey.Builder
import com.google.android.gms.auth.blockstore.*

private const val ENCRYPTED_PREFERENCE_FILENAME = "encrypted_mnemonic"

class MnemonicStorageHelper(context: Context) {
  private val blockstoreClient: BlockstoreClient
  private var isEndToEndEncryptionAvailable: Boolean = false;
  private val localContext: Context = context

  init {
      blockstoreClient = Blockstore.getClient(context)
      blockstoreClient.isEndToEndEncryptionAvailable.addOnSuccessListener { isE2EEAvailable ->
          isEndToEndEncryptionAvailable = isE2EEAvailable
      }
  }

  fun getSharedPreferences(): SharedPreferences {
    val masterKey: MasterKey = Builder(localContext)
      .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
      .build()

    var attemptedSharedPreferences: SharedPreferences
    try {
      attemptedSharedPreferences = EncryptedSharedPreferences.create(
        localContext,
        ENCRYPTED_PREFERENCE_FILENAME,
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
      )
    } catch (ex: IOException) {
      // If we encounter an IOException, it's likely due to the user restoring from backup and
      // the master key being invalidated. In this case, we need to clear the shared preferences
      // and recreate them. The user will lose their mnemonic, but this is the only way to
      // recover from this situation.
      localContext.getSharedPreferences(ENCRYPTED_PREFERENCE_FILENAME, Context.MODE_PRIVATE).edit().clear().apply()

      attemptedSharedPreferences = EncryptedSharedPreferences.create(
        localContext,
        ENCRYPTED_PREFERENCE_FILENAME,
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
      )
    }
    return attemptedSharedPreferences
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
    val editor = getSharedPreferences().edit()
    editor.putString(key, mnemonic)
    editor.commit()
  }

  fun read(key: String, onSuccess: (mnemonic: String?) -> Unit) {

    val retrieveRequest = RetrieveBytesRequest.Builder()
      .setKeys(listOf(key))
      .build()

    blockstoreClient.retrieveBytes(retrieveRequest)
      .addOnSuccessListener { result: RetrieveBytesResponse ->
        val blockstoreDataMap = result.blockstoreDataMap

        if (blockstoreDataMap.isEmpty()) {
          val mnemonic = readFromSharedPref(key)
          onSuccess(mnemonic)
        } else {
          val mnemonic = blockstoreDataMap[key]
          if (mnemonic !== null) {
            onSuccess(mnemonic.bytes.toString(Charsets.UTF_8))
          } else {
            onSuccess(null)
          }
        }
      }
      .addOnFailureListener {
        val mnemonic = readFromSharedPref(key)
        onSuccess(mnemonic)
      }
  }

  private fun readFromSharedPref(key: String): String? {
    return getSharedPreferences().getString(key, null)
  }

  fun delete(key: String) {
    val retrieveRequest = DeleteBytesRequest.Builder()
      .setKeys(listOf(key))
      .build()

    blockstoreClient.deleteBytes(retrieveRequest)

    val editor = getSharedPreferences().edit()
    editor.remove(key)
    editor.commit()
  }
}
