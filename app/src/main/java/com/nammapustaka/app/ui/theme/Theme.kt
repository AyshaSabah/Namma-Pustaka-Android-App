package com.nammapustaka.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Violet500,
    secondary = AccentViolet,
    tertiary = SecondaryViolet,
    background = DarkBg,
    surface = Color(0xFF1E293B)
)

private val LightColorScheme = lightColorScheme(
    primary = Violet600,
    secondary = Violet500,
    tertiary = AccentViolet,
    background = Color.White,
    surface = Color.White,
    primaryContainer = Violet50,
    onPrimaryContainer = Violet700,
    outlineVariant = OutlineVariant
)

@Composable
fun NammaPustakaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
