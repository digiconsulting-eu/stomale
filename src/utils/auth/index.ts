
// Main auth module that re-exports all functionality

// User-related types
export * from './types';

// User existence checks
export { checkUserExists } from './userExistence';

// Login functionality
export { loginWithEmailPassword } from './loginUtils';

// Admin utilities
export { checkIsAdmin, getAdminEmails } from './adminUtils';

// Session management
export { refreshSession, checkSessionHealth } from './sessionUtils';

// Auth reset and state management
export { resetAuthClient, checkForCorruptedState } from './resetUtils';
