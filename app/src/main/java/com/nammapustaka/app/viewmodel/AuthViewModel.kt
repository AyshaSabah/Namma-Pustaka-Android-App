package com.nammapustaka.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nammapustaka.app.data.FirebaseManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AuthViewModel : ViewModel() {
    private val auth = FirebaseManager.auth
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()
    
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage = _errorMessage.asStateFlow()
    
    fun login(email: String, password: String, onSuccess: () -> Unit) {
        if (email.isEmpty() || password.isEmpty()) {
            _errorMessage.value = "Email and password cannot be empty"
            return
        }
        
        _isLoading.value = true
        _errorMessage.value = null
        
        auth.signInWithEmailAndPassword(email, password)
            .addOnCompleteListener { task ->
                _isLoading.value = false
                if (task.isSuccessful) {
                    onSuccess()
                } else {
                    _errorMessage.value = task.exception?.message ?: "Login failed"
                }
            }
    }
    
    fun signup(email: String, password: String, displayName: String, onSuccess: () -> Unit) {
        if (email.isEmpty() || password.isEmpty() || displayName.isEmpty()) {
            _errorMessage.value = "All fields are required"
            return
        }
        
        _isLoading.value = true
        _errorMessage.value = null
        
        auth.createUserWithEmailAndPassword(email, password)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    // Update profile with display name would happen here
                    onSuccess()
                } else {
                    _isLoading.value = false
                    _errorMessage.value = task.exception?.message ?: "Signup failed"
                }
            }
    }
    
    fun clearError() {
        _errorMessage.value = null
    }
}
