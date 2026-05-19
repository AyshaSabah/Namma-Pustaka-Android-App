package com.nammapustaka.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.nammapustaka.app.data.FirebaseManager
import com.nammapustaka.app.navigation.NammaPustakaNavHost
import com.nammapustaka.app.ui.theme.NammaPustakaTheme

import com.google.firebase.firestore.Source

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        FirebaseManager.initialize(this)
        
        // Test Firestore connection as per critical guidelines
        FirebaseManager.firestore.collection("test").document("connection")
            .get(Source.SERVER)
            .addOnFailureListener { e ->
                if (e.message?.contains("offline") == true) {
                    android.util.Log.e("FirebaseManager", "Firebase is offline. Check configuration.")
                }
            }

        setContent {
            NammaPustakaTheme {
                val navController = rememberNavController()
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    NammaPustakaNavHost(navController = navController)
                }
            }
        }
    }
}
