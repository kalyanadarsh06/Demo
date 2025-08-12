import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import EnhancedHeader from '@/components/EnhancedHeader';
import EnhancedEventStream, { SecurityEvent } from '@/components/EnhancedEventStream';
import WorkflowCanvas from '@/components/WorkflowCanvas';
import SystemStatusPanel from '@/components/SystemStatusPanel';
import { layout, theme } from '@/styles/theme';

// Enhanced demo sequence with metadata and workflow information
let demoEventIndex = 0;
const enhancedDemoSequence: (string | Partial<SecurityEvent>)[] = [
  "Access card used - Main entrance (Badge #4521)",
  "Door unlock - Classroom 101",
  { 
    message: "Camera offline - Gym #3", 
    type: "warning" as const,
    category: "device_fault" as const,
    metadata: { device: "Camera #3", location: "Gymnasium", status: "Offline" }
  },
  "Badge scan - Staff entrance (Badge #7832)",
  "Visitor buzz in - Main office",
  { 
    message: "Smoke detected - Cafeteria sensor #7", 
    type: "critical" as const,
    category: "fire" as const,
    location: "School Cafeteria",
    metadata: { sensor: "Smoke Detector #7", confidence: "98%", zone: "Cafeteria" },
    workflow: {
      id: "fire-response",
      name: "Emergency Fire Response Workflow",
      steps: [
        { id: 1, action: "Fire Alarm Activation", description: "Sound building-wide fire alarm" },
        { id: 2, action: "Emergency Exit Unlock", description: "Unlock all emergency exits" },
        { id: 3, action: "Evacuation Lighting Activation", description: "Activate emergency lighting system" },
        { id: 4, action: "Emergency Services Notification", description: "Notify fire department automatically" },
        { id: 5, action: "Facility Broadcast", description: "PA announcement: evacuation procedures" },
        { id: 6, action: "Compliance Audit Log", description: "Log all actions for compliance review" }
      ]
    }
  },
  "Access card used - Library entrance (Badge #2341)",
  { 
    message: "Door sensor fault - Classroom 205", 
    type: "warning" as const,
    category: "device_fault" as const,
    metadata: { device: "Door Sensor", location: "Classroom 205", status: "Fault" }
  },
  { 
    message: "Weapon detected - Camera #2 (Front entrance)", 
    type: "critical" as const,
    category: "weapon" as const,
    location: "Front Entrance",
    metadata: { sensor: "AI Camera #2", confidence: "96%", threat_type: "Firearm" },
    workflow: {
      id: "active-shooter",
      name: "Active Shooter Lockdown Protocol",
      steps: [
        { id: 1, action: "AI Vision Analysis", description: "Confirm threat with secondary AI analysis" },
        { id: 2, action: "Lockdown Command", description: "Lock all doors and secure building" },
        { id: 3, action: "Emergency Alert", description: "Alert law enforcement immediately" },
        { id: 4, action: "Facility Broadcast", description: "PA announcement: lockdown procedures" },
        { id: 5, action: "Staff Notification", description: "Send emergency alerts to all staff devices" }
      ]
    }
  },
  "Badge scan - Administrative office (Badge #9876)"
];

function buildEnhancedEvent(): SecurityEvent | null {
  if (demoEventIndex >= enhancedDemoSequence.length) {
    return null;
  }
  
  const eventData = enhancedDemoSequence[demoEventIndex];
  demoEventIndex++;
  
  const timestamp = new Date().toLocaleTimeString();
  const id = `${Date.now()}-${demoEventIndex}`;
  
  if (typeof eventData === "string") {
    // Normal event
    return {
      id,
      type: "info",
      message: eventData,
      timestamp,
      category: "access"
    };
  } else {
    // Enhanced event with metadata
    return {
      id,
      timestamp,
      ...eventData
    } as SecurityEvent;
  }
}

