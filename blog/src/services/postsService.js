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
    console.log('Creating post with data:', { postData, userId, userName });
    
    const post = {
      ...postData,
      authorId: userId,
      authorName: userName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      excerpt: postData.content.substring(0, 100) + '...',
      status: postData.status || 'draft'
    };
    
    console.log('Post object to save:', post);
    
    const docRef = await addDoc(collection(db, 'posts'), post);
    console.log('Post created successfully with ID:', docRef.id);
    
    return { id: docRef.id, ...post };
  } catch (error) {
    console.error('Error creating post:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create post';
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Please check your Firestore rules.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firestore is currently unavailable. Please try again.';
    } else if (error.code === 'resource-exhausted') {
      errorMessage = 'Service temporarily unavailable. Please try again later.';
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