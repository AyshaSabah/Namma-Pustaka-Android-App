# Security Specification for Namma-Pustaka

## 1. Data Invariants
- **Books (`/books/{bookId}`)**: 
  - Publicly readable (list and get).
  - Creation/Updates: Restricted to authenticated users for initial seeding. (In a real app, only admins).
  - Document ID: Must be a valid ID string.
  - Fields: `title`, `author`, `genre` are required and must be strings with size limits.
  
- **User Profiles (`/users/{userId}`)**:
  - Read: Only the owner (`userId == request.auth.uid`).
  - Create: Anyone authenticated can create their own profile.
  - Update: Only the owner can update. 
  - Immutable: `email` must not change after creation.
  - Schema: `points` (int), `issuedBookIds` (list of strings), `reservedBookIds` (list of strings).
  - Privacy: User profiles are private to the owner.

- **Notifications (`/users/{userId}/notifications/{notifId}`)**:
  - Parent profile must belong to the user.
  - Read/Write: Only the owner of the parent profile can access.
  - Schema: `title`, `message`, `timestamp`, `isRead` (bool), `type` (enum).

## 2. The "Dirty Dozen" Payloads (Anti-Patterns)
1. **Identity Spoofing**: Attempt to create a `users/victimId` profile as `attackerId`.
2. **Schema Poisoning**: Adding `isAdmin: true` to a UserProfile.
3. **Ghost Fields**: Adding `maliciousCode: "..."` to a Book document.
4. **Id Poisoning**: Using a 1MB string as a Document ID for a book.
5. **PII Leak**: Authenticated user trying to `get` another user's profile.
6. **Immutable Field Escape**: Attempting to change `email` in a `users` update.
7. **Size Bomb**: Sending a book description that is 5MB.
8. **Orphaned Writes**: Creating a notification for a user that doesn't exist.
9. **Identity Integrity**: Setting `ownerId` of a resource to someone else's UID.
10. **Unprotected List**: Querying all users without a filter on `userId`.
11. **Type Confusion**: Sending `points: "100"` (string) instead of integer.
12. **Unauthorized Deletion**: Attacker deleting a book from the catalog.

## 3. Security Requirements
- All strings must have `.size()` limits (e.g., 500 characters for descriptions, 100 for titles).
- All writes must use `isValidId()` and `isValid[Entity]()`.
- Updates must use `affectedKeys().hasOnly()`.
- Timestamps must be server-validated where applicable (though current logic uses ISO strings, ideally use `request.time`).
- No blanket `allow read: if isSignedIn()` on user collections.

## 4. Test Runner Plan
We will use `firestore-rules-test` patterns to verify these invariants.
(Note: Since I cannot run actual vitest/jest tests in this environment easily without setting up a full test suite, I will perform a manual "Red Team Analysis" on the rules logic).
