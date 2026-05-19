package com.nammapustaka.app.model

data class Book(
    val id: String,
    val title: String,
    val author: String,
    val description: String,
    val summaryKannada: String,
    val imageUrl: String,
    val category: String,
    val genre: String,
    val publishedDate: String,
    val isIssued: Boolean = false,
    val isReserved: Boolean = false
)
