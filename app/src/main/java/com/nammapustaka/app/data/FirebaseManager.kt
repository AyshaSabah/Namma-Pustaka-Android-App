package com.nammapustaka.app.data

import android.content.Context
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase

object FirebaseManager {
    lateinit var auth: FirebaseAuth
    lateinit var db: FirebaseFirestore

    fun initialize(context: Context) {
        val options = FirebaseOptions.Builder()
            .setProjectId("future-linker-490611-v4")
            .setApplicationId("1:841090338034:web:2338cfd77d0990509a946b")
            .setApiKey("AIzaSyBGjTJLGHFX4aXn9j4HxsaYahTDz1vL5kQ")
            .setDatabaseUrl("https://future-linker-490611-v4.firebaseio.com")
            .setStorageBucket("future-linker-490611-v4.firebasestorage.app")
            .setGcmSenderId("841090338034")
            .build()

        if (FirebaseApp.getApps(context).isEmpty()) {
            FirebaseApp.initializeApp(context, options)
        }
        
        auth = Firebase.auth
        db = Firebase.firestore(FirebaseApp.getInstance(), "ai-studio-ea070e38-0481-43ff-8b95-c7aafcb6d386")
    }
}
