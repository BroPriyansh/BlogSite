import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  where,
  serverTimestamp,
  deleteDoc,
  getDoc,
  setDoc
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

// Delete a post
export const deletePost = async (postId) => {
  try {
    console.log('Deleting post:', postId);
    
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    console.log('Post deleted successfully');
    
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    
    let errorMessage = 'Failed to delete post';
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. You can only delete your own posts.';
    } else if (error.code === 'not-found') {
      errorMessage = 'Post not found.';
    }
    
    throw new Error(errorMessage);
  }
};

// Like a post
export const likePost = async (postId, userId) => {
  try {
    console.log('=== LIKE POST FUNCTION CALLED ===');
    console.log('Post ID:', postId, 'User ID:', userId);
    
    if (!postId || !userId) {
      console.error('Missing required parameters:', { postId, userId });
      throw new Error('Missing required parameters');
    }
    
    const likeRef = doc(db, 'posts', postId, 'likes', userId);
    console.log('Like document reference:', likeRef.path);
    
    const likeDoc = await getDoc(likeRef);
    console.log('Like document exists:', likeDoc.exists());
    
    if (likeDoc.exists()) {
      // Unlike: remove the like
      console.log('Removing like...');
      await deleteDoc(likeRef);
      console.log('Post unliked successfully');
      return { liked: false };
    } else {
      // Like: add the like
      console.log('Adding like...');
      await setDoc(likeRef, {
        userId,
        timestamp: serverTimestamp()
      });
      console.log('Post liked successfully');
      return { liked: true };
    }
  } catch (error) {
    console.error('❌ Error liking post:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    // Provide specific error messages based on error codes
    let errorMessage = 'Failed to like post';
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Please check your Firestore security rules. Make sure authenticated users can access the likes subcollection.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firestore is currently unavailable. Please try again.';
    } else if (error.code === 'resource-exhausted') {
      errorMessage = 'Service temporarily unavailable. Please try again later.';
    } else if (error.code === 'network-error') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.code === 'not-found') {
      errorMessage = 'Post not found. Please refresh the page and try again.';
    } else {
      errorMessage = `Failed to like post: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
};

// Get like count for a post
export const getLikeCount = async (postId) => {
  try {
    console.log('Getting like count for post:', postId);
    const likesQuery = query(collection(db, 'posts', postId, 'likes'));
    const querySnapshot = await getDocs(likesQuery);
    console.log('Like count result:', querySnapshot.size);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting like count:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message
    });
    // Return 0 if there's a permission error, as the subcollection might not exist yet
    return 0;
  }
};

// Check if user has liked a post
export const checkUserLike = async (postId, userId) => {
  try {
    const likeRef = doc(db, 'posts', postId, 'likes', userId);
    const likeDoc = await getDoc(likeRef);
    return likeDoc.exists();
  } catch (error) {
    console.error('Error checking user like:', error);
    return false;
  }
};

// Add a comment to a post
export const addComment = async (postId, commentData, userId, userName) => {
  try {
    console.log('=== ADD COMMENT FUNCTION CALLED ===');
    console.log('Post ID:', postId, 'User ID:', userId, 'User Name:', userName);
    
    if (!postId || !userId || !userName) {
      console.error('Missing required parameters:', { postId, userId, userName });
      throw new Error('Missing required parameters');
    }
    
    const comment = {
      ...commentData,
      authorId: userId,
      authorName: userName,
      timestamp: serverTimestamp()
    };
    
    console.log('Comment object to save:', comment);
    console.log('Collection path: posts/' + postId + '/comments');
    
    const docRef = await addDoc(collection(db, 'posts', postId, 'comments'), comment);
    console.log('✅ Comment added successfully with ID:', docRef.id);
    
    return { id: docRef.id, ...comment };
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    // Provide specific error messages based on error codes
    let errorMessage = 'Failed to add comment';
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Please check your Firestore security rules. Make sure authenticated users can access the comments subcollection.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firestore is currently unavailable. Please try again.';
    } else if (error.code === 'resource-exhausted') {
      errorMessage = 'Service temporarily unavailable. Please try again later.';
    } else if (error.code === 'network-error') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.code === 'not-found') {
      errorMessage = 'Post not found. Please refresh the page and try again.';
    } else {
      errorMessage = `Failed to add comment: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
};

// Get comments for a post
export const getComments = async (postId) => {
  try {
    console.log('Getting comments for post:', postId);
    const commentsQuery = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(commentsQuery);
    const comments = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    console.log('Comments result:', comments.length, 'comments');
    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message
    });
    // Return empty array if there's a permission error, as the subcollection might not exist yet
    return [];
  }
};

// Delete a comment
export const deleteComment = async (postId, commentId) => {
  try {
    console.log('=== DELETE COMMENT FUNCTION CALLED ===');
    console.log('Post ID:', postId, 'Comment ID:', commentId);
    
    if (!postId || !commentId) {
      console.error('Missing required parameters:', { postId, commentId });
      throw new Error('Missing required parameters');
    }
    
    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
    console.log('Comment document reference:', commentRef.path);
    
    await deleteDoc(commentRef);
    console.log('✅ Comment deleted successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    // Provide specific error messages based on error codes
    let errorMessage = 'Failed to delete comment';
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. You can only delete your own comments.';
    } else if (error.code === 'not-found') {
      errorMessage = 'Comment not found.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firestore is currently unavailable. Please try again.';
    } else {
      errorMessage = `Failed to delete comment: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
}; 