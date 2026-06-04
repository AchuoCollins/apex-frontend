import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/branding/Logo';
import styles from './AuthLayout.module.css';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user)    return <Navigate to="/dashboard" replace />;

  return (
    <div className={styles.shell}>
      {/* Background grid */}
      <div className={styles.grid} aria-hidden />

      {/* Left brand panel */}
      <div className={styles.brand}>
        <div className={styles.brandInner}>
          <Logo size="lg" />
          <h2 className={styles.tagline}>
            Welcome to<br />
            <span className={styles.accent}>APEX.</span>
          </h2>
          <p className={styles.brandTagline}>Reach Your Peak Potential</p>
          <p className={styles.brandBody}>
            AI-Powered Physique &amp; Training Analyzer. Sign in to continue your fitness journey.
          </p>
          <div className={styles.pillRow}>
            {['Aesthetic Ratios', 'Periodized Plans', 'AI Analysis'].map(p => (
              <span key={p} className={styles.pill}>{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.form}>
        <div className={styles.formInner}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
