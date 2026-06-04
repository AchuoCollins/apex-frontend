import styles from './Switch.module.css';

/**
 * Accessible animated toggle switch.
 *
 * Props:
 *  - checked:  boolean
 *  - onChange: (next: boolean) => void
 *  - label:    optional inline label
 *  - sub:      optional secondary text (description)
 *  - size:     'sm' | 'md' (default 'md')
 *  - disabled: boolean
 *  - id:       optional id for the input (auto-generated otherwise)
 */
export default function Switch({
  checked,
  onChange,
  label,
  sub,
  size = 'md',
  disabled = false,
  id,
}) {
  const inputId = id ?? `sw-${Math.random().toString(36).slice(2, 9)}`;
  const handle = () => { if (!disabled) onChange(!checked); };

  const ui = (
    <button
      type="button"
      id={inputId}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      onClick={handle}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handle(); }
      }}
      className={[
        styles.track,
        styles['size_' + size],
        checked  ? styles.trackOn  : '',
        disabled ? styles.trackDisabled : '',
      ].join(' ')}
    >
      <span className={[styles.thumb, checked ? styles.thumbOn : ''].join(' ')} />
    </button>
  );

  if (!label && !sub) return ui;

  return (
    <label htmlFor={inputId} className={[styles.row, disabled ? styles.rowDisabled : ''].join(' ')}>
      <div className={styles.labelWrap}>
        {label && <span className={styles.label}>{label}</span>}
        {sub   && <span className={styles.sub}>{sub}</span>}
      </div>
      {ui}
    </label>
  );
}
