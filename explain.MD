# Namma Pustaka (ನಮ್ಮ ಪುಸ್ತಕ) - Native Android Technical Specification

**Namma Pustaka** is a high-fidelity, native Android digital library ecosystem built with **Kotlin** and **Jetpack Compose**. It provides a modern, social, and gamified experience for students and teachers to browse, issue, and manage library activities with real-time synchronization.

---

## 1. Technical Stack & Architecture

### Mobile Architecture (MVVM)
The application follows the **Model-View-ViewModel (MVVM)** architectural pattern, ensuring a clean separation of concerns and robust state management.

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Language** | **Kotlin** | Primary language, utilizing Coroutines and Flow for async work. |
| **UI Framework** | **Jetpack Compose** | Declarative UI toolkit; Zero XML layouts. |
| **Design System** | **Material 3** | Implementation of Material You components with dynamic color support. |
| **Navigation** | **Compose Navigation** | State-based routing with safe arguments. |
| **State Management** | **StateFlow / ViewModel** | Reactive streams for UI state and lifecycle-aware business logic. |
| **Networking/DB** | **Firebase SDK** | Real-time Cloud Firestore and Firebase Authentication. |
| **Image Loading** | **Coil** | Efficient Kotlin-first image loading for cover arts and profiles. |

---

## 2. Backend & Real-time Services

### Firebase Integration
Unlike web-based prototypes, Namma Pustaka is a fully integrated full-stack native app.

- **Firebase Authentication**: 
    - Secure Email/Password authentication.
    - Automatic UserProfile provisioning via `BookViewModel` on successful login.
- **Cloud Firestore (NoSQL)**: 
    - **Real-time Synchronization**: Uses `addSnapshotListener` to reflect changes in book status, user points, and notifications instantly.
    - **Scalable Subcollections**: User-specific data like `notifications` are nested under `/users/{userId}/notifications` for optimized querying and security.

### Comprehensive Data Schema

#### `books` (Collection)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `String` | Unique Document ID. |
| `title` | `String` | Book title (e.g., "The Alchemist"). |
| `author` | `String` | Writer's name. |
| `description`| `String` | Extended plot summary. |
| `summaryKannada`| `String` | Regional language summary for accessibility. |
| `imageUrl` | `String` | Link to cover art. |
| `genre` | `String` | Genre used for recommendation engine. |
| `isIssued` | `Boolean` | Current availability status. |

#### `users` (Collection)
| Field | Type | Description |
| :--- | :--- | :--- |
| `points` | `Number` | Gamification currency. |
| `issuedBookIds`| `Array<String>`| List of currently borrowed book IDs. |
| `bookmarkedBookIds`| `Array<String>`| Personal collection of favorite books. |
| `displayName`| `String` | User's preferred name (Editable). |
| `photoUrl` | `String` | Avatar URL (Customizable via Avatar Picker). |

---

## 3. Security & Integrity

### Hardened Firestore Security Rules
The application implements **Zero-Trust** security following the **Eight Pillars of Hardened Rules**:

1. **Identity Integrity**: Every write verifies `request.auth.uid == userId`.
2. **Schema Validation**: `isValidUser()` and `isValidBook()` helpers enforce field types and size limits.
3. **Immutability Protection**: Fields like `email` are protected against updates after creation.
4. **Action-Based Updates**: Updates to books are restricted to specific keys (`isIssued`, `isReserved`) using `affectedKeys().hasOnly()`.
5. **Path Hardening**: `isValidId()` regex prevents injection via document IDs.

---

## 4. Key UX & Technical Implementations

### Smart Recommendation Engine
The engine calculates suggestions by analyzing user history and genre overlap, providing a fresh discovery experience.

### Advanced Account Features
- **Profile Customization**: 
    - **Nickname Editing**: Users can update their preferred display name directly on the profile page.
    - **Dual Portrait Options**: Users can choose from a library of preset professional avatars or upload their own images via the local device gallery using a native `ActivityResultLauncher`.
- **Reading History**: Live-tracked list of all books issued by the user.
- **Bookmarks (Favorites)**: Real-time bookmarking system for saving books.

### Gamification (Reader Rank)
- **Leveling Logic**: Users progress through ranks based on points earned from library activities.
- **Live Leaderboard**: Real-time ranking of top participants.

---

## 5. Development & Scalability
- **Modular Components**: Reusable UI atoms for consistency.
- **Error Boundaries**: Standardized error handling for Firestore operations.
- **Performance**: Optimized list rendering and image caching.