const EnhancedDemo: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<'fire' | 'weapon' | null>(null);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [demoProgress, setDemoProgress] = useState(0);
  const [deviceStats, setDeviceStats] = useState({
    cameras: { total: 24, online: 24 },
    accessControl: { total: 18, online: 18 },
    sensors: { total: 45, online: 45 },
    paSystem: { total: 6, online: 6 }
  });

  // Demo control handlers
  const handleStart = () => {
    demoEventIndex = 0;
    setEvents([]);
    setActiveWorkflow(null);
    setWorkflowProgress(0);
    setDemoProgress(0);
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
    setActiveWorkflow(null);
    setWorkflowProgress(0);
    setDemoProgress(0);
  };

  const handlePause = () => {
    setRunning(false);
  };

  const handleExecuteWorkflow = (workflowId: string) => {
    if (workflowId === 'fire-response') {
      setActiveWorkflow('fire');
      simulateWorkflowExecution('fire');
    } else if (workflowId === 'active-shooter') {
      setActiveWorkflow('weapon');
      simulateWorkflowExecution('weapon');
    }
  };

  const simulateWorkflowExecution = (type: 'fire' | 'weapon') => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20; // Faster progress for better visibility
      setWorkflowProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        // Keep workflow active longer to show completion
        setTimeout(() => {
          setActiveWorkflow(null);
          setWorkflowProgress(0);
        }, 5000); // Increased from 3000 to 5000ms
      }
    }, 800); // Slower interval for better visibility
  };

  // Event generation effect
  useEffect(() => {
    if (!running) return;
    
    const timer = setInterval(() => {
      const eventData = buildEnhancedEvent();
      
      if (eventData === null) {
        setRunning(false);
        setDemoProgress(100);
        return;
      }
      
      setEvents(prev => [eventData, ...prev].slice(0, 20));
      setDemoProgress(Math.round((demoEventIndex / enhancedDemoSequence.length) * 100));
      
      // Update device status based on event type
      if (eventData.category === 'device_fault') {
        if (eventData.message.includes('Camera')) {
          setDeviceStats(prev => ({
            ...prev,
            cameras: { ...prev.cameras, online: prev.cameras.online - 1 }
          }));
        } else if (eventData.message.includes('sensor')) {
          setDeviceStats(prev => ({
            ...prev,
            sensors: { ...prev.sensors, online: prev.sensors.online - 1 }
          }));
        }
      }
      
      // Auto-execute weapon workflows
      if (eventData.category === 'weapon' && eventData.workflow) {
        setTimeout(() => {
          handleExecuteWorkflow(eventData.workflow!.id);
        }, 1000);
      }
    }, 2500);
    
    return () => clearInterval(timer);
  }, [running]);

  // System status data
  const systemHealth = 'healthy' as const;
  const workflows = [
    {
      name: 'Active Shooter Lockdown',
      status: 'standby' as const,
      lastTriggered: 'Never',
      avgResponseTime: '2.1s',
      successRate: 100
    },
    {
      name: 'Fire Emergency Response',
      status: 'standby' as const,
      lastTriggered: '3 days ago',
      avgResponseTime: '1.8s',
      successRate: 98
    }
  ];

  // Device stats are now managed by state above

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Enhanced Header */}
      <EnhancedHeader
        demoStatus={running ? 'running' : 'idle'}
        totalEvents={events.length}
        activeWorkflows={2}
        systemHealth={systemHealth}
        progress={demoProgress}
        onStart={handleStart}
        onStop={handleStop}
        onPause={handlePause}
      />

      {/* Main Content - 3 Panel Layout */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Panel - Enhanced Event Stream */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`${layout.leftPanel} border-r border-white/10 bg-black/20 backdrop-blur-sm overflow-y-auto`}
        >
          <EnhancedEventStream
            events={events}
            isLive={running}
            onExecuteWorkflow={handleExecuteWorkflow}
          />
        </motion.div>

        {/* Center Panel - Interactive Workflow Canvas */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${layout.mainContent} relative`}
        >
          <WorkflowCanvas
            activeWorkflow={activeWorkflow}
            executionProgress={workflowProgress}
          />
          
          {/* Canvas Overlay Info */}
          <div className="absolute top-4 left-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-black/40 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/10"
            >
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  activeWorkflow ? 'bg-red-400 animate-pulse' : 'bg-green-400'
                }`} />
                <span className="text-sm font-medium text-white">
                  {activeWorkflow 
                    ? `${activeWorkflow === 'fire' ? 'Fire Protocol' : 'Lockdown Protocol'} Active`
                    : 'System Monitoring'
                  }
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Panel - System Status */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`${layout.rightPanel} border-l border-white/10 bg-black/20 backdrop-blur-sm overflow-y-auto`}
        >
          <SystemStatusPanel
            systemHealth={systemHealth}
            workflows={workflows}
            deviceStats={deviceStats}
          />
        </motion.div>
      </div>

      {/* Footer Status Bar */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="h-12 border-t border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-between px-6"
      >

      </motion.div>
    </div>
  );
};

export default EnhancedDemo;
