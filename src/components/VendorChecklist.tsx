'use client';
import { useState } from 'react';
import type { VendorCard, VendorStatus } from '@/lib/types';
import { CheckSquare, Square, ChevronDown, ChevronUp, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

interface Props {
  vendors: VendorCard[];
  onChange: (vendors: VendorCard[]) => void;
}

const STATUS_OPTS: VendorStatus[] = ['Researching', 'Shortlisted', 'Contacted', 'Verified & Booked'];

function VendorCardUI({ vendor, onUpdate }: { vendor: VendorCard; onUpdate: (v: VendorCard) => void }) {
  const [expanded, setExpanded] = useState(false);

  function toggleQuestion(qId: string) {
    onUpdate({
      ...vendor,
      vettingQuestions: vendor.vettingQuestions.map((q) =>
        q.id === qId ? { ...q, checked: !q.checked } : q
      ),
    });
  }

  const checkedCount = vendor.vettingQuestions.filter((q) => q.checked).length;
  const isBooked = vendor.status === 'Verified & Booked';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <h3 style={{ fontWeight: 800, color: 'var(--black)', fontSize: 16 }}>{vendor.category}</h3>
            {isBooked && (
              <span className="badge badge-lime">
                <ShieldCheck size={11} aria-hidden="true" /> BOOKED
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
            <Clock size={12} aria-hidden="true" />
            <span>Lead time: {vendor.bookingLeadTime}</span>
          </div>
          <div style={{ marginTop: 4, fontWeight: 800, color: 'var(--purple)', fontSize: 14, fontFamily: 'var(--mono)' }}>
            {vendor.estimatedPriceRange}
          </div>
        </div>

        <select
          value={vendor.status}
          onChange={(e) => onUpdate({ ...vendor, status: e.target.value as VendorStatus })}
          aria-label={`Status for ${vendor.category} vendor`}
          data-testid={`vendor-status-${vendor.id}`}
          className="input"
          style={{
            width: 'auto',
            fontSize: 12,
            padding: '6px 10px',
            minHeight: 38,
            fontWeight: 800,
            fontFamily: 'var(--mono)',
            background: isBooked ? 'var(--lime)' : vendor.status === 'Contacted' ? '#FEF3C7' : '#fff',
            color: 'var(--black)',
          }}
        >
          {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontFamily: 'var(--mono)', fontWeight: 700 }}>
        <span>VETTING: {checkedCount}/{vendor.vettingQuestions.length} VERIFIED</span>
        <button
          onClick={() => setExpanded((p) => !p)}
          aria-expanded={expanded}
          aria-controls={`vendor-questions-${vendor.id}`}
          data-testid={`vendor-toggle-questions-${vendor.id}`}
          className="btn-outline"
          style={{ padding: '4px 10px', minHeight: 30, fontSize: 11 }}
        >
          {expanded ? <ChevronUp size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />}
          {expanded ? 'HIDE' : 'VIEW QUESTIONS'}
        </button>
      </div>

      {!isBooked && (
        <div style={{
          background: '#FFFBEB',
          border: '1.5px solid #FDE68A',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 11,
          color: '#92400E',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--mono)',
        }}>
          <AlertCircle size={13} aria-hidden="true" />
          <span>Not confirmed yet. Mark &quot;Verified &amp; Booked&quot; only post-agreement.</span>
        </div>
      )}

      {expanded && (
        <div id={`vendor-questions-${vendor.id}`} style={{ borderTop: '2px solid #E5E7EB', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)' }}>
            Vetting Checklist:
          </div>
          {vendor.vettingQuestions.map((q) => (
            <label key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', minHeight: 36 }}>
              <button
                role="checkbox"
                aria-checked={q.checked}
                onClick={() => toggleQuestion(q.id)}
                data-testid={`vendor-q-${q.id}`}
                className="flex-shrink-0 mt-0.5 rounded focus-visible:outline-neutral-900"
                aria-label={q.question}
                style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                {q.checked
                  ? <CheckSquare size={18} color="var(--purple)" aria-hidden="true" />
                  : <Square size={18} color="#71717A" aria-hidden="true" />
                }
              </button>
              <span style={{
                fontSize: 13,
                color: q.checked ? 'var(--muted)' : 'var(--black)',
                textDecoration: q.checked ? 'line-through' : 'none',
                fontWeight: q.checked ? 500 : 600,
              }}>
                {q.question}
              </span>
            </label>
          ))}

          <div style={{ marginTop: 8 }}>
            <label htmlFor={`vendor-notes-${vendor.id}`} className="label">
              Vendor Notes
            </label>
            <textarea
              id={`vendor-notes-${vendor.id}`}
              data-testid={`vendor-notes-${vendor.id}`}
              value={vendor.userNotes}
              onChange={(e) => onUpdate({ ...vendor, userNotes: e.target.value })}
              maxLength={1000}
              rows={2}
              className="input"
              style={{ resize: 'none', fontSize: 13, minHeight: 60 }}
              placeholder="Contacts, agreed terms, pricing quotes…"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorChecklist({ vendors, onChange }: Props) {
  function updateVendor(updated: VendorCard) {
    onChange(vendors.map((v) => v.id === updated.id ? updated : v));
  }

  const bookedCount = vendors.filter((v) => v.status === 'Verified & Booked').length;

  return (
    <section aria-labelledby="vendor-heading" aria-live="polite">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <span className="badge badge-purple" style={{ marginBottom: 6 }}>VENDOR PROCUREMENT</span>
        <h2 id="vendor-heading" className="section-title">Vendor Checklist &amp; Vetting</h2>
        <p className="section-subtitle">
          {bookedCount} of {vendors.length} vendors secured. Essential interview questions and lead times.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 16 }} className="md:grid-cols-2">
        {vendors.map((v) => (
          <VendorCardUI key={v.id} vendor={v} onUpdate={updateVendor} />
        ))}
      </div>
    </section>
  );
}
