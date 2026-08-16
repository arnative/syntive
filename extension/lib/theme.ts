// Theme management helper for Syntive

interface ThemePreset {
  id: string;
  name: string;
  accentHex: string;
  // Readable text on accentHex (WCAG AA), precomputed per preset.
  primaryFg: string;
}

export const PRESET_THEMES: ThemePreset[] = [
  { id: 'default', name: 'Default (Zinc)', accentHex: '#ffffff', primaryFg: '#0f172a' },
  { id: 'dracula', name: 'Dracula (Violet)', accentHex: '#bd93f9', primaryFg: '#0f172a' },
  { id: 'clouds', name: 'Clouds (Sky Blue)', accentHex: '#38bdf8', primaryFg: '#0f172a' },
  { id: 'emerald', name: 'Emerald Synth (Green)', accentHex: '#10b981', primaryFg: '#0f172a' },
  { id: 'amber', name: 'Cyber Amber (Gold)', accentHex: '#f59e0b', primaryFg: '#0f172a' },
  { id: 'sunset', name: 'Sunset Orange (Coral)', accentHex: '#f97316', primaryFg: '#0f172a' },
  { id: 'rose-pine', name: 'Rosé Pine (Pink)', accentHex: '#ec4899', primaryFg: '#ffffff' },
  { id: 'custom', name: 'Kustom Hex / GitHub', accentHex: '#6366f1', primaryFg: '#ffffff' },
];

export interface ThemeConfig {
  mode: 'dark' | 'light' | 'system';
  presetId: string;
  customAccent: string;
  githubUrl?: string;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'system',
  presetId: 'default',
  customAccent: '#6366f1',
  githubUrl: '',
};

// YIQ contrast pick for user-supplied custom hex colors (presets carry
// precomputed primaryFg instead).
function contrastFg(hex: string): string {
  const clean = hex.trim().replace('#', '');
  if (clean.length !== 6) return '#ffffff';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (299 * r + 587 * g + 114 * b) / 1000 >= 128 ? '#0f172a' : '#ffffff';
}

export async function loadThemeConfig(): Promise<ThemeConfig> {
  try {
    const data = await browser.storage.local.get([
      'syntive.themeMode',
      'syntive.themePreset',
      'syntive.customAccent',
      'syntive.githubAccentUrl',
    ]);
    return {
      mode: (data['syntive.themeMode'] as ThemeConfig['mode']) || 'system',
      presetId: (data['syntive.themePreset'] as string) || 'default',
      customAccent: (data['syntive.customAccent'] as string) || '#6366f1',
      githubUrl: (data['syntive.githubAccentUrl'] as string) || '',
    };
  } catch (err) {
    console.error('Failed to load theme config:', err);
    return DEFAULT_THEME_CONFIG;
  }
}

export async function saveThemeConfig(config: ThemeConfig): Promise<void> {
  try {
    await browser.storage.local.set({
      'syntive.themeMode': config.mode,
      'syntive.themePreset': config.presetId,
      'syntive.customAccent': config.customAccent,
      'syntive.githubAccentUrl': config.githubUrl || '',
    });
    localStorage.setItem('syntive.theme', config.mode);
    applyThemeConfig(config);
  } catch (err) {
    console.error('Failed to save theme config:', err);
  }
}

export function getEffectiveIsDark(mode: 'dark' | 'light' | 'system'): boolean {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return mode === 'dark';
}

export function applyThemeConfig(config?: ThemeConfig | null): void {
  if (!config) return;
  const root = document.documentElement;

  // Disable all transitions during theme application to prevent flicker
  root.classList.add('theme-transitioning');

  // 1. Mode application
  const isDark = getEffectiveIsDark(config.mode);
  root.classList.toggle('light', !isDark);

  // 2. Preset & Accent application
  const preset = PRESET_THEMES.find((p) => p.id === config.presetId) || PRESET_THEMES[0];
  const accentColor = config.presetId === 'custom' && config.customAccent ? config.customAccent : preset.accentHex;

  if (preset.id === 'default') {
    root.style.removeProperty('--accent');
    root.style.removeProperty('--primary');
    root.style.removeProperty('--primary-foreground');
    root.style.removeProperty('--ring');
    root.removeAttribute('data-accent');
    root.style.removeProperty('--accent-source');
  } else {
    // Hue-tinted surfaces are derived in globals.css from --accent-source via
    // CSS relative color syntax (oklch(from <color> l c h)).
    root.style.setProperty('--accent-source', accentColor);
    root.setAttribute('data-accent', '');
    root.style.setProperty('--primary', accentColor);
    root.style.setProperty('--ring', accentColor);
    root.style.setProperty(
      '--primary-foreground',
      config.presetId === 'custom' ? contrastFg(accentColor) : preset.primaryFg
    );
  }

  // 3. Dynamic real-time tab favicon refresh for instant browser tab strip update on theme toggle
  const markColor = isDark ? '#e4decb' : '#2b2b2b';
  const svgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2134 2134"><style>.mark{fill:${markColor};opacity:0.80;}</style><path class="mark" d="M145.627,1186.242c0,-655.143 531.099,-1186.242 1186.242,-1186.242l-0,72.132c-453.999,166.424 -777.959,602.434 -777.959,1114.11l-0,373.29c193.257,-80.135 329.19,-270.626 329.19,-492.866c0,-294.551 238.781,-533.331 533.331,-533.331l0,-166.215c-0.002,-97.366 38.674,-190.745 107.522,-259.595c68.847,-68.849 162.232,-107.525 259.598,-107.526l0.007,533.336l204.148,0.001l0,413.754c-0,655.143 -531.099,1186.242 -1186.242,1186.242l0,-72.132c453.999,-166.424 777.959,-602.434 777.959,-1114.11l0,-373.293c-193.261,80.134 -329.196,270.626 -329.196,492.868c-0,294.551 -238.781,533.331 -533.331,533.331l0,166.215c0.002,97.366 -38.674,190.745 -107.522,259.595c-68.847,68.849 -162.232,107.525 -259.598,107.526l-0.007,-533.336l-204.142,-0.001l0,-413.754Z"/></svg>`
  )}`;

  const existingLinks = document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']");
  existingLinks.forEach((link) => link.remove());

  const newFavicon = document.createElement('link');
  newFavicon.rel = 'icon';
  newFavicon.type = 'image/svg+xml';
  newFavicon.href = svgDataUri;
  document.head.appendChild(newFavicon);

  // Re-enable transitions on next frame so the theme snap is instant
  requestAnimationFrame(() => root.classList.remove('theme-transitioning'));
}

/**
 * Initializes cross-tab theme storage listener & OS system color scheme listener.
 * Ensures ALL open tabs immediately & dynamically update theme & favicon in real-time.
 */
export function initThemeListeners(): () => void {
  loadThemeConfig().then((cfg) => applyThemeConfig(cfg));

  const onStorageChange = (changes: Record<string, any>) => {
    if (
      changes['syntive.themeMode'] ||
      changes['syntive.themePreset'] ||
      changes['syntive.customAccent'] ||
      changes['syntive.githubAccentUrl']
    ) {
      loadThemeConfig().then((cfg) => applyThemeConfig(cfg));
    }
  };
  browser.storage.onChanged.addListener(onStorageChange);

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const onMediaChange = () => {
    loadThemeConfig().then((cfg) => {
      if (cfg.mode === 'system') {
        applyThemeConfig(cfg);
      }
    });
  };
  mediaQuery.addEventListener?.('change', onMediaChange);

  return () => {
    browser.storage.onChanged.removeListener(onStorageChange);
    mediaQuery.removeEventListener?.('change', onMediaChange);
  };
}

export async function fetchGitHubAccentColor(url: string): Promise<string | null> {
  try {
    const rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    const res = await fetch(rawUrl);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (data && typeof data.accentHex === 'string') {
      return data.accentHex;
    }
    if (data && typeof data.accent === 'string') {
      return data.accent;
    }
    if (data && typeof data.primary === 'string') {
      return data.primary;
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch accent color from GitHub:', err);
    return null;
  }
}
