import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes with improved error handling
  useEffect(() => {
    let unsubscribe;
    let retryCount = 0;
    const maxRetries = 3;

    const setupAuthListener = () => {
      try {
        console.log('=== SETTING UP AUTH LISTENER ===');
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          try {
            console.log('=== AUTH STATE CHANGED ===');
            console.log('Firebase User:', user);

            if (user) {
              // Get additional user data from Firestore
              try {
                console.log('Fetching user data from Firestore for UID:', user.uid);
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                console.log('User document exists:', userDoc.exists());

                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  console.log('User data from Firestore:', userData);
                  setCurrentUser({
                    uid: user.uid,
                    email: user.email,
                    name: userData.name,
                    avatar: userData.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase(),
                    createdAt: userData.createdAt,
                    emailVerified: user.emailVerified
                  });
                } else {
                  console.log('User document not found, using fallback data');
                  // Fallback to basic user info
                  setCurrentUser({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || user.email?.split('@')[0],
                    avatar: user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase(),
                    createdAt: user.metadata.creationTime,
                    emailVerified: user.emailVerified
                  });
                }
              } catch (error) {
                console.error('Error fetching user data:', error);
                setCurrentUser({
                  uid: user.uid,
                  email: user.email,
                  name: user.displayName || user.email?.split('@')[0],
                  avatar: user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase(),
                  createdAt: user.metadata.creationTime,
                  emailVerified: user.emailVerified
                });
              }
            } else {
              console.log('No user authenticated');
              setCurrentUser(null);
            }
            setLoading(false);
            retryCount = 0; // Reset retry count on successful connection
            console.log('=== END AUTH STATE CHANGED ===');
          } catch (error) {
            console.error('Error in auth state change handler:', error);
            setLoading(false);
          }
        }, (error) => {
          console.error('Auth state change error:', error);
          setLoading(false);

          // Retry connection if it's a network error
          if (retryCount < maxRetries && (error.code === 'network-error' || error.code === 'unavailable')) {
            retryCount++;
            console.log(`Retrying auth connection (${retryCount}/${maxRetries})...`);
            setTimeout(() => {
              if (unsubscribe) {
                unsubscribe();
              }
              setupAuthListener();
            }, 2000 * retryCount); // Exponential backoff
          }
        });
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        setLoading(false);
      }
    };

    setupAuthListener();

    return () => {
      if (unsubscribe) {
        console.log('Cleaning up auth listener...');
        unsubscribe();
      }
    };
  }, []);

  const register = async (email, password, name) => {
    try {
      console.log('=== REGISTER FUNCTION CALLED ===');
      console.log('Registering user:', { email, name });

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase Auth user created:', user.uid);

      // Update profile with display name
      await updateProfile(user, {
        displayName: name
      });
      console.log('Profile updated with display name');

      // Send verification email
      await sendEmailVerification(user);
      console.log('Verification email sent');

      // Save additional user data to Firestore
      const userData = {
        name,
        email,
        createdAt: new Date().toISOString(),
        avatar: name.charAt(0).toUpperCase()
      };
      console.log('Saving user data to Firestore:', userData);

      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User data saved to Firestore successfully');

      console.log('=== REGISTER FUNCTION SUCCESS ===');
      return { success: true, user };
    } catch (error) {
      let errorMessage = 'An error occurred during registration';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
        default:
          errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      let errorMessage = 'An error occurred during login';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resendVerificationEmail = async () => {
    if (currentUser && !currentUser.emailVerified) {
      try {
        await sendEmailVerification(auth.currentUser);
        return { success: true };
      } catch (error) {
        throw error;
      }
    }
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
    resendVerificationEmail,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 