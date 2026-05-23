// ============================================================
// ADMIN MANAGEMENT API EXPORTS
// Bounded Context: User Management (Core)
// ============================================================

// Types
export * from '../types';

// API Layer
export { adminApi } from './adminApi';

// Hooks
export { 
  useAdminUsers, 
  useAdminUserCount, 
  useAdminUser, 
  useAdminUsersByRole 
} from './useAdminUsers';

export { useUserActions } from './useUserActions';
