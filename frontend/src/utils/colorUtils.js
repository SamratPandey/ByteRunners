/**
 * ByteRunners Color Utilities
 * Centralized color management for consistent UI theming
 */

// Primary Color Palette
export const colors = {
  // Primary ByteRunners Green Theme
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7', 
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main brand green
    600: '#16a34a', // Primary button color
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Secondary Gray Scale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Accent Colors
  blue: {
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  
  yellow: {
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
  },
  
  red: {
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Special Purpose Colors
  background: '#000000',
  surface: '#0f0f0f',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6',
};

// Button Variants Configuration
export const buttonVariants = {
  primary: {
    bg: colors.primary[600],
    hover: colors.primary[700],
    text: 'white',
    description: 'Main action buttons'
  },
  
  secondary: {
    bg: colors.gray[700],
    hover: colors.gray[600],
    text: 'white',
    description: 'Secondary actions'
  },
  
  success: {
    bg: colors.success,
    hover: colors.primary[700],
    text: 'white',
    description: 'Success/completion actions'
  },
  
  warning: {
    bg: colors.warning,
    hover: colors.yellow[700],
    text: 'white',
    description: 'Warning/caution actions'
  },
  
  error: {
    bg: colors.error,
    hover: colors.red[700],
    text: 'white',
    description: 'Destructive/error actions'
  },
  
  info: {
    bg: colors.info,
    hover: colors.blue[700],
    text: 'white',
    description: 'Informational actions'
  },
  
  outline: {
    bg: 'transparent',
    hover: colors.primary[600],
    border: colors.primary[600],
    text: colors.primary[600],
    hoverText: 'white',
    description: 'Secondary outline buttons'
  },
  
  ghost: {
    bg: 'transparent',
    hover: `${colors.primary[600]}10`, // 10% opacity
    text: colors.gray[300],
    hoverText: colors.primary[400],
    description: 'Minimal ghost buttons'
  }
};

// Status Colors for Various States
export const statusColors = {
  online: colors.success,
  offline: colors.gray[500],
  pending: colors.warning,
  error: colors.error,
  premium: colors.yellow[500],
  
  difficulty: {
    easy: colors.success,
    medium: colors.warning,
    hard: colors.error,
  },
  
  badge: {
    new: colors.blue[500],
    featured: colors.yellow[500],
    premium: colors.yellow[600],
    completed: colors.success,
  }
};

// Typography Colors
export const textColors = {
  primary: '#ffffff',
  secondary: colors.gray[300],
  muted: colors.gray[500],
  accent: colors.primary[400],
  link: colors.primary[500],
  linkHover: colors.primary[400],
  error: colors.error,
  success: colors.success,
  warning: colors.warning,
};

// Border Colors  
export const borderColors = {
  default: colors.gray[800],
  subtle: colors.gray[900],
  accent: colors.primary[600],
  muted: colors.gray[700],
  focus: colors.primary[500],
};

// Background Colors
export const backgroundColors = {
  primary: colors.background,
  surface: colors.surface,
  card: '#0a0a0a',
  elevated: '#1a1a1a',
  overlay: 'rgba(0, 0, 0, 0.8)',
  glass: 'rgba(0, 0, 0, 0.3)',
};

// Utility function to get button classes
export const getButtonClasses = (variant = 'primary', size = 'default') => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    default: 'h-10 px-4 py-2',
    lg: 'h-11 px-8',
    xl: 'h-12 px-10 text-lg',
    icon: 'h-10 w-10',
  };

  return `${baseClasses} ${sizeClasses[size] || sizeClasses.default}`;
};

// Utility function to get difficulty badge colors
export const getDifficultyColor = (difficulty) => {
  const difficultyMap = {
    easy: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    hard: 'bg-red-100 text-red-800 border-red-200',
    Easy: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Hard: 'bg-red-100 text-red-800 border-red-200',
  };
  
  return difficultyMap[difficulty] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Export default theme configuration
export const theme = {
  colors,
  buttonVariants,
  statusColors,
  textColors,
  borderColors,
  backgroundColors,
};

export default theme;
