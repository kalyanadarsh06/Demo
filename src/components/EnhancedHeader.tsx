import React from 'react';
import { Shield, Activity, Zap, Clock, Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { theme, typography, statusIndicator } from '@/styles/theme';

interface MetricBadgeProps {
  label: string;
  value: string | number;
  trend?: string;
  status?: 'healthy' | 'warning' | 'critical' | 'optimal';
  color: 'blue' | 'green' | 'purple' | 'amber';
  icon?: React.ReactNode;
}

const MetricBadge: React.FC<MetricBadgeProps> = ({ 
  label, value, trend, status, color, icon 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    green: 'bg-green-500/10 border-green-500/20 text-green-300',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300'
  };

  const statusColors = {
    healthy: 'text-green-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
    optimal: 'text-purple-400'
  };

  return (
    <div className={cn(
      'flex items-center space-x-3 px-3 py-2 rounded-lg border backdrop-blur-sm',
      colorClasses[color]
    )}>
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-white">{value}</span>
          {trend && (
            <span className={cn(
              'text-xs font-medium',
              trend.startsWith('+') ? 'text-green-400' : 'text-red-400'
            )}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-xs opacity-80">{label}</p>
        {status && (
          <div className="flex items-center space-x-1 mt-1">
            <div className={cn(
              'w-1.5 h-1.5 rounded-full',
              status === 'healthy' && 'bg-green-400',
              status === 'warning' && 'bg-amber-400',
              status === 'critical' && 'bg-red-400',
              status === 'optimal' && 'bg-purple-400'
            )} />
            <span className={cn('text-xs capitalize', statusColors[status])}>
              {status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

interface DemoControlPanelProps {
  status: 'idle' | 'running' | 'paused';
  progress?: number;
  onStart: () => void;
  onStop: () => void;
  onPause?: () => void;
}

const DemoControlPanel: React.FC<DemoControlPanelProps> = ({ 
  status, progress = 0, onStart, onStop, onPause 
}) => (
  <div className="flex items-center space-x-4">
    {/* Demo Status Indicator */}
    <div className="flex items-center space-x-2">
      <div className={cn(
        'w-2 h-2 rounded-full',
        status === 'running' && 'bg-green-400 animate-pulse',
        status === 'paused' && 'bg-amber-400',
        status === 'idle' && 'bg-slate-400'
      )} />
      <span className="text-xs text-slate-300 font-medium">
        {status === 'running' ? 'LIVE DEMO' : status.toUpperCase()}
      </span>
    </div>

    {/* Control Buttons */}
    <div className="flex items-center space-x-2">
      {status === 'idle' ? (
        <Button 
          onClick={onStart}
          size="sm" 
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
        >
          <Play className="w-4 h-4 mr-1" />
          Start Demo
        </Button>
      ) : (
        <>
          {status === 'running' && onPause ? (
            <Button 
              onClick={onPause}
              size="sm" 
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          ) : status === 'paused' ? (
            <Button 
              onClick={onStart}
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="w-4 h-4 mr-1" />
              Resume
            </Button>
          ) : null}
          <Button 
            onClick={onStop}
            size="sm" 
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            <Square className="w-4 h-4 mr-1" />
            Stop
          </Button>
        </>
      )}
    </div>

    {/* Demo Progress */}
    {status === 'running' && progress > 0 && (
      <div className="flex items-center space-x-2">
        <Progress value={progress} className="w-24 h-2" />
        <span className="text-xs text-slate-400 font-mono">{progress}%</span>
      </div>
    )}
  </div>
);

interface EnhancedHeaderProps {
  demoStatus: 'idle' | 'running' | 'paused';
  totalEvents: number;
  activeWorkflows: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  progress?: number;
  onStart: () => void;
  onStop: () => void;
  onPause?: () => void;
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  demoStatus, totalEvents, activeWorkflows, systemHealth, progress,
  onStart, onStop, onPause
}) => (
  <header className="h-16 border-b border-white/10 bg-gradient-to-r from-slate-900 to-slate-800 relative overflow-hidden">
    {/* Animated Background */}
    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
    
    <div className="relative z-10 flex items-center justify-between h-full px-6">
      {/* Brand Section */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className={cn(typography.heading, 'text-white')}>Convergence</h1>
            <p className={cn(typography.caption, 'text-slate-400')}>
              AI-Powered Physical Security Automation
            </p>
          </div>
        </div>
      </div>

      {/* Live Metrics Summary */}
      <div className="flex items-center space-x-4">
        <MetricBadge 
          label="Events Processed" 
          value={totalEvents} 
          trend={totalEvents > 5 ? "+12%" : undefined}
          color="blue" 
          icon={<Activity className="w-4 h-4" />}
        />
        <MetricBadge 
          label="Active Workflows" 
          value={activeWorkflows} 
          status="healthy" 
          color="green" 
          icon={<Zap className="w-4 h-4" />}
        />
        <MetricBadge 
          label="Device Status" 
          value="Online"
          color="blue"
          icon={<Activity className="w-4 h-4" />}
        />
      </div>

      {/* Demo Controls */}
      <DemoControlPanel 
        status={demoStatus}
        progress={progress}
        onStart={onStart}
        onStop={onStop}
        onPause={onPause}
      />
    </div>
  </header>
);

export default EnhancedHeader;
