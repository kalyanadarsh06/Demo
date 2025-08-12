import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, AlertTriangle, Info, Clock, CheckCircle, XCircle, 
  Flame, Shield, Camera, Lock, Zap, Speaker, ChevronDown 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { glassCard, typography, animations } from '@/styles/theme';

export interface SecurityEvent {
  id: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  location?: string;
  category?: 'access' | 'device_fault' | 'fire' | 'weapon' | 'system';
  metadata?: Record<string, string>;
  workflow?: {
    id: string;
    name: string;
    steps: Array<{
      id: number;
      action: string;
      description: string;
    }>;
  };
}

interface StreamMetricsProps {
  eventsPerMinute: number;
  criticalEvents: number;
}

const StreamMetrics: React.FC<StreamMetricsProps> = ({ 
  eventsPerMinute, criticalEvents 
}) => (
  <div className="grid grid-cols-2 gap-6">
    <div className="text-center">
      <div className="text-lg font-bold text-white">{eventsPerMinute}</div>
      <div className="text-xs text-slate-400">Events/min</div>
    </div>
    <div className="text-center">
      <div className="text-lg font-bold text-red-400">{criticalEvents}</div>
      <div className="text-xs text-slate-400">Critical</div>
    </div>
  </div>
);

const getSeverityConfig = (type: SecurityEvent['type']) => {
  const configs = {
    info: {
      icon: Info,
      iconClass: 'text-blue-400',
      cardClass: 'bg-blue-500/5 border-blue-500/20',
      badgeVariant: 'secondary' as const,
      borderClass: 'bg-blue-400'
    },
    warning: {
      icon: AlertTriangle,
      iconClass: 'text-amber-400',
      cardClass: 'bg-amber-500/5 border-amber-500/20',
      badgeVariant: 'default' as const,
      borderClass: 'bg-amber-400'
    },
    critical: {
      icon: AlertTriangle,
      iconClass: 'text-red-300',
      cardClass: 'bg-red-500/10 border-red-400/40 ring-2 ring-red-400/50 shadow-lg shadow-red-500/20',
      badgeVariant: 'destructive' as const,
      borderClass: 'bg-red-400 animate-pulse'
    }
  };
  return configs[type];
};

interface CriticalEventActionsProps {
  event: SecurityEvent;
  onExecute: (workflowId: string) => void;
}

