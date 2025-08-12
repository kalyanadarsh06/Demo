import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IntegratedEventStreamingService, SecurityEvent, WorkflowExecution } from '@/services/integratedEventStreamingService';
import { geminiService } from '@/services/geminiService';

// Enhanced Workflow Interface with Event Integration
export interface IntegratedWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  source: 'custom' | 'template' | 'ai_generated';
  location?: WorkflowLocation;
  schedule?: WorkflowSchedule;
  complianceTags?: string[];
  aiMetadata?: AIGenerationMetadata;
  confidenceScore?: number;
  validationStatus?: 'pending' | 'validated' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  
  // Event Integration
  eventTriggers: EventTrigger[];
  parallelExecution: boolean;
  dependencies: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Visual Configuration
  visualConfig: WorkflowVisualConfig;
}

export interface WorkflowStep {
  id: string;
  label: string;
  action: string;
  icon?: string;
  deviceRefs?: DeviceRef[];
  parameters?: Record<string, any>;
  escalation?: EscalationRef;
  conditions?: Condition[];
  timeout?: number;
  retryPolicy?: RetryPolicy;
  order: number;
  
  // Visual Properties
  visualProps: StepVisualProps;
}

export interface EventTrigger {
  id: string;
  eventType: string;
  conditions: TriggerCondition[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  cooldownPeriod?: number;
  deviceFilters?: string[];
  locationFilters?: string[];
}

export interface WorkflowVisualConfig {
  color: string;
  icon: string;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  showInDashboard: boolean;
  animationPreferences: AnimationPreferences;
}

export interface StepVisualProps {
  color: string;
  icon: string;
  estimatedDuration: number;
  visualEffects: string[];
}

export interface AnimationPreferences {
  enableAnimations: boolean;
  speed: 'slow' | 'normal' | 'fast';
  highlightOnTrigger: boolean;
  showConnections: boolean;
}

// Context State Interface
interface IntegratedWorkflowContextState {
  // Core Data
  workflows: IntegratedWorkflow[];
  templates: IntegratedWorkflow[];
  savedWorkflows: IntegratedWorkflow[];
  
  // Event Streaming
  eventService: IntegratedEventStreamingService;
  recentEvents: SecurityEvent[];
  activeExecutions: WorkflowExecution[];
  
  // Demo State
  demoMode: boolean;
  currentScenario?: string;
  
  // Reporting
  reportingData: ReportingData;
  executionHistory: WorkflowExecution[];
  
  // UI State
  selectedWorkflow?: IntegratedWorkflow;
  selectedEvent?: SecurityEvent;
  dashboardLayout: DashboardLayout;
}

interface IntegratedWorkflowContextActions {
  // Workflow Management
  addWorkflow: (workflow: Omit<IntegratedWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkflow: (id: string, updates: Partial<IntegratedWorkflow>) => void;
  deleteWorkflow: (id: string) => void;
  activateWorkflow: (id: string) => void;
  deactivateWorkflow: (id: string) => void;
  
  // Event Integration
  publishEvent: (event: Omit<SecurityEvent, 'id' | 'timestamp' | 'triggeredWorkflows' | 'visualMetadata'>) => Promise<void>;
  startDemoScenario: (scenarioId: string) => Promise<void>;
  stopDemo: () => void;
  
  // Execution Control
  executeWorkflow: (workflowId: string, triggerEvent?: SecurityEvent) => Promise<void>;
  pauseWorkflow: (executionId: string) => Promise<void>;
  resumeWorkflow: (executionId: string) => Promise<void>;
  stopWorkflow: (executionId: string) => Promise<void>;
  
  // AI Integration
  generateWorkflowFromPrompt: (prompt: string, context?: any) => Promise<WorkflowGenerationResult>;
  
  // UI Actions
  selectWorkflow: (workflow: IntegratedWorkflow) => void;
  selectEvent: (event: SecurityEvent) => void;
  updateDashboardLayout: (layout: DashboardLayout) => void;
}

type IntegratedWorkflowContextType = IntegratedWorkflowContextState & IntegratedWorkflowContextActions;

// Create Context
const IntegratedWorkflowContext = createContext<IntegratedWorkflowContextType | undefined>(undefined);

// Default Templates with Event Integration
const DEFAULT_INTEGRATED_TEMPLATES: IntegratedWorkflow[] = [
  {
    id: 'active_shooter_lockdown',
    name: 'Active Shooter Lockdown Protocol',
    description: 'Immediate response to weapon detection with building-wide lockdown',
    source: 'template',
    isActive: true,
    priority: 'critical',
    parallelExecution: false,
    dependencies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    
    eventTriggers: [
      {
        id: 'weapon_trigger',
        eventType: 'weapon_detected',
        conditions: [{ field: 'confidence', operator: '>', value: 0.8 }],
        priority: 'critical',
        cooldownPeriod: 0
      }
    ],
    
    steps: [
      {
        id: 'step1',
        label: 'Initiate Building Lockdown',
        action: 'emergency_lockdown',
        order: 1,
        timeout: 5000,
        visualProps: {
          color: '#dc2626',
          icon: 'Shield',
          estimatedDuration: 3,
          visualEffects: ['flash', 'highlight']
        },
        deviceRefs: [
          { deviceId: 'access-control-main', deviceType: 'access_control', location: 'Building Wide' }
        ]
      },
      {
        id: 'step2',
        label: 'Alert Law Enforcement',
        action: 'notify_police',
        order: 2,
        timeout: 10000,
        visualProps: {
          color: '#dc2626',
          icon: 'Phone',
          estimatedDuration: 5,
          visualEffects: ['pulse']
        }
      },
      {
        id: 'step3',
        label: 'Broadcast Emergency Alert',
        action: 'emergency_broadcast',
        order: 3,
        timeout: 15000,
        visualProps: {
          color: '#dc2626',
          icon: 'Volume2',
          estimatedDuration: 2,
          visualEffects: ['ripple']
        },
        deviceRefs: [
          { deviceId: 'pa-system-building', deviceType: 'communication', location: 'Building Wide' }
        ]
      }
    ],
    
    triggers: [],
    complianceTags: ['SAFETY', 'EMERGENCY_RESPONSE', 'LAW_ENFORCEMENT'],
    
    visualConfig: {
      color: '#dc2626',
      icon: 'AlertTriangle',
      position: { x: 100, y: 100 },
      size: 'large',
      showInDashboard: true,
      animationPreferences: {
        enableAnimations: true,
        speed: 'fast',
        highlightOnTrigger: true,
        showConnections: true
      }
    }
  },
  
  {
    id: 'unauthorized_access_response',
    name: 'Unauthorized Access Investigation',
    description: 'Response protocol for failed access attempts and security breaches',
    source: 'template',
    isActive: true,
    priority: 'high',
    parallelExecution: true,
    dependencies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    
    eventTriggers: [
      {
        id: 'access_denied_trigger',
        eventType: 'access_denied',
        conditions: [],
        priority: 'medium',
        cooldownPeriod: 5000
      },
      {
        id: 'multiple_attempts_trigger',
        eventType: 'multiple_failed_attempts',
        conditions: [{ field: 'attempts', operator: '>=', value: 3 }],
        priority: 'high',
        cooldownPeriod: 0
      }
    ],
    
    steps: [
      {
        id: 'step1',
        label: 'Log Security Incident',
        action: 'log_incident',
        order: 1,
        timeout: 2000,
        visualProps: {
          color: '#f59e0b',
          icon: 'FileText',
          estimatedDuration: 1,
          visualEffects: ['fade_in']
        }
      },
      {
        id: 'step2',
        label: 'Capture Security Footage',
        action: 'capture_footage',
        order: 2,
        timeout: 5000,
        visualProps: {
          color: '#f59e0b',
          icon: 'Camera',
          estimatedDuration: 3,
          visualEffects: ['highlight']
        },
        deviceRefs: [
          { deviceId: 'camera-main-entrance', deviceType: 'ai_camera', location: 'Main Entrance' }
        ]
      },
      {
        id: 'step3',
        label: 'Alert Security Team',
        action: 'alert_security',
        order: 3,
        timeout: 3000,
        visualProps: {
          color: '#f59e0b',
          icon: 'Users',
          estimatedDuration: 2,
          visualEffects: ['pulse']
        }
      }
    ],
    
    triggers: [],
    complianceTags: ['ACCESS_CONTROL', 'INCIDENT_RESPONSE', 'AUDIT_TRAIL'],
    
    visualConfig: {
      color: '#f59e0b',
      icon: 'Lock',
      position: { x: 300, y: 150 },
      size: 'medium',
      showInDashboard: true,
      animationPreferences: {
        enableAnimations: true,
        speed: 'normal',
        highlightOnTrigger: true,
        showConnections: true
      }
    }
  },
  
  {
    id: 'fire_safety_protocol',
    name: 'Fire Safety & Evacuation Protocol',
    description: 'Comprehensive fire detection and evacuation response system',
    source: 'template',
    isActive: true,
    priority: 'critical',
    parallelExecution: false,
    dependencies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    
    eventTriggers: [
      {
        id: 'fire_alarm_trigger',
        eventType: 'fire_alarm',
        conditions: [],
        priority: 'critical',
        cooldownPeriod: 0
      }
    ],
    
    steps: [
      {
        id: 'step1',
        label: 'Activate Fire Suppression',
        action: 'activate_suppression',
        order: 1,
        timeout: 10000,
        visualProps: {
          color: '#dc2626',
          icon: 'Droplets',
          estimatedDuration: 5,
          visualEffects: ['flash', 'ripple']
        }
      },
      {
        id: 'step2',
        label: 'Initiate Evacuation Procedures',
        action: 'start_evacuation',
        order: 2,
        timeout: 15000,
        visualProps: {
          color: '#dc2626',
          icon: 'Users',
          estimatedDuration: 10,
          visualEffects: ['pulse', 'highlight']
        }
      },
      {
        id: 'step3',
        label: 'Contact Fire Department',
        action: 'call_fire_department',
        order: 3,
        timeout: 8000,
        visualProps: {
          color: '#dc2626',
          icon: 'Phone',
          estimatedDuration: 3,
          visualEffects: ['flash']
        }
      }
    ],
    
    triggers: [],
    complianceTags: ['FIRE_SAFETY', 'EVACUATION', 'EMERGENCY_SERVICES'],
    
    visualConfig: {
      color: '#dc2626',
      icon: 'Flame',
      position: { x: 200, y: 250 },
      size: 'large',
      showInDashboard: true,
      animationPreferences: {
        enableAnimations: true,
        speed: 'fast',
        highlightOnTrigger: true,
        showConnections: true
      }
    }
  }
];

// Context Provider Component
export const IntegratedWorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<IntegratedWorkflowContextState>(() => {
    const eventService = new IntegratedEventStreamingService();
    
    return {
      workflows: [],
      templates: DEFAULT_INTEGRATED_TEMPLATES,
      savedWorkflows: [...DEFAULT_INTEGRATED_TEMPLATES],
      eventService,
      recentEvents: [],
      activeExecutions: [],
      demoMode: true,
      reportingData: {
        totalEvents: 0,
        workflowsTriggered: 0,
        averageResponseTime: 0,
        successRate: 0,
        eventsByType: new Map(),
        workflowPerformance: new Map()
      },
      executionHistory: [],
      dashboardLayout: {
        eventStreamWidth: 33,
        workflowCanvasWidth: 34,
        detailsPanelWidth: 33
      }
    };
  });

