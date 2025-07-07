# Firebase Storage Setup

To enable image uploads in your blog, you need to deploy the Firebase Storage rules.

## Prerequisites

1. Make sure you have Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

## Deploy Storage Rules

1. Navigate to your blog directory:
   ```bash
   cd blog
   ```

2. Initialize Firebase (if not already done):
   ```bash
   firebase init storage
   ```

3. Deploy the storage rules:
   ```bash
   firebase deploy --only storage
   ```

## Storage Rules

The `storage.rules` file contains the following rules:

- **blog-images/{imageId}**: Allows authenticated users to upload images, anyone to read
- **profile-images/{imageId}**: Allows users to upload their own profile images
- **Default**: Denies all other access

## Troubleshooting

If image uploads still don't work after deploying rules:

1. Check the browser console for error messages
2. Verify that Firebase Storage is enabled in your Firebase Console
3. Make sure your Firebase project has the correct storage bucket configured
4. Check that the user is authenticated before attempting upload

## Testing

After deploying the rules, try uploading an image in the blog editor. You should see:
- Upload progress indicator
- Success message when upload completes
- Image preview in the editor

If you see "Permission denied" errors, make sure the storage rules have been deployed successfully. 