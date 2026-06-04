import styles from './StatCard.module.css';

export default function StatCard({ label, value, unit, trend, status = 'default', sublabel }) {
  return (
    <div className={[styles.card, styles[status]].join(' ')}>
      <span className={styles.label}>{label}</span>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value ?? '—'}</span>
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
      {sublabel && <span className={styles.sublabel}>{sublabel}</span>}
      {trend !== undefined && (
        <span className={[styles.trend, trend >= 0 ? styles.up : styles.down].join(' ')}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
}
