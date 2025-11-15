
export const theme = {
  colors: {
    // 🎨 Päävärit
    primary: '#0F828C', 
    secondary: '#A86464', 
    accent: '#B3E5BE', 
    highlight: '#F5FFC9', 

    background: '#FFFFFF', 
    surface: '#FFFFFF', 
    border: '#E0E0E0', 


    textPrimary: '#2E2E2E', 
    textSecondary: '#5C5C5C', 
    placeholder: '#9E9E9E', 

    error: '#811844',
    success: '#81C784',
    warning: '#FFD54F',
  },

  spacing: {
    xsmall: 4,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },

  borderRadius: {
    small: 6,
    medium: 10,
    large: 16,
    card: 12,
  },

  shadow: {
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
  },

  typography: {
    fontFamily: {
      regular: 'System', 
      bold: 'System',
      light: 'System',
    },
    fontSize: {
      small: 12,
      medium: 16,
      large: 20,
      xlarge: 26,
    },
    lineHeight: {
      small: 18,
      medium: 24,
      large: 30,
    },
  },
};
