import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase';

// Admin email addresses - UPDATE WITH YOUR ACTUAL EMAIL
const ADMIN_EMAILS = [
  'rg410345@gmail.com',
  'amritansh.raj21@gmail.com' 
];

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign in with Google
export const signInWithGoogle = async (): Promise<User | null> => {
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
    console.error('Sign in error:', error);
    
    // Handle specific Firebase auth errors
    switch (error.code) {
      case 'auth/unauthorized-domain':
        throw new Error('Domain not authorized. Please add your domain to Firebase Console → Authentication → Settings → Authorized domains');
      case 'auth/popup-blocked':
        throw new Error('Popup blocked. Please allow popups for this site.');
      case 'auth/popup-closed-by-user':
        throw new Error('Sign-in cancelled. Please try again.');
      case 'auth/network-request-failed':
        throw new Error('Network error. Please check your connection.');
      default:
        throw new Error(error.message || 'Sign-in failed. Please try again.');
    }
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error('Sign-out failed. Please try again.');
  }
};

// Check if user is admin
export const isAdminUser = (user: User | null): boolean => {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

// Get user display info
export const getUserDisplayInfo = (user: User | null) => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL,
    isAdmin: isAdminUser(user)
  };
};
