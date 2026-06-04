import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../theme/ThemeToggle';
import styles from './Topbar.module.css';

const TITLES = {
  '/dashboard': 'APEX Dashboard',
  '/metrics':   'Your Metrics',
  '/analysis':  'Physique Analysis',
  '/training':  'Training Plan',
  '/profile':   'Profile',
};

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const title = TITLES[pathname] ?? 'APEX';

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {/* Mobile menu button */}
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Toggle menu">
          <MenuIcon />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.right}>
        <ThemeToggle variant="icon" size="sm" />
        <div className={styles.userChip}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <span className={styles.userName}>{user?.name ?? 'Athlete'}</span>
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
