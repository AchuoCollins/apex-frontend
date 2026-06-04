import { FOCUS_AREAS } from '../../context/MetricsContext';
import styles from './FocusAreaSelector.module.css';

/**
 * Multi-select grid for choosing focus muscle groups.
 * Selecting "Full Body" clears all other selections; selecting a
 * specific area clears "Full Body".
 */
export default function FocusAreaSelector({ value = [], onChange, compact = false }) {
  const toggle = (area) => {
    const exists = value.includes(area);
    let next;
    if (area === 'Full Body') {
      next = exists ? [] : ['Full Body'];
    } else {
      next = exists
        ? value.filter(v => v !== area)
        : [...value.filter(v => v !== 'Full Body'), area];
    }
    onChange(next);
  };

  return (
    <div className={[styles.grid, compact ? styles.compact : ''].join(' ')}>
      {FOCUS_AREAS.map(area => {
        const selected = value.includes(area);
        return (
          <button
            type="button"
            key={area}
            className={[styles.chip, selected ? styles.chipSelected : ''].join(' ')}
            onClick={() => toggle(area)}
            aria-pressed={selected}
          >
            <span className={styles.chipLabel}>{area}</span>
            {selected && <span className={styles.check}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}
