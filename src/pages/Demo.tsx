import React, { useState } from 'react';
import WorkflowExecutionDashboard from '@/components/WorkflowExecutionDashboard';
import { IntegratedEventStreamingService } from '@/services/integratedEventStreamingService';

const DemoContent: React.FC = () => {
  const [eventService] = useState(() => new IntegratedEventStreamingService());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <WorkflowExecutionDashboard 
          eventService={eventService} 
          availableWorkflows={[]} // Empty array - dashboard will use its own static workflows
        />
      </div>
    </div>
  );
};

export const Demo: React.FC = () => {
  return <DemoContent />;
};

export default Demo;
