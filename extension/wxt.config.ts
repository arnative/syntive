import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// Syntive extension config. Targets Chromium + Firefox from one codebase.
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  webExt: {
    disabled: true,
  },
vite: () => ({
    plugins: [tailwindcss()],
    define: {
      // API base injected at build time from .env (VITE_API_BASE).
      // Falls back to localhost for `wxt dev`.
      __API_BASE__: JSON.stringify(process.env.VITE_API_BASE ?? 'https://syntive.byztma.workers.dev'),
    },
    // Disable Vite's automatic <link rel="modulepreload"> injection.
    // It preloads the shared globals chunk from a cross-world context, which
    // Chrome flags as a "cross-world extension resource mismatch" warning.
    build: {
      modulePreload: false,
    },
  }),
  manifest: {
    name: 'Syntive',
    description: 'Encrypted bookmark synchronization across browsers & OS.',
    permissions: ['bookmarks', 'storage', 'alarms', 'topSites'],
    host_permissions: ['https://*/*'],
    icons: {
      '16': 'icons/logo-16.png',
      '32': 'icons/logo-32.png',
      '48': 'icons/logo-48.png',
      '128': 'icons/logo-128.png',
    },
    action: {
      default_icon: {
        '16': 'icons/logo-16.png',
        '32': 'icons/logo-32.png',
        '48': 'icons/logo-48.png',
      },
    },
    // Override the new-tab page so the Syntive dashboard replaces it.
    chrome_url_overrides: { newtab: 'newtab.html' },
    browser_specific_settings: {
      gecko: {
        id: 'syntive@extension.id',
      },
    },
  },
});
