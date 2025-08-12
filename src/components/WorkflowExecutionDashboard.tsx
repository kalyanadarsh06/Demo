import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  Camera, 
  Lock, 
  Unlock, 
  Bell, 
  Zap, 
  Clock, 
  TrendingUp, 
  Network, 
  BarChart3, 
  Play, 
  Pause, 
  Eye, 
  Users, 
  MapPin,
  ChevronDown,
  Flame,
  AlertCircle
} from 'lucide-react';
import { IntegratedEventStreamingService, SecurityEvent, WorkflowExecution } from '@/services/integratedEventStreamingService';

interface WorkflowExecutionDashboardProps {
  eventService: IntegratedEventStreamingService;
  availableWorkflows?: any[]; // Optional prop for saved workflows from WorkflowsContext
}

export const WorkflowExecutionDashboard: React.FC<WorkflowExecutionDashboardProps> = ({ 
  eventService,
  availableWorkflows = []
}) => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [activeWorkflows, setActiveWorkflows] = useState<WorkflowExecution[]>([]);
  const [reportingData, setReportingData] = useState<any>({});
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowExecution | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Static workflows for demo - only Active Shooter and Fire Response
  const demoWorkflows = [
    {
      id: 'active-shooter-lockdown',
      name: 'Active Shooter Lockdown (K-12 School)',
      steps: [
        'AI Vision Analysis',
        'Lockdown Command',
        'Emergency Alert',
        'Facility Broadcast',
        'Emergency Alert'
      ],
      triggers: ['weapon_detected'],
      status: 'active' as const
    },
    {
      id: 'fire-response-workflow',
      name: 'Emergency Fire Response Workflow',
      steps: [
        'Fire Alarm Activation',
        'Emergency Exit Unlock',
        'Evacuation Lighting Activation', 
        'Emergency Services Notification',
        'Facility Broadcast',
        'Compliance Audit Log'
      ],
      triggers: ['fire_detected', 'smoke_detected'],
      status: 'active' as const
    }
  ];

  useEffect(() => {
    // Subscribe to event service updates
    const handleEventPublished = (event: SecurityEvent) => {
      setEvents(prev => [event, ...prev.slice(0, 49)]);
    };

    const handleWorkflowStarted = (execution: WorkflowExecution) => {
      setActiveWorkflows(prev => [...prev, execution]);
    };

    const handleWorkflowCompleted = (execution: WorkflowExecution) => {
      setActiveWorkflows(prev => 
        prev.map(w => w.id === execution.id ? execution : w)
      );
    };

    const handleWorkflowArchived = (execution: WorkflowExecution) => {
      setActiveWorkflows(prev => prev.filter(w => w.id !== execution.id));
    };

    const handleReportingUpdated = (data: any) => {
      setReportingData(data);
    };

    const handleWorkflowsTriggered = (data: any) => {
      // Visualize explicit trigger connections
      drawTriggerConnections(data.event, data.workflows, data.visualConnections);
    };

    // Event listeners
    eventService.on('event_published', handleEventPublished);
    eventService.on('workflow_started', handleWorkflowStarted);
    eventService.on('workflow_completed', handleWorkflowCompleted);
    eventService.on('workflow_archived', handleWorkflowArchived);
    eventService.on('reporting_updated', handleReportingUpdated);
    eventService.on('workflows_triggered', handleWorkflowsTriggered);

    // Initialize data
    setEvents(eventService.getRecentEvents(20));
    setActiveWorkflows(eventService.getActiveWorkflows());
    setReportingData(eventService.getReportingData());

    return () => {
      eventService.removeAllListeners();
    };
  }, [eventService]);

  const drawTriggerConnections = (event: SecurityEvent, workflows: any[], connections: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw animated connections
    connections.forEach((connection, index) => {
      setTimeout(() => {
        drawAnimatedConnection(ctx, connection, event, workflows[index]);
      }, index * 200);
    });
  };

  const drawAnimatedConnection = (ctx: CanvasRenderingContext2D, connection: any, event: SecurityEvent, workflow: any) => {
    const startX = 100;
    const startY = 100 + (Math.random() * 200);
    const endX = 400;
    const endY = 100 + (Math.random() * 200);

    // Draw connection line with animation
    ctx.strokeStyle = event.visualMetadata.color;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    
    let progress = 0;
    const animate = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      const currentX = startX + (endX - startX) * progress;
      const currentY = startY + (endY - startY) * progress;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      
      // Draw pulse at current position
      ctx.fillStyle = event.visualMetadata.color;
      ctx.beginPath();
      ctx.arc(currentX, currentY, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      progress += 0.02;
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  const handleStartDemo = async (scenarioId: string) => {
    setDemoRunning(true);
    try {
      await eventService.startDemoScenario(scenarioId);
    } catch (error) {
      console.error('Demo failed:', error);
    } finally {
      setTimeout(() => setDemoRunning(false), 30000); // Auto-stop after 30 seconds
    }
  };

  const getEventIcon = (type: string) => {
    const icons: Record<string, any> = {
      weapon_detected: AlertTriangle,
      motion_detected: Eye,
      access_denied: Lock,
      fire_alarm: Flame,
      lockdown_initiated: Shield
    };
    return icons[type] || AlertCircle;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getWorkflowStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header with Demo Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Security Operations Center</h1>
          <p className="text-muted-foreground">Real-time event monitoring and workflow execution</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => handleStartDemo('school_security_demo')}
            disabled={demoRunning}
            className="bg-red-600 hover:bg-red-700"
          >
            {demoRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            Start School Security Demo
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{reportingData.totalEvents || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold">{activeWorkflows.length}</p>
              </div>
              <Zap className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{reportingData.averageResponseTime || 0}s</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{Math.round((reportingData.successRate || 0) * 100)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Event Stream */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live Event Stream
              {demoRunning && (
                <Badge variant="destructive" className="animate-pulse">
                  DEMO ACTIVE
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {events.map(event => {
              const IconComponent = getEventIcon(event.type);
              return (
                <div
                  key={event.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedEvent?.id === event.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" style={{ color: event.visualMetadata.color }} />
                      <span className="font-medium text-sm">
                        {event.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-1">{event.location.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.timestamp.toLocaleTimeString()}
                  </p>
                  
                  {event.triggeredWorkflows.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs font-medium text-blue-600">
                        Triggered {event.triggeredWorkflows.length} workflow(s)
                      </p>
                      <div className="flex gap-1 mt-1">
                        {event.triggeredWorkflows.map((workflowId, index) => (
                          <div key={index} className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {events.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No events detected</p>
                <p className="text-sm">Start a demo to see live events</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Fire Response Workflows */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Emergency Fire Response Workflows
              <Badge variant="outline">2</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {demoWorkflows.map(workflow => (
              <div
                key={workflow.id}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">{workflow.name}</h4>
                  <Badge className={workflow.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                    {workflow.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                {/* Workflow Steps Dropdown */}
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    <span>View Steps ({workflow.steps.length})</span>
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-3 space-y-2">
                    {workflow.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                          {index + 1}
                        </div>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </details>

                {/* Triggers */}
                <div className="mt-3 pt-2 border-t">
                  <p className="text-xs font-medium text-gray-600 mb-2">Triggers:</p>
                  <div className="flex flex-wrap gap-1">
                    {workflow.triggers.map((trigger, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {trigger.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Visualization Canvas & Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Event-Workflow Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Canvas for drawing trigger connections */}
            <canvas
              ref={canvasRef}
              width={300}
              height={200}
              className="border rounded-lg mb-4 w-full"
            />
            
            {/* Selected Event/Workflow Details */}
            {selectedEvent && (
              <div className="space-y-3">
                <h4 className="font-medium">Selected Event</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: selectedEvent.visualMetadata.color }}
                    />
                    <span className="font-medium text-sm">
                      {selectedEvent.type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Device: {selectedEvent.source.deviceId}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Location: {selectedEvent.location.name}
                  </p>
                  
                  {selectedEvent.data.confidence && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Confidence:</span>
                      <span className="font-medium">
                        {Math.round(selectedEvent.data.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedWorkflow && (
              <div className="space-y-3">
                <h4 className="font-medium">Selected Workflow</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-sm mb-2">{selectedWorkflow.workflowName}</h5>
                  <div className="space-y-2">
                    {selectedWorkflow.steps.map((step, index) => (
                      <div key={step.stepId} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${
                          step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'running' ? 'bg-blue-500 animate-pulse' :
                          step.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                        }`} />
                        <span className={step.status === 'running' ? 'font-medium' : ''}>
                          {step.stepName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Event Distribution & Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Event Types</h4>
              <div className="space-y-2">
                {Array.from(reportingData.eventsByType?.entries() || []).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">{type.replace(/_/g, ' ')}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">System Performance</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Response Time</span>
                  <span className="font-medium">{reportingData.averageResponseTime || 0}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-medium">{Math.round((reportingData.successRate || 0) * 100)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Workflows Triggered</span>
                  <span className="font-medium">{reportingData.workflowsTriggered || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowExecutionDashboard;
