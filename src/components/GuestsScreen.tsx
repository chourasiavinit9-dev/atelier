'use client';
import { useState } from 'react';
import type { GuestsState, Guest, GuestRSVP } from '@/lib/types';
import { Plus, Trash2, Download, Upload } from 'lucide-react';
import ToggleButton from '@/components/ToggleButton';

interface Props {
  guests: GuestsState;
  onChange: (guests: GuestsState) => void;
  targetHeadcount: number;
  onSyncCatering?: (confirmedCount: number) => void;
}

function makeId() {
  return Math.random().toString(36).slice(2, 11);
}

const RSVP_OPTS: GuestRSVP[] = ['Yes', 'Maybe', 'No', 'Invited'];

export default function GuestsScreen({ guests, onChange, targetHeadcount, onSyncCatering }: Props) {
  const [newName, setNewName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [filter, setFilter] = useState<GuestRSVP | 'All'>('All');

  const list = guests?.list ?? [];
  const attendingCount = list.filter((g) => g.rsvp === 'Yes').length;
  const tentativeCount = list.filter((g) => g.rsvp === 'Maybe').length;
  const declinedCount = list.filter((g) => g.rsvp === 'No').length;
  const invitedCount = list.filter((g) => g.rsvp === 'Invited').length;

  const filteredList = filter === 'All' ? list : list.filter((g) => g.rsvp === filter);

  function addGuest() {
    if (!newName.trim()) return;
    const newGuest: Guest = {
      id: makeId(),
      name: newName.trim(),
      rsvp: 'Invited',
    };
    onChange({ ...guests, list: [newGuest, ...list] });
    setNewName('');
  }

  function updateRSVP(id: string, rsvp: GuestRSVP) {
    const updated = list.map((g) => (g.id === id ? { ...g, rsvp } : g));
    onChange({ ...guests, list: updated });
  }

  function removeGuest(id: string) {
    const updated = list.filter((g) => g.id !== id);
    onChange({ ...guests, list: updated });
  }

  function handleBulkImport() {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim().replace(/^["']|["']$/g, ''))
      .filter((l) => l.length > 0);

    const imported: Guest[] = lines.map((name) => ({
      id: makeId(),
      name,
      rsvp: 'Invited',
    }));

    onChange({ ...guests, list: [...imported, ...list] });
    setBulkText('');
    setShowBulk(false);
  }

  function exportCSV() {
    const rows = ['Name,RSVP Status', ...list.map((g) => `"${g.name}","${g.rsvp}"`)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest-list.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section aria-labelledby="guests-heading" aria-live="polite">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: 6 }}>HEADCOUNT &amp; ATTENDANCE</span>
          <h2 id="guests-heading" className="section-title">Guest List &amp; RSVP Tracker</h2>
          <p className="section-subtitle">
            Target headcount: {targetHeadcount} guests. Currently tracking {list.length} contacts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowBulk((p) => !p)} className="btn-outline" style={{ fontSize: 12 }}>
            <Upload size={13} aria-hidden="true" /> {showBulk ? 'Close Paste' : 'Bulk Import'}
          </button>
          <button onClick={exportCSV} className="btn-outline" style={{ fontSize: 12 }}>
            <Download size={13} aria-hidden="true" /> Export CSV
          </button>
          {onSyncCatering && (
            <button
              onClick={() => onSyncCatering(attendingCount)}
              className="btn btn-lime"
              style={{ fontSize: 12, padding: '6px 14px', minHeight: 36 }}
            >
              Sync Catering ({attendingCount})
            </button>
          )}
        </div>
      </div>

      {/* Bulk Paste Area */}
      {showBulk && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>Paste Guest Names (one per line)</h3>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={4}
            placeholder="Aarav Patel&#10;Sunita Rao&#10;Dr. Kevin Vance"
            className="input"
            style={{ resize: 'vertical', fontSize: 13, marginBottom: 10 }}
          />
          <button onClick={handleBulkImport} className="btn btn-lime" style={{ fontSize: 12 }}>
            Add All Guests
          </button>
        </div>
      )}

      {/* Metric Strip */}
      <div className="metric-strip">
        <div className="metric-card lime">
          <div className="metric-label">Confirmed Attending</div>
          <div className="metric-value">{attendingCount}</div>
        </div>
        <div className="metric-card purple">
          <div className="metric-label" style={{ color: 'rgba(255,255,255,0.75)' }}>Tentative / Pending</div>
          <div className="metric-value">{tentativeCount + invitedCount}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Declined</div>
          <div className="metric-value" style={{ color: '#DC2626' }}>{declinedCount}</div>
        </div>
      </div>

      {/* Add Guest Form & Filter */}
      <div className="card" style={{ marginBottom: 18, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addGuest(); }}
            placeholder="Guest full name…"
            className="input"
            style={{ fontSize: 13, padding: '6px 12px', minHeight: 38 }}
          />
          <button onClick={addGuest} className="btn btn-lime" style={{ fontSize: 12, padding: '6px 14px', minHeight: 38 }}>
            <Plus size={13} aria-hidden="true" /> Add Guest
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['All', ...RSVP_OPTS] as const).map((s) => (
            <ToggleButton
              key={s}
              active={filter === s}
              onClick={() => setFilter(filter === s && s !== 'All' ? 'All' : s)}
              style={{ padding: '4px 10px', minHeight: 30, fontSize: 11 }}
            >
              {s}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Guest List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {filteredList.map((g) => (
          <div
            key={g.id}
            className="card"
            style={{
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              background: g.rsvp === 'Yes' ? '#FAF5FF' : '#fff',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--black)' }}>{g.name}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <select
                value={g.rsvp}
                onChange={(e) => updateRSVP(g.id, e.target.value as GuestRSVP)}
                className="input"
                style={{
                  width: 'auto',
                  fontSize: 11,
                  padding: '4px 8px',
                  minHeight: 30,
                  fontWeight: 800,
                  fontFamily: 'var(--mono)',
                  background: g.rsvp === 'Yes' ? 'var(--lime)' : g.rsvp === 'No' ? '#FEE2E2' : '#fff',
                }}
              >
                {RSVP_OPTS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <button
                type="button"
                onClick={() => removeGuest(g.id)}
                aria-label={`Remove ${g.name}`}
                className="btn-outline"
                style={{ padding: 4, minHeight: 30, color: '#DC2626' }}
              >
                <Trash2 size={12} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
