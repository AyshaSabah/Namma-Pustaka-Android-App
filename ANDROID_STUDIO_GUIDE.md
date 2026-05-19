# Android Studio Integration Guide

Follow these steps to integrate the **Namma-Pustaka** library app into your Android Studio project.

## 1. Project Setup
1. Open **Android Studio** and create a new project.
2. Select **Empty Compose Activity**.
3. Name your project (e.g., `NammaPustaka`) and ensure the package name matches `com.nammapustaka.app`.
4. Set the **Minimum SDK** to at least **24**.

## 2. Dependencies
Open your `app/build.gradle` (Module level) and ensure the following dependencies are added in the `dependencies` block:

```gradle
dependencies {
    // Jetpack Compose Navigation
    implementation "androidx.navigation:navigation-compose:2.7.7"
    
    // Coil (Image Loading)
    implementation "io.coil-kt:coil-compose:2.5.0"
    
    // Lifecycle & ViewModel
    implementation "androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0"
    
    // Material Icons Extended
    implementation "androidx.compose.material:material-icons-extended:1.6.2"
}
```

## 3. Directory Structure
Create the following package structure inside `app/src/main/java/com/nammapustaka/app/`:
- `data/`
- `model/`
- `navigation/`
- `ui/screens/`
- `viewmodel/`

## 4. Copy Files
Copy the code from the following files in this environment to your local project:

- `model/Book.kt`
- `data/SampleData.kt`
- `navigation/NavGraph.kt`
- `viewmodel/BookViewModel.kt`
- All screens in `ui/screens/` (HomeScreen, DetailScreen, ProfileScreen, etc.)
- Update your `MainActivity.kt` to use the `NavGraph` setup.

## 5. Main Appearance (Theme)
Ensure you use the Material3 theme. The code relies on `MaterialTheme.colorScheme` for primary colors (Violet) and backgrounds. You can customize your `ui/theme/Color.kt` to match the violet palette.

## 6. Run the App
Connect your device or start an emulator and click the **Run** button (Green Play Icon) in Android Studio.

---
**Tip:** If you encounter import errors, hover over the red text and press `Alt + Enter` (Windows/Linux) or `Option + Enter` (Mac) to auto-import the missing Compose classes.

**Persistence:** For the profile picture to stay saved in your Android app after a restart, use **Jetpack DataStore** or **SharedPreferences** to save the image URI locally.
