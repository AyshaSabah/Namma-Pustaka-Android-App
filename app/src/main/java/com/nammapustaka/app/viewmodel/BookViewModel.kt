package com.nammapustaka.app.viewmodel

import android.app.Application
import android.content.Context
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.Query
import com.nammapustaka.app.data.FirebaseManager
import com.nammapustaka.app.data.SampleData
import com.nammapustaka.app.model.Book
import com.nammapustaka.app.model.Notification
import com.nammapustaka.app.model.UserProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

enum class OperationType(val value: String) {
    CREATE("create"),
    UPDATE("update"),
    DELETE("delete"),
    LIST("list"),
    GET("get"),
    WRITE("write"),
}

data class FirestoreErrorInfo(
    val error: String,
    val operationType: String,
    val path: String?,
    val authInfo: Map<String, Any?>
)

class BookViewModel(application: Application) : AndroidViewModel(application) {
    private val sharedPrefs = application.getSharedPreferences("namma_pustaka_prefs", Context.MODE_PRIVATE)

    private val _books = MutableStateFlow<List<Book>>(emptyList())
    val books: StateFlow<List<Book>> = _books.asStateFlow()

    private val _recommendedBooks = MutableStateFlow<List<Book>>(emptyList())
    val recommendedBooks: StateFlow<List<Book>> = _recommendedBooks.asStateFlow()

    private val _userProfile = MutableStateFlow<UserProfile?>(null)
    val userProfile: StateFlow<UserProfile?> = _userProfile.asStateFlow()

    private val _notifications = MutableStateFlow<List<Notification>>(emptyList())
    val notifications: StateFlow<List<Notification>> = _notifications.asStateFlow()

    private val _topReaders = MutableStateFlow<List<UserProfile>>(emptyList())
    val topReaders: StateFlow<List<UserProfile>> = _topReaders.asStateFlow()

    private var profileListener: ListenerRegistration? = null
    private var notificationListener: ListenerRegistration? = null
    private var booksListener: ListenerRegistration? = null
    private var leaderboardListener: ListenerRegistration? = null

    init {
        startBooksListener()
        startProfileListener()
        startLeaderboardListener()
    }

    private fun startBooksListener() {
        val path = "books"
        booksListener?.remove()
        booksListener = FirebaseManager.db.collection(path)
            .addSnapshotListener { snapshot, e ->
                if (e != null) {
                    handleFirestoreError(e, OperationType.LIST, path)
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    val fetchBooks = snapshot.documents.mapNotNull { it.toObject(Book::class.java)?.copy(id = it.id) }
                    if (fetchBooks.isEmpty()) {
                        seedBooks()
                    } else {
                        _books.value = fetchBooks
                        updateRecommendations()
                        // Synchronize status with profile
                        val profile = _userProfile.value
                        if (profile != null) {
                            _books.update { current ->
                                current.map { book ->
                                    book.copy(
                                        isIssued = profile.issuedBookIds.contains(book.id),
                                        isReserved = profile.reservedBookIds.contains(book.id)
                                    )
                                }
                            }
                        }
                    }
                }
            }
    }

    private fun seedBooks() {
        viewModelScope.launch {
            try {
                val batch = FirebaseManager.db.batch()
                SampleData.books.forEach { book ->
                    val docRef = FirebaseManager.db.collection("books").document(book.id)
                    batch.set(docRef, book)
                }
                batch.commit().await()
            } catch (e: Exception) {
                Log.e("BookViewModel", "Error seeding books: ${e.message}")
            }
        }
    }

    private fun startProfileListener() {
        val user = FirebaseManager.auth.currentUser ?: return
        val path = "users/${user.uid}"

        profileListener?.remove()
        profileListener = FirebaseManager.db.document(path).addSnapshotListener { snapshot, e ->
            if (e != null) {
                handleFirestoreError(e, OperationType.GET, path)
                return@addSnapshotListener
            }

            if (snapshot != null && snapshot.exists()) {
                val profile = snapshot.toObject(UserProfile::class.java)?.copy(uid = snapshot.id)
                _userProfile.value = profile
                
                profile?.let { p ->
                    _books.update { currentBooks ->
                        currentBooks.map { book ->
                            book.copy(
                                isIssued = p.issuedBookIds.contains(book.id),
                                isReserved = p.reservedBookIds.contains(book.id)
                            )
                        }
                    }
                }
                updateRecommendations()
            } else {
                createUserProfile()
            }
        }

        startNotificationListener(user.uid)
    }

