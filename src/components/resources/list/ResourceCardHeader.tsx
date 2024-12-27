import React from 'react';
import { Link2 } from 'lucide-react';
import type { Resource } from '../../../types/resource';

interface ResourceCardHeaderProps {
  resource: Resource;
  isExpanded: boolean;
  onExpandToggle: () => void;
}

export function ResourceCardHeader({ resource, isExpanded, onExpandToggle }: ResourceCardHeaderProps) {
  return (
    <div className="flex-1">
      <h3 className="text-white font-medium">{resource.name}</h3>
      {resource.url && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-[#10A37F] hover:underline mt-1"
        >
          <Link2 size={14} />
          <span>{resource.url}</span>
        </a>
      )}
    </div>
  );
}