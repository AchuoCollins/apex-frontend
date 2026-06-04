import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMetrics } from '../hooks/useMetrics';
import {
  GENDERS,
  FITNESS_GOALS,
  EXPERIENCE_LEVELS,
  TRAINING_REASONS,
} from '../context/MetricsContext';
import FocusAreaSelector from '../components/shared/FocusAreaSelector';
import { analyzePhysique } from '../utils/physiqueRatios';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { metrics, hasMetrics, hasAdvanced, savedAt, saveMetrics, clearMetrics } = useMetrics();

  const analysis = hasAdvanced ? analyzePhysique(metrics) : null;

  /* Form state mixes user fields (name/email/units) and metric fields (goal, focusAreas, etc.) */
  const [form, setForm] = useState({
    name:  user?.name  ?? '',
    email: user?.email ?? '',
    units: user?.units ?? 'metric',

    gender:          metrics.gender          ?? '',
    age:             metrics.age             ?? '',
    height:          metrics.height          ?? '',
    weight:          metrics.weight          ?? '',
    goal:            metrics.goal            ?? '',
    experienceLevel: metrics.experienceLevel ?? '',
    focusAreas:      metrics.focusAreas      ?? [],
    trainingReason:  metrics.trainingReason  ?? '',
    eventName:       metrics.eventName       ?? '',
    eventType:       metrics.eventType       ?? '',
    eventDate:       metrics.eventDate       ?? '',
  });
  const [saved,            setSaved]            = useState(false);
  const [section,          setSection]          = useState('personal');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const set    = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setSaved(false); };
  const setVal = (k, v)   => { setForm(p => ({ ...p, [k]: v })); setSaved(false); };

  const handleSave = () => {
    /* Split: user account fields vs metric/training fields */
    const { name, email, units, ...metricUpdates } = form;
    updateUser({ name, email, units, ...metricUpdates });
    saveMetrics(metricUpdates);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearData = () => {
    clearMetrics();
    setShowClearConfirm(false);
  };

  const initials = (user?.name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const goalMeta   = FITNESS_GOALS.find(g => g.value === form.goal);
  const reasonMeta = TRAINING_REASONS.find(r => r.value === form.trainingReason);

  return (
    <div className={styles.page}>

      {/* ── Profile hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.heroInfo}>
            <h2 className={styles.heroName}>{user?.name ?? 'Athlete'}</h2>
            <p className={styles.heroEmail}>{user?.email ?? ''}</p>
            <div className={styles.heroBadges}>
              {goalMeta && (
                <span className={styles.heroBadge}>
                  {goalMeta.icon} {goalMeta.label}
                </span>
              )}
              {reasonMeta && (
                <span className={styles.heroBadge}>
                  {reasonMeta.icon} {reasonMeta.label}
                </span>
              )}
              {analysis && (
                <span className={[styles.heroBadge, styles.scoreBadge].join(' ')}>
                  🎯 Score: {analysis.score} / 100
                </span>
              )}
              {form.focusAreas.length > 0 && (
                <span className={[styles.heroBadge, styles.metricsBadge].join(' ')}>
                  🎯 {form.focusAreas.length} focus area{form.focusAreas.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.heroActions}>
          {saved && <span className={styles.savedPill}>✓ Changes saved</span>}
          <button className={styles.btnAccent} onClick={handleSave}>Save Changes</button>
        </div>
      </div>

      {/* ── Nav + Content ── */}
      <div className={styles.layout}>

        {/* Sidebar nav */}
        <nav className={styles.sideNav}>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={[styles.navItem, section === s.id ? styles.navActive : ''].join(' ')}
              onClick={() => setSection(s.id)}
            >
              <span className={styles.navIcon}>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className={styles.content}>

          {/* ── Personal Info ── */}
          {section === 'personal' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Personal Information</h3>
                <p className={styles.cardSub}>Your basic profile details</p>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.fieldGrid}>
                  <Field label="Full Name" id="name">
                    <input className={styles.input} type="text" value={form.name} onChange={set('name')} placeholder="John Doe" />
                  </Field>
                  <Field label="Email Address" id="email">
                    <input className={styles.input} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                  </Field>
                </div>

                <Field label="Gender">
                  <div className={styles.optionRow4}>
                    {GENDERS.map(g => (
                      <button
                        type="button"
                        key={g.value}
                        className={[styles.miniCard, form.gender === g.value ? styles.miniCardSelected : ''].join(' ')}
                        onClick={() => setVal('gender', g.value)}
                      >
                        <span className={styles.miniCardIcon}>{g.icon}</span>
                        <span className={styles.miniCardLabel}>{g.label}</span>
                      </button>
                    ))}
                  </div>
                </Field>

                <div className={styles.fieldGrid}>
                  <Field label="Age" id="age">
                    <div className={styles.inputRow}>
                      <input className={styles.input} type="number" value={form.age} onChange={set('age')} placeholder="25" min="16" max="80" />
                      <span className={styles.unit}>yrs</span>
                    </div>
                  </Field>
                  <Field label="Height" id="height">
                    <div className={styles.inputRow}>
                      <input className={styles.input} type="number" value={form.height} onChange={set('height')} placeholder="178" />
                      <span className={styles.unit}>cm</span>
                    </div>
                  </Field>
                  <Field label="Body Weight" id="weight">
                    <div className={styles.inputRow}>
                      <input className={styles.input} type="number" value={form.weight} onChange={set('weight')} placeholder="80" />
                      <span className={styles.unit}>kg</span>
                    </div>
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── Goal & Experience ── */}
          {section === 'goal' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Goal & Experience</h3>
                <p className={styles.cardSub}>Shape how your plan is structured</p>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.fieldBlock}>
                  <label className={styles.fieldLabel}>Fitness Goal</label>
                  <div className={styles.goalGrid}>
                    {FITNESS_GOALS.map(g => (
                      <button
                        type="button"
                        key={g.value}
                        className={[styles.goalCard, form.goal === g.value ? styles.goalSelected : ''].join(' ')}
                        onClick={() => setVal('goal', g.value)}
                      >
                        <span className={styles.goalIcon}>{g.icon}</span>
                        <span className={styles.goalLabel}>{g.label}</span>
                        <span className={styles.goalDesc}>{g.desc}</span>
                        {form.goal === g.value && <span className={styles.goalCheck}>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.fieldBlock}>
                  <label className={styles.fieldLabel}>Experience Level</label>
                  <div className={styles.experienceRow}>
                    {EXPERIENCE_LEVELS.map(l => (
                      <button
                        type="button"
                        key={l.value}
                        className={[styles.experienceCard, form.experienceLevel === l.value ? styles.experienceSelected : ''].join(' ')}
                        onClick={() => setVal('experienceLevel', l.value)}
                      >
                        <span className={styles.experienceLabel}>{l.label}</span>
                        <span className={styles.experienceDesc}>{l.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.fieldBlock}>
                  <label className={styles.fieldLabel}>Unit System</label>
                  <div className={styles.unitToggle}>
                    <button
                      className={[styles.unitBtn, form.units === 'metric' ? styles.unitActive : ''].join(' ')}
                      onClick={() => setVal('units', 'metric')}
                    >
                      Metric (cm / kg)
                    </button>
                    <button
                      className={[styles.unitBtn, form.units === 'imperial' ? styles.unitActive : ''].join(' ')}
                      onClick={() => setVal('units', 'imperial')}
                    >
                      Imperial (in / lbs)
                    </button>
                  </div>
                  <p className={styles.fieldHint}>All measurements are currently stored in metric.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Focus Areas ── */}
          {section === 'focus' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Focus Areas</h3>
                <p className={styles.cardSub}>Pick the muscle groups you want extra volume on</p>
              </div>
              <div className={styles.cardBody}>
                <FocusAreaSelector
                  value={form.focusAreas}
                  onChange={(v) => setVal('focusAreas', v)}
                />
                <p className={styles.fieldHint}>
                  {form.focusAreas.length === 0
                    ? 'No focus areas selected — your plan will be balanced across all muscle groups.'
                    : `${form.focusAreas.length} selected: ${form.focusAreas.join(', ')}`}
                </p>
              </div>
            </div>
          )}

          {/* ── Training Reason & Event ── */}
          {section === 'reason' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Training Reason</h3>
                <p className={styles.cardSub}>Why are you training? Helps tailor your recommendations</p>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.reasonGrid}>
                  {TRAINING_REASONS.map(r => (
                    <button
                      type="button"
                      key={r.value}
                      className={[styles.miniCard, form.trainingReason === r.value ? styles.miniCardSelected : ''].join(' ')}
                      onClick={() => setVal('trainingReason', r.value)}
                    >
                      <span className={styles.miniCardIcon}>{r.icon}</span>
                      <span className={styles.miniCardLabel}>{r.label}</span>
                    </button>
                  ))}
                </div>

                {form.trainingReason === 'upcoming-event' && (
                  <div className={styles.eventCard}>
                    <p className={styles.eventCardTitle}>📅 Event Details</p>
                    <div className={styles.fieldGrid}>
                      <Field label="Event Name" id="eventName">
                        <input className={styles.input} type="text" value={form.eventName} onChange={set('eventName')} placeholder="Summer Beach Trip" />
                      </Field>
                      <Field label="Event Type" id="eventType">
                        <input className={styles.input} type="text" value={form.eventType} onChange={set('eventType')} placeholder="Wedding, competition…" />
                      </Field>
                    </div>
                    <Field label="Event Date" id="eventDate">
                      <input className={styles.input} type="date" value={form.eventDate} onChange={set('eventDate')} />
                    </Field>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Data & Privacy ── */}
          {section === 'data' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Data & Privacy</h3>
                <p className={styles.cardSub}>Manage your stored data and account info</p>
              </div>
              <div className={styles.cardBody}>

                <div className={styles.dataBlock}>
                  <div className={styles.dataBlockHeader}>
                    <div>
                      <p className={styles.dataBlockTitle}>Profile Data</p>
                      <p className={styles.dataBlockSub}>
                        {hasMetrics
                          ? `Profile saved · Last updated ${savedAt ? new Date(savedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : 'unknown'}`
                          : 'No profile data stored yet'
                        }
                      </p>
                    </div>
                    {hasMetrics && !showClearConfirm && (
                      <button className={styles.btnDanger} onClick={() => setShowClearConfirm(true)}>
                        Clear All Data
                      </button>
                    )}
                  </div>

                  {showClearConfirm && (
                    <div className={styles.confirmBox}>
                      <p className={styles.confirmText}>
                        ⚠️ This will permanently delete all your stored profile, measurements, and event data. This cannot be undone.
                      </p>
                      <div className={styles.confirmActions}>
                        <button className={styles.btnSecondary} onClick={() => setShowClearConfirm(false)}>Cancel</button>
                        <button className={styles.btnDanger} onClick={handleClearData}>Yes, clear all data</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.dataInfo}>
                  <InfoIcon />
                  <p>Your data is stored locally in your browser. It is never shared with third parties. Clearing browser storage or cookies will remove your saved data.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Account ── */}
          {section === 'account' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Account</h3>
                <p className={styles.cardSub}>Session and security settings</p>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.accountRow}>
                  <div>
                    <p className={styles.accountRowTitle}>Change Password</p>
                    <p className={styles.accountRowSub}>Update your login credentials</p>
                  </div>
                  <button className={styles.btnSecondary}>Change Password</button>
                </div>
                <div className={styles.accountDivider} />
                <div className={styles.accountRow}>
                  <div>
                    <p className={styles.accountRowTitle}>Sign Out</p>
                    <p className={styles.accountRowSub}>End your current session on this device</p>
                  </div>
                  <button className={styles.btnSecondary} onClick={logout}>Sign Out</button>
                </div>
                <div className={styles.accountDivider} />
                <div className={styles.dangerZone}>
                  <p className={styles.dangerZoneTitle}>⚠️ Danger Zone</p>
                  <div className={styles.accountRow} style={{ marginTop: 0 }}>
                    <div>
                      <p className={styles.accountRowTitle}>Delete Account</p>
                      <p className={styles.accountRowSub}>Permanently remove your account and all associated data</p>
                    </div>
                    <button className={styles.btnDanger}>Delete Account</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save bar */}
          <div className={styles.saveBar}>
            {saved && <span className={styles.savedPill}>✓ Changes saved</span>}
            <button className={styles.btnAccent} onClick={handleSave}>Save Changes</button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */
function Field({ label, id, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

/* ── Constants ── */
const SECTIONS = [
  { id: 'personal', label: 'Personal Info',  icon: '👤' },
  { id: 'goal',     label: 'Goal & Level',   icon: '🎯' },
  { id: 'focus',    label: 'Focus Areas',    icon: '💪' },
  { id: 'reason',   label: 'Reason / Event', icon: '📅' },
  { id: 'data',     label: 'Data & Privacy', icon: '🔒' },
  { id: 'account',  label: 'Account',        icon: '🔑' },
];

/* ── Icons ── */
function InfoIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,color:'var(--color-text-muted)'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
