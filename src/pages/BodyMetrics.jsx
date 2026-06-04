import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMetrics } from '../hooks/useMetrics';
import {
  GENDERS,
  FITNESS_GOALS,
  EXPERIENCE_LEVELS,
} from '../context/MetricsContext';
import FocusAreaSelector from '../components/shared/FocusAreaSelector';
import styles from './BodyMetrics.module.css';

/* Sections + the fields they own (drives the side-nav, validation, completion bar) */
const SECTIONS = [
  {
    id: 'basics',
    title: 'Basic Stats',
    subtitle: 'Required — used to personalise your plan',
    type: 'basics',
    fields: ['gender', 'age', 'height', 'weight'],
  },
  {
    id: 'goal',
    title: 'Goal & Experience',
    subtitle: 'Required — shapes plan structure and intensity',
    type: 'goal',
    fields: ['goal', 'experienceLevel'],
  },
  {
    id: 'focus',
    title: 'Focus Areas',
    subtitle: 'Select the muscle groups you want to prioritise',
    type: 'focus',
    fields: ['focusAreas'],
  },
  {
    id: 'advanced',
    title: 'Advanced Physique Assessment',
    subtitle: 'Optional — circumference measurements in centimetres',
    type: 'measurements',
    optional: true,
    fields: [
      { key: 'chest',    label: 'Chest',     unit: 'cm', placeholder: '100', hint: 'Around the nipple line, arms relaxed' },
      { key: 'waist',    label: 'Waist',     unit: 'cm', placeholder: '78',  hint: 'Narrowest point, typically above navel' },
      { key: 'shoulder', label: 'Shoulders', unit: 'cm', placeholder: '120', hint: 'Around the widest point of the deltoids' },
      { key: 'upperArm', label: 'Arms',      unit: 'cm', placeholder: '38',  hint: 'Peak of the bicep, flexed' },
      { key: 'forearm',  label: 'Forearms',  unit: 'cm', placeholder: '30',  hint: 'Widest point of the forearm' },
      { key: 'neck',     label: 'Neck',      unit: 'cm', placeholder: '38',  hint: 'Mid-neck, below the larynx' },
      { key: 'thigh',    label: 'Thighs',    unit: 'cm', placeholder: '58',  hint: 'Upper thigh, below the glute fold' },
      { key: 'calf',     label: 'Calves',    unit: 'cm', placeholder: '36',  hint: 'Widest point of the calf, standing' },
      { key: 'bodyFat',  label: 'Body Fat %',unit: '%',  placeholder: '15',  hint: 'Estimated body fat percentage', min: 3, max: 60 },
    ],
  },
];

