import { useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import type { Task } from '../types/task';

interface UseDragAndDropProps {
  onTaskMove: (taskId: string, status: Task['status']) => void;
}

export function useDragAndDrop({ onTaskMove }: UseDragAndDropProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      onTaskMove(active.id as string, over.id as Task['status']);
    }
    
    setActiveId(null);
  };

  return {
    activeId,
    handleDragStart,
    handleDragEnd,
  };
}