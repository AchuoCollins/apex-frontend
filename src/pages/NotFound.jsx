import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.grid} aria-hidden />
      <div className={styles.inner}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.sub}>The page you're looking for doesn't exist or has been moved.</p>
        <div className={styles.actions}>
          <Link to="/" className={styles.btnAccent}>Go to Home</Link>
          <Link to="/dashboard" className={styles.btnGhost}>Open Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
