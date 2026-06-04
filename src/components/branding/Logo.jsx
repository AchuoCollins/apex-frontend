import { Link } from 'react-router-dom';
import styles from './Logo.module.css';

/**
 * APEX text-based logo.
 *
 * Props:
 *  - size:    'sm' | 'md' | 'lg' | 'xl'            (default 'md')
 *  - variant: 'default' | 'mark-only' | 'stacked'  (default 'default')
 *  - to:      route to link to; pass null to render a non-link span
 *  - showTagline: boolean — adds "Reach Your Peak Potential" under the wordmark
 *  - className:  optional outer class
 */
export default function Logo({
  size        = 'md',
  variant     = 'default',
  to          = '/',
  showTagline = false,
  className   = '',
}) {
  const inner = (
    <>
      {/* The mark: stylised "A" inside a square — fitness + AI aesthetic */}
      <span className={styles.mark} aria-hidden>
        <svg viewBox="0 0 32 32" className={styles.markSvg}>
          <rect x="1" y="1" width="30" height="30" rx="7" className={styles.markBg} />
          {/* Stylised "A" peak */}
          <path
            d="M9 23 L16 8 L23 23 M12.2 17.5 L19.8 17.5"
            fill="none"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.markStroke}
          />
        </svg>
      </span>

      {variant !== 'mark-only' && (
        <span className={[styles.wordWrap, variant === 'stacked' ? styles.wordStacked : ''].join(' ')}>
          <span className={styles.wordmark}>APEX</span>
          {showTagline && (
            <span className={styles.tagline}>Reach Your Peak Potential</span>
          )}
        </span>
      )}
    </>
  );

  const classes = [styles.logo, styles['size_' + size], className].join(' ');

  if (to === null) {
    return <span className={classes} aria-label="APEX">{inner}</span>;
  }
  return (
    <Link to={to} className={classes} aria-label="APEX home">
      {inner}
    </Link>
  );
}
