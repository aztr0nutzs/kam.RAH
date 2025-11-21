
export const colors = {
  bg: '#000000',
  neonPink: '#ff00ff',
  neonCyan: '#00ffff',
  neonMint: '#39ff14',
  neonPurple: '#9d00ff',
  textPrimary: '#e0e0e0',
  textSecondary: '#9ca3af',
  borderSubtle: '#1f2933',
  surface: 'rgba(0, 0, 0, 0.7)',
  surfaceDark: 'rgba(0, 0, 0, 0.9)',
  danger: '#ef4444', // red-500
};

export const typography = {
  // Ensure these fonts are loaded in App.tsx via expo-font
  monospace: 'SourceCodePro_400Regular', 
  orbitron: 'Orbitron_700Bold',
};

export const shadow = {
  neonPink: {
    shadowColor: colors.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  neonCyan: {
    shadowColor: colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  neonPurple: {
    shadowColor: colors.neonPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  }
};
