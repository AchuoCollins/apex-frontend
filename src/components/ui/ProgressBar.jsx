import styles from './ProgressBar.module.css';

export default function ProgressBar({ value, max = 100, label, showValue = true, variant = 'accent', size = 'md' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={styles.wrapper}>
      {(label || showValue) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && <span className={styles.value}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={[styles.track, styles[size]].join(' ')}>
        <div
          className={[styles.fill, styles[variant]].join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
