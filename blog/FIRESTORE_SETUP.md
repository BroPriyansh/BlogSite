# Firestore Security Rules Setup

## Problem
The like and comment functionality is failing because the Firestore security rules don't allow access to subcollections (`likes` and `comments`).

## Solution
You need to update your Firestore security rules in the Firebase Console.

## Steps to Fix

### 1. Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`dashboard-c1927`)
3. Go to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### 2. Update the Security Rules
Replace the current rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read all posts
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null && (
        request.auth.uid == resource.data.authorId || 
        request.auth.token.email == 'memuforpc12@gmail.com'
      );
      
      // Allow authenticated users to read/write likes subcollection
      match /likes/{likeId} {
        allow read, write: if request.auth != null;
      }
      
      // Allow authenticated users to read/write comments subcollection
      match /comments/{commentId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
    
    // Allow users to read/write their own user data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Publish the Rules
1. Click **Publish** to save the new rules
2. Wait a few minutes for the rules to take effect

### 4. Test the Functionality
1. Log in to your blog application
2. Navigate to any article
3. Try liking the article
4. Try adding a comment
5. Check the browser console for any error messages

## What These Rules Do

- **Posts**: Everyone can read posts, but only authors and the admin can edit/delete them
- **Likes**: Only authenticated users can like/unlike posts
- **Comments**: Everyone can read comments, but only authenticated users can add comments
- **Users**: Users can only access their own user data

## Troubleshooting

If you still see errors after updating the rules:

1. **Check the browser console** for specific error messages
2. **Wait a few minutes** for the rules to propagate
3. **Make sure you're logged in** before testing like/comment functionality
4. **Clear browser cache** and refresh the page

## Alternative: Temporary Fix

If you can't update the Firestore rules immediately, the code has been updated to provide better error messages that will help identify the specific issue. 