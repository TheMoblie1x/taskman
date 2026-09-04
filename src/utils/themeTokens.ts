import { CustomColors, KanbanCardSettings, PresetThemeName, ThemeMode, SupportedFontFamily, SupportedFontSize } from '../types';

export const DEFAULT_KANBAN_CARD_SETTINGS: KanbanCardSettings = {
  showTicketId: true,
  showAssignee: true,
  showPriority: true,
  showLabels: true,
  showDueDate: true,
  showTicketType: true,
  showSubtasksCount: true,
  cardRadius: 'md',
  columnWidth: 'normal',
};

export const SUPPORTED_FONT_FAMILIES: SupportedFontFamily[] = [
  'Plus Jakarta Sans',
  'Inter',
  'Roboto',
  'Outfit',
  'JetBrains Mono',
];

export const SUPPORTED_FONT_SIZES: { value: SupportedFontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'xlarge', label: 'Extra Large' },
];

export const PRESET_THEMES: Record<PresetThemeName, { name: string; mode: 'light' | 'dark'; colors: CustomColors }> = {
  default: {
    name: 'Default',
    mode: 'light',
    colors: {
      primary: '#2563EB',
      secondary: '#475569',
      accent: '#3B82F6',
      background: '#F8FAFC',
      sidebar: '#FFFFFF',
      card: '#FFFFFF',
      header: '#FFFFFF',
      text: '#0F172A',
      textSecondary: '#64748B',
      border: '#E2E8F0',
    },
  },
  midnight: {
    name: 'Midnight',
    mode: 'dark',
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#60A5FA',
      background: '#0B0F19',
      sidebar: '#0F172A',
      card: '#1E293B',
      header: '#0F172A',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      border: '#1E293B',
    },
  },
  slate: {
    name: 'Slate',
    mode: 'dark',
    colors: {
      primary: '#06B6D4',
      secondary: '#64748B',
      accent: '#22D3EE',
      background: '#0F172A',
      sidebar: '#1E293B',
      card: '#334155',
      header: '#1E293B',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      border: '#334155',
    },
  },
  forest: {
    name: 'Forest',
    mode: 'dark',
    colors: {
      primary: '#10B981',
      secondary: '#6B7280',
      accent: '#34D399',
      background: '#061D15',
      sidebar: '#0B291F',
      card: '#123D2F',
      header: '#0B291F',
      text: '#ECFDF5',
      textSecondary: '#A7F3D0',
      border: '#194E3D',
    },
  },
  ocean: {
    name: 'Ocean',
    mode: 'light',
    colors: {
      primary: '#0284C7',
      secondary: '#64748B',
      accent: '#0EA5E9',
      background: '#F0F9FF',
      sidebar: '#FFFFFF',
      card: '#FFFFFF',
      header: '#FFFFFF',
      text: '#0C4A6E',
      textSecondary: '#0369A1',
      border: '#BAE6FD',
    },
  },
  warm: {
    name: 'Warm Neutral',
    mode: 'light',
    colors: {
      primary: '#D97706',
      secondary: '#78716C',
      accent: '#F59E0B',
      background: '#FAFAF9',
      sidebar: '#FFFFFF',
      card: '#FFFFFF',
      header: '#FFFFFF',
      text: '#1C1917',
      textSecondary: '#78716C',
      border: '#E7E5E4',
    },
  },
};

export const HIGH_CONTRAST_COLORS: CustomColors = {
  primary: '#000000',
  secondary: '#1A1A1A',
  accent: '#0052CC',
  background: '#FFFFFF',
  sidebar: '#FFFFFF',
  card: '#FFFFFF',
  header: '#FFFFFF',
  text: '#000000',
  textSecondary: '#111111',
  border: '#000000',
};

export function applyThemeTokensToDOM(
  themeMode: ThemeMode,
  preset: PresetThemeName,
  customColors?: Partial<CustomColors>,
  fontFamily: SupportedFontFamily = 'Plus Jakarta Sans',
  fontSize: SupportedFontSize = 'medium'
) {
  const root = document.documentElement;

  // Determine dark class
  let isDark = false;
  if (themeMode === 'system') {
    isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else if (themeMode === 'dark') {
    isDark = true;
  } else if (themeMode === 'high_contrast') {
    isDark = false;
  } else {
    isDark = PRESET_THEMES[preset]?.mode === 'dark';
  }

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  if (themeMode === 'high_contrast') {
    root.setAttribute('data-high-contrast', 'true');
  } else {
    root.removeAttribute('data-high-contrast');
  }

  const baseColors =
    themeMode === 'high_contrast'
      ? HIGH_CONTRAST_COLORS
      : PRESET_THEMES[preset]?.colors || PRESET_THEMES.default.colors;

  const mergedColors: CustomColors = {
    ...baseColors,
    ...(customColors || {}),
  };

  // These are the actual custom properties index.css and the app's utility classes read —
  // keep this the single place that maps the CustomColors token set onto them.
  root.style.setProperty('--accent', mergedColors.primary);
  root.style.setProperty('--accent-hover', mergedColors.accent);
  root.style.setProperty('--bg', mergedColors.background);
  root.style.setProperty('--sidebar', mergedColors.sidebar);
  root.style.setProperty('--card', mergedColors.card);
  root.style.setProperty('--header', mergedColors.header);
  root.style.setProperty('--text-main', mergedColors.text);
  root.style.setProperty('--text-muted', mergedColors.textSecondary);
  root.style.setProperty('--border', mergedColors.border);
  root.style.setProperty('--color-secondary', mergedColors.secondary);

  // Font family
  const fontFallback = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  let fontCSS = `'${fontFamily}', ${fontFallback}`;
  if (fontFamily === 'JetBrains Mono') {
    fontCSS = `'JetBrains Mono', monospace`;
  }
  root.style.setProperty('--font-sans', fontCSS);
  document.body.style.fontFamily = fontCSS;

  // Font size scale
  const fontScales: Record<SupportedFontSize, string> = {
    small: '13px',
    medium: '14px',
    large: '15px',
    xlarge: '16px',
  };
  root.style.fontSize = fontScales[fontSize] || '14px';
}
