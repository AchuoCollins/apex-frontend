import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMetrics } from '../hooks/useMetrics';
import {
  FITNESS_GOALS,
  EXPERIENCE_LEVELS,
  TRAINING_REASONS,
  GENDERS,
} from '../context/MetricsContext';
import { analyzePhysique } from '../utils/physiqueRatios';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user }                                = useAuth();
  const { metrics, hasMetrics, hasAdvanced, savedAt } = useMetrics();

  const analysis = hasAdvanced ? analyzePhysique(metrics) : null;
  const greeting = getGreeting();

  const goal       = FITNESS_GOALS.find(g => g.value === metrics.goal);
  const experience = EXPERIENCE_LEVELS.find(l => l.value === metrics.experienceLevel);
  const reason     = TRAINING_REASONS.find(r => r.value === metrics.trainingReason);
  const gender     = GENDERS.find(g => g.value === metrics.gender);

  const focusAreas    = metrics.focusAreas ?? [];
  const eventCountdown = metrics.trainingReason === 'upcoming-event' && metrics.eventDate
    ? daysUntil(metrics.eventDate)
    : null;

  return (
    <div className={styles.page}>

      {/* ── Greeting ── */}
      <div className={styles.greeting}>
        <div>
          <p className={styles.greetSub}>{greeting}</p>
          <h2 className={styles.greetName}>{user?.name ?? 'Athlete'}</h2>
        </div>
        {savedAt && (
          <span className={styles.lastUpdated}>
            <ClockIcon /> Last updated {formatDate(savedAt)}
          </span>
        )}
      </div>

      {/* ── No metrics CTA ── */}
      {!hasMetrics && (
        <div className={styles.setupBanner}>
          <div className={styles.setupGlow} aria-hidden />
          <div className={styles.setupLeft}>
            <span className={styles.setupBadge}>Get Started</span>
            <h3 className={styles.setupTitle}>Complete your profile to unlock your training plan</h3>
            <p className={styles.setupDesc}>
              Tell us a little about yourself — gender, goal, experience and focus areas — and
              our AI will generate a personalised training plan for you.
            </p>
          </div>
          <div className={styles.setupActions}>
            <Link to="/metrics" className={styles.setupCta}>
              Complete Profile <ArrowIcon />
            </Link>
          </div>
        </div>
      )}

      {/* ── Profile snapshot cards (always shown when there's any data) ── */}
      {hasMetrics && (
        <div className={styles.profileCards}>
          <div className={styles.profileCard}>
            <span className={styles.profileCardLabel}>Goal</span>
            {goal ? (
              <>
                <span className={styles.profileCardValue}>
                  <span className={styles.profileCardIcon}>{goal.icon}</span>
                  {goal.label}
                </span>
                <span className={styles.profileCardSub}>{goal.desc}</span>
              </>
            ) : (
              <Link to="/metrics" className={styles.profileCardEmpty}>Set your goal →</Link>
            )}
          </div>

          <div className={styles.profileCard}>
            <span className={styles.profileCardLabel}>Focus Areas</span>
            {focusAreas.length > 0 ? (
              <>
                <span className={styles.profileCardValue}>{focusAreas.length} selected</span>
                <div className={styles.tagRow}>
                  {focusAreas.slice(0, 5).map(a => <span key={a} className={styles.tag}>{a}</span>)}
                  {focusAreas.length > 5 && <span className={styles.tagMore}>+{focusAreas.length - 5}</span>}
                </div>
              </>
            ) : (
              <Link to="/metrics" className={styles.profileCardEmpty}>Pick focus areas →</Link>
            )}
          </div>

          <div className={styles.profileCard}>
            <span className={styles.profileCardLabel}>Training Reason</span>
            {reason ? (
              <>
                <span className={styles.profileCardValue}>
                  <span className={styles.profileCardIcon}>{reason.icon}</span>
                  {reason.label}
                </span>
                {experience && <span className={styles.profileCardSub}>{experience.label} level</span>}
              </>
            ) : (
              <Link to="/metrics" className={styles.profileCardEmpty}>Set training reason →</Link>
            )}
          </div>

          {/* Countdown card — only if event reason */}
          {metrics.trainingReason === 'upcoming-event' ? (
            <div className={[styles.profileCard, styles.profileCardAccent].join(' ')}>
              <span className={styles.profileCardLabel}>Upcoming Event</span>
              {eventCountdown != null ? (
                <>
                  <span className={styles.profileCardValue}>
                    <span className={styles.countdownNum}>{Math.max(eventCountdown, 0)}</span>
                    <span className={styles.countdownUnit}>days</span>
                  </span>
                  <span className={styles.profileCardSub}>
                    {metrics.eventName || 'Your event'}{metrics.eventType ? ` · ${metrics.eventType}` : ''}
                  </span>
                </>
              ) : (
                <Link to="/profile" className={styles.profileCardEmpty}>Add event date →</Link>
              )}
            </div>
          ) : (
            <div className={styles.profileCard}>
              <span className={styles.profileCardLabel}>Your Stats</span>
              <span className={styles.profileCardValue}>
                {metrics.height ? `${metrics.height}cm` : '—'}
                <span className={styles.statDivider}>·</span>
                {metrics.weight ? `${metrics.weight}kg` : '—'}
              </span>
              <span className={styles.profileCardSub}>
                {gender ? `${gender.label}` : ''}{metrics.age ? ` · ${metrics.age} yrs` : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Score + KPI row (only when advanced measurements exist) ── */}
      {analysis && (
        <>
          <div className={styles.kpiRow}>
            <div className={styles.scoreCard}>
              <div className={styles.scoreRingWrap}>
                <svg viewBox="0 0 100 100" className={styles.ringsvg}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-border)" strokeWidth="8"/>
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={scoreColor(analysis.score)}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray="251.3"
                    strokeDashoffset={251.3 - (251.3 * analysis.score / 100)}
                    transform="rotate(-90 50 50)"
                    style={{transition:'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)'}}
                  />
                </svg>
                <div className={styles.ringCenter}>
                  <span className={styles.ringScore}>{analysis.score}</span>
                  <span className={styles.ringLabel}>/ 100</span>
                </div>
              </div>
              <div className={styles.scoreInfo}>
                <p className={styles.scoreTitle}>Physique Score</p>
                <p className={styles.scoreDesc}>
                  {analysis.score >= 90 ? 'Elite — near-optimal proportions across all ratios.' :
                   analysis.score >= 75 ? 'Advanced — a few ratios need targeted work.' :
                   analysis.score >= 55 ? 'Developing — clear opportunities for improvement.' :
                                          'Foundation — significant room to grow.'}
                </p>
                <Link to="/analysis" className={styles.scoreLink}>
                  View full analysis <ArrowIcon />
                </Link>
              </div>
            </div>

            <div className={styles.kpiGrid}>
              <KpiCard label="Ratios Analysed"  value={analysis.ratios.length}    unit=""   icon={<ScanIcon />} />
              <KpiCard label="Lagging Groups"   value={analysis.lagging.length}   unit=""   icon={<AlertTriIcon />} status={analysis.lagging.length > 0 ? 'danger' : 'success'} />
              <KpiCard label="Optimal Ratios"   value={analysis.ratios.filter(r=>r.status==='optimal').length} unit="" icon={<CheckCircIcon />} status="success" />
              <KpiCard label="Measurements"     value={Object.values(metrics).filter(v => v && !Array.isArray(v)).length} unit="" icon={<RulerIcon />} />
            </div>
          </div>

          {/* Ratio breakdown */}
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <h3 className={styles.sectionTitle}>Ratio Breakdown</h3>
              <Link to="/analysis" className={styles.sectionLink}>See full analysis →</Link>
            </div>
            <div className={styles.ratioGrid}>
              {analysis.ratios.map(r => (
                <div key={r.name} className={[styles.ratioCard, styles[r.status]].join(' ')}>
                  <div className={styles.ratioTop}>
                    <span className={styles.ratioName}>{r.name}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className={styles.ratioValues}>
                    <span className={styles.ratioCurrent}>{r.current.toFixed(2)}</span>
                    <span className={styles.ratioSep}>/</span>
                    <span className={styles.ratioTarget}>{r.target.toFixed(2)} target</span>
                  </div>
                  <div className={styles.ratioTrack}>
                    <div
                      className={[styles.ratioFill, styles['fill_'+r.status]].join(' ')}
                      style={{ width: Math.min(r.pct, 100) + '%' }}
                    />
                  </div>
                  <span className={styles.ratioPct}>{r.pct}% of target</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lagging + quick actions */}
          <div className={styles.bottomGrid}>
            <div className={styles.lagSection}>
              <div className={styles.sectionHead}>
                <h3 className={styles.sectionTitle}>Priority Muscle Groups</h3>
                <Link to="/training" className={styles.sectionLink}>View plan →</Link>
              </div>
              {analysis.lagging.length === 0 ? (
                <div className={styles.allGood}>
                  <CheckCircIcon /> All ratios are at or near target — exceptional balance!
                </div>
              ) : (
                <div className={styles.lagList}>
                  {analysis.lagging.map((r, i) => (
                    <div key={r.name} className={styles.lagItem}>
                      <span className={styles.lagRank}>#{i + 1}</span>
                      <div className={styles.lagInfo}>
                        <span className={styles.lagMuscle}>{r.musclePrimary}</span>
                        <span className={styles.lagRatio}>{r.name}</span>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.quickActions}>
              <h3 className={styles.sectionTitle}>Quick Actions</h3>
              <div className={styles.actionList}>
                {QUICK_ACTIONS.map(a => (
                  <Link key={a.to} to={a.to} className={styles.actionItem}>
                    <span className={styles.actionIcon}>{a.icon}</span>
                    <div className={styles.actionText}>
                      <span className={styles.actionLabel}>{a.label}</span>
                      <span className={styles.actionDesc}>{a.desc}</span>
                    </div>
                    <ArrowIcon />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Advanced unlock prompt — has required, missing measurements */}
      {hasMetrics && !analysis && (
        <div className={styles.unlockCard}>
          <div>
            <p className={styles.unlockLabel}>🔓 Unlock Physique Analysis</p>
            <p className={styles.unlockBody}>
              Add your circumference measurements in the Advanced Physique Assessment to unlock
              your physique score, ratio breakdown, and lagging-group analysis.
            </p>
          </div>
          <Link to="/metrics" className={styles.unlockBtn}>
            Add Measurements <ArrowIcon />
          </Link>
        </div>
      )}

      {/* Quick actions when no advanced metrics */}
      {(!analysis) && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Quick Actions</h3>
          <div className={styles.actionListWide}>
            {QUICK_ACTIONS.map(a => (
              <Link key={a.to} to={a.to} className={styles.actionItemWide}>
                <span className={styles.actionIcon}>{a.icon}</span>
                <div className={styles.actionText}>
                  <span className={styles.actionLabel}>{a.label}</span>
                  <span className={styles.actionDesc}>{a.desc}</span>
                </div>
                <ArrowIcon />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */
function KpiCard({ label, value, unit, icon, status }) {
  return (
    <div className={[styles.kpiCard, status ? styles['kpi_' + status] : ''].join(' ')}>
      <div className={styles.kpiIcon}>{icon}</div>
      <div className={styles.kpiVal}>{value}{unit}</div>
      <div className={styles.kpiLabel}>{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { optimal:'success', developing:'warning', lagging:'danger', overdeveloped:'accent' };
  return <span className={[styles.badge, styles['badge_' + (map[status] ?? 'default')]].join(' ')}>{status}</span>;
}

/* ── Helpers ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}
function scoreColor(s) {
  if (s >= 85) return 'var(--color-success)';
  if (s >= 65) return 'var(--color-warning)';
  return 'var(--color-danger)';
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today  = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr); target.setHours(0,0,0,0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

const QUICK_ACTIONS = [
  { to:'/metrics',  icon:<RulerIcon />,   label:'Update Profile',      desc:'Refresh your stats and focus areas' },
  { to:'/analysis', icon:<ScanIcon />,    label:'Physique Analysis',   desc:'View your ratio scores and lag points' },
  { to:'/training', icon:<DumbellIcon />, label:'Training Plan',       desc:'See your personalised workout program' },
  { to:'/profile',  icon:<UserIcon />,    label:'Edit Profile',        desc:'Update your goals and personal info' },
];

/* ── Icons ── */
function ArrowIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}
function ClockIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function ScanIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>;
}
function RulerIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/></svg>;
}
function DumbellIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 5v14"/><path d="M18 5v14"/><path d="M2 9h4"/><path d="M2 15h4"/><path d="M18 9h4"/><path d="M18 15h4"/><line x1="6" y1="12" x2="18" y2="12"/></svg>;
}
function UserIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
}
function AlertTriIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function CheckCircIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
