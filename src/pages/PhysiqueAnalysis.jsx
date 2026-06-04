import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMetrics } from '../hooks/useMetrics';
import { analyzePhysique, getStatusVariant, MUSCLE_GROUPS } from '../utils/physiqueRatios';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './PhysiqueAnalysis.module.css';

export default function PhysiqueAnalysis() {
  const { metrics, hasAdvanced } = useMetrics();
  const [activeRatio, setActiveRatio] = useState(null);

  if (!hasAdvanced) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}><ScanIcon /></div>
        <h2 className={styles.emptyTitle}>Advanced measurements required</h2>
        <p className={styles.emptySub}>
          Complete the Advanced Physique Assessment (chest, waist, shoulders…) so we can run your
          ratio analysis and physique score.
        </p>
        <Link to="/metrics" className={styles.emptyBtn}>Add Measurements <ArrowIcon /></Link>
      </div>
    );
  }

  const { ratios, lagging, score } = analyzePhysique(metrics);

  const radarData = ratios.map(r => ({
    subject: r.name.split('-')[0],
    current: Math.min(Math.round(r.pct), 100),
    target: 100,
    fullName: r.name,
  }));

  const scoreColor = score >= 85 ? 'var(--color-success)' : score >= 65 ? 'var(--color-warning)' : 'var(--color-danger)';
  const scoreLabel = score >= 85 ? 'Elite' : score >= 70 ? 'Advanced' : score >= 55 ? 'Developing' : 'Foundation';

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.pageTitle}>Physique Analysis</h2>
          <p className={styles.pageSub}>Your aesthetic ratio scores benchmarked against physiological targets.</p>
        </div>
        <Link to="/training" className={styles.btnAccent}>
          Generate Training Plan <ArrowIcon />
        </Link>
      </div>

      {/* ── Top row: Score + Radar ── */}
      <div className={styles.topRow}>

        {/* Score panel */}
        <div className={styles.scorePanel}>
          <div className={styles.scorePanelTop}>
            <svg viewBox="0 0 140 140" className={styles.bigRing}>
              <circle cx="70" cy="70" r="58" fill="none" stroke="var(--color-border)" strokeWidth="10"/>
              <circle cx="70" cy="70" r="58" fill="none"
                stroke={scoreColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="364.4"
                strokeDashoffset={364.4 - (364.4 * score / 100)}
                transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
              />
            </svg>
            <div className={styles.ringOverlay}>
              <span className={styles.bigScore}>{score}</span>
              <span className={styles.bigScoreLabel}>/ 100</span>
              <span className={styles.scoreTag} style={{ background: scoreColor === 'var(--color-success)' ? 'var(--color-success-subtle)' : scoreColor === 'var(--color-warning)' ? 'var(--color-warning-subtle)' : 'var(--color-danger-subtle)', color: scoreColor }}>
                {scoreLabel}
              </span>
            </div>
          </div>

          <div className={styles.scoreMeta}>
            <div className={styles.scoreMetaRow}>
              <MetaStat label="Ratios Analysed" value={ratios.length} />
              <MetaStat label="Optimal"     value={ratios.filter(r => r.status === 'optimal').length}     color="var(--color-success)" />
              <MetaStat label="Developing"  value={ratios.filter(r => r.status === 'developing').length}  color="var(--color-warning)" />
              <MetaStat label="Lagging"     value={ratios.filter(r => r.status === 'lagging').length}     color="var(--color-danger)" />
            </div>
          </div>

          <div className={styles.scoreInterpret}>
            <p className={styles.interpretText}>
              {score >= 85
                ? 'Near-optimal proportions. Minor refinements will elevate your physique to elite status.'
                : score >= 70
                ? 'Strong foundation with a few clear targets. Focused training on lagging groups will have significant impact.'
                : score >= 55
                ? 'Solid base with meaningful imbalances. Addressing the priority groups will produce the most visual change.'
                : 'Early stage physique development. Consistent training across all groups will yield rapid progress.'}
            </p>
          </div>
        </div>

        {/* Radar chart */}
        <div className={styles.radarPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Ratio Overview</h3>
            <span className={styles.panelHint}>Current vs. target across all ratios</span>
          </div>
          <div className={styles.radarWrap}>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontFamily: 'Barlow', fontWeight: 600 }}
                />
                <Radar name="Target" dataKey="target" stroke="var(--color-border-strong)" fill="transparent" strokeWidth={1} strokeDasharray="4 3" />
                <Radar name="Current" dataKey="current" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.12} strokeWidth={2} dot={{ fill: 'var(--color-accent)', r: 4 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 8, fontFamily: 'DM Mono', fontSize: 12 }}
                  labelStyle={{ color: 'var(--color-text-primary)', fontFamily: 'Barlow', fontWeight: 700 }}
                  itemStyle={{ color: 'var(--color-text-secondary)' }}
                  formatter={(val, name) => [`${val}%`, name]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.radarLegend}>
            <span className={styles.legendItem}><span className={styles.legendDash} />Target (100%)</span>
            <span className={styles.legendItem}><span className={styles.legendDot} />Your current score</span>
          </div>
        </div>
      </div>

      {/* ── Ratio cards ── */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>Ratio Deep Dive</h3>
          <p className={styles.sectionSub}>Click any ratio to see its full breakdown</p>
        </div>
        <div className={styles.ratioGrid}>
          {ratios.map(r => (
            <div
              key={r.name}
              className={[styles.ratioCard, styles[r.status], activeRatio === r.name ? styles.ratioCardActive : ''].join(' ')}
              onClick={() => setActiveRatio(activeRatio === r.name ? null : r.name)}
            >
              <div className={styles.ratioCardTop}>
                <div>
                  <p className={styles.ratioCardName}>{r.name}</p>
                  <p className={styles.ratioCardMuscle}>{r.musclePrimary}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className={styles.ratioNumbers}>
                <div className={styles.ratioNum}>
                  <span className={styles.ratioNumVal}>{r.current.toFixed(3)}</span>
                  <span className={styles.ratioNumLabel}>Current</span>
                </div>
                <div className={styles.ratioArrow}>→</div>
                <div className={styles.ratioNum}>
                  <span className={styles.ratioNumVal} style={{ color: 'var(--color-text-muted)' }}>{r.target.toFixed(3)}</span>
                  <span className={styles.ratioNumLabel}>Target</span>
                </div>
              </div>

              <div className={styles.ratioBarWrap}>
                <div className={styles.ratioBar}>
                  <div
                    className={[styles.ratioBarFill, styles['fill_' + r.status]].join(' ')}
                    style={{ width: Math.min(r.pct, 100) + '%' }}
                  />
                  {/* Target marker at 100% */}
                  <div className={styles.targetMarker} />
                </div>
                <div className={styles.ratioBarLabels}>
                  <span>{r.pct}% of target</span>
                  {r.diff < 0
                    ? <span className={styles.diffNeg}>Need +{Math.abs(r.diff).toFixed(3)}</span>
                    : <span className={styles.diffPos}>+{r.diff.toFixed(3)} over target</span>
                  }
                </div>
              </div>

              {/* Expanded detail */}
              {activeRatio === r.name && (
                <div className={styles.ratioExpanded}>
                  <div className={styles.expandDivider} />
                  <div className={styles.expandGrid}>
                    <div className={styles.expandItem}>
                      <span className={styles.expandLabel}>Primary Muscle</span>
                      <span className={styles.expandVal}>{r.musclePrimary}</span>
                    </div>
                    <div className={styles.expandItem}>
                      <span className={styles.expandLabel}>Gap to Close</span>
                      <span className={styles.expandVal} style={{ color: r.diff < 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {r.diff < 0 ? `${Math.abs(r.diff).toFixed(3)} below` : `${r.diff.toFixed(3)} above`}
                      </span>
                    </div>
                    <div className={styles.expandItem}>
                      <span className={styles.expandLabel}>Status</span>
                      <span className={styles.expandVal}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
                    </div>
                    <div className={styles.expandItem}>
                      <span className={styles.expandLabel}>Priority</span>
                      <span className={styles.expandVal}>
                        {r.status === 'lagging' ? '🔴 High' : r.status === 'developing' ? '🟡 Medium' : '🟢 Low'}
                      </span>
                    </div>
                  </div>
                  <p className={styles.expandAdvice}>
                    {r.status === 'lagging'
                      ? `Your ${r.musclePrimary} are significantly underdeveloped relative to your other muscle groups. Prioritise direct volume for this group in your training plan.`
                      : r.status === 'developing'
                      ? `Your ${r.musclePrimary} are on track but need more dedicated volume to reach the aesthetic target.`
                      : r.status === 'optimal'
                      ? `Your ${r.musclePrimary} are at the ideal proportion. Maintain current volume and focus on lagging areas.`
                      : `Your ${r.musclePrimary} are overdeveloped relative to this ratio. Reduce direct volume and redirect effort to lagging groups.`
                    }
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Lag priority list ── */}
      {lagging.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>Priority Action Plan</h3>
            <p className={styles.sectionSub}>Groups to target first for maximum visual impact</p>
          </div>
          <div className={styles.priorityList}>
            {lagging.map((r, i) => (
              <div key={r.name} className={[styles.priorityItem, styles[r.status + 'Border']].join(' ')}>
                <div className={styles.priorityRank}>
                  <span className={styles.rankNum}>#{i + 1}</span>
                  <span className={styles.rankLabel}>Priority</span>
                </div>
                <div className={styles.priorityInfo}>
                  <div className={styles.priorityTop}>
                    <span className={styles.priorityMuscle}>{r.musclePrimary}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <span className={styles.priorityRatio}>{r.name} ratio — {r.pct}% of target</span>
                  <div className={styles.priorityBar}>
                    <div className={[styles.priorityBarFill, styles['fill_' + r.status]].join(' ')} style={{ width: Math.min(r.pct, 100) + '%' }} />
                  </div>
                </div>
                <div className={styles.priorityAction}>
                  <Link to="/training" className={styles.priorityBtn}>
                    View Training Plan <ArrowIcon />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── All optimal ── */}
      {lagging.length === 0 && (
        <div className={styles.allOptimal}>
          <span className={styles.allOptimalIcon}>🏆</span>
          <h3 className={styles.allOptimalTitle}>All Ratios Optimal</h3>
          <p className={styles.allOptimalSub}>Every measured ratio is at or near its target. Exceptional balance — maintain your current programming.</p>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */
function MetaStat({ label, value, color }) {
  return (
    <div className={styles.metaStat}>
      <span className={styles.metaVal} style={color ? { color } : {}}>{value}</span>
      <span className={styles.metaLabel}>{label}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { optimal: 'success', developing: 'warning', lagging: 'danger', overdeveloped: 'accent' };
  return (
    <span className={[styles.badge, styles['badge_' + (map[status] ?? 'default')]].join(' ')}>
      {status}
    </span>
  );
}

/* ── Icons ── */
function ArrowIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}
function ScanIcon() {
  return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>;
}
