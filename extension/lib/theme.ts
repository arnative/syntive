// Theme management helper for Syntive

interface ThemePreset {
  id: string;
  name: string;
  accentHex: string;
}

export const PRESET_THEMES: ThemePreset[] = [
  { id: 'default', name: 'Default (Zinc)', accentHex: '#ffffff' },
  { id: 'dracula', name: 'Dracula (Violet)', accentHex: '#bd93f9' },
  { id: 'clouds', name: 'Clouds (Sky Blue)', accentHex: '#38bdf8' },
  { id: 'emerald', name: 'Emerald Synth (Green)', accentHex: '#10b981' },
  { id: 'amber', name: 'Cyber Amber (Gold)', accentHex: '#f59e0b' },
  { id: 'sunset', name: 'Sunset Orange (Coral)', accentHex: '#f97316' },
  { id: 'rose-pine', name: 'Rosé Pine (Pink)', accentHex: '#ec4899' },
  { id: 'custom', name: 'Kustom Hex / GitHub', accentHex: '#6366f1' },
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

/**
 * Standard RGB -> OKLCH converter to extract exact Hue angle H (0-360 deg) and Chroma
 * for 100% precise native OKLCH theme generation without hue distortion.
 */
export function hexToOklch(hex: string): { l: number; c: number; h: number } {
  let cleanHex = hex.trim().replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((ch) => ch + ch).join('');
  }
  if (cleanHex.length !== 6) return { l: 0.75, c: 0.15, h: 250 };

  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

  const toLinear = (c: number) => (c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92);
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720403 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757986 * s_;

  const C = Math.sqrt(a * a + b_ * b_);
  let H = (Math.atan2(b_, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
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
    root.style.removeProperty('--background');
    root.style.removeProperty('--card');
    root.style.removeProperty('--popover');
    root.style.removeProperty('--muted');
    root.style.removeProperty('--tint-foreground');
    root.style.removeProperty('--border');
  } else {
    root.style.setProperty('--primary', accentColor);
    root.style.setProperty('--ring', accentColor);

    const { l, h } = hexToOklch(accentColor);
    const roundH = Math.round(h * 10) / 10;

    // Dynamically set --primary-foreground based on accent lightness (WCAG AA compliance)
    const primaryFg = l < 0.68 ? '#ffffff' : '#0f172a';
    root.style.setProperty('--primary-foreground', primaryFg);

    if (isDark) {
      // Ultra-subtle, sleek OKLCH surface tinting using identical Hue H to eliminate reddish distortion
      root.style.setProperty('--background', `oklch(0.10 0.005 ${roundH})`);
      root.style.setProperty('--card', `oklch(0.14 0.008 ${roundH})`);
      root.style.setProperty('--popover', `oklch(0.14 0.008 ${roundH})`);
      root.style.setProperty('--muted', `oklch(0.17 0.012 ${roundH})`);
      root.style.setProperty('--tint-foreground', `oklch(0.72 0.045 ${roundH})`);
      root.style.setProperty('--border', `oklch(0.23 0.015 ${roundH})`);
      root.style.setProperty('--accent', `oklch(0.19 0.020 ${roundH})`);
    } else {
      root.style.setProperty('--background', `oklch(0.99 0.004 ${roundH})`);
      root.style.setProperty('--card', `oklch(0.97 0.007 ${roundH})`);
      root.style.setProperty('--popover', `oklch(0.97 0.007 ${roundH})`);
      root.style.setProperty('--muted', `oklch(0.93 0.010 ${roundH})`);
      root.style.setProperty('--tint-foreground', `oklch(0.45 0.060 ${roundH})`);
      root.style.setProperty('--border', `oklch(0.88 0.012 ${roundH})`);
      root.style.setProperty('--accent', `oklch(0.94 0.014 ${roundH})`);
    }
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