  // Initialize event service listeners
  useEffect(() => {
    const { eventService } = state;

    const handleEventPublished = (event: SecurityEvent) => {
      setState(prev => ({
        ...prev,
        recentEvents: [event, ...prev.recentEvents.slice(0, 49)]
      }));
    };

    const handleWorkflowStarted = (execution: WorkflowExecution) => {
      setState(prev => ({
        ...prev,
        activeExecutions: [...prev.activeExecutions, execution]
      }));
    };

    const handleWorkflowCompleted = (execution: WorkflowExecution) => {
      setState(prev => ({
        ...prev,
        activeExecutions: prev.activeExecutions.map(e => 
          e.id === execution.id ? execution : e
        ),
        executionHistory: [execution, ...prev.executionHistory.slice(0, 99)]
      }));
    };

    const handleWorkflowArchived = (execution: WorkflowExecution) => {
      setState(prev => ({
        ...prev,
        activeExecutions: prev.activeExecutions.filter(e => e.id !== execution.id)
      }));
    };

    const handleReportingUpdated = (data: any) => {
      setState(prev => ({
        ...prev,
        reportingData: { ...prev.reportingData, ...data }
      }));
    };

    // Set up event listeners
    eventService.on('event_published', handleEventPublished);
    eventService.on('workflow_started', handleWorkflowStarted);
    eventService.on('workflow_completed', handleWorkflowCompleted);
    eventService.on('workflow_archived', handleWorkflowArchived);
    eventService.on('reporting_updated', handleReportingUpdated);

    return () => {
      eventService.removeAllListeners();
    };
  }, [state.eventService]);

