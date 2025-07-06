import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

// Upload image to Firebase Storage
export const uploadImage = async (file, userId) => {
  try {
    console.log('=== UPLOAD IMAGE FUNCTION CALLED ===');
    console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
    console.log('User ID:', userId);

    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload an image smaller than 5MB.');
    }

    // Create unique filename
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `blog-images/${fileName}`);

    console.log('Uploading to path:', storageRef.fullPath);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload successful:', snapshot.metadata.name);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadURL);

    console.log('=== UPLOAD IMAGE FUNCTION SUCCESS ===');
    return {
      url: downloadURL,
      path: storageRef.fullPath,
      fileName: fileName,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });

    let errorMessage = 'Failed to upload image';
    if (error.code === 'storage/unauthorized') {
      errorMessage = 'Permission denied. Please check your Firebase Storage rules.';
    } else if (error.code === 'storage/quota-exceeded') {
      errorMessage = 'Storage quota exceeded. Please try a smaller image.';
    } else if (error.code === 'storage/unauthenticated') {
      errorMessage = 'Please log in to upload images.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

// Delete image from Firebase Storage
export const deleteImage = async (imagePath) => {
  try {
    console.log('Deleting image:', imagePath);
    
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    
    console.log('Image deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    
    let errorMessage = 'Failed to delete image';
    if (error.code === 'storage/object-not-found') {
      errorMessage = 'Image not found.';
    } else if (error.code === 'storage/unauthorized') {
      errorMessage = 'Permission denied. You can only delete your own images.';
    }
    
    throw new Error(errorMessage);
  }
};

// Validate image file
export const validateImageFile = (file) => {
  const errors = [];

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push('File size too large. Please upload an image smaller than 5MB.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 