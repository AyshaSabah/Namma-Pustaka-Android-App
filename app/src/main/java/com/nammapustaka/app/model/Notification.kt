package com.nammapustaka.app.model

data class Notification(
    val id: String = "",
    val title: String = "",
    val message: String = "",
    val timestamp: String = "",
    val isRead: Boolean = false,
    val type: String = "info" // info, success, alert
)