export default function BodyMetrics() {
  const { metrics, saveMetrics, savedAt } = useMetrics();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ ...metrics });
  const [saved,   setSaved]   = useState(false);
  const [errors,  setErrors]  = useState({});
  const [activeSection, setActiveSection] = useState('basics');

  const setField = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });
    setSaved(false);
  };
  const setInput = (key) => (e) => setField(key, e.target.value);

  const validate = () => {
    const errs = {};
    if (!form.gender)           errs.gender = 'Required';
    if (!form.age)              errs.age = 'Required';
    if (!form.height)           errs.height = 'Required';
    if (!form.weight)           errs.weight = 'Required';
    if (!form.goal)             errs.goal = 'Required';
    if (!form.experienceLevel)  errs.experienceLevel = 'Required';

    /* Range checks on advanced measurements */
    SECTIONS.find(s => s.id === 'advanced').fields.forEach(f => {
      const val = parseFloat(form[f.key]);
      if (form[f.key] !== '' && form[f.key] != null) {
        if (isNaN(val)) errs[f.key] = 'Invalid number';
        else if (f.min != null && (val < f.min || val > f.max)) errs[f.key] = `Must be ${f.min}–${f.max}`;
      }
    });
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstSection = SECTIONS.find(s =>
        s.fields.some(f => (typeof f === 'string' ? f : f.key) in errs)
      );
      if (firstSection) {
        setActiveSection(firstSection.id);
        document.getElementById('section-' + firstSection.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    saveMetrics(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveAndAnalyse = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    saveMetrics(form);
    navigate('/analysis');
  };

  /* Per-section completion */
  const completionFor = (section) => {
    if (section.type === 'basics') {
      const filled = section.fields.filter(k => form[k]).length;
      return { filled, total: section.fields.length };
    }
    if (section.type === 'goal') {
      const filled = section.fields.filter(k => form[k]).length;
      return { filled, total: section.fields.length };
    }
    if (section.type === 'focus') {
      return { filled: (form.focusAreas?.length ?? 0) > 0 ? 1 : 0, total: 1 };
    }
    if (section.type === 'measurements') {
      const filled = section.fields.filter(f => form[f.key] !== '' && form[f.key] != null).length;
      return { filled, total: section.fields.length };
    }
    return { filled: 0, total: 1 };
  };

  /* Overall progress */
  const totals = SECTIONS.reduce((acc, s) => {
    const c = completionFor(s);
    acc.filled += c.filled; acc.total += c.total;
    return acc;
  }, { filled: 0, total: 0 });
  const progress = Math.round((totals.filled / totals.total) * 100);

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.pageTitle}>Your Metrics</h2>
          <p className={styles.pageSub}>
            Enter your required profile information. Advanced measurements are optional but unlock
            deeper, more accurate AI analysis.
          </p>
        </div>
        <div className={styles.headerActions}>
          {saved && (
            <span className={styles.savedPill}>
              <CheckIcon /> Saved
            </span>
          )}
          <button className={styles.btnSecondary} onClick={handleSave}>
            Save
          </button>
          <button className={styles.btnAccent} onClick={handleSaveAndAnalyse}>
            Save & Analyse <ArrowIcon />
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className={styles.progressWrap}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Profile Completion</span>
          <span className={styles.progressValue}>{totals.filled} / {totals.total} fields — {progress}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: progress + '%' }} />
        </div>
      </div>

      {/* ── Body layout ── */}
      <div className={styles.layout}>

        {/* Sidebar nav */}
        <div className={styles.sideNav}>
          {SECTIONS.map(s => {
            const c = completionFor(s);
            return (
              <button
                key={s.id}
                className={[styles.sideNavItem, activeSection === s.id ? styles.sideNavActive : ''].join(' ')}
                onClick={() => {
                  setActiveSection(s.id);
                  document.getElementById('section-' + s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <div className={styles.sideNavLabel}>
                  <span>{s.title}</span>
                  <span className={[styles.sideNavCount, c.filled === c.total ? styles.sideNavDone : ''].join(' ')}>
                    {c.filled}/{c.total}
                  </span>
                </div>
                <div className={styles.sideNavTrack}>
                  <div className={styles.sideNavFill} style={{ width: (c.filled / c.total * 100) + '%' }} />
                </div>
                {s.optional && <span className={styles.sideNavTag}>Optional</span>}
              </button>
            );
          })}

          {/* Tips card */}
          <div className={styles.tipsCard}>
            <div className={styles.tipsTitle}><InfoIcon /> Measurement Tips</div>
            <ul className={styles.tipsList}>
              <li>Use a flexible tape measure</li>
              <li>Measure in the morning</li>
              <li>Keep the tape parallel to the floor</li>
              <li>Don't suck in or flex (unless noted)</li>
              <li>Measure the same spots each time</li>
            </ul>
          </div>
        </div>

        {/* Form sections */}
        <div className={styles.formArea}>

          {SECTIONS.map(section => (
            <div
              key={section.id}
              id={'section-' + section.id}
              className={styles.formSection}
              onFocus={() => setActiveSection(section.id)}
            >
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>{section.title}</h3>
                  <p className={styles.sectionSub}>{section.subtitle}</p>
                </div>
                {section.optional && <span className={styles.optionalChip}>Optional</span>}
              </div>

              {/* Basics: gender + numeric inputs */}
              {section.type === 'basics' && (
                <div className={styles.sectionBody}>
                  <div className={styles.fieldBlock}>
                    <label className={styles.fieldLabel}>Gender {errors.gender && <span className={styles.requiredHint}>· {errors.gender}</span>}</label>
                    <div className={styles.optionGrid4}>
                      {GENDERS.map(g => (
                        <button
                          type="button"
                          key={g.value}
                          className={[styles.optionCard, form.gender === g.value ? styles.optionSelected : ''].join(' ')}
                          onClick={() => setField('gender', g.value)}
                        >
                          <span className={styles.optionIcon}>{g.icon}</span>
                          <span className={styles.optionLabel}>{g.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.fieldGrid3}>
                    {[
                      { key: 'age',    label: 'Age',    unit: 'yrs', placeholder: '25', min: 16, max: 80 },
                      { key: 'height', label: 'Height', unit: 'cm',  placeholder: '178', min: 140, max: 230 },
                      { key: 'weight', label: 'Weight', unit: 'kg',  placeholder: '80',  min: 40,  max: 200 },
                    ].map(f => (
                      <div key={f.key} className={styles.fieldWrap}>
                        <label className={styles.fieldLabel} htmlFor={f.key}>{f.label}</label>
                        <div className={[styles.inputRow, errors[f.key] ? styles.inputError : form[f.key] ? styles.inputFilled : ''].join(' ')}>
                          <input
                            id={f.key} type="number" className={styles.input}
                            placeholder={f.placeholder}
                            value={form[f.key] ?? ''} onChange={setInput(f.key)}
                            min={f.min} max={f.max}
                          />
                          <span className={styles.unit}>{f.unit}</span>
                        </div>
                        {errors[f.key] && <span className={styles.fieldError}>{errors[f.key]}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goal & Experience */}
              {section.type === 'goal' && (
                <div className={styles.sectionBody}>
                  <div className={styles.fieldBlock}>
                    <label className={styles.fieldLabel}>Fitness Goal {errors.goal && <span className={styles.requiredHint}>· {errors.goal}</span>}</label>
                    <div className={styles.optionGrid3}>
                      {FITNESS_GOALS.map(g => (
                        <button
                          type="button"
                          key={g.value}
                          className={[styles.optionCard, form.goal === g.value ? styles.optionSelected : ''].join(' ')}
                          onClick={() => setField('goal', g.value)}
                        >
                          <span className={styles.optionIcon}>{g.icon}</span>
                          <span className={styles.optionLabel}>{g.label}</span>
                          <span className={styles.optionDesc}>{g.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.fieldBlock}>
                    <label className={styles.fieldLabel}>Experience Level {errors.experienceLevel && <span className={styles.requiredHint}>· {errors.experienceLevel}</span>}</label>
                    <div className={styles.optionGrid3}>
                      {EXPERIENCE_LEVELS.map(l => (
                        <button
                          type="button"
                          key={l.value}
                          className={[styles.optionCard, form.experienceLevel === l.value ? styles.optionSelected : ''].join(' ')}
                          onClick={() => setField('experienceLevel', l.value)}
                        >
                          <span className={styles.optionLabel}>{l.label}</span>
                          <span className={styles.optionDesc}>{l.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Focus Areas */}
              {section.type === 'focus' && (
                <div className={styles.sectionBody}>
                  <FocusAreaSelector
                    value={form.focusAreas ?? []}
                    onChange={(v) => setField('focusAreas', v)}
                  />
                  <p className={styles.helperText}>
                    {(form.focusAreas?.length ?? 0) === 0
                      ? 'Pick the muscle groups you want extra volume on. Choose "Full Body" for an even, balanced focus.'
                      : `${form.focusAreas.length} selected · ${form.focusAreas.join(', ')}`}
                  </p>
                </div>
              )}

              {/* Advanced Physique Assessment */}
              {section.type === 'measurements' && (
                <div className={styles.sectionBody}>
                  <div className={styles.unlockBanner}>
                    🔓 Advanced assessment unlocks more accurate AI analysis.
                  </div>
                  <div className={styles.fieldGrid3}>
                    {section.fields.map(f => (
                      <div key={f.key} className={styles.fieldWrap}>
                        <label className={styles.fieldLabel} htmlFor={f.key}>{f.label}</label>
                        <div className={[styles.inputRow, errors[f.key] ? styles.inputError : form[f.key] ? styles.inputFilled : ''].join(' ')}>
                          <input
                            id={f.key} type="number" className={styles.input}
                            placeholder={f.placeholder}
                            value={form[f.key] ?? ''} onChange={setInput(f.key)}
                            step="0.1"
                          />
                          <span className={styles.unit}>{f.unit}</span>
                        </div>
                        {errors[f.key]
                          ? <span className={styles.fieldError}>{errors[f.key]}</span>
                          : f.hint && <span className={styles.fieldHint}>{f.hint}</span>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Bottom action bar */}
          <div className={styles.bottomBar}>
            {savedAt && (
              <span className={styles.lastSaved}>
                Last saved {new Date(savedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
              </span>
            )}
            <div className={styles.bottomActions}>
              <button className={styles.btnSecondary} onClick={handleSave}>
                {saved ? <><CheckIcon /> Saved!</> : 'Save Profile'}
              </button>
              <button className={styles.btnAccent} onClick={handleSaveAndAnalyse}>
                Save & Analyse <ArrowIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Icons ── */
function ArrowIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}
function CheckIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function InfoIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
