import type { UserRole } from '../types/user';

export const ROLE_PERMISSIONS = {
  admin: {
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: true,
    canAssignTask: true,
    canCreateResource: true,
    canEditResource: true,
    canDeleteResource: true,
    canManageUsers: true,
  },
  developer: {
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: false,
    canAssignTask: false,
    canCreateResource: true,
    canEditResource: true,
    canDeleteResource: false,
    canManageUsers: false,
  },
  researcher: {
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: false,
    canAssignTask: false,
    canCreateResource: true,
    canEditResource: true,
    canDeleteResource: false,
    canManageUsers: false,
  },
  media_buyer: {
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: false,
    canAssignTask: false,
    canCreateResource: true,
    canEditResource: true,
    canDeleteResource: false,
    canManageUsers: false,
  },
  copywriter: {
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: false,
    canAssignTask: false,
    canCreateResource: true,
    canEditResource: true,
    canDeleteResource: false,
    canManageUsers: false,
  },
  designer: {
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: false,
    canAssignTask: false,
    canCreateResource: true,
    canEditResource: true,
    canDeleteResource: false,
    canManageUsers: false,
  },
  sales: {
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: false,
    canAssignTask: false,
    canCreateResource: true,
    canEditResource: true,
    canDeleteResource: false,
    canManageUsers: false,
  },
  accounting: {
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: false,
    canAssignTask: false,
    canCreateResource: true,
    canEditResource: true,
    canDeleteResource: false,
    canManageUsers: false,
  },
} as const;