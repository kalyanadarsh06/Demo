import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Info, Clock, ChevronDown, Flame, Shield, Check, X } from "lucide-react";

export type EventItem = {
  id: string;
  type: "info" | "warning" | "critical";
  message: string;
  ts: string;
  source?: string;
  details?: string;
};

const eventConfig: Record<EventItem["type"], { color: string; icon: any; bgColor: string }> = {
  info: { color: "text-blue-600", icon: Info, bgColor: "bg-blue-50 border-blue-200" },
  warning: { color: "text-amber-600", icon: AlertCircle, bgColor: "bg-amber-50 border-amber-200" },
  critical: { color: "text-red-600", icon: AlertCircle, bgColor: "bg-red-50 border-red-200" },
};

const CriticalEventDropdown = ({ event }: { event: EventItem }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'denied'>('pending');
  const [currentStep, setCurrentStep] = useState(0);
  
  const isFireEvent = event.message.includes('Smoke') || event.message.includes('Fire');
  const isWeaponEvent = event.message.includes('Weapon') || event.message.includes('Gun');
  
  // Auto-approve weapon events, require approval for fire events
  const requiresApproval = isFireEvent;
  
  const getWorkflowSteps = () => {
    if (isFireEvent) {
      return [
        { id: 1, action: "Fire Alarm Activation", description: "Sound building-wide fire alarm" },
        { id: 2, action: "Emergency Exit Unlock", description: "Unlock all emergency exits" },
        { id: 3, action: "Evacuation Lighting Activation", description: "Activate emergency lighting system" },
        { id: 4, action: "Emergency Services Notification", description: "Notify fire department automatically" },
        { id: 5, action: "Facility Broadcast", description: "PA announcement: evacuation procedures" },
        { id: 6, action: "Compliance Audit Log", description: "Log all actions for compliance review" }
      ];
    } else if (isWeaponEvent) {
      return [
        { id: 1, action: "AI Vision Analysis", description: "Confirm threat with secondary AI analysis" },
        { id: 2, action: "Lockdown Command", description: "Lock all doors and secure building" },
        { id: 3, action: "Emergency Alert", description: "Alert law enforcement immediately" },
        { id: 4, action: "Facility Broadcast", description: "PA announcement: lockdown procedures" },
        { id: 5, action: "Staff Notification", description: "Send emergency alerts to all staff devices" }
      ];
    }
    return [];
  };

  const getStepStatus = (stepIndex: number) => {
    if (!requiresApproval || approvalStatus === 'approved') {
      if (stepIndex < currentStep) return 'completed';
      if (stepIndex === currentStep) return 'running';
      return 'pending';
    }
    return 'pending';
  };

  const handleApproval = (approved: boolean) => {
    setApprovalStatus(approved ? 'approved' : 'denied');
    if (approved) {
      startWorkflowExecution();
    }
  };

  const startWorkflowExecution = () => {
    const steps = getWorkflowSteps();
    let stepIndex = 0;
    
    const executeStep = () => {
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex);
        stepIndex++;
        setTimeout(executeStep, 1500); // Execute each step every 1.5 seconds
      }
    };
    
    executeStep();
  };

  // Auto-start weapon detection workflow
  React.useEffect(() => {
    if (isWeaponEvent && !requiresApproval) {
      setApprovalStatus('approved');
      setTimeout(startWorkflowExecution, 500);
    }
  }, [isWeaponEvent]);

  return (
    <div className="mt-3 border-t-2 border-red-200 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-medium text-red-800 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-2">
          {isFireEvent ? <Flame className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
          <span className="font-semibold">
            {isFireEvent ? 'Fire Emergency Protocol' : 'Active Shooter Protocol'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-xs">
            {isExpanded ? 'HIDE DETAILS' : 'SHOW WORKFLOW'}
          </Badge>
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      
      {isExpanded && (
        <div className="mt-3 space-y-3 bg-white rounded-lg p-4 border">
          {/* Approval Section - Only for Fire Events */}
        {requiresApproval && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Emergency protocol activation requires authorization</span>
            </div>
            
            {approvalStatus === 'pending' && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleApproval(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleApproval(false)}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Deny
                </Button>
              </div>
            )}
            
            {approvalStatus === 'approved' && (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Protocol approved - executing automated response</span>
              </div>
            )}
            
            {approvalStatus === 'denied' && (
              <div className="flex items-center gap-2 text-red-700">
                <X className="w-5 h-5" />
                <span className="font-medium">Protocol denied - manual intervention required</span>
              </div>
            )}
          </div>
        )}

        {/* Auto-execution notice for weapon events */}
        {isWeaponEvent && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Critical threat detected - executing lockdown protocol immediately</span>
            </div>
          </div>
        )}

          {/* Workflow Steps */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Automated Response Steps:</h4>
            {getWorkflowSteps().map((step, index) => {
              const status = getStepStatus(index);
              return (
                <div key={step.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                  status === 'completed' ? 'bg-green-50 border-green-200' :
                  status === 'running' ? 'bg-blue-50 border-blue-200 animate-pulse' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                    status === 'completed' ? 'bg-green-500 text-white' :
                    status === 'running' ? 'bg-blue-500 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {status === 'completed' ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{step.action}</div>
                    <div className="text-xs text-gray-600 mt-1">{step.description}</div>
                  </div>
                  <Badge 
                    variant={status === 'completed' ? 'default' : status === 'running' ? 'secondary' : 'outline'}
                    className={
                      status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                      status === 'running' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-gray-100 text-gray-600 border-gray-300'
                    }
                  >
                    {status === 'running' ? 'EXECUTING' : status.toUpperCase()}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const EventStream = ({ events }: { events: EventItem[] }) => {
  return (
    <section id="demo" className="container max-w-6xl mx-auto py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold">Live Security Event Stream</h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Real-time monitoring of security events. Critical events trigger automated workflows with approval controls.
        </p>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
            <div className="text-muted-foreground text-lg font-medium">Waiting for security events...</div>
            <div className="text-sm text-muted-foreground mt-2">
              Press "Start" above to begin monitoring school security systems
            </div>
          </Card>
        ) : (
          events.map((e, index) => {
            const config = eventConfig[e.type] || eventConfig.info; // Fallback to info if type not found
            const Icon = config.icon;
            const isCritical = e.type === 'critical';
            
            const isFireOrWeapon = isCritical; // All critical events should show dropdown
            
            return (
              <Card key={e.id} className={`p-4 ${config.bgColor} ${isCritical ? 'border-l-8 border-red-500 shadow-lg' : 'border-l-4'} animate-fade-in-up ${isFireOrWeapon ? 'ring-2 ring-red-300 ring-opacity-50' : ''}`} style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${isCritical ? 'bg-red-100' : config.bgColor}`}>
                      <Icon className={`w-4 h-4 ${isCritical ? 'text-red-600' : config.color}`} />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className={`font-medium ${isCritical ? 'text-red-800 text-lg' : config.color}`}>{e.message}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant={e.type === 'critical' ? 'destructive' : e.type === 'warning' ? 'default' : 'secondary'} className="text-xs font-bold">
                          {e.type.toUpperCase()}
                        </Badge>
                        {isFireOrWeapon && (
                          <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                            WORKFLOW TRIGGERED
                          </Badge>
                        )}
                      </div>
                      {/* Add critical event dropdown for fire and weapon events */}
                      {isFireOrWeapon && (
                        <CriticalEventDropdown event={e} />
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{e.ts}</div>
                </div>
              </Card>
            );
          })
        )}
      </div>
      {events.length > 0 && (
        <div className="text-center mt-6">
          <Badge variant="outline" className="text-sm">
            {events.length} event{events.length !== 1 ? 's' : ''} processed
          </Badge>
        </div>
      )}
    </section>
  );
};

export default EventStream;