    private fun startNotificationListener(uid: String) {
        val path = "users/$uid/notifications"
        notificationListener?.remove()
        notificationListener = FirebaseManager.db.collection(path)
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, e ->
                if (e != null) {
                    handleFirestoreError(e, OperationType.LIST, path)
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    val notifs = snapshot.documents.mapNotNull { it.toObject(Notification::class.java)?.copy(id = it.id) }
                    _notifications.value = notifs
                }
            }
    }

    private fun createUserProfile() {
        val user = FirebaseManager.auth.currentUser ?: return
        val path = "users/${user.uid}"
        val profile = UserProfile(
            uid = user.uid,
            email = user.email,
            displayName = user.displayName ?: "Reader",
            photoUrl = user.photoUrl?.toString(),
            issuedBookIds = emptyList(),
            reservedBookIds = emptyList(),
            bookmarkedBookIds = emptyList(),
            createdAt = java.time.Instant.now().toString()
        )
        viewModelScope.launch {
            try {
                FirebaseManager.db.document(path).set(profile).await()
            } catch (e: Exception) {
                handleFirestoreError(e, OperationType.WRITE, path)
            }
        }
    }

    private fun startLeaderboardListener() {
        val path = "users"
        leaderboardListener?.remove()
        leaderboardListener = FirebaseManager.db.collection(path)
            .orderBy("points", Query.Direction.DESCENDING)
            .limit(10)
            .addSnapshotListener { snapshot, e ->
                if (e != null) {
                    handleFirestoreError(e, OperationType.LIST, path)
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    val readers = snapshot.documents.mapNotNull { it.toObject(UserProfile::class.java)?.copy(uid = it.id) }
                    _topReaders.value = readers
                }
            }
    }

    fun toggleIssueStatus(bookId: String) {
        val user = FirebaseManager.auth.currentUser ?: return
        val currentProfile = _userProfile.value ?: return
        val path = "users/${user.uid}"

        val isAlreadyIssued = currentProfile.issuedBookIds.contains(bookId)
        val newIssuedList = if (isAlreadyIssued) {
            currentProfile.issuedBookIds.filter { it != bookId }
        } else {
            currentProfile.issuedBookIds + bookId
        }

        val newPoints = if (!isAlreadyIssued) currentProfile.points + 50 else currentProfile.points

        viewModelScope.launch {
            try {
                FirebaseManager.db.document(path).update(
                    "issuedBookIds", newIssuedList,
                    "points", newPoints
                ).await()
                
                if (!isAlreadyIssued) {
                    addNotification("Book Issued", "You have successfully issued '${_books.value.find { it.id == bookId }?.title}'. Happy reading!", "success")
                }
            } catch (e: Exception) {
                handleFirestoreError(e, OperationType.UPDATE, path)
            }
        }
    }

    fun toggleReserveStatus(bookId: String) {
        val user = FirebaseManager.auth.currentUser ?: return
        val currentProfile = _userProfile.value ?: return
        val path = "users/${user.uid}"

        val isAlreadyReserved = currentProfile.reservedBookIds.contains(bookId)
        val newReservedList = if (isAlreadyReserved) {
            currentProfile.reservedBookIds.filter { it != bookId }
        } else {
            currentProfile.reservedBookIds + bookId
        }

        viewModelScope.launch {
            try {
                FirebaseManager.db.document(path).update("reservedBookIds", newReservedList).await()
                if (!isAlreadyReserved) {
                    addNotification("Book Reserved", "You have reserved '${_books.value.find { it.id == bookId }?.title}'. We'll notify you when it's available.", "info")
                }
            } catch (e: Exception) {
                handleFirestoreError(e, OperationType.UPDATE, path)
            }
        }
    }

    private fun addNotification(title: String, message: String, type: String) {
        val user = FirebaseManager.auth.currentUser ?: return
        val path = "users/${user.uid}/notifications"
        val notification = Notification(
            title = title,
            message = message,
            timestamp = java.time.Instant.now().toString(),
            type = type
        )
        viewModelScope.launch {
            try {
                FirebaseManager.db.collection(path).add(notification).await()
            } catch (e: Exception) {
                handleFirestoreError(e, OperationType.WRITE, path)
            }
        }
    }

    fun markNotificationAsRead(notificationId: String) {
        val user = FirebaseManager.auth.currentUser ?: return
        val path = "users/${user.uid}/notifications/$notificationId"
        viewModelScope.launch {
            try {
                FirebaseManager.db.document(path).update("isRead", true).await()
            } catch (e: Exception) {
                handleFirestoreError(e, OperationType.UPDATE, path)
            }
        }
    }

    fun toggleBookmark(bookId: String) {
        val user = FirebaseManager.auth.currentUser ?: return
        val currentBookmarks = _userProfile.value?.bookmarkedBookIds ?: emptyList()
        val path = "users/${user.uid}"
        
        val newBookmarks = if (currentBookmarks.contains(bookId)) {
            currentBookmarks.filter { it != bookId }
        } else {
            currentBookmarks + bookId
        }

        viewModelScope.launch {
            try {
                FirebaseManager.db.document(path).update("bookmarkedBookIds", newBookmarks).await()
                val message = if (newBookmarks.size > currentBookmarks.size) "Book Added to Favorites" else "Book Removed from Favorites"
                addNotification("Favorites Updated", message, "info")
            } catch (e: Exception) {
                handleFirestoreError(e, OperationType.UPDATE, path)
            }
        }
    }

    fun updateProfile(displayName: String? = null, photoUrl: String? = null) {
        val user = FirebaseManager.auth.currentUser ?: return
        val path = "users/${user.uid}"
        
        val updates = mutableMapOf<String, Any>()
        displayName?.let { updates["displayName"] = it }
        photoUrl?.let { updates["photoUrl"] = it }

        viewModelScope.launch {
            try {
                FirebaseManager.db.document(path).update(updates).await()
                addNotification("Profile Updated", "Your profile has been successfully updated.", "success")
            } catch (e: Exception) {
                handleFirestoreError(e, OperationType.UPDATE, path)
            }
        }
    }

    fun logout(onComplete: () -> Unit) {
        profileListener?.remove()
        notificationListener?.remove()
        FirebaseManager.auth.signOut()
        _userProfile.value = null
        onComplete()
    }

    private fun handleFirestoreError(error: Exception, operationType: OperationType, path: String?) {
        val auth = FirebaseManager.auth
        val errInfo = FirestoreErrorInfo(
            error = error.message ?: "Unknown error",
            operationType = operationType.value,
            path = path,
            authInfo = mapOf(
                "userId" to auth.currentUser?.uid,
                "email" to auth.currentUser?.email,
                "emailVerified" to auth.currentUser?.isEmailVerified
            )
        )
        Log.e("Firestore Error", "{ \"error\": \"${errInfo.error}\", \"operationType\": \"${errInfo.operationType}\", \"path\": \"${errInfo.path}\" }")
    }

    private fun updateRecommendations() {
        val currentBooks = _books.value
        val historyBooks = currentBooks.filter { it.isIssued || it.isReserved }
        val historyGenres = historyBooks.map { it.genre }.toSet()
        val historyIds = historyBooks.map { it.id }.toSet()

        val recommended = if (historyGenres.isEmpty()) {
            currentBooks.filter { !historyIds.contains(it.id) }.shuffled().take(5)
        } else {
            currentBooks.filter { !historyIds.contains(it.id) && historyGenres.contains(it.genre) }
        }

        _recommendedBooks.value = if (recommended.isEmpty() && historyIds.isNotEmpty()) {
            currentBooks.filter { !historyIds.contains(it.id) }.take(5)
        } else if (recommended.isEmpty()) {
            currentBooks.take(5)
        } else {
            recommended
        }
    }

    fun getBookById(bookId: String?): Book? {
        return _books.value.find { it.id == bookId }
    }

    override fun onCleared() {
        super.onCleared()
        profileListener?.remove()
        notificationListener?.remove()
        booksListener?.remove()
        leaderboardListener?.remove()
    }
}
