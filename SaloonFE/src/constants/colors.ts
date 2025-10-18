export const COLORS = {
  // Light Mode
  light: {
    primary: '#000000',           // Pure Black
    secondary: '#C0C0C0',         // Silver
    accent: '#A8A8A8',            // Light Silver
    background: '#F5F5F5',        // Off White
    cardBg: '#FFFFFF',            // White
    text: '#000000',              // Black
    textSecondary: '#666666',     // Gray
    border: '#E0E0E0',            // Light Gray
    success: '#2ECC71',
    error: '#E74C3C',
    warning: '#F39C12',
  },
  
  // Dark Mode
  dark: {
    primary: '#FFFFFF',           // White
    secondary: '#C0C0C0',         // Silver
    accent: '#808080',            // Medium Gray
    background: '#000000',        // Pure Black
    cardBg: '#1A1A1A',            // Dark Gray
    text: '#C0C0C0',              // Silver
    textSecondary: '#808080',     // Medium Gray
    border: '#333333',            // Dark Border
    success: '#2ECC71',
    error: '#E74C3C',
    warning: '#F39C12',
  },
};

export const GRADIENTS = {
  light: {
    primary: ['#000000', '#333333'],
    secondary: ['#C0C0C0', '#E8E8E8'],
    accent: ['#808080', '#C0C0C0'],
  },
  dark: {
    primary: ['#1A1A1A', '#000000'],
    secondary: ['#333333', '#1A1A1A'],
    accent: ['#C0C0C0', '#808080'],
  },
};

export const SHADOWS = {
  light: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  dark: {
    small: {
      shadowColor: '#C0C0C0',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#C0C0C0',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#C0C0C0',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};
