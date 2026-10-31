'use client';
import type { Workspace, NavScreen } from '@/lib/types';
import { computePlanHealth, getSuggestedNextActions } from '@/lib/domainLogic';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface Props {
  workspace: Workspace;
  onNavigate: (screen: NavScreen) => void;
  onToggleTask: (taskId: string) => void;
}

/** Snapshot of "now" taken once per module load — avoids calling Date.now() during render. */
function getDaysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

export default function TodayScreen({ workspace, onNavigate, onToggleTask }: Props) {
  const { formInput, plan } = workspace;
  const health = computePlanHealth(workspace);
  const nextActions = getSuggestedNextActions(workspace);

  const daysLeft = getDaysUntil(formInput.eventDate);
  const completedTasks = plan.timeline.filter((t) => t.status === 'Completed').length;
  const bookedVendors = plan.vendors.filter((v) => v.status === 'Verified & Booked').length;
  const totalActual = plan.budget.reduce((s, b) => s + b.items.reduce((si, i) => si + (i.actualCost ?? 0), 0), 0);

  const upcomingTasks = plan.timeline.slice(0, 4);

  return (
    <section aria-labelledby="today-heading" aria-live="polite">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <span className="badge badge-purple" style={{ marginBottom: 6 }}>EXECUTIVE COCKPIT</span>
        <h2 id="today-heading" className="section-title">Today &amp; Event Command Center</h2>
        <p className="section-subtitle">Real-time health score, countdown, and priority actions for {formInput.eventType}.</p>
      </div>

      {/* Hero Countdown & Health Bento Grid */}
      <div className="metric-strip">
        <div className="metric-card lime">
          <div className="metric-label">Target Countdown</div>
          <div className="metric-value">
            {daysLeft > 0 ? daysLeft : 0}
            <span className="metric-unit">DAYS LEFT</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--black)' }}>
            🗓 {formInput.eventDate} ({formInput.city})
          </div>
        </div>

        <div className="metric-card purple">
          <div className="metric-label" style={{ color: 'rgba(255,255,255,0.75)' }}>Plan Readiness Health</div>
          <div className="metric-value">
            {health.score}
            <span className="metric-unit">/100</span>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="badge badge-solid-lime" style={{ fontSize: '0.65rem' }}>
              BUDGET {health.parts.budgetBalance}/25
            </span>
            <span className="badge badge-solid-lime" style={{ fontSize: '0.65rem' }}>
              TASKS {health.parts.tasksOnTime}/25
            </span>
            <span className="badge badge-solid-lime" style={{ fontSize: '0.65rem' }}>
              VENDORS {health.parts.vendorsVerified}/25
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Quick Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)' }}>
              <span>Spent vs Target:</span>
              <span style={{ color: 'var(--purple)' }}>{formInput.currency} {totalActual.toLocaleString()} / {formInput.totalBudget.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)' }}>
              <span>Vendors Booked:</span>
              <span>{bookedVendors} / {plan.vendors.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)' }}>
              <span>Tasks Complete:</span>
              <span>{completedTasks} / {plan.timeline.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Recommended Next Actions */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16 }}>⚡ Recommended Next Actions</h3>
            <span className="badge badge-solid-lime">AUTOPILOT</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {nextActions.map((action, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--purple-bg)',
                  border: '1.5px solid var(--black)',
                  boxShadow: '2px 2px 0 var(--black)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--black)' }}>{action.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{action.reason}</div>
                </div>
                {action.navigateTo && (
                  <button
                    onClick={() => onNavigate(action.navigateTo as NavScreen)}
                    className="btn btn-lime"
                    style={{ padding: '6px 12px', minHeight: 34, fontSize: 12 }}
                    data-testid={`action-nav-${action.navigateTo}`}
                  >
                    Open <ArrowRight size={13} aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Priority Timeline Preview */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16 }}>🎯 Priority Tasks</h3>
            <button
              onClick={() => onNavigate('timeline')}
              className="btn-outline"
              style={{ padding: '4px 10px', minHeight: 30, fontSize: 11 }}
            >
              View All ({plan.timeline.length})
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingTasks.map((t) => {
              const isDone = t.status === 'Completed';
              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: isDone ? '#F4F4F5' : '#fff',
                    border: '1.5px solid #E5E7EB',
                  }}
                >
                  <button
                    onClick={() => onToggleTask(t.id)}
                    aria-label={`Toggle ${t.title}`}
                    data-testid={`today-task-${t.id}`}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {isDone ? <CheckCircle2 size={18} color="#059669" /> : <Circle size={18} color="#71717A" />}
                  </button>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, textDecoration: isDone ? 'line-through' : 'none' }}>
                    {t.title}
                  </span>
                  <span className="tag" style={{ fontSize: '0.65rem' }}>{t.dueDate}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
