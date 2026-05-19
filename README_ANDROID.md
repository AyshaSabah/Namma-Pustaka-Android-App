# Migrating to Android Studio

To take this code into a real Android project, follow these steps:

### 1. Project Setup
- Open Android Studio.
- File -> New -> New Project.
- Select **"Empty Compose Activity"**.
- Name: **NammaPustaka**
- Package: `com.nammapustaka.app`

### 2. Add Dependencies
Open `app/build.gradle.kts` and add these to your `dependencies` block:
```kotlin
// UI & Icons
implementation("androidx.compose.material:material-icons-extended")
implementation("androidx.navigation:navigation-compose:2.7.7")

// Image Loading
implementation("io.coil-kt:coil-compose:2.5.0")

// ViewModel
implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
```

### 3. Copy Code Files
Copy the content of the following files from this AI Studio project into your Android Studio source folders:

- **Logic & Data:**
  - `model/Book.kt`
  - `data/SampleData.kt`
  - `viewmodel/BookViewModel.kt`

- **Navigation:**
  - `navigation/Screen.kt`
  - `navigation/NavGraph.kt`

- **UI Screens:**
  - `ui/screens/SplashScreen.kt`
  - `ui/screens/LoginScreen.kt`
  - `ui/screens/SignupScreen.kt`
  - `ui/screens/MainScreen.kt`
  - `ui/screens/HomeScreen.kt`
  - `ui/screens/BookDetailScreen.kt`
  - `ui/screens/SearchScreen.kt`
  - `ui/screens/ScanScreen.kt`
  - `ui/screens/LeaderboardScreen.kt`
  - `ui/screens/ProfileScreen.kt`

### 4. Build and Run
- Wait for Gradle to sync.
- Press the **Run** button (green play icon).
- Your app is now running on your phone/emulator!
