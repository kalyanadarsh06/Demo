import React from 'react';
import { 
  Activity, Shield, CheckCircle, AlertTriangle, Clock, Zap,
  TrendingUp, TrendingDown, XCircle, Camera, Lock, Speaker
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { glassCard, typography } from '@/styles/theme';

interface HealthMetricProps {
  label: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical' | 'optimal';
  details: string;
  trend?: 'up' | 'down' | 'stable';
}

const HealthMetric: React.FC<HealthMetricProps> = ({ 
  label, value, unit, status, details, trend 
}) => {
  const statusConfig = {
    healthy: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    optimal: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
  };

  const config = statusConfig[status];

  return (
    <div className={cn('p-3 rounded-lg border backdrop-blur-sm', config.bg, config.border)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">{label}</span>
        {trend && (
          <div className="flex items-center space-x-1">
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3 text-green-400" />
            ) : trend === 'down' ? (
              <TrendingDown className="w-3 h-3 text-red-400" />
            ) : null}
          </div>
        )}
      </div>
      <div className="flex items-baseline space-x-1 mb-1">
        <span className={cn('text-2xl font-bold', config.color)}>{value}</span>
        <span className={cn('text-sm', config.color)}>{unit}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{details}</span>
        <Badge 
          variant="outline" 
          size="sm" 
          className={cn('text-xs capitalize', config.color, config.border)}
        >
          {status}
        </Badge>
      </div>
      {unit === '%' && (
        <Progress 
          value={value} 
          className={cn(
            "mt-2 h-1",
            status === 'healthy' && '[&>div]:bg-green-400',
            status === 'warning' && '[&>div]:bg-amber-400',
            status === 'critical' && '[&>div]:bg-red-400',
            status === 'optimal' && '[&>div]:bg-purple-400'
          )}
        />
      )}
    </div>
  );
};

interface WorkflowStatusCardProps {
  name: string;
  status: 'active' | 'standby' | 'executing' | 'error';
  lastTriggered: string;
  avgResponseTime: string;
  successRate: number;
}

