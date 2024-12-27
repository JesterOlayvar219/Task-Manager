import type { UserProfile } from '../../../../types/user';

export function filterUsers(users: UserProfile[], search: string): UserProfile[] {
  if (!search?.trim()) return users;
  
  const searchLower = search.trim().toLowerCase();
  return users.filter(user => {
    if (!user?.username) return false;
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });
}