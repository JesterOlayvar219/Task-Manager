import React from 'react';
import { ResourceCard } from '../ResourceCard';
import type { Resource } from '../../../types/resource';

interface ResourceListProps {
  resources: Resource[];
  onDelete: (id: string) => Promise<void>;
}

export function ResourceList({ resources, onDelete }: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] text-gray-400">
        <p>No resources added yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          name={resource.name}
          url={resource.url || undefined}
          username={resource.username || undefined}
          notes={resource.notes || undefined}
          accessUsers={resource.access_users}
          onDelete={() => onDelete(resource.id)}
        />
      ))}
    </div>
  );
}