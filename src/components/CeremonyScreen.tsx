'use client';
import type { CeremonySchedule, CeremonyItem, EventType } from '@/lib/types';
import { detectCeremonyClashes } from '@/lib/domainLogic';
import { CEREMONY_FUNCTIONS } from '@/lib/constants';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

interface Props {
  ceremonies: CeremonySchedule | null;
  onChange: (ceremonies: CeremonySchedule) => void;
  eventType: EventType;
  eventDate: string;
}

function makeId() {
  return Math.random().toString(36).slice(2, 11);
}

export default function CeremonyScreen({ ceremonies, onChange, eventType, eventDate }: Props) {
  const days = ceremonies?.days ?? [];
  const clashes = detectCeremonyClashes(days);
  const availableFunctions = CEREMONY_FUNCTIONS[eventType] ?? ['Ceremony', 'Reception', 'Dinner'];

  function updateItem(dayIdx: number, itemId: string, patch: Partial<CeremonyItem>) {
    const newDays = days.map((d, di) => {
      if (di !== dayIdx) return d;
      return {
        ...d,
        items: d.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
      };
    });
    onChange({ ...(ceremonies ?? { assumptions: [], functions: [] }), days: newDays });
  }

  function addItem(dayIdx: number) {
    const newItem: CeremonyItem = {
      id: makeId(),
      start: '18:00',
      end: '20:00',
      what: 'New Celebration Function',
      who: 'Family & Guests',
      venue: 'Main Venue',
    };
    const newDays = days.map((d, di) => (di === dayIdx ? { ...d, items: [...d.items, newItem] } : d));
    onChange({ ...(ceremonies ?? { assumptions: [], functions: [] }), days: newDays });
  }

  function removeItem(dayIdx: number, itemId: string) {
    const newDays = days.map((d, di) => (di === dayIdx ? { ...d, items: d.items.filter((it) => it.id !== itemId) } : d));
    onChange({ ...(ceremonies ?? { assumptions: [], functions: [] }), days: newDays });
  }

  return (
    <section aria-labelledby="ceremony-heading" aria-live="polite">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <span className="badge badge-purple" style={{ marginBottom: 6 }}>MULTI-CEREMONY ORCHESTRATION</span>
        <h2 id="ceremony-heading" className="section-title">Ceremony &amp; Function Schedule</h2>
        <p className="section-subtitle">
          Structure multi-day celebration functions with automatic timeline clash detection. Starts {eventDate}.
        </p>
      </div>

      {/* Clash Alerts */}
      {clashes.length > 0 && (
        <div className="alert-error" style={{ marginBottom: 20 }}>
          <AlertTriangle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 800 }}>Schedule Overlap Warning</div>
            {clashes.map((c, i) => (
              <div key={i} style={{ fontSize: 13, marginTop: 2 }}>• {c.message}</div>
            ))}
          </div>
        </div>
      )}

      {/* Function Tags */}
      <div className="card" style={{ marginBottom: 20, padding: '14px 18px' }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)', marginBottom: 8 }}>
          Standard {eventType} Functions:
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {availableFunctions.map((fn) => (
            <span key={fn} className="badge badge-purple" style={{ fontSize: 11, padding: '4px 10px' }}>
              ✦ {fn}
            </span>
          ))}
        </div>
      </div>

      {/* Days List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {days.map((day, dayIdx) => (
          <div key={dayIdx} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--black)' }}>{day.label}</h3>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>Date: {day.date}</span>
              </div>
              <button
                onClick={() => addItem(dayIdx)}
                className="btn btn-lime"
                style={{ padding: '6px 14px', minHeight: 34, fontSize: 12 }}
              >
                <Plus size={13} aria-hidden="true" /> Add Function Slot
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {day.items.map((it) => (
                <div
                  key={it.id}
                  style={{
                    background: '#FAF5FF',
                    border: '1.5px solid var(--black)',
                    boxShadow: '2px 2px 0 var(--black)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'grid',
                    gridTemplateColumns: '150px 1fr 180px 180px 40px',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="time"
                      value={it.start}
                      onChange={(e) => updateItem(dayIdx, it.id, { start: e.target.value })}
                      aria-label="Start time"
                      className="input"
                      style={{ fontSize: 12, padding: '4px 6px', minHeight: 32, fontWeight: 800, fontFamily: 'var(--mono)' }}
                    />
                    <span style={{ fontWeight: 800 }}>–</span>
                    <input
                      type="time"
                      value={it.end}
                      onChange={(e) => updateItem(dayIdx, it.id, { end: e.target.value })}
                      aria-label="End time"
                      className="input"
                      style={{ fontSize: 12, padding: '4px 6px', minHeight: 32, fontWeight: 800, fontFamily: 'var(--mono)' }}
                    />
                  </div>

                  <input
                    type="text"
                    value={it.what}
                    onChange={(e) => updateItem(dayIdx, it.id, { what: e.target.value })}
                    aria-label="Function name"
                    className="input"
                    style={{ fontSize: 13, padding: '6px 10px', minHeight: 32, fontWeight: 700 }}
                  />

                  <input
                    type="text"
                    value={it.who}
                    onChange={(e) => updateItem(dayIdx, it.id, { who: e.target.value })}
                    placeholder="Participants"
                    aria-label="Who participates"
                    className="input"
                    style={{ fontSize: 12, padding: '6px 8px', minHeight: 32, color: 'var(--purple)', fontWeight: 600 }}
                  />

                  <input
                    type="text"
                    value={it.venue ?? ''}
                    onChange={(e) => updateItem(dayIdx, it.id, { venue: e.target.value })}
                    placeholder="Venue / Room"
                    aria-label="Venue location"
                    className="input"
                    style={{ fontSize: 12, padding: '6px 8px', minHeight: 32 }}
                  />

                  <button
                    type="button"
                    onClick={() => removeItem(dayIdx, it.id)}
                    aria-label="Delete function"
                    className="btn-outline"
                    style={{ padding: 4, minHeight: 32, color: '#DC2626' }}
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
