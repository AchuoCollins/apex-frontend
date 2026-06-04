import { useTheme } from '../../hooks/useTheme';
import styles from './ThemeToggle.module.css';

/**
 * APEX theme toggle.
 *
 * Variants:
 *  - 'pill'   — segmented pill with ☀️ Light and 🌙 Dark labelled buttons. Best on Settings.
 *  - 'icon'   — compact icon-only segmented pill. Best for navbars where space is tight.
 *  - 'switch' — single-thumb sliding switch.
 *
 * Sizes:  'sm' | 'md' (default 'md')
 */
export default function ThemeToggle({ variant = 'icon', size = 'md', className = '' }) {
  const { theme, setTheme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  /* Single-thumb switch */
  if (variant === 'switch') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleTheme}
        className={[styles.switch, styles['size_' + size], isDark ? styles.switchDark : styles.switchLight, className].join(' ')}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className={styles.switchThumb}>
          {isDark ? <MoonIcon /> : <SunIcon />}
        </span>
      </button>
    );
  }

  /* Labelled pill (Settings) or icon-only pill (navbar) */
  const showLabels = variant === 'pill';
  return (
    <div
      className={[
        styles.pill,
        styles['size_' + size],
        showLabels ? styles.pillLabelled : '',
        className,
      ].join(' ')}
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        className={[styles.pillBtn, !isDark ? styles.pillBtnActive : ''].join(' ')}
        onClick={() => setTheme('light')}
        aria-pressed={!isDark}
        aria-label="Light mode"
        title="Light mode"
      >
        <SunIcon />
        {showLabels && <span className={styles.pillLabel}>Light</span>}
      </button>
      <button
        type="button"
        className={[styles.pillBtn, isDark ? styles.pillBtnActive : ''].join(' ')}
        onClick={() => setTheme('dark')}
        aria-pressed={isDark}
        aria-label="Dark mode"
        title="Dark mode"
      >
        <MoonIcon />
        {showLabels && <span className={styles.pillLabel}>Dark</span>}
      </button>
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
