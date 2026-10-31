'use client';
import type { EventTheme } from '@/lib/types';
import { Pin, Palette, Check } from 'lucide-react';

interface Props {
  themes: EventTheme[];
  currency?: string;
  onPinToTasks: (theme: EventTheme) => void;
  onPinToBudget: (theme: EventTheme) => void;
  pinnedTaskIds: Set<string>;
  pinnedBudgetIds: Set<string>;
}

function ContrastChip({ hex, label, ratio }: { hex: string; label: string; ratio: number }) {
  const passes = ratio >= 4.5;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', background: '#F4F4F5', borderRadius: 6, border: '1px solid #E4E4E7' }} title={`Contrast: ${ratio}:1 ${passes ? '✓ WCAG AA' : '✗ below AA'}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            width: 20, height: 20, borderRadius: 4,
            backgroundColor: hex, border: '1.5px solid var(--black)',
            display: 'inline-block', flexShrink: 0,
          }}
          aria-label={`${label} color ${hex}`}
          role="img"
        />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--black)' }}>{label}</span>
      </div>
      <span className={passes ? 'badge badge-lime' : 'badge badge-red'} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
        {passes ? '✓ AA' : '✗ FAIL'} {ratio}:1
      </span>
    </div>
  );
}

function ThemeCard({ theme, onPinTasks, onPinBudget, taskPinned, budgetPinned }: {
  theme: EventTheme;
  onPinTasks: () => void;
  onPinBudget: () => void;
  taskPinned: boolean;
  budgetPinned: boolean;
}) {
  return (
    <article aria-labelledby={`theme-${theme.id}-name`} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: 4 }}>{theme.budgetTier.toUpperCase()} TIER</span>
          <h3 id={`theme-${theme.id}-name`} style={{ fontWeight: 800, fontSize: 18, color: 'var(--black)', lineHeight: 1.2 }}>
            {theme.name}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>{theme.description}</p>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--lime)', border: 'var(--border)', boxShadow: '2px 2px 0 var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Palette size={18} color="var(--black)" aria-hidden="true" />
        </div>
      </div>

      <div>
        <p className="label" style={{ fontSize: 11, marginBottom: 6 }}>ACCESSIBILITY COLOR PALETTE</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {theme.colorPalette.map((color) => (
            <ContrastChip key={color.hex} hex={color.hex} label={color.label} ratio={color.contrastRatio} />
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
        <div style={{ background: '#FAF5FF', border: '1.5px solid #E9D5FF', borderRadius: 8, padding: '10px 12px' }}>
          <p style={{ fontWeight: 800, fontSize: 11, color: 'var(--purple)', fontFamily: 'var(--mono)', marginBottom: 6 }}>
            DECOR MOTIFS
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {theme.decorMotifs.map((m, i) => (
              <li key={i} style={{ color: 'var(--black)', display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12 }}>
                <span style={{ color: 'var(--purple)', fontWeight: 800 }}>•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 8, padding: '10px 12px' }}>
          <p style={{ fontWeight: 800, fontSize: 11, color: '#166534', fontFamily: 'var(--mono)', marginBottom: 6 }}>
            MENU PICKS
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {theme.menuHighlights.map((m, i) => (
              <li key={i} style={{ color: 'var(--black)', display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12 }}>
                <span style={{ color: '#166534', fontWeight: 800 }}>•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <p className="label" style={{ fontSize: 11, marginBottom: 4 }}>GUEST ENGAGEMENT</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {theme.guestEngagementIdeas.map((g, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--black)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <span style={{ color: 'var(--purple)', fontWeight: 800 }}>⚡</span>
              <span>{g}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '2px solid #E5E7EB', marginTop: 'auto' }}>
        <button
          onClick={onPinTasks}
          disabled={taskPinned}
          aria-pressed={taskPinned}
          data-testid={`theme-pin-tasks-${theme.id}`}
          className={taskPinned ? 'btn-outline' : 'btn-outline'}
          style={{
            flex: 1, fontSize: 12, padding: '6px 10px', minHeight: 36,
            background: taskPinned ? 'var(--lime)' : 'var(--white)',
            color: 'var(--black)', fontWeight: 800,
          }}
        >
          {taskPinned ? <Check size={13} aria-hidden="true" /> : <Pin size={13} aria-hidden="true" />}
          {taskPinned ? 'Pinned to Tasks' : 'Pin to Tasks'}
        </button>
        <button
          onClick={onPinBudget}
          disabled={budgetPinned}
          aria-pressed={budgetPinned}
          data-testid={`theme-pin-budget-${theme.id}`}
          className={budgetPinned ? 'btn-outline' : 'btn-outline'}
          style={{
            flex: 1, fontSize: 12, padding: '6px 10px', minHeight: 36,
            background: budgetPinned ? 'var(--lime)' : 'var(--white)',
            color: 'var(--black)', fontWeight: 800,
          }}
        >
          {budgetPinned ? <Check size={13} aria-hidden="true" /> : <Pin size={13} aria-hidden="true" />}
          {budgetPinned ? 'Pinned to Budget' : 'Pin to Budget'}
        </button>
      </div>
    </article>
  );
}

export default function ThemeStudio({ themes, onPinToTasks, onPinToBudget, pinnedTaskIds, pinnedBudgetIds }: Props) {
  return (
    <section aria-labelledby="themes-heading" aria-live="polite">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <span className="badge badge-purple" style={{ marginBottom: 6 }}>CREATIVE DIRECTION</span>
        <h2 id="themes-heading" className="section-title">Theme Studio &amp; Inspiration</h2>
        <p className="section-subtitle">3 personalized themes with verified WCAG 2.1 AA color contrast ratios.</p>
      </div>

      <div style={{ display: 'grid', gap: 16 }} className="md:grid-cols-3">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            onPinTasks={() => onPinToTasks(theme)}
            onPinBudget={() => onPinToBudget(theme)}
            taskPinned={pinnedTaskIds.has(theme.id)}
            budgetPinned={pinnedBudgetIds.has(theme.id)}
          />
        ))}
      </div>
    </section>
  );
}
