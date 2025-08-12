import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, Brain, Shield, AlertTriangle, CheckCircle, Clock, 
  Zap, Radio, Lock, Speaker, FileText, ArrowRight 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { glassCard, typography } from '@/styles/theme';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'processor' | 'action' | 'decision';
  title: string;
  subtitle: string;
  position: { x: number; y: number };
  status: 'idle' | 'active' | 'executing' | 'completed' | 'error';
  metrics?: {
    confidence?: string;
    latency?: string;
    progress?: number;
  };
}

interface Connection {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  status: 'idle' | 'active' | 'completed' | 'flowing';
  animated?: boolean;
}

interface ExecutionStep {
  id: string;
  title: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp: string;
  duration?: string;
}

interface WorkflowCanvasProps {
  activeWorkflow?: 'fire' | 'weapon' | null;
  executionProgress?: number;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  activeWorkflow,
  executionProgress = 0
}) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [executingSteps, setExecutingSteps] = useState<ExecutionStep[]>([]);

  useEffect(() => {
    // Layout constants for proper positioning within canvas bounds
    const canvasWidth = 800; // Available canvas width
    const nodeWidth = 130;   // Width of each node (reduced for better fit)
    const nodeSpacing = 50;  // Increased spacing between nodes
    const stepWidth = nodeWidth + nodeSpacing; // Total width per step
    const maxSteps = 4;      // Maximum steps to fit horizontally
    const verticalSpacing = 80; // Increased vertical spacing between action nodes
    
    if (activeWorkflow === 'weapon') {
      // Active Shooter Lockdown workflow - positioned in upper half
      setNodes([
        {
          id: 'trigger',
          type: 'trigger',
          title: 'Weapon Detected',
          subtitle: 'Camera #2 - Main Entrance',
          position: { x: 50, y: 80 },
          status: 'completed',
          metrics: { confidence: '96%', latency: '48ms' }
        },
        {
          id: 'processor',
          type: 'processor',
          title: 'Threat Assessment',
          subtitle: 'Multi-model Analysis',
          position: { x: 50 + stepWidth, y: 80 },
          status: executionProgress > 20 ? 'completed' : 'executing',
          metrics: { progress: Math.min(100, executionProgress * 2) }
        },
        {
          id: 'decision',
          type: 'decision',
          title: 'Threat Confirmed',
          subtitle: 'Confidence > 90%',
          position: { x: 50 + stepWidth * 2, y: 80 },
          status: executionProgress > 40 ? 'completed' : 'executing'
        },
        {
          id: 'lockdown',
          type: 'action',
          title: 'Lockdown Command',
          subtitle: 'Secure All Entrances',
          position: { x: 50 + stepWidth * 3, y: 40 },
          status: executionProgress > 60 ? 'completed' : executionProgress > 40 ? 'executing' : 'idle'
        },
        {
          id: 'alert',
          type: 'action',
          title: 'Emergency Alert',
          subtitle: 'Law Enforcement',
          position: { x: 50 + stepWidth * 3, y: 40 + verticalSpacing },
          status: executionProgress > 80 ? 'completed' : executionProgress > 60 ? 'executing' : 'idle'
        }
      ]);

      setConnections([
        {
          id: 'c1',
          from: { x: 50 + nodeWidth, y: 80 },
          to: { x: 50 + stepWidth, y: 80 },
          status: 'completed',
          animated: true
        },
        {
          id: 'c2',
          from: { x: 50 + stepWidth + nodeWidth, y: 80 },
          to: { x: 50 + stepWidth * 2, y: 80 },
          status: executionProgress > 20 ? 'completed' : 'active',
          animated: executionProgress > 20
        },
        {
          id: 'c3',
          from: { x: 50 + stepWidth * 2 + nodeWidth, y: 80 },
          to: { x: 50 + stepWidth * 3, y: 65 },
          status: executionProgress > 40 ? 'completed' : 'idle',
          animated: executionProgress > 40
        },
        {
          id: 'c4',
          from: { x: 50 + stepWidth * 2 + nodeWidth, y: 80 },
          to: { x: 50 + stepWidth * 3, y: 95 },
          status: executionProgress > 40 ? 'completed' : 'idle',
          animated: executionProgress > 40
        }
      ]);
    } else if (activeWorkflow === 'fire') {
      // Emergency Fire Response workflow - positioned in lower half with increased gap
      setNodes([
        {
          id: 'fire-trigger',
          type: 'trigger',
          title: 'Fire Detected',
          subtitle: 'Smoke Sensor - Floor 2',
          position: { x: 50, y: 280 },
          status: 'completed',
          metrics: { confidence: '98%', latency: '32ms' }
        },
        {
          id: 'fire-processor',
          type: 'processor',
          title: 'Fire Confirmation',
          subtitle: 'Multi-sensor Analysis',
          position: { x: 50 + stepWidth, y: 280 },
          status: executionProgress > 15 ? 'completed' : 'executing',
          metrics: { progress: Math.min(100, executionProgress * 3) }
        },
        {
          id: 'fire-approval',
          type: 'decision',
          title: 'Human Approval',
          subtitle: 'Safety Protocol',
          position: { x: 50 + stepWidth * 2, y: 280 },
          status: executionProgress > 30 ? 'completed' : 'executing'
        },
        {
          id: 'fire-alarm',
          type: 'action',
          title: 'Fire Alarm',
          subtitle: 'Building-wide Alert',
          position: { x: 50 + stepWidth * 3, y: 270 },
          status: executionProgress > 50 ? 'completed' : executionProgress > 30 ? 'executing' : 'idle'
        },
        {
          id: 'fire-unlock',
          type: 'action',
          title: 'Exit Unlock',
          subtitle: 'Emergency Exits',
          position: { x: 50 + stepWidth * 3, y: 270 + verticalSpacing },
          status: executionProgress > 70 ? 'completed' : executionProgress > 50 ? 'executing' : 'idle'
        },
        {
          id: 'fire-services',
          type: 'action',
          title: 'Emergency Services',
          subtitle: 'Fire Department',
          position: { x: 50 + stepWidth * 3, y: 270 + verticalSpacing * 2 },
          status: executionProgress > 90 ? 'completed' : executionProgress > 70 ? 'executing' : 'idle'
        }
      ]);

      setConnections([
        {
          id: 'fire-c1',
          from: { x: 50 + nodeWidth, y: 280 },
          to: { x: 50 + stepWidth, y: 280 },
          status: 'completed',
          animated: true
        },
        {
          id: 'fire-c2',
          from: { x: 50 + stepWidth + nodeWidth, y: 280 },
          to: { x: 50 + stepWidth * 2, y: 280 },
          status: executionProgress > 15 ? 'completed' : 'active',
          animated: executionProgress > 15
        },
        {
          id: 'fire-c3',
          from: { x: 50 + stepWidth * 2 + nodeWidth, y: 280 },
          to: { x: 50 + stepWidth * 3, y: 255 },
          status: executionProgress > 30 ? 'completed' : 'idle',
          animated: executionProgress > 30
        },
        {
          id: 'fire-c4',
          from: { x: 50 + stepWidth * 2 + nodeWidth, y: 280 },
          to: { x: 50 + stepWidth * 3, y: 280 },
          status: executionProgress > 30 ? 'completed' : 'idle',
          animated: executionProgress > 30
        },
        {
          id: 'fire-c5',
          from: { x: 50 + stepWidth * 2 + nodeWidth, y: 280 },
          to: { x: 50 + stepWidth * 3, y: 305 },
          status: executionProgress > 30 ? 'completed' : 'idle',
          animated: executionProgress > 30
        }
      ]);
    } else {
      // Show both workflows when no specific workflow is active - dual visualization
      const stepWidth = 140 + 40; // nodeWidth + spacing
      
      const weaponNodes = [
        {
          id: 'weapon-trigger',
          type: 'trigger',
          title: 'Weapon Detected',
          subtitle: 'Camera #2 - Main Entrance',
          position: { x: 50, y: 80 },
          status: 'idle' as const,
          metrics: { confidence: '96%', latency: '48ms' }
        },
        {
          id: 'weapon-processor',
          type: 'processor',
          title: 'Threat Assessment',
          subtitle: 'Multi-model Analysis',
          position: { x: 50 + stepWidth, y: 80 },
          status: 'idle' as const,
          metrics: { progress: 0 }
        },
        {
          id: 'weapon-decision',
          type: 'decision',
          title: 'Threat Confirmed',
          subtitle: 'Confidence > 90%',
          position: { x: 50 + stepWidth * 2, y: 80 },
          status: 'idle' as const
        },
        {
          id: 'weapon-lockdown',
          type: 'action',
          title: 'Lockdown Command',
          subtitle: 'Secure All Entrances',
          position: { x: 50 + stepWidth * 3, y: 40 },
          status: 'idle' as const
        },
        {
          id: 'weapon-alert',
          type: 'action',
          title: 'Emergency Alert',
          subtitle: 'Law Enforcement',
          position: { x: 50 + stepWidth * 3, y: 40 + verticalSpacing },
          status: 'idle' as const
        }
      ];
      
      const fireNodes = [
        {
          id: 'fire-trigger',
          type: 'trigger',
          title: 'Fire Detected',
          subtitle: 'Smoke Sensor - Floor 2',
          position: { x: 50, y: 280 },
          status: 'idle' as const,
          metrics: { confidence: '98%', latency: '32ms' }
        },
        {
          id: 'fire-processor',
          type: 'processor',
          title: 'Fire Confirmation',
          subtitle: 'Multi-sensor Analysis',
          position: { x: 50 + stepWidth, y: 280 },
          status: 'idle' as const,
          metrics: { progress: 0 }
        },
        {
          id: 'fire-approval',
          type: 'decision',
          title: 'Human Approval',
          subtitle: 'Safety Protocol',
          position: { x: 50 + stepWidth * 2, y: 280 },
          status: 'idle' as const
        },
        {
          id: 'fire-alarm',
          type: 'action',
          title: 'Fire Alarm',
          subtitle: 'Building-wide Alert',
          position: { x: 50 + stepWidth * 3, y: 270 },
          status: 'idle' as const
        },
        {
          id: 'fire-unlock',
          type: 'action',
          title: 'Exit Unlock',
          subtitle: 'Emergency Exits',
          position: { x: 50 + stepWidth * 3, y: 270 + verticalSpacing },
          status: 'idle' as const
        },
        {
          id: 'fire-services',
          type: 'action',
          title: 'Emergency Services',
          subtitle: 'Fire Department',
          position: { x: 50 + stepWidth * 3, y: 270 + verticalSpacing * 2 },
          status: 'idle' as const
        }
      ];
      
      setNodes([...weaponNodes, ...fireNodes]);
      
      const nodeWidth = 140;
      const weaponConnections = [
        {
          id: 'weapon-c1',
          from: { x: 50 + nodeWidth, y: 80 },
          to: { x: 50 + stepWidth, y: 80 },
          status: 'idle' as const,
          animated: false
        },
        {
          id: 'weapon-c2',
          from: { x: 50 + stepWidth + nodeWidth, y: 80 },
          to: { x: 50 + stepWidth * 2, y: 80 },
          status: 'idle' as const,
          animated: false
        },
        {
          id: 'weapon-c3',
          from: { x: 50 + stepWidth * 2 + nodeWidth, y: 80 },
          to: { x: 50 + stepWidth * 3, y: 65 },
          status: 'idle' as const,
          animated: false
        },
        {
          id: 'weapon-c4',
          from: { x: 50 + stepWidth * 2 + nodeWidth, y: 80 },
          to: { x: 50 + stepWidth * 3, y: 95 },
          status: 'idle' as const,
          animated: false
        }
      ];
      
      const fireConnections = [
        {
          id: 'fire-c1',
          from: { x: 50 + nodeWidth, y: 280 },
          to: { x: 50 + stepWidth, y: 280 },
          status: 'idle' as const,
          animated: false
        },
        {
          id: 'fire-c2',
          from: { x: 50 + stepWidth + nodeWidth, y: 280 },
          to: { x: 50 + stepWidth * 2, y: 280 },
          status: 'idle' as const,
          animated: false
        },
        {
          id: 'fire-c3',
          from: { x: 50 + stepWidth * 2 + nodeWidth, y: 280 },
          to: { x: 50 + stepWidth * 3, y: 255 },
          status: 'idle' as const,
          animated: false
        },
        {
          id: 'fire-c4',
          from: { x: 50 + stepWidth * 2 + nodeWidth, y: 280 },
          to: { x: 50 + stepWidth * 3, y: 280 },
          status: 'idle' as const,
          animated: false
        },
        {
          id: 'fire-c5',
          from: { x: 50 + stepWidth * 2 + nodeWidth, y: 280 },
          to: { x: 50 + stepWidth * 3, y: 305 },
          status: 'idle' as const,
          animated: false
        }
      ];
      
      setConnections([...weaponConnections, ...fireConnections]);
    }
  }, [activeWorkflow, executionProgress]);

  const getNodeIcon = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'trigger': return Eye;
      case 'processor': return Brain;
      case 'decision': return Shield;
      case 'action': return Zap;
      default: return CheckCircle;
    }
  };

  const getStatusConfig = (status: WorkflowNode['status']) => {
    const configs = {
      idle: { color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30' },
      active: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
      executing: { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
      completed: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
      error: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' }
    };
    return configs[status] || configs.idle;
  };

  const getConnectionPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const midX = from.x + (to.x - from.x) / 2;
    return `M ${from.x} ${from.y} Q ${midX} ${from.y} ${to.x} ${to.y}`;
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Canvas Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      </div>

      {/* Main Canvas */}
      <div className="relative h-full p-6 overflow-auto">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Render connections */}
          {connections.map((connection) => (
            <g key={connection.id}>
              <motion.path
                d={getConnectionPath(connection.from, connection.to)}
                stroke={connection.status === 'completed' ? '#10b981' : 
                       connection.status === 'active' ? '#3b82f6' : '#64748b'}
                strokeWidth="2"
                fill="none"
                strokeDasharray={connection.animated ? "5,5" : "none"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
              {connection.animated && (
                <motion.circle
                  r="3"
                  fill="#3b82f6"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <animateMotion dur="2s" repeatCount="indefinite">
                    <mpath href={`#${connection.id}`} />
                  </animateMotion>
                </motion.circle>
              )}
            </g>
          ))}
        </svg>

        {/* Render workflow nodes */}
        {nodes.map((node, index) => {
          const Icon = getNodeIcon(node.type);
          const statusConfig = getStatusConfig(node.status);

          return (
            <motion.div
              key={node.id}
              className={cn(
                glassCard.base,
                glassCard.variants.default,
                statusConfig.bg,
                statusConfig.border,
                'absolute w-36 p-3 cursor-pointer hover:scale-105 transition-all duration-200'
              )}
              style={{
                left: node.position.x,
                top: node.position.y,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Icon className={cn('w-4 h-4', statusConfig.color)} />
                <Badge 
                  variant="outline" 
                  className={cn('text-xs', statusConfig.color, statusConfig.border)}
                >
                  {node.status}
                </Badge>
              </div>
              
              <h4 className={cn(typography.caption, 'text-white font-medium mb-1')}>
                {node.title}
              </h4>
              <p className="text-xs text-slate-400 mb-2">
                {node.subtitle}
              </p>

              {/* Metrics */}
              {node.metrics && (
                <div className="space-y-1">
                  {node.metrics.confidence && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Confidence</span>
                      <span className="text-green-400">{node.metrics.confidence}</span>
                    </div>
                  )}
                  {node.metrics.latency && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Latency</span>
                      <span className="text-blue-400">{node.metrics.latency}</span>
                    </div>
                  )}
                  {typeof node.metrics.progress === 'number' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-amber-400">{node.metrics.progress}%</span>
                      </div>
                      <Progress value={node.metrics.progress} className="h-1" />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}



        {/* Execution Overlay */}
        {activeWorkflow && executionProgress > 0 && (
          <motion.div
            className={cn(
              glassCard.base,
              glassCard.variants.default,
              'absolute top-6 right-6 p-4 w-64'
            )}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className={cn(typography.caption, 'text-white')}>
                Workflow Execution
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Progress</span>
                <span className="text-blue-400">{Math.round(executionProgress)}%</span>
              </div>
              <Progress value={executionProgress} className="h-2" />
              
              <div className="text-xs text-slate-400 mt-2">
                {activeWorkflow === 'weapon' ? 'Active Shooter Response' : 'Fire Emergency Protocol'}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WorkflowCanvas;