  // Context Actions
  const addWorkflow = (workflow: Omit<IntegratedWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWorkflow: IntegratedWorkflow = {
      ...workflow,
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setState(prev => ({
      ...prev,
      workflows: [...prev.workflows, newWorkflow],
      savedWorkflows: [...prev.savedWorkflows, newWorkflow]
    }));
  };

  const updateWorkflow = (id: string, updates: Partial<IntegratedWorkflow>) => {
    setState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w => 
        w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w
      ),
      savedWorkflows: prev.savedWorkflows.map(w => 
        w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w
      )
    }));
  };

  const deleteWorkflow = (id: string) => {
    setState(prev => ({
      ...prev,
      workflows: prev.workflows.filter(w => w.id !== id),
      savedWorkflows: prev.savedWorkflows.filter(w => w.id !== id)
    }));
  };

  const activateWorkflow = (id: string) => {
    updateWorkflow(id, { isActive: true });
  };

  const deactivateWorkflow = (id: string) => {
    updateWorkflow(id, { isActive: false });
  };

  const publishEvent = async (event: Omit<SecurityEvent, 'id' | 'timestamp' | 'triggeredWorkflows' | 'visualMetadata'>) => {
    await state.eventService.publishEvent(event);
  };

  const startDemoScenario = async (scenarioId: string) => {
    setState(prev => ({ ...prev, currentScenario: scenarioId }));
    await state.eventService.startDemoScenario(scenarioId);
  };

  const stopDemo = () => {
    setState(prev => ({ ...prev, currentScenario: undefined }));
  };

  const executeWorkflow = async (workflowId: string, triggerEvent?: SecurityEvent) => {
    const workflow = [...state.workflows, ...state.savedWorkflows].find(w => w.id === workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // This would integrate with the actual execution engine
    console.log(`Executing workflow: ${workflow.name}`);
  };

  const generateWorkflowFromPrompt = async (prompt: string, context?: any): Promise<WorkflowGenerationResult> => {
    try {
      const result = await geminiService.generateWorkflow(prompt, {
        ...context,
        availableTemplates: state.templates,
        eventTypes: Object.values(state.eventService.constructor.name),
        demoMode: state.demoMode
      });

      if (result.success && result.workflow) {
        // Convert to IntegratedWorkflow format
        const integratedWorkflow: IntegratedWorkflow = {
          ...result.workflow,
          eventTriggers: [],
          parallelExecution: false,
          dependencies: [],
          priority: 'medium',
          visualConfig: {
            color: '#3b82f6',
            icon: 'Zap',
            position: { x: Math.random() * 400, y: Math.random() * 300 },
            size: 'medium',
            showInDashboard: true,
            animationPreferences: {
              enableAnimations: true,
              speed: 'normal',
              highlightOnTrigger: true,
              showConnections: true
            }
          }
        };

        addWorkflow(integratedWorkflow);
      }

      return result;
    } catch (error) {
      console.error('Workflow generation failed:', error);
      throw error;
    }
  };

  const selectWorkflow = (workflow: IntegratedWorkflow) => {
    setState(prev => ({ ...prev, selectedWorkflow: workflow }));
  };

  const selectEvent = (event: SecurityEvent) => {
    setState(prev => ({ ...prev, selectedEvent: event }));
  };

  const updateDashboardLayout = (layout: DashboardLayout) => {
    setState(prev => ({ ...prev, dashboardLayout: layout }));
  };

  const contextValue: IntegratedWorkflowContextType = {
    ...state,
    addWorkflow,
    updateWorkflow,
    deleteWorkflow,
    activateWorkflow,
    deactivateWorkflow,
    publishEvent,
    startDemoScenario,
    stopDemo,
    executeWorkflow,
    pauseWorkflow: async () => {},
    resumeWorkflow: async () => {},
    stopWorkflow: async () => {},
    generateWorkflowFromPrompt,
    selectWorkflow,
    selectEvent,
    updateDashboardLayout
  };

  return (
    <IntegratedWorkflowContext.Provider value={contextValue}>
      {children}
    </IntegratedWorkflowContext.Provider>
  );
};

// Custom Hook
export const useIntegratedWorkflow = (): IntegratedWorkflowContextType => {
  const context = useContext(IntegratedWorkflowContext);
  if (!context) {
    throw new Error('useIntegratedWorkflow must be used within an IntegratedWorkflowProvider');
  }
  return context;
};

// Supporting Interfaces
interface DeviceRef {
  deviceId: string;
  deviceType: string;
  location: string;
}

interface EscalationRef {
  id: string;
  type: string;
  target: string;
}

interface Condition {
  field: string;
  operator: string;
  value: any;
}

interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: string;
}

interface TriggerCondition {
  field: string;
  operator: string;
  value: any;
}

interface WorkflowLocation {
  name: string;
  coordinates: { lat: number; lng: number };
}

interface WorkflowSchedule {
  type: 'once' | 'recurring';
  startTime: Date;
  endTime?: Date;
  pattern?: string;
}

interface AIGenerationMetadata {
  originalPrompt: string;
  modelUsed: string;
  tokensUsed: number;
  processingTime: number;
  confidence: number;
  reasoning: string[];
  alternatives?: any[];
  warnings: string[];
  suggestions: string[];
}

interface WorkflowTrigger {
  id: string;
  type: string;
  conditions: any[];
}

interface ReportingData {
  totalEvents: number;
  workflowsTriggered: number;
  averageResponseTime: number;
  successRate: number;
  eventsByType: Map<string, number>;
  workflowPerformance: Map<string, any>;
}

interface DashboardLayout {
  eventStreamWidth: number;
  workflowCanvasWidth: number;
  detailsPanelWidth: number;
}

interface WorkflowGenerationResult {
  success: boolean;
  workflow?: any;
  error?: string;
  confidence?: number;
  warnings?: string[];
  suggestions?: string[];
}

export default IntegratedWorkflowContext;
