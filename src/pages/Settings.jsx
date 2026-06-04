import { useTheme } from '../hooks/useTheme';
import ThemeToggle from '../components/theme/ThemeToggle';
import styles from './Settings.module.css';

export default function Settings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.pageTitle}>Settings</h2>
          <p className={styles.pageSub}>
            Personalise the look of APEX. Your preferences are saved to this device.
          </p>
        </div>
      </div>

      {/* Appearance section */}
      <section className={styles.section}>
        <header className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>Appearance</h3>
          <p className={styles.sectionSub}>Choose between light and dark mode.</p>
        </header>

        <div className={styles.list}>
          <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowTitle}>
                {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </span>
              <span className={styles.rowSub}>
                {isDark
                  ? 'Easier on the eyes in low-light environments.'
                  : 'Bright, high-contrast layout for daytime use.'}
              </span>
            </div>
            <ThemeToggle variant="pill" size="md" />
          </div>
        </div>
      </section>

      {/* Current appearance summary */}
      <section className={styles.section}>
        <header className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>Current Appearance</h3>
          <p className={styles.sectionSub}>The theme currently applied across APEX.</p>
        </header>
        <div className={styles.statusGrid}>
          <div className={[styles.statusCard, styles.statusCardActive].join(' ')}>
            <span className={styles.statusIcon}>{isDark ? '🌙' : '☀️'}</span>
            <div className={styles.statusBody}>
              <span className={styles.statusLabel}>Theme</span>
              <span className={styles.statusValue}>{isDark ? 'Dark' : 'Light'}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
