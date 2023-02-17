package com.rlynetworkmobilesdk

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import androidx.security.crypto.MasterKey.Builder

class EncryptedSharedPreferencesHelper(context: Context) {
  private val sharedPreferences: SharedPreferences

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

  }

  fun save(key: String, mnemonic: String) {
    val editor = sharedPreferences.edit()
    editor.putString(key, mnemonic)
    editor.commit()
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
