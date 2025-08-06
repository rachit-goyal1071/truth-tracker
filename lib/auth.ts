import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User 
} from 'firebase/auth';
import { auth } from './firebase';

// Configure admin emails - REPLACE WITH YOUR ACTUAL ADMIN EMAIL
const ADMIN_EMAILS = [
  'rg410345@gmail.com',
];

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user is admin
    if (!isAdminUser(user)) {
      await signOut(auth);
      throw new Error('Access denied. Admin privileges required.');
    }
    
    return user;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for authentication. Please contact the administrator.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign in was cancelled.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
    } else if (error.message === 'Access denied. Admin privileges required.') {
      throw error;
    } else {
      throw new Error('Sign in failed. Please try again.');
    }
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Sign out failed. Please try again.');
  }
};

// Check if user is admin
export const isAdminUser = (user: User | null): boolean => {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
};

// Get user display name
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return '';
  return user.displayName || user.email || 'User';
};
