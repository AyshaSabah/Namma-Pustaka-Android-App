package com.nammapustaka.app.ui.screens

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavController
import androidx.navigation.NavHostController
import androidx.navigation.compose.*
import com.nammapustaka.app.navigation.Screen

data class BottomNavItem(
    val name: String,
    val route: String,
    val icon: ImageVector
)

val bottomNavItems = listOf(
    BottomNavItem("Discover", Screen.Home.route, Icons.Default.AutoStories),
    BottomNavItem("Library", Screen.Search.route, Icons.Default.Search),
    BottomNavItem("Scan", Screen.Scan.route, Icons.Default.QrCode),
    BottomNavItem("Ranks", Screen.Leaderboard.route, Icons.Default.EmojiEvents),
    BottomNavItem("Account", Screen.Profile.route, Icons.Default.Person)
)

@Composable
fun MainScreen(rootNavController: NavController) {
    val navController = rememberNavController()
    
    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                bottomNavItems.forEach { item ->
                    NavigationBarItem(
                        selected = currentRoute == item.route,
                        onClick = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.startDestinationId) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(item.icon, contentDescription = item.name) },
                        label = { Text(item.name) }
                    )
                }
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(paddingValues)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(navController = rootNavController)
            }
            composable(Screen.Search.route) {
                SearchScreen(navController = rootNavController)
            }
            composable(Screen.Scan.route) {
                ScanScreen()
            }
            composable(Screen.Leaderboard.route) {
                LeaderboardScreen()
            }
            composable(Screen.Profile.route) {
                ProfileScreen(navController = rootNavController)
            }
        }
    }
}
