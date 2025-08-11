import { EventEmitter } from 'events';

// Enhanced Event System with Explicit Trigger Visualization
export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: SecurityEventType;
  source: EventSource;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: Location;
  data: Record<string, any>;
  correlationId?: string;
  triggeredWorkflows: string[];
  status: 'new' | 'processing' | 'resolved' | 'escalated';
  visualMetadata: EventVisualMetadata;
}

export interface EventVisualMetadata {
  color: string;
  icon: string;
  animation: 'pulse' | 'bounce' | 'flash' | 'ripple';
  duration: number;
  priority: number;
  uiEffects: UIEffect[];
}

export interface UIEffect {
  type: 'highlight' | 'notification' | 'modal' | 'sound' | 'vibration';
  target: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  data?: Record<string, any>;
}

export enum SecurityEventType {
  // Motion & Detection
  MOTION_DETECTED = 'motion_detected',
  WEAPON_DETECTED = 'weapon_detected',
  INTRUSION_ALERT = 'intrusion_alert',
  PERIMETER_BREACH = 'perimeter_breach',
  
  // Access Control
  ACCESS_GRANTED = 'access_granted',
  ACCESS_DENIED = 'access_denied',
  BADGE_SCAN_SUCCESS = 'badge_scan_success',
  BADGE_SCAN_FAILED = 'badge_scan_failed',
  DOOR_FORCED = 'door_forced',
  MULTIPLE_FAILED_ATTEMPTS = 'multiple_failed_attempts',
  
  // AI Vision
  SUSPICIOUS_BEHAVIOR = 'suspicious_behavior',
  CROWD_DETECTED = 'crowd_detected',
  FACE_RECOGNIZED = 'face_recognized',
  FACE_UNKNOWN = 'face_unknown',
  
  // Emergency
  FIRE_ALARM = 'fire_alarm',
  MEDICAL_EMERGENCY = 'medical_emergency',
  EVACUATION_TRIGGERED = 'evacuation_triggered',
  LOCKDOWN_INITIATED = 'lockdown_initiated',
  
  // System
  DEVICE_OFFLINE = 'device_offline',
  DEVICE_ONLINE = 'device_online',
  WORKFLOW_TRIGGERED = 'workflow_triggered',
  WORKFLOW_COMPLETED = 'workflow_completed',
  WORKFLOW_FAILED = 'workflow_failed'
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  currentStep: number;
  totalSteps: number;
  triggerEvent: SecurityEvent;
  steps: StepExecution[];
  progress: number;
  visualState: WorkflowVisualState;
  parallelExecutions: string[];
  dependencies: string[];
}

export interface WorkflowVisualState {
  position: { x: number; y: number };
  color: string;
  size: 'small' | 'medium' | 'large';
  animation: 'idle' | 'running' | 'completed' | 'error';
  connections: Connection[];
  highlights: Highlight[];
}

export interface Connection {
  from: string;
  to: string;
  type: 'trigger' | 'dependency' | 'parallel';
  status: 'active' | 'inactive' | 'completed';
  animated: boolean;
}

export interface StepExecution {
  stepId: string;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  deviceCommands: DeviceCommand[];
  results: StepResult[];
  visualEffects: VisualEffect[];
}

export interface VisualEffect {
  type: 'device_highlight' | 'command_execution' | 'result_display' | 'error_indication';
  target: string;
  duration: number;
  data: Record<string, any>;
}

// Integrated Event Streaming Service
export class IntegratedEventStreamingService extends EventEmitter {
  private events: SecurityEvent[] = [];
  private activeWorkflows: Map<string, WorkflowExecution> = new Map();
  private eventQueue: SecurityEvent[] = [];
  private processing = false;
  private subscribers: Map<string, Function[]> = new Map();
  private demoMode = true;
  private reportingData: ReportingData = {
    totalEvents: 0,
    workflowsTriggered: 0,
    averageResponseTime: 0,
    successRate: 0,
    eventsByType: new Map(),
    workflowPerformance: new Map()
  };

  constructor() {
    super();
    this.initializeEventProcessing();
    this.startReportingCollection();
  }

