import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import styles from './Auth.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [form,   setForm]   = useState({ email: '', password: '' });
  const [error,  setError]  = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }

    setLoading(true);
    try {
      const tokens = await authService.login({ email: form.email, password: form.password });
      localStorage.setItem('pa_user', JSON.stringify({ token: tokens.access_token, refreshToken: tokens.refresh_token }));
      const me = await authService.me();
      login(
        {
          id: me.id,
          name: [me.first_name, me.last_name].filter(Boolean).join(' ') || me.email,
          email: me.email,
          firstName: me.first_name,
          lastName: me.last_name,
          profile: me.profile,
          focusAreas: me.focus_areas,
          refreshToken: tokens.refresh_token,
        },
        tokens.access_token,
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.message ?? 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Welcome to APEX</h2>
        <p className={styles.cardSub}>Sign in to continue your fitness journey.</p>
      </div>

      {/* Form */}
      <div className={styles.form}>
        {error && <div className={styles.errorBanner}><AlertIcon />{error}</div>}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Email Address</label>
          <input
            id="email" type="email" autoComplete="email"
            className={styles.input}
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="password">Password</label>
            <a href="#" className={styles.forgotLink}>Forgot password?</a>
          </div>
          <input
            id="password" type="password" autoComplete="current-password"
            className={styles.input}
            placeholder="••••••••"
            value={form.password}
            onChange={set('password')}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <span className={styles.spinner} /> : null}
          {loading ? 'Signing in…' : 'Sign In'}
          {!loading && <ArrowIcon />}
        </button>
      </div>

      {/* Divider */}
      <div className={styles.divider}><span>or</span></div>

      {/* Demo shortcut */}
      <button
        className={styles.demoBtn}
        onClick={() => {
          login({ id: 0, name: 'Demo Athlete', email: 'demo@apex.ai' }, 'demo-token');
          navigate('/dashboard');
        }}
      >
        <FlashIcon /> Continue as Demo Athlete
      </button>

      {/* Footer */}
      <p className={styles.switchText}>
        Don't have an account?{' '}
        <Link to="/register" className={styles.switchLink}>Create one free</Link>
      </p>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
function FlashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}