const CriticalEventActions: React.FC<CriticalEventActionsProps> = ({ 
  event, onExecute 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'denied'>('pending');
  
  if (!event.workflow) return null;

  const isFireEvent = event.category === 'fire';
  const requiresApproval = isFireEvent;

  const handleApprove = () => {
    setApprovalStatus('approved');
    onExecute(event.workflow!.id);
  };

  const handleDeny = () => {
    setApprovalStatus('denied');
  };

  return (
    <div className="space-y-3">
      {/* Workflow Preview Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 rounded-lg text-sm font-medium text-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-2">
          {isFireEvent ? <Flame className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
          <span className="font-semibold">
            {isFireEvent ? 'Fire Emergency Protocol' : 'Active Shooter Protocol'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive">
            {isExpanded ? 'HIDE DETAILS' : 'SHOW WORKFLOW'}
          </Badge>
          <ChevronDown className={cn(
            'w-4 h-4 transition-transform',
            isExpanded && 'rotate-180'
          )} />
        </div>
      </button>

      {/* Expanded Workflow Details */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          {/* Workflow Preview */}
          <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-300">
                  Automated Response Required
                </span>
              </div>
              <Badge variant="destructive">
                {event.workflow.steps.length} Steps
              </Badge>
            </div>
            
            <p className="text-sm text-red-200 mb-3">{event.workflow.name}</p>
            
            {/* Step Preview */}
            <div className="space-y-1">
              {event.workflow.steps.slice(0, 3).map((step, index) => (
                <div key={step.id} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  <span className="text-xs text-red-300">{step.action}</span>
                </div>
              ))}
              {event.workflow.steps.length > 3 && (
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  <span className="text-xs text-red-300">
                    +{event.workflow.steps.length - 3} more steps...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Execution Controls */}
          {requiresApproval ? (
            <div className="bg-amber-900/20 border border-amber-400/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">
                  Human Approval Required
                </span>
              </div>
              
              <p className="text-xs text-amber-200 mb-3">
                Fire safety protocols require human confirmation before execution.
              </p>
              
              {approvalStatus === 'pending' && (
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleApprove}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve & Execute
                  </Button>
                  <Button 
                    onClick={handleDeny}
                    size="sm"
                    variant="outline"
                    className="border-red-400 text-red-400 hover:bg-red-900/20"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Deny
                  </Button>
                </div>
              )}
              
              {approvalStatus === 'approved' && (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Protocol approved - executing...</span>
                </div>
              )}
              
              {approvalStatus === 'denied' && (
                <div className="flex items-center space-x-2 text-red-400">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Protocol denied - manual intervention required</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-300">
                  Auto-Execution Initiated
                </span>
              </div>
              <p className="text-xs text-red-200">
                Critical threat detected - executing lockdown protocol immediately
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

interface AnimatedEventCardProps {
  event: SecurityEvent;
  index: number;
  delay: number;
  onExecuteWorkflow: (workflowId: string) => void;
}

const AnimatedEventCard: React.FC<AnimatedEventCardProps> = ({ 
  event, index, delay, onExecuteWorkflow 
}) => {
  const severity = getSeverityConfig(event.type);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000 }}
      className={cn(
        "relative p-4 rounded-lg border backdrop-blur-sm",
        severity.cardClass,
        glassCard.base
      )}
    >
      {/* Event Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <severity.icon className={cn("w-5 h-5", severity.iconClass)} />
          <Badge variant={severity.badgeVariant}>
            {event.type.toUpperCase()}
          </Badge>
          {event.type === 'critical' && event.workflow && (
            <Badge variant="outline" className="text-xs bg-yellow-100/10 text-yellow-300 border-yellow-400/30">
              WORKFLOW TRIGGERED
            </Badge>
          )}
        </div>
        <div className="text-right">
          <time className="text-xs text-slate-400 font-mono">{event.timestamp}</time>
          {event.location && (
            <p className="text-xs text-slate-500">{event.location}</p>
          )}
        </div>
      </div>

      {/* Event Content */}
      <div className="space-y-2">
        <p className={cn(
          "font-medium",
          event.type === 'critical' ? 'text-red-200 text-base' : 'text-white text-sm'
        )}>
          {event.message}
        </p>
        
        {event.metadata && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(event.metadata).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-1">
                <span className="text-xs text-slate-400">{key}:</span>
                <span className="text-xs font-mono text-white bg-slate-800/50 px-1 rounded">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Critical Event Actions */}
      {event.type === 'critical' && event.workflow && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <CriticalEventActions 
            event={event}
            onExecute={onExecuteWorkflow}
          />
        </div>
      )}

      {/* Severity Indicator */}
      <div className={cn(
        "absolute left-0 top-0 w-1 h-full rounded-l-lg",
        severity.borderClass
      )} />
    </motion.div>
  );
};

interface EnhancedEventStreamProps {
  events: SecurityEvent[];
  isLive: boolean;
  onExecuteWorkflow: (workflowId: string) => void;
}

const EnhancedEventStream: React.FC<EnhancedEventStreamProps> = ({ 
  events, isLive, onExecuteWorkflow 
}) => (
  <div className="h-full flex flex-col">
    {/* Stream Header */}
    <div className="flex items-center justify-between p-4 border-b border-white/10">
      <div className="flex items-center space-x-2">
        <Activity className="w-5 h-5 text-blue-400" />
        <h2 className={cn(typography.subheading, 'text-white')}>Live Event Stream</h2>
        {isLive && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">LIVE</span>
          </div>
        )}
      </div>
      <Badge variant="secondary" className="text-xs">
        {events.length} events
      </Badge>
    </div>

    {/* Event List */}
    <div className="flex-1 overflow-y-auto space-y-3 p-4">
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Clock className="w-12 h-12 text-slate-500 mb-4" />
          <div className="text-slate-400 text-lg font-medium mb-2">Waiting for security events...</div>
          <div className="text-sm text-slate-500">
            Press "Start Demo" to begin monitoring school security systems
          </div>
        </div>
      ) : (
        events.map((event, index) => (
          <AnimatedEventCard 
            key={event.id}
            event={event}
            index={index}
            delay={index * 100}
            onExecuteWorkflow={onExecuteWorkflow}
          />
        ))
      )}
    </div>

    {/* Stream Footer */}
    <div className="p-4 border-t border-white/10">
      <StreamMetrics 
        eventsPerMinute={events.length > 0 ? Math.min(24, events.length * 6) : 0}
        criticalEvents={events.filter(e => e.type === 'critical').length}
      />
    </div>
  </div>
);

export default EnhancedEventStream;
