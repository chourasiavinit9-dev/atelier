'use client';
import type { RunSheet, RunSheetRow } from '@/lib/types';
import { Plus, Trash2, Printer, Download, Clock } from 'lucide-react';

interface Props {
  runSheet: RunSheet | null;
  onChange: (runSheet: RunSheet) => void;
  eventDate: string;
  eventType: string;
}

function makeId() {
  return Math.random().toString(36).slice(2, 11);
}

export default function RunSheetScreen({ runSheet, onChange, eventDate, eventType }: Props) {
  const rows = runSheet?.rows ?? [];
  const confirmedCount = rows.filter((r) => r.confirmed).length;

  function updateRow(id: string, patch: Partial<RunSheetRow>) {
    const updated = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
    onChange({ ...(runSheet ?? { assumptions: [] }), rows: updated });
  }

  function addRow() {
    const newRow: RunSheetRow = {
      id: makeId(),
      time: '12:00',
      what: 'New execution milestone',
      who: 'Assigned Coordinator',
      confirmed: false,
    };
    onChange({ ...(runSheet ?? { assumptions: [] }), rows: [...rows, newRow] });
  }

  function removeRow(id: string) {
    const updated = rows.filter((r) => r.id !== id);
    onChange({ ...(runSheet ?? { assumptions: [] }), rows: updated });
  }

  function handlePrint() {
    window.print();
  }

  function downloadIcs() {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Atelier//RunSheet//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];
    rows.forEach((r) => {
      const timeClean = r.time.replace(':', '');
      const dateClean = eventDate.replace(/-/g, '');
      lines.push(
        'BEGIN:VEVENT',
        `UID:${r.id}@atelier.local`,
        `DTSTART:${dateClean}T${timeClean}00`,
        `DTEND:${dateClean}T${timeClean}00`,
        `SUMMARY:${r.what.replace(/[,;\\]/g, ' ')}`,
        `DESCRIPTION:Assigned to: ${r.who.replace(/[,;\\]/g, ' ')}`,
        `STATUS:${r.confirmed ? 'CONFIRMED' : 'TENTATIVE'}`,
        'END:VEVENT'
      );
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventType.toLowerCase().replace(/\s+/g, '-')}-runsheet.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section aria-labelledby="runsheet-heading" aria-live="polite">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: 6 }}>MINUTE-BY-MINUTE ITINERARY</span>
          <h2 id="runsheet-heading" className="section-title">Day-Of Execution Run Sheet</h2>
          <p className="section-subtitle">
            {confirmedCount} of {rows.length} execution milestones locked and confirmed.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={downloadIcs} className="btn-outline" style={{ fontSize: 12 }}>
            <Download size={13} aria-hidden="true" /> Export ICS
          </button>
          <button onClick={handlePrint} className="btn btn-lime" style={{ fontSize: 12, padding: '6px 14px', minHeight: 36 }}>
            <Printer size={13} aria-hidden="true" /> Print Run Sheet
          </button>
        </div>
      </div>

      {/* Progress Strip */}
      <div className="card" style={{ marginBottom: 20, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} color="var(--purple)" aria-hidden="true" />
          <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--mono)' }}>EVENT DATE: {eventDate}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge badge-solid-lime">
            {confirmedCount === rows.length && rows.length > 0 ? '✓ 100% READY' : `${confirmedCount} CONFIRMED`}
          </span>
          <button
            onClick={addRow}
            data-testid="runsheet-add-row"
            className="btn btn-lime"
            style={{ padding: '4px 12px', minHeight: 32, fontSize: 12 }}
          >
            <Plus size={13} aria-hidden="true" /> Add Time Slot
          </button>
        </div>
      </div>

      {/* Rows Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '90px 1fr 220px 100px 44px',
          gap: 12, padding: '12px 18px', background: 'var(--purple-bg)',
          borderBottom: 'var(--border)', fontSize: 11, fontWeight: 800,
          fontFamily: 'var(--mono)', color: 'var(--black)',
        }}>
          <span>TIME</span>
          <span>ACTIVITY / MILESTONE</span>
          <span>RESPONSIBLE ROLE</span>
          <span>CONFIRMED</span>
          <span />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1fr 220px 100px 44px',
                gap: 12,
                padding: '12px 18px',
                alignItems: 'center',
                borderBottom: i !== rows.length - 1 ? '1px solid #E5E7EB' : 'none',
                background: r.confirmed ? '#FAF5FF' : '#fff',
              }}
            >
              <input
                type="time"
                value={r.time}
                onChange={(e) => updateRow(r.id, { time: e.target.value })}
                aria-label="Time"
                className="input"
                style={{ fontSize: 13, padding: '6px 8px', minHeight: 34, fontWeight: 800, fontFamily: 'var(--mono)' }}
              />
              <input
                type="text"
                value={r.what}
                onChange={(e) => updateRow(r.id, { what: e.target.value })}
                aria-label="Activity description"
                className="input"
                style={{ fontSize: 13, padding: '6px 10px', minHeight: 34, fontWeight: 600 }}
              />
              <input
                type="text"
                value={r.who}
                onChange={(e) => updateRow(r.id, { who: e.target.value })}
                aria-label="Responsible person"
                className="input"
                style={{ fontSize: 13, padding: '6px 10px', minHeight: 34, color: 'var(--purple)', fontWeight: 700 }}
              />
              <button
                type="button"
                onClick={() => updateRow(r.id, { confirmed: !r.confirmed })}
                aria-label={r.confirmed ? 'Mark unconfirmed' : 'Mark confirmed'}
                className="btn-outline"
                style={{
                  padding: '4px 8px', minHeight: 32, fontSize: 11,
                  background: r.confirmed ? 'var(--lime)' : '#fff',
                  fontWeight: 800,
                }}
              >
                {r.confirmed ? '✓ YES' : 'PENDING'}
              </button>
              <button
                type="button"
                onClick={() => removeRow(r.id)}
                aria-label="Delete milestone"
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