const WorkflowStatusCard: React.FC<WorkflowStatusCardProps> = ({
  name, status, lastTriggered, avgResponseTime, successRate
}) => {
  const statusConfig = {
    active: { color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle },
    standby: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Clock },
    executing: { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Zap },
    error: { color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className={cn(
      'p-3 rounded-lg border backdrop-blur-sm',
      config.bg,
      'border-white/10'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <StatusIcon className={cn('w-4 h-4', config.color)} />
          <span className="text-sm font-medium text-white">{name}</span>
        </div>
        <Badge 
          variant="outline" 
          size="sm" 
          className={cn('text-xs capitalize', config.color)}
        >
          {status}
        </Badge>
      </div>
      
      <div className="text-xs">
        <div>
          <span className="text-slate-400">Last Triggered:</span>
          <div className="text-white font-mono">{lastTriggered}</div>
        </div>
      </div>
      
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400">Success Rate</span>
          <span className="text-green-400 font-bold">{successRate}%</span>
        </div>
        <Progress value={successRate} className="h-1" />
      </div>
    </div>
  );
};

interface DeviceStatusTileProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  online: number;
  status: 'healthy' | 'warning' | 'critical';
}

const DeviceStatusTile: React.FC<DeviceStatusTileProps> = ({
  icon, label, count, online, status
}) => {
  const statusConfig = {
    healthy: { color: 'text-green-400', bg: 'bg-green-500/10' },
    warning: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
    critical: { color: 'text-red-400', bg: 'bg-red-500/10' }
  };

  const config = statusConfig[status];
  const percentage = Math.round((online / count) * 100);

  return (
    <div className={cn(
      'p-3 rounded-lg border backdrop-blur-sm',
      config.bg,
      'border-white/10'
    )}>
      <div className="flex items-center space-x-2 mb-2">
        <div className={cn('p-1 rounded', config.bg)}>
          {React.cloneElement(icon as React.ReactElement, { 
            className: cn('w-4 h-4', config.color) 
          })}
        </div>
        <span className="text-xs font-medium text-white">{label}</span>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className={cn('text-lg font-bold', config.color)}>{online}</span>
          <span className="text-xs text-slate-400">/{count}</span>
        </div>
        <Progress value={percentage} className="h-1" />
        <div className="text-xs text-slate-400">{percentage}% online</div>
      </div>
    </div>
  );
};

interface ActivityTimelineProps {
  activities: Array<{
    id: string;
    action: string;
    timestamp: string;
    type: 'success' | 'warning' | 'error';
  }>;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => (
  <div className="space-y-2 max-h-32 overflow-y-auto">
    {activities.map((activity, index) => (
      <div key={activity.id} className="flex items-start space-x-2">
        <div className={cn(
          'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
          activity.type === 'success' && 'bg-green-400',
          activity.type === 'warning' && 'bg-amber-400',
          activity.type === 'error' && 'bg-red-400'
        )} />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-white">{activity.action}</p>
          <p className="text-xs text-slate-400 font-mono">{activity.timestamp}</p>
        </div>
      </div>
    ))}
  </div>
);

interface SystemStatusPanelProps {
  systemHealth: 'healthy' | 'warning' | 'critical';
  workflows: Array<{
    name: string;
    status: 'active' | 'standby' | 'executing' | 'error';
    lastTriggered: string;
    avgResponseTime: string;
    successRate: number;
  }>;
  deviceStats: {
    cameras: { total: number; online: number };
    accessControl: { total: number; online: number };
    sensors: { total: number; online: number };
    paSystem: { total: number; online: number };
  };
}

const SystemStatusPanel: React.FC<SystemStatusPanelProps> = ({
  systemHealth,
  workflows,
  deviceStats
}) => {
  const recentActivities = [
    { id: '1', action: 'Workflow executed successfully', timestamp: '2 min ago', type: 'success' as const },
    { id: '2', action: 'Device health check completed', timestamp: '5 min ago', type: 'success' as const },
    { id: '3', action: 'Camera #3 connection restored', timestamp: '8 min ago', type: 'warning' as const },
    { id: '4', action: 'System backup completed', timestamp: '15 min ago', type: 'success' as const }
  ];

  return (
    <div className="h-full flex flex-col space-y-4 p-4">


      {/* Active Workflows */}
      <div className={cn(glassCard.base, glassCard.variants.default, 'p-4 flex-1')}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn(typography.subheading, 'text-white')}>Active Workflows</h3>
          <Badge variant="outline" className="text-slate-300">
            {workflows.length} Active
          </Badge>
        </div>
        
        <div className="space-y-3">
          {workflows.map((workflow, index) => (
            <WorkflowStatusCard 
              key={index}
              name={workflow.name}
              status={workflow.status}
              lastTriggered={workflow.lastTriggered}
              avgResponseTime={workflow.avgResponseTime}
              successRate={workflow.successRate}
            />
          ))}
        </div>
      </div>

      {/* Device Status Grid */}
      <div className={cn(glassCard.base, glassCard.variants.default, 'p-4')}>
        <h3 className={cn(typography.subheading, 'text-white mb-4')}>Device Status</h3>
        <div className="grid grid-cols-2 gap-3">
          <DeviceStatusTile 
            icon={<Camera />}
            label="Cameras"
            count={deviceStats.cameras.total}
            online={deviceStats.cameras.online}
            status="healthy"
          />
          <DeviceStatusTile 
            icon={<Lock />}
            label="Access Control"
            count={deviceStats.accessControl.total}
            online={deviceStats.accessControl.online}
            status="healthy"
          />
          <DeviceStatusTile 
            icon={<Zap />}
            label="Sensors"
            count={deviceStats.sensors.total}
            online={deviceStats.sensors.online}
            status="warning"
          />
          <DeviceStatusTile 
            icon={<Speaker />}
            label="PA System"
            count={deviceStats.paSystem.total}
            online={deviceStats.paSystem.online}
            status="healthy"
          />
        </div>
      </div>


    </div>
  );
};

export default SystemStatusPanel;
