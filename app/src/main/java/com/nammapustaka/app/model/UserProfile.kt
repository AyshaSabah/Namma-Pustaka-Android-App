package com.nammapustaka.app.model

data class UserProfile(
    val uid: String = "",
    val email: String? = null,
    val displayName: String? = null,
    val photoUrl: String? = null,
    val points: Int = 0,
    val issuedBookIds: List<String> = emptyList(),
    val reservedBookIds: List<String> = emptyList(),
    val bookmarkedBookIds: List<String> = emptyList(),
    val createdAt: String = ""
)
