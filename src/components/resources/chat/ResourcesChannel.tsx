import React, { useState } from 'react';
import { ResourceList } from '../list/ResourceList';
import { ResourcesHeader } from './ResourcesHeader';
import { AddResourceDialog } from '../dialogs/AddResourceDialog';
import { ChannelChat } from '../../channels/ChannelChat';
import { useResources } from '../../../hooks/useResources';

export function ResourcesChannel() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { resources, addResource, deleteResource } = useResources();

  return (
    <ChannelChat channelId="resources" channelName="Resources Chat">
      <div className="p-6">
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
    </ChannelChat>
  );
}