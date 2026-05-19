package com.nammapustaka.app.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.compose.material3.Text
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.nammapustaka.app.ui.screens.*

@Composable
fun NammaPustakaNavHost(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(navController = navController)
        }
        composable(Screen.Login.route) {
            LoginScreen(navController = navController)
        }
        composable(Screen.Signup.route) {
            SignupScreen(navController = navController)
        }
        composable(Screen.Main.route) {
            MainScreen(rootNavController = navController)
        }
        composable(Screen.BookDetail.route) { backStackEntry ->
            val bookId = backStackEntry.arguments?.getString("bookId")
            BookDetailScreen(navController = navController, bookId = bookId)
        }
        composable(Screen.Notifications.route) {
            NotificationsScreen(navController = navController)
        }
        // These are usually handled within MainScreen's inner NavHost, 
        // but adding them here allows direct navigation from root if needed.
        composable(Screen.Search.route) {
            SearchScreen(navController = navController)
        }
        composable(Screen.Leaderboard.route) {
            LeaderboardScreen()
        }
        composable(Screen.Profile.route) {
            ProfileScreen(navController = navController)
        }
    }
}

@Composable
fun PlaceholderScreen(name: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(text = name)
    }
}
