export const theme = {
  colors: {
    bg: "#F6F8FA",
    background: "#F6F8FA",
    surface: "#FFFFFF",
    text: "#0B1320",
    textSecondary: "#63738A",
    muted: "#63738A",
    primary: "#15803D",
    primaryAlt: "#0F766E",
    primaryLight: "#E7F8EE",
    success: "#16A34A",
    warn: "#F59E0B",
    danger: "#DC2626",
    border: "#E5E7EB",
    badge: {
      goodBg: "#E7F8EE", 
      goodText: "#15803D",
      cautionBg: "#FFF6DB", 
      cautionText: "#B45309",
      dontBg: "#FDECEC", 
      dontText: "#B91C1C",
    }
  },
  radius: 20,
  borderRadius: 20,
  spacing: (n: number) => n * 8,
  type: { 
    display: 28, 
    title: 20, 
    body: 18, 
    caption: 14 
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },
  elevation: {
    card: 2,
    button: 4,
  },
  fonts: {
    regular: 'NotoSansThai-Regular, system-ui, -apple-system, sans-serif',
    medium: 'NotoSansThai-Medium, system-ui, -apple-system, sans-serif',
    bold: 'NotoSansThai-Bold, system-ui, -apple-system, sans-serif',
  }
};

export type Theme = typeof theme;