  // Event Publishing with Explicit Trigger Visualization
  async publishEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'triggeredWorkflows' | 'visualMetadata'>): Promise<void> {
    const enhancedEvent: SecurityEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      triggeredWorkflows: [],
      visualMetadata: this.generateVisualMetadata(event.type, event.severity)
    };

    this.events.unshift(enhancedEvent);
    this.eventQueue.push(enhancedEvent);
    
    // Update reporting data
    this.updateReportingData(enhancedEvent);
    
    // Emit for UI updates
    this.emit('event_published', enhancedEvent);
    
    // Process event queue
    if (!this.processing) {
      await this.processEventQueue();
    }
  }

  // Process Event Queue with Workflow Triggering
  private async processEventQueue(): Promise<void> {
    this.processing = true;
    
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      await this.processEvent(event);
    }
    
    this.processing = false;
  }

  // Enhanced Event Processing with Explicit Workflow Triggering
  private async processEvent(event: SecurityEvent): Promise<void> {
    console.log(`🔄 Processing event: ${event.type} from ${event.source.deviceId}`);
    
    // Find workflows that should be triggered
    const triggeredWorkflows = await this.findTriggeredWorkflows(event);
    
    if (triggeredWorkflows.length > 0) {
      event.triggeredWorkflows = triggeredWorkflows.map(w => w.id);
      
      // Execute workflows in parallel
      const executionPromises = triggeredWorkflows.map(workflow => 
        this.executeWorkflow(workflow, event)
      );
      
      await Promise.all(executionPromises);
      
      // Emit explicit trigger visualization
      this.emit('workflows_triggered', {
        event,
        workflows: triggeredWorkflows,
        visualConnections: this.generateTriggerConnections(event, triggeredWorkflows)
      });
    }
    
    // Notify subscribers
    const subscribers = this.subscribers.get(event.type) || [];
    subscribers.forEach(callback => callback(event));
    
    // Emit for UI updates
    this.emit('event_processed', event);
  }

  // Workflow Execution with Visual Tracking
  private async executeWorkflow(workflow: any, triggerEvent: SecurityEvent): Promise<void> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: 'running',
      startTime: new Date(),
      currentStep: 0,
      totalSteps: workflow.steps.length,
      triggerEvent,
      steps: [],
      progress: 0,
      visualState: {
        position: this.calculateWorkflowPosition(workflow.id),
        color: this.getWorkflowColor(workflow.source),
        size: 'medium',
        animation: 'running',
        connections: [],
        highlights: []
      },
      parallelExecutions: [],
      dependencies: []
    };

    this.activeWorkflows.set(executionId, execution);
    this.emit('workflow_started', execution);

    try {
      // Execute steps with visual feedback
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        execution.currentStep = i;
        execution.progress = (i / workflow.steps.length) * 100;

        // Update visual state
        execution.visualState.highlights = [{
          target: step.id,
          type: 'current_step',
          intensity: 'high',
          duration: 0 // Persistent until step completes
        }];

        this.emit('workflow_step_started', { execution, step });

        const stepExecution = await this.executeStep(step, execution);
        execution.steps.push(stepExecution);

        this.emit('workflow_step_completed', { execution, step, result: stepExecution });

        // Add delay for demo visualization
        if (this.demoMode) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      execution.status = 'completed';
      execution.endTime = new Date();
      execution.progress = 100;
      execution.visualState.animation = 'completed';

      this.emit('workflow_completed', execution);

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.visualState.animation = 'error';

      this.emit('workflow_failed', { execution, error });
    } finally {
      // Keep in active workflows for a short time for visualization
      setTimeout(() => {
        this.activeWorkflows.delete(executionId);
        this.emit('workflow_archived', execution);
      }, 5000);
    }
  }

  // Step Execution with Device Commands
  private async executeStep(step: any, execution: WorkflowExecution): Promise<StepExecution> {
    const stepExecution: StepExecution = {
      stepId: step.id,
      stepName: step.label,
      status: 'running',
      startTime: new Date(),
      deviceCommands: [],
      results: [],
      visualEffects: []
    };

    try {
      // Generate device commands
      const commands = this.generateDeviceCommands(step);
      stepExecution.deviceCommands = commands;

      // Execute commands with visual effects
      for (const command of commands) {
        const result = await this.executeDeviceCommand(command);
        stepExecution.results.push(result);

        // Add visual effect
        stepExecution.visualEffects.push({
          type: 'command_execution',
          target: command.deviceId,
          duration: 2000,
          data: { command: command.action, result: result.success }
        });

        this.emit('device_command_executed', { command, result, execution });
      }

      stepExecution.status = 'completed';
      stepExecution.endTime = new Date();

    } catch (error) {
      stepExecution.status = 'failed';
      stepExecution.endTime = new Date();
    }

    return stepExecution;
  }

  // Demo Event Generation
  async startDemoScenario(scenarioId: string): Promise<void> {
    const scenarios = this.getDemoScenarios();
    const scenario = scenarios.find(s => s.id === scenarioId);
    
    if (!scenario) {
      throw new Error(`Demo scenario ${scenarioId} not found`);
    }

    console.log(`🎬 Starting demo scenario: ${scenario.name}`);
    this.emit('demo_started', scenario);

    // Schedule demo events
    for (const demoEvent of scenario.events) {
      setTimeout(async () => {
        await this.publishEvent({
          type: demoEvent.type as SecurityEventType,
          source: {
            deviceId: demoEvent.deviceId,
            deviceType: demoEvent.deviceType,
            location: demoEvent.location,
            zone: 'Demo Zone',
            building: 'Demo Building'
          },
          severity: demoEvent.severity,
          location: { name: demoEvent.location, coordinates: { lat: 0, lng: 0 } },
          data: { 
            demo: true, 
            scenario: scenarioId,
            confidence: demoEvent.confidence || 0.95
          },
          status: 'new'
        });
      }, demoEvent.delay);
    }
  }

  // Reporting and Analytics
  private updateReportingData(event: SecurityEvent): void {
    this.reportingData.totalEvents++;
    
    const eventCount = this.reportingData.eventsByType.get(event.type) || 0;
    this.reportingData.eventsByType.set(event.type, eventCount + 1);
    
    this.emit('reporting_updated', this.reportingData);
  }

  getReportingData(): ReportingData {
    return { ...this.reportingData };
  }

  getActiveWorkflows(): WorkflowExecution[] {
    // Return empty array for demo - only static workflows in dashboard will show
    return [];
  }

  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.events.slice(0, limit);
  }

  // Update Available Workflows for Demo Integration
  updateAvailableWorkflows(workflows: any[]): void {
    this.availableWorkflows = workflows;
    console.log(`🔄 Updated available workflows: ${workflows.length} workflows loaded`);
  }

  private availableWorkflows: any[] = [];

  // Utility Methods
  private generateVisualMetadata(type: SecurityEventType, severity: string): EventVisualMetadata {
    const severityColors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    };

    const typeIcons = {
      [SecurityEventType.WEAPON_DETECTED]: 'AlertTriangle',
      [SecurityEventType.MOTION_DETECTED]: 'Eye',
      [SecurityEventType.ACCESS_DENIED]: 'Lock',
      [SecurityEventType.FIRE_ALARM]: 'Flame',
      [SecurityEventType.LOCKDOWN_INITIATED]: 'Shield'
    };

    return {
      color: severityColors[severity as keyof typeof severityColors] || '#6b7280',
      icon: typeIcons[type] || 'AlertCircle',
      animation: severity === 'critical' ? 'flash' : 'pulse',
      duration: severity === 'critical' ? 5000 : 3000,
      priority: severity === 'critical' ? 1 : severity === 'high' ? 2 : 3,
      uiEffects: [
        {
          type: 'notification',
          target: 'event_feed',
          duration: 3000,
          intensity: severity as 'low' | 'medium' | 'high'
        }
      ]
    };
  }

  private async findTriggeredWorkflows(event: SecurityEvent): Promise<any[]> {
    // Mock workflow matching logic
    const mockWorkflows = [
      {
        id: 'lockdown_protocol',
        name: 'Emergency Lockdown Protocol',
        triggers: [SecurityEventType.WEAPON_DETECTED, SecurityEventType.INTRUSION_ALERT],
        steps: [
          { id: 'step1', label: 'Lock all doors', action: 'lock_doors' },
          { id: 'step2', label: 'Alert security', action: 'send_alert' },
          { id: 'step3', label: 'Notify police', action: 'call_police' }
        ],
        source: 'template'
      },
      {
        id: 'access_investigation',
        name: 'Access Violation Investigation',
        triggers: [SecurityEventType.ACCESS_DENIED, SecurityEventType.MULTIPLE_FAILED_ATTEMPTS],
        steps: [
          { id: 'step1', label: 'Record incident', action: 'log_event' },
          { id: 'step2', label: 'Alert security', action: 'send_alert' }
        ],
        source: 'custom'
      }
    ];

    return mockWorkflows.filter(workflow => 
      workflow.triggers.includes(event.type)
    );
  }

  private generateDeviceCommands(step: any): DeviceCommand[] {
    // Mock device command generation
    return [
      {
        deviceId: `device_${step.action}`,
        action: step.action,
        parameters: {},
        timestamp: new Date()
      }
    ];
  }

  private async executeDeviceCommand(command: DeviceCommand): Promise<StepResult> {
    // Mock device command execution
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      commandId: command.deviceId,
      success: Math.random() > 0.1, // 90% success rate
      message: `${command.action} executed successfully`,
      timestamp: new Date(),
      data: {}
    };
  }

  private getDemoScenarios(): DemoScenario[] {
    return [
      {
        id: 'school_security_demo',
        name: 'School Security Events',
        description: 'Normal school operations with critical fire emergency',
        events: [
          // Normal access control events
          {
            delay: 0,
            type: 'badge_scan_success',
            deviceId: 'main-entrance-reader',
            deviceType: 'badge_reader',
            location: 'Main Entrance',
            severity: 'low'
          },
          {
            delay: 2000,
            type: 'door_unlock',
            deviceId: 'classroom-door-101',
            deviceType: 'door_control',
            location: 'Classroom 101',
            severity: 'low'
          },
          {
            delay: 4000,
            type: 'badge_scan_success',
            deviceId: 'staff-entrance-reader',
            deviceType: 'badge_reader',
            location: 'Staff Entrance',
            severity: 'low'
          },
          {
            delay: 6000,
            type: 'door_lock',
            deviceId: 'gym-door',
            deviceType: 'door_control',
            location: 'Gymnasium',
            severity: 'low'
          },
          // Critical fire event that triggers Emergency Fire Response Workflow
          {
            delay: 8000,
            type: 'fire_detected',
            deviceId: 'smoke-detector-cafeteria',
            deviceType: 'fire_sensor',
            location: 'School Cafeteria',
            severity: 'critical',
            confidence: 0.98
          }
        ]
      }
    ];
  }

  private calculateWorkflowPosition(workflowId: string): { x: number; y: number } {
    // Calculate position based on workflow ID for consistent placement
    const hash = workflowId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return {
      x: 100 + (Math.abs(hash) % 400),
      y: 100 + (Math.abs(hash >> 8) % 300)
    };
  }

  private getWorkflowColor(source: string): string {
    const colors = {
      template: '#3b82f6',
      custom: '#10b981',
      ai_generated: '#8b5cf6'
    };
    return colors[source as keyof typeof colors] || '#6b7280';
  }

  private generateTriggerConnections(event: SecurityEvent, workflows: any[]): Connection[] {
    return workflows.map(workflow => ({
      from: event.id,
      to: workflow.id,
      type: 'trigger' as const,
      status: 'active' as const,
      animated: true
    }));
  }

  private initializeEventProcessing(): void {
    // Initialize event processing system
    console.log('🚀 Event streaming service initialized');
  }

  private startReportingCollection(): void {
    // Start collecting reporting data
    setInterval(() => {
      this.calculateMetrics();
    }, 5000);
  }

  private calculateMetrics(): void {
    const activeWorkflowCount = this.activeWorkflows.size;
    this.reportingData.workflowsTriggered = activeWorkflowCount;
    
    // Calculate average response time and success rate
    // This would be based on actual execution data in production
    this.reportingData.averageResponseTime = 1.2; // seconds
    this.reportingData.successRate = 0.95; // 95%
  }
}

// Supporting Interfaces
interface EventSource {
  deviceId: string;
  deviceType: string;
  location: string;
  zone: string;
  building: string;
}

interface Location {
  name: string;
  coordinates: { lat: number; lng: number };
}

interface DeviceCommand {
  deviceId: string;
  action: string;
  parameters: Record<string, any>;
  timestamp: Date;
}

interface StepResult {
  commandId: string;
  success: boolean;
  message: string;
  timestamp: Date;
  data: Record<string, any>;
}

interface DemoScenario {
  id: string;
  name: string;
  description: string;
  events: DemoEvent[];
}

interface DemoEvent {
  delay: number;
  type: string;
  deviceId: string;
  deviceType: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence?: number;
}

interface ReportingData {
  totalEvents: number;
  workflowsTriggered: number;
  averageResponseTime: number;
  successRate: number;
  eventsByType: Map<string, number>;
  workflowPerformance: Map<string, any>;
}

interface Highlight {
  target: string;
  type: string;
  intensity: 'low' | 'medium' | 'high';
  duration: number;
}

export default IntegratedEventStreamingService;
