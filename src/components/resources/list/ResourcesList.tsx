import React from 'react';
import { ResourceCard } from './ResourceCard';
import type { Resource } from '../../../types/resource';

interface ResourcesListProps {
  resources: Resource[];
  onDelete: (id: string) => void;
}

export function ResourcesList({ resources, onDelete }: ResourcesListProps) {
  if (resources.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] text-gray-400">
        <p>No resources added yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}