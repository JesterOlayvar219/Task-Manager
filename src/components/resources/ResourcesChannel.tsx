import React, { useState } from 'react';
import { ResourceList } from './list/ResourceList';
import { ResourcesHeader } from './header/ResourcesHeader';
import { AddResourceDialog } from './dialogs/AddResourceDialog';
import { useResources } from '../../hooks/useResources';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

export function ResourcesChannel() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { resources, loading, error, addResource, deleteResource } = useResources();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="flex-1 bg-[#313338] p-6">
      <ResourcesHeader 
        resourceCount={resources.length} 
        onAddResource={() => setIsDialogOpen(true)} 
      />

      <ResourceList 
        resources={resources} 
        onDelete={deleteResource} 
      />

      <AddResourceDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={addResource}
      />
    </div>
  );
}