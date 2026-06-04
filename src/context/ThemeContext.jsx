import { createContext, useEffect, useState, useCallback } from 'react';

export const ThemeContext = createContext(null);

const STORAGE_KEY = 'pa_theme';
const VALID_THEMES = ['light', 'dark'];

/** Resolve the initial theme synchronously so we don't flash the wrong one. */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (VALID_THEMES.includes(stored)) return stored;

    /* If user already has a profile saved with a theme preference, honour it */
    const userJson = localStorage.getItem('pa_user');
    if (userJson) {
      const pref = JSON.parse(userJson)?.theme_preference;
      if (VALID_THEMES.includes(pref)) return pref;
    }
  } catch (_) {}

  /* Default: dark (matches current design); fall back to system pref only if
     the user hasn't expressed one. */
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

/* Apply theme attribute immediately, before React mounts — avoids FOUC. */
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', getInitialTheme());
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  /* Sync to DOM + storage whenever it changes */
  useEffect(() => {
    const root = document.documentElement;
    /* Briefly enable global transitions so the swap animates */
    root.setAttribute('data-theme-transition', 'true');
    root.setAttribute('data-theme', theme);

    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}

    /* Sync to stored user profile (so it persists with the account) */
    try {
      const userJson = localStorage.getItem('pa_user');
      if (userJson) {
        const u = JSON.parse(userJson);
        if (u.theme_preference !== theme) {
          u.theme_preference = theme;
          localStorage.setItem('pa_user', JSON.stringify(u));
        }
      }
    } catch (_) {}

    const t = setTimeout(() => root.removeAttribute('data-theme-transition'), 280);
    return () => clearTimeout(t);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (VALID_THEMES.includes(next)) setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark', isLight: theme === 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
}
