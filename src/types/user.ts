export type UserRole = 
  | 'admin'
  | 'developer'
  | 'researcher'
  | 'media_buyer'
  | 'copywriter'
  | 'designer'
  | 'sales'
  | 'accounting';

export interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  lastActive: string;
}

export interface RolePermissions {
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canAssignTask: boolean;
  canCreateResource: boolean;
  canEditResource: boolean;
  canDeleteResource: boolean;
  canManageUsers: boolean;
}