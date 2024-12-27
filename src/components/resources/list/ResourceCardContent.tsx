import React from 'react';
import { cn } from '../../../lib/utils';
import type { Resource } from '../../../types/resource';

interface ResourceCardContentProps {
  resource: Resource;
  isExpanded: boolean;
}

export function ResourceCardContent({ resource, isExpanded }: ResourceCardContentProps) {
  if (!resource.notes && !resource.username) return null;

  return (
    <div className="space-y-2">
      {resource.notes && (
        <p className={cn(
          "text-sm text-gray-400",
          !isExpanded && "line-clamp-2"
        )}>
          {resource.notes}
        </p>
      )}
      
      {isExpanded && resource.username && (
        <div className="mt-4 space-y-2 text-sm">
          <div className="text-gray-300">
            <span className="font-medium">Username:</span> {resource.username}
          </div>
          {resource.password && (
            <div className="text-gray-300">
              <span className="font-medium">Password:</span> {resource.password}
            </div>
          )}
        </div>
      )}
    </div>
  );
}