'use client';
import type { GuestScheduleCard, GuestScheduleItem, CeremonySchedule } from '@/lib/types';
import { Plus, Trash2, Printer, RefreshCw } from 'lucide-react';

interface Props {
  schedule: GuestScheduleCard;
  onChange: (schedule: GuestScheduleCard) => void;
  ceremonies?: CeremonySchedule | null;
  eventType: string;
}

function makeId() {
  return Math.random().toString(36).slice(2, 11);
}

export default function GuestScheduleScreen({ schedule, onChange, ceremonies, eventType }: Props) {
  const items = schedule?.items ?? [];

  function updateItem(id: string, patch: Partial<GuestScheduleItem>) {
    const updated = items.map((it) => (it.id === id ? { ...it, ...patch } : it));
    onChange({ ...schedule, items: updated });
  }

  function addItem() {
    const newItem: GuestScheduleItem = {
      id: makeId(),
      function: 'Celebration Gathering',
      date: new Date().toISOString().split('T')[0]!,
      startTime: '18:00',
      venue: 'Grand Ballroom',
      dressCode: 'Smart Casual',
      note: 'Please arrive on time.',
    };
    onChange({ ...schedule, items: [...items, newItem] });
  }

  function removeItem(id: string) {
    const updated = items.filter((it) => it.id !== id);
    onChange({ ...schedule, items: updated });
  }

  function copyFromCeremonies() {
    if (!ceremonies?.days) return;
    const imported: GuestScheduleItem[] = ceremonies.days.flatMap((day) =>
      day.items.map((it) => ({
        id: makeId(),
        function: it.what,
        date: day.date,
        startTime: it.start,
        venue: it.venue ?? 'Venue Location',
        dressCode: eventType === 'Wedding' ? 'Festive Traditional' : 'Party Chic',
        note: 'Seating opens 15 mins early.',
      }))
    );
    onChange({ ...schedule, items: imported });
  }

  return (
    <section aria-labelledby="guest-schedule-heading" aria-live="polite">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: 6 }}>ATTENDEE PROGRAMME</span>
          <h2 id="guest-schedule-heading" className="section-title">Guest-Facing Schedule &amp; Itinerary</h2>
          <p className="section-subtitle">
            Public-facing timeline for guests including dress codes, locations and timings.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {ceremonies && (
            <button onClick={copyFromCeremonies} className="btn-outline" style={{ fontSize: 12 }}>
              <RefreshCw size={13} aria-hidden="true" /> Sync from Ceremonies
            </button>
          )}
          <button onClick={() => window.print()} className="btn btn-lime" style={{ fontSize: 12, padding: '6px 14px', minHeight: 36 }}>
            <Printer size={13} aria-hidden="true" /> Print Itinerary
          </button>
        </div>
      </div>

      {/* Guest Card Preview Box */}
      <div className="card" style={{ marginBottom: 20, background: 'var(--white)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, borderBottom: '2px solid #E5E7EB', paddingBottom: 12 }}>
          <div>
            <input
              type="text"
              value={schedule.title}
              onChange={(e) => onChange({ ...schedule, title: e.target.value })}
              className="input"
              style={{ fontSize: 20, fontWeight: 800, padding: '4px 8px', minHeight: 40 }}
            />
            <input
              type="text"
              value={schedule.intro}
              onChange={(e) => onChange({ ...schedule, intro: e.target.value })}
              className="input"
              style={{ fontSize: 13, color: 'var(--muted)', padding: '4px 8px', marginTop: 6, minHeight: 34 }}
            />
          </div>
          <button onClick={addItem} className="btn btn-lime" style={{ padding: '6px 14px', minHeight: 36, fontSize: 12 }}>
            <Plus size={13} aria-hidden="true" /> Add Event
          </button>
        </div>

        {/* Schedule Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((it) => (
            <div
              key={it.id}
              style={{
                border: '1.5px solid var(--black)',
                boxShadow: '3px 3px 0 var(--black)',
                borderRadius: 12,
                padding: '16px 18px',
                background: '#fff',
                display: 'grid',
                gridTemplateColumns: '130px 1fr 180px 180px 40px',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="badge badge-purple" style={{ fontSize: 11, textAlign: 'center' }}>
                  {it.startTime}
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', textAlign: 'center' }}>
                  {it.date}
                </span>
              </div>

              <div>
                <input
                  type="text"
                  value={it.function}
                  onChange={(e) => updateItem(it.id, { function: e.target.value })}
                  aria-label="Event function name"
                  className="input"
                  style={{ fontSize: 15, fontWeight: 800, padding: '4px 8px', minHeight: 34 }}
                />
                <input
                  type="text"
                  value={it.note ?? ''}
                  onChange={(e) => updateItem(it.id, { note: e.target.value })}
                  placeholder="Notes for guests…"
                  className="input"
                  style={{ fontSize: 12, color: 'var(--muted)', padding: '4px 8px', marginTop: 4, minHeight: 30 }}
                />
              </div>

              <div>
                <label className="label" style={{ fontSize: 10, marginBottom: 2 }}>VENUE</label>
                <input
                  type="text"
                  value={it.venue}
                  onChange={(e) => updateItem(it.id, { venue: e.target.value })}
                  aria-label="Venue location"
                  className="input"
                  style={{ fontSize: 12, padding: '4px 8px', minHeight: 32 }}
                />
              </div>

              <div>
                <label className="label" style={{ fontSize: 10, marginBottom: 2 }}>DRESS CODE</label>
                <input
                  type="text"
                  value={it.dressCode ?? ''}
                  onChange={(e) => updateItem(it.id, { dressCode: e.target.value })}
                  placeholder="e.g. Traditional Elegance"
                  aria-label="Dress code"
                  className="input"
                  style={{ fontSize: 12, padding: '4px 8px', minHeight: 32, color: 'var(--purple)', fontWeight: 700 }}
                />
              </div>

              <button
                type="button"
                onClick={() => removeItem(it.id)}
                aria-label="Remove item"
                className="btn-outline"
                style={{ padding: 4, minHeight: 32, color: '#DC2626' }}
              >
                <Trash2 size={13} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
