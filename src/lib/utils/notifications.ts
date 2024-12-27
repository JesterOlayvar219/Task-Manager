// Utility functions for notifications
export function getNotificationIcon(type: 'task' | 'comment' | 'mention') {
  switch (type) {
    case 'task':
      return 'clipboard';
    case 'comment':
      return 'message-square';
    case 'mention':
      return 'at-sign';
    default:
      return 'bell';
  }
}

export function getNotificationTitle(type: 'task' | 'comment' | 'mention') {
  switch (type) {
    case 'task':
      return 'Task Update';
    case 'comment':
      return 'New Comment';
    case 'mention':
      return 'Mention';
    default:
      return 'Notification';
  }
}