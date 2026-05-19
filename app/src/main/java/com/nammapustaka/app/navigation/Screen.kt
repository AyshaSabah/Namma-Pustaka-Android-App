package com.nammapustaka.app.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Signup : Screen("signup")
    object Main : Screen("main")
    object Home : Screen("home")
    object BookDetail : Screen("book_detail/{bookId}") {
        fun createRoute(bookId: String) = "book_detail/$bookId"
    }
    object Search : Screen("search")
    object Scan : Screen("scan")
    object Leaderboard : Screen("leaderboard")
    object Profile : Screen("profile")
    object Notifications : Screen("notifications")
}
