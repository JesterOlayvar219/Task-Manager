import { useState } from 'react';
import type { Task } from '../../types/task';

export interface PersonalTasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

export function usePersonalTasksState() {
  return useState<PersonalTasksState>({
    tasks: [],
    loading: true,
    error: null
  });
}