export interface Resource {
  id: string;
  name: string;
  url?: string;
  username?: string;
  password?: string;
  accessUsers: string[];
  notes?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}