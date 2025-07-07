// Convert file to Base64 for free storage in Firestore
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

    // Validate file size (max 2MB for better quality)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload an image smaller than 2MB for free storage.');
    }

    // Compress and convert file to Base64
    console.log('Compressing and converting file to Base64...');
    let base64String;
    try {
      base64String = await compressAndConvertToBase64(file);
      console.log('Base64 conversion successful');
    } catch (error) {
      console.log('Canvas compression failed, using fallback method:', error);
      // Fallback to simple Base64 conversion
      base64String = await fileToBase64(file);
      console.log('Fallback Base64 conversion successful');
    }

    // Ensure the Base64 string has the proper data URL format
    if (base64String && !base64String.startsWith('data:')) {
      console.log('Base64 string missing data URL prefix, adding it...');
      const mimeType = file.type || 'image/jpeg';
      base64String = `data:${mimeType};base64,${base64String}`;
    }

    // Create unique filename
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}_${file.name}`;

    console.log('=== UPLOAD IMAGE FUNCTION SUCCESS ===');
    return {
      url: base64String, // This is the Base64 data URL
      path: `blog-images/${fileName}`,
      fileName: fileName,
      size: file.size,
      type: file.type,
      isBase64: true
    };
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });

    let errorMessage = 'Failed to upload image';
    if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

// Helper function to compress and convert file to Base64
const compressAndConvertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions (max 1200px width/height for good quality)
        const maxDimension = 1200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to Base64 with quality settings
        const quality = 0.8; // 80% quality for good balance
        const base64String = canvas.toDataURL('image/jpeg', quality);
        
        // Clean up object URL
        URL.revokeObjectURL(img.src);
        
        resolve(base64String);
      } catch (error) {
        // Clean up object URL on error
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };
    
    img.onerror = () => {
      // Clean up object URL on error
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for compression'));
    };
    
    // Create object URL for the image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
  });
};

// Helper function to convert file to Base64 (fallback)
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      console.log('FileReader result type:', typeof result);
      console.log('FileReader result starts with data:', result.startsWith('data:'));
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Delete image from Base64 storage (no-op since it's stored in Firestore)
export const deleteImage = async (imagePath) => {
  try {
    console.log('Deleting Base64 image:', imagePath);
    // Since images are stored in Firestore, deletion happens when the post is deleted
    console.log('Image will be deleted when post is deleted');
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
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

  // Check file size (max 2MB for better quality)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    errors.push('File size too large. Please upload an image smaller than 2MB for free storage.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Test Base64 conversion
export const testStorageConnection = async () => {
  try {
    console.log('Testing Base64 image conversion...');
    
    // Create a test file
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
    
    await fileToBase64(testFile);
    console.log('Base64 conversion test successful');
    
    return {
      success: true,
      message: 'Base64 image conversion is working properly'
    };
  } catch (error) {
    console.error('Base64 conversion test failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
}; 