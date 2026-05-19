package com.nammapustaka.app.ui.screens

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.rounded.AddPhotoAlternate
import androidx.compose.material.icons.rounded.Face
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.nammapustaka.app.navigation.Screen
import com.nammapustaka.app.viewmodel.BookViewModel
import com.nammapustaka.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(navController: NavController, viewModel: BookViewModel = viewModel()) {
    val context = LocalContext.current
    val userProfile by viewModel.userProfile.collectAsState()
    val books by viewModel.books.collectAsState()
    
    var isEditing by remember { mutableStateOf(false) }
    var editedName by remember { mutableStateOf("") }
    var showAvatarPicker by remember { mutableStateOf(false) }

    // Launcher for Gallery Picker
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        uri?.let {
            viewModel.updateProfile(photoUrl = it.toString())
        }
    }

    val issuedBooks = books.filter { userProfile?.issuedBookIds?.contains(it.id) == true }

    LaunchedEffect(userProfile) {
        userProfile?.let {
            if (!isEditing) editedName = it.displayName ?: ""
        }
    }

    val avatars = listOf(
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
    )

    Scaffold(
        bottomBar = {
            if (isEditing) {
                Surface(
                    tonalElevation = 8.dp, 
                    shadowElevation = 8.dp,
                    color = MaterialTheme.colorScheme.surface
                ) {
                    Row(
                        modifier = Modifier
                            .navigationBarsPadding()
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedButton(
                            onClick = { 
                                isEditing = false 
                                editedName = userProfile?.displayName ?: ""
                            },
                            modifier = Modifier.weight(1f).height(50.dp),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Text("Cancel", fontWeight = FontWeight.Bold)
                        }
                        Button(
                            onClick = {
                                if (editedName.isNotBlank()) {
                                    viewModel.updateProfile(displayName = editedName)
                                    isEditing = false
                                    android.widget.Toast.makeText(context, "Nickname updated", android.widget.Toast.LENGTH_SHORT).show()
                                }
                            },
                            modifier = Modifier.weight(1f).height(50.dp),
                            shape = RoundedCornerShape(14.dp),
                            enabled = editedName.isNotBlank() && editedName != userProfile?.displayName
                        ) {
                            Text("Update", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            item {
                // Header
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(300.dp)
                        .background(
                            brush = androidx.compose.ui.graphics.Brush.verticalGradient(
                                colors = listOf(Violet800, Violet600)
                            )
                        )
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize().padding(top = 40.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            AsyncImage(
                                model = userProfile?.photoUrl ?: avatars[0],
                                contentDescription = null,
                                modifier = Modifier
                                    .size(120.dp)
                                    .clip(CircleShape)
                                    .border(4.dp, Color.White.copy(alpha = 0.3f), CircleShape)
                                    .clickable { showAvatarPicker = true },
                                contentScale = ContentScale.Crop
                            )
                            Surface(
                                modifier = Modifier
                                    .size(38.dp)
                                    .offset(x = 42.dp, y = 42.dp)
                                    .clip(CircleShape)
                                    .clickable { showAvatarPicker = true },
                                color = Color.White,
                                shadowElevation = 4.dp
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        Icons.Default.PhotoCamera, 
                                        contentDescription = null, 
                                        tint = Violet600, 
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(20.dp))
                        
                        if (isEditing) {
                            OutlinedTextField(
                                value = editedName,
                                onValueChange = { editedName = it },
                                colors = OutlinedTextFieldDefaults.colors(
                                    unfocusedBorderColor = Color.White.copy(alpha = 0.5f),
                                    focusedBorderColor = Color.White,
                                    cursorColor = Color.White,
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                ),
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                textStyle = LocalTextStyle.current.copy(
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                ),
                                label = { Text("Enter Nickname", color = Color.White.copy(alpha = 0.7f), fontSize = 10.sp) },
                                modifier = Modifier.width(220.dp)
                            )
                        } else {
                            Text(
                                userProfile?.displayName ?: "Reader",
                                color = Color.White,
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = (-0.5).sp
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(4.dp))
                        
                        Text(
                            userProfile?.email ?: "Guest Reader",
                            color = Color.White.copy(alpha = 0.7f),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    
                    IconButton(
                        onClick = { navController.popBackStack() },
                        modifier = Modifier.statusBarsPadding().padding(8.dp).align(Alignment.TopStart)
                    ) {
                        Icon(Icons.Default.ArrowBackIosNew, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                    }

                    if (!isEditing) {
                        Surface(
                            modifier = Modifier
                                .statusBarsPadding()
                                .padding(16.dp)
                                .align(Alignment.TopEnd)
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { isEditing = true },
                            color = Color.White.copy(alpha = 0.15f)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.Edit, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Edit", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }

            item {
                // Quick Stats
                val points = userProfile?.points ?: 0
                val level = (points / 500) + 1
                val progress = (points % 500) / 500f
                
                val topReaders by viewModel.topReaders.collectAsState()
                val userRank = topReaders.indexOfFirst { it.uid == userProfile?.uid }.let { if (it == -1) "100+" else "#${it + 1}" }
                
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp)
                        .offset(y = (-30).dp)
                        .clip(RoundedCornerShape(24.dp))
                        .background(MaterialTheme.colorScheme.surface)
                        .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(24.dp))
                        .padding(24.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        StatItem(label = "Books", value = userProfile?.issuedBookIds?.size?.toString() ?: "0")
                        Box(modifier = Modifier.width(1.dp).height(40.dp).background(MaterialTheme.colorScheme.outlineVariant))
                        StatItem(label = "Points", value = points.toString())
                        Box(modifier = Modifier.width(1.dp).height(40.dp).background(MaterialTheme.colorScheme.outlineVariant))
                        StatItem(label = "Rank", value = userRank)
                    }
                    
                    Spacer(Modifier.height(16.dp))
                    
                    LinearProgressIndicator(
                        progress = progress,
                        modifier = Modifier.fillMaxWidth().height(8.dp).clip(CircleShape),
                        color = Violet600,
                        trackColor = Violet100
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("LV. $level Reader", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Violet600)
                        Text("${points % 500}/500 XP to next level", fontSize = 10.sp, color = Color.Gray)
                    }
                }
            }

            item {
                Text(
                    "Your Favorites",
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            val favoriteBooks = books.filter { userProfile?.bookmarkedBookIds?.contains(it.id) == true }
            if (favoriteBooks.isEmpty()) {
                item {
                    Text(
                        "No bookmarks yet. Tap the bookmark icon on any book!",
                        modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp),
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.outline
                    )
                }
            } else {
                items(favoriteBooks) { book ->
                    BookHistoryItem(book = book, statusLabel = "FAVORITE", statusColor = Color(0xFFFFF3E0), textColor = Color(0xFFE65100)) {
                        navController.navigate("bookDetail/${book.id}")
                    }
                }
            }

            item {
                Text(
                    "Your Reading Collection",
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 16.dp),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            if (issuedBooks.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.AutoStories, contentDescription = null, size = 48.dp, tint = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                            Spacer(Modifier.height(8.dp))
                            Text("No history yet. Start reading!", color = MaterialTheme.colorScheme.outline)
                        }
                    }
                }
            } else {
                items(issuedBooks) { book ->
                    BookHistoryItem(book = book, statusLabel = "ISSUED", statusColor = Color(0xFFE8F5E9), textColor = Color(0xFF2E7D32)) {
                        navController.navigate("bookDetail/${book.id}")
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
                Column(modifier = Modifier.padding(horizontal = 24.dp)) {
                    Text("Account Controls", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, letterSpacing = 1.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    ProfileMenuOption(icon = Icons.Default.Settings, label = "Preferences")
                    ProfileMenuOption(icon = Icons.Default.HelpCenter, label = "Support Center")
                    ProfileMenuOption(
                        icon = Icons.Default.PowerSettingsNew, 
                        label = "Logout Account", 
                        color = Color.Red,
                        onClick = {
                            viewModel.logout {
                                navController.navigate(Screen.Login.route) {
                                    popUpTo(0)
                                }
                            }
                        }
                    )
                }
                Spacer(modifier = Modifier.height(60.dp))
            }
        }
    }

    if (showAvatarPicker) {
        AlertDialog(
            onDismissRequest = { showAvatarPicker = false },
            title = { 
                Text("Customize Profile Picture", fontWeight = FontWeight.Black, fontSize = 20.sp) 
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text(
                        "Choose from our library or upload your own favorite image from your gallery.", 
                        fontSize = 12.sp, 
                        lineHeight = 16.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    // Gallery Button
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .clickable { 
                                galleryLauncher.launch("image/*")
                                showAvatarPicker = false
                            },
                        color = Violet600.copy(alpha = 0.1f),
                        border = BorderStroke(1.dp, Violet600.copy(alpha = 0.2f))
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(Icons.Rounded.AddPhotoAlternate, contentDescription = null, tint = Violet600)
                            Spacer(Modifier.width(12.dp))
                            Text("Upload from Gallery", fontWeight = FontWeight.Bold, color = Violet600)
                        }
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        HorizontalDivider(modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.outlineVariant)
                        Text(
                            "OR CHOOSE AVATAR", 
                            modifier = Modifier.padding(horizontal = 12.dp),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.outline
                        )
                        HorizontalDivider(modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.outlineVariant)
                    }
                    
                    // Avatar Grid
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        mainAxisSpacing = 12.dp,
                        crossAxisSpacing = 12.dp,
                        mainAxisAlignment = MainAxisAlignment.Center
                    ) {
                        avatars.forEach { url ->
                            AsyncImage(
                                model = url,
                                contentDescription = null,
                                modifier = Modifier
                                    .size(60.dp)
                                    .clip(CircleShape)
                                    .border(
                                        if (userProfile?.photoUrl == url) 3.dp else 0.dp,
                                        Violet600,
                                        CircleShape
                                    )
                                    .clickable {
                                        viewModel.updateProfile(photoUrl = url)
                                        showAvatarPicker = false
                                    },
                                contentScale = ContentScale.Crop
                            )
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showAvatarPicker = false }) {
                    Text("Cancel", fontWeight = FontWeight.Bold)
                }
            },
            shape = RoundedCornerShape(32.dp),
            containerColor = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun FlowRow(
    modifier: Modifier = Modifier,
    mainAxisSpacing: androidx.compose.ui.unit.Dp = 0.dp,
    crossAxisSpacing: androidx.compose.ui.unit.Dp = 0.dp,
    mainAxisAlignment: MainAxisAlignment = MainAxisAlignment.Start,
    content: @Composable () -> Unit
) {
    androidx.compose.foundation.layout.FlowRow(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(mainAxisSpacing, when(mainAxisAlignment) {
            MainAxisAlignment.Center -> Arrangement.Center
            MainAxisAlignment.End -> Arrangement.End
            else -> Arrangement.Start
        }),
        verticalArrangement = Arrangement.spacedBy(crossAxisSpacing),
        content = { content() }
    )
}

enum class MainAxisAlignment { Start, Center, End }

@Composable
fun BookHistoryItem(
    book: com.nammapustaka.app.model.Book, 
    statusLabel: String = "ISSUED", 
    statusColor: Color = Color(0xFFE8F5E9), 
    textColor: Color = Color(0xFF2E7D32),
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 6.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AsyncImage(
                model = book.imageUrl,
                contentDescription = null,
                modifier = Modifier.size(55.dp, 80.dp).clip(RoundedCornerShape(10.dp)),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(book.title, fontWeight = FontWeight.Bold, fontSize = 15.sp, maxLines = 1)
                Text(book.author, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                Spacer(modifier = Modifier.height(12.dp))
                Surface(
                    color = statusColor,
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        statusLabel,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                        color = textColor,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }
            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color.LightGray)
        }
    }
}

@Composable
fun StatItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontWeight = FontWeight.Black, fontSize = 22.sp, color = Violet600)
        Text(label.uppercase(), fontSize = 9.sp, color = Color.Gray, fontWeight = FontWeight.Black, letterSpacing = 0.5.sp)
    }
}

@Composable
fun ProfileMenuOption(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, color: Color = Color.Unspecified, onClick: () -> Unit = {}) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .padding(vertical = 14.dp, horizontal = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(color.takeOrElse { MaterialTheme.colorScheme.primary }.copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = null, tint = color.takeOrElse { MaterialTheme.colorScheme.primary }, modifier = Modifier.size(18.dp))
        }
        Spacer(modifier = Modifier.width(16.dp))
        Text(label, modifier = Modifier.weight(1f), fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = color.takeOrElse { Color.Unspecified })
        Icon(Icons.Default.ChevronRight, contentDescription = null, size = 16.dp, tint = Color.LightGray)
    }
}
