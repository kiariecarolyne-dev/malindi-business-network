// Malindi Business Network design tokens.
//
// Visual identity: a modern, professional digital business network.
// Deep midnight navy as the brand canvas, electric blue as the action accent,
// a small teal/cyan highlight for network/technology touches, cool light
// neutrals for backgrounds. Deliberately distinct from the legacy green
// palette of the copied project.
export const colors = {
  navy: '#0A1A3C',
  navySoft: '#12264F',
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  primaryLight: '#E0EAFF',
  accent: '#14B8A6',
  accentLight: '#CCFBF1',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#0B1F45',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  placeholder: '#94A3B8',
  white: '#FFFFFF',
  // Background used behind photo/logo placeholders so they blend with the
  // app canvas (matches the splash and adaptive icon background).
  logoBackground: '#F8FAFC',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const typography = {
  // Large display headline used on branded entry screens.
  display: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.navy,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.navy },
  subtitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  body: { fontSize: 14, color: colors.text },
  bodySmall: { fontSize: 12, color: colors.textSecondary },
  caption: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
};

export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 2,
};

export const glow = {
  shadowColor: colors.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 16,
  elevation: 6,
};