// Re-export all notification functionality from the modular files
export {
  initializeNotifications
} from './notifications/initialize';

export {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications
} from './notifications/mutations';

export {
  createNotificationsQuery,
  getUnreadNotificationsQuery,
  getUnreadCount
} from './notifications/queries';