// Professional Security Theme for YC Demo
export const theme = {
  primary: {
    50: '#eff6ff',   // Light blue backgrounds
    100: '#dbeafe',  // Subtle highlights
    500: '#3b82f6',  // Primary buttons, highlights  
    600: '#2563eb',  // Hover states
    700: '#1d4ed8',  // Active states
    900: '#1e3a8a'   // Text, borders
  },
  security: {
    green: '#10b981',   // Safe/operational
    amber: '#f59e0b',   // Warning states  
    red: '#ef4444',     // Critical alerts
    purple: '#8b5cf6'   // AI/automation indicators
  },
  surfaces: {
    glass: 'rgba(255, 255, 255, 0.1)',     // Glassmorphism
    card: 'rgba(255, 255, 255, 0.05)',     // Card backgrounds
    border: 'rgba(255, 255, 255, 0.1)',    // Subtle borders
    overlay: 'rgba(0, 0, 0, 0.4)'          // Modal overlays
  },
  gradients: {
    primary: 'bg-gradient-to-r from-slate-900 to-slate-800',
    secondary: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    critical: 'bg-gradient-to-r from-red-900/20 to-red-800/20',
    success: 'bg-gradient-to-r from-green-900/20 to-green-800/20'
  }
};

// Typography Scale
export const typography = {
  display: 'text-3xl font-bold',           // Dashboard title
  heading: 'text-xl font-semibold',        // Section headers
  subheading: 'text-lg font-medium',       // Subsection headers
  body: 'text-sm font-medium',             // Main content
  caption: 'text-xs font-normal',          // Supporting text
  mono: 'font-mono text-xs'                // Code/metrics
};

// Glass Card Component Classes
export const glassCard = {
  base: 'backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl',
  variants: {
    default: 'shadow-lg',
    critical: 'shadow-2xl ring-2 ring-red-400/30 border-red-400/20',
    success: 'shadow-lg ring-1 ring-green-400/20 border-green-400/10',
    warning: 'shadow-lg ring-1 ring-amber-400/20 border-amber-400/10'
  }
};

// Animated Status Indicators
export const statusIndicator = {
  online: 'w-2 h-2 bg-green-400 rounded-full animate-pulse',
  warning: 'w-2 h-2 bg-amber-400 rounded-full animate-pulse',
  critical: 'w-2 h-2 bg-red-400 rounded-full animate-bounce',
  offline: 'w-2 h-2 bg-slate-400 rounded-full'
};

// Animation Classes
export const animations = {
  fadeInUp: 'animate-in slide-in-from-bottom-4 fade-in duration-500',
  fadeInLeft: 'animate-in slide-in-from-left-4 fade-in duration-500',
  fadeInRight: 'animate-in slide-in-from-right-4 fade-in duration-500',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin'
};

// Layout Constants
export const layout = {
  header: 'h-20',
  footer: 'h-12',
  leftPanel: 'w-80 min-w-0 flex-shrink-0',
  rightPanel: 'w-72 min-w-0 flex-shrink-0',
  mainContent: 'flex-1 min-w-0'
};
