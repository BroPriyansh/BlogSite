import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Get all posts
export const getPosts = async () => {
  try {
    console.log('Fetching posts from Firestore...');
    const q = query(collection(db, 'posts'), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    console.log('Posts fetched successfully:', posts.length);
    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    // Return empty array instead of throwing for better UX
    return [];
  }
};

// Create a new post
export const createPost = async (postData, userId, userName) => {
  try {
    console.log('=== CREATE POST FUNCTION CALLED ===');
    console.log('Creating post with data:', { postData, userId, userName });
    console.log('User authentication check:', { userId, userName });
    
    if (!userId || !userName) {
      console.error('❌ Authentication check failed');
      throw new Error('User authentication required');
    }
    
    console.log('✅ Authentication check passed');
    
    const post = {
      ...postData,
      authorId: userId,
      authorName: userName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      excerpt: postData.content.substring(0, 100) + '...',
      status: postData.status || 'draft'
    };
    
    // Remove undefined fields that Firestore doesn't accept
    Object.keys(post).forEach(key => {
      if (post[key] === undefined) {
        delete post[key];
      }
    });
    
    console.log('Post object to save:', post);
    console.log('Attempting to write to Firestore...');
    console.log('Collection path: posts');
    
    const docRef = await addDoc(collection(db, 'posts'), post);
    console.log('✅ Post created successfully with ID:', docRef.id);
    console.log('=== CREATE POST FUNCTION SUCCESS ===');
    
    return { id: docRef.id, ...post };
  } catch (error) {
    console.error('❌ Error creating post:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    console.error('=== CREATE POST FUNCTION FAILED ===');
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create post';
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Please check your Firestore rules.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firestore is currently unavailable. Please try again.';
    } else if (error.code === 'resource-exhausted') {
      errorMessage = 'Service temporarily unavailable. Please try again later.';
    } else if (error.code === 'network-error') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.code === 'not-found') {
      errorMessage = 'Firestore database not found. Please check your Firebase setup.';
    }
    
    throw new Error(errorMessage);
  }
};

// Update a post
export const updatePost = async (postId, postData) => {
  try {
    console.log('Updating post:', postId, postData);
    
    const postRef = doc(db, 'posts', postId);
    const updateData = {
      ...postData,
      updatedAt: serverTimestamp(),
      excerpt: postData.content.substring(0, 100) + '...'
    };
    
    await updateDoc(postRef, updateData);
    console.log('Post updated successfully');
    
    return { id: postId, ...updateData };
  } catch (error) {
    console.error('Error updating post:', error);
    
    let errorMessage = 'Failed to update post';
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. You can only edit your own posts.';
    } else if (error.code === 'not-found') {
      errorMessage = 'Post not found.';
    }
    
    throw new Error(errorMessage);
  }
};

// Get posts by user
export const getPostsByUser = async (userId) => {
  try {
    console.log('Fetching posts for user:', userId);
    
    const q = query(
      collection(db, 'posts'), 
      where('authorId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('User posts fetched:', posts.length);
    return posts;
  } catch (error) {
    console.error('Error getting user posts:', error);
    return [];
  }
}; 