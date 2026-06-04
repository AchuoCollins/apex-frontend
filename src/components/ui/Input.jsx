import styles from './Input.module.css';

export default function Input({
  label,
  hint,
  error,
  id,
  prefix,
  suffix,
  className = '',
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={[styles.wrapper, className].join(' ')}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      <div className={[styles.inputRow, error ? styles.hasError : ''].join(' ')}>
        {prefix && <span className={styles.affix}>{prefix}</span>}
        <input id={inputId} className={styles.input} {...props} />
        {suffix && <span className={styles.affix}>{suffix}</span>}
      </div>
      {error  && <span className={styles.error}>{error}</span>}
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
