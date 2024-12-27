import React from 'react';
import { AddResourceButton } from '../buttons/AddResourceButton';

interface ResourcesHeaderProps {
  resourceCount: number;
  onAddResource: () => void;
}

export function ResourcesHeader({ resourceCount, onAddResource }: ResourcesHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-100">Resources</h2>
        <span className="text-sm text-gray-400">{resourceCount} resources</span>
      </div>
      <AddResourceButton onClick={onAddResource} />
    </div>
  );
}