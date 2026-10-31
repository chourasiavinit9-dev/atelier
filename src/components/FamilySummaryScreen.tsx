'use client';
import { useState } from 'react';
import type { Workspace } from '@/lib/types';
import { Printer } from 'lucide-react';
import ToggleButton from '@/components/ToggleButton';

interface Props {
  workspace: Workspace;
}

export default function FamilySummaryScreen({ workspace }: Props) {
  const { formInput, plan, guests, ceremonies, runSheet } = workspace;
  const [showBudget, setShowBudget] = useState(true);
  const [showVendors, setShowVendors] = useState(true);
  const [showSchedule, setShowSchedule] = useState(true);
  const [showRunSheet, setShowRunSheet] = useState(true);

  const attendingCount = guests?.list?.filter((g) => g.rsvp === 'Yes').length ?? 0;
  const totalAlloc = plan.budget.reduce((s, b) => s + b.allocatedAmount, 0);

  function handlePrint() {
    window.print();
  }

  return (
    <section aria-labelledby="family-heading" aria-live="polite">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: 6 }}>EXECUTIVE FAMILY BRIEFING</span>
          <h2 id="family-heading" className="section-title">Family &amp; Core Organizer Summary</h2>
          <p className="section-subtitle">
            One-sheet master briefing packet for family elders and key coordinators.
          </p>
        </div>
        <button onClick={handlePrint} className="btn btn-lime" style={{ fontSize: 13, padding: '8px 18px', minHeight: 40 }}>
          <Printer size={15} aria-hidden="true" /> Print Family Packet
        </button>
      </div>

      {/* Section Toggles */}
      <div className="card" style={{ marginBottom: 20, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Include Sections:</span>
        <ToggleButton active={showBudget} onClick={() => setShowBudget((p) => !p)} style={{ padding: '4px 10px', minHeight: 30, fontSize: 11 }}>
          Budget Overview
        </ToggleButton>
        <ToggleButton active={showVendors} onClick={() => setShowVendors((p) => !p)} style={{ padding: '4px 10px', minHeight: 30, fontSize: 11 }}>
          Key Vendors
        </ToggleButton>
        <ToggleButton active={showSchedule} onClick={() => setShowSchedule((p) => !p)} style={{ padding: '4px 10px', minHeight: 30, fontSize: 11 }}>
          Ceremony Flow
        </ToggleButton>
        <ToggleButton active={showRunSheet} onClick={() => setShowRunSheet((p) => !p)} style={{ padding: '4px 10px', minHeight: 30, fontSize: 11 }}>
          Day-Of Execution
        </ToggleButton>
      </div>

      {/* Printable Master Document */}
      <div className="card" style={{ padding: '32px 36px', background: '#fff' }}>
        {/* Document Header */}
        <div style={{ borderBottom: '2.5px solid var(--black)', paddingBottom: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="badge badge-purple" style={{ marginBottom: 6 }}>OFFICIAL EVENT PACKET</span>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--black)', letterSpacing: '-0.02em', margin: 0 }}>
              {formInput.eventType}: {formInput.city}
            </h1>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
              <span>🗓 {formInput.eventDate}</span>
              <span>📍 {formInput.city} ({formInput.cityTier})</span>
              <span>👥 {formInput.guestCount} Target Guests ({attendingCount} Confirmed)</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-solid-lime" style={{ fontSize: 12 }}>ATELIER CERTIFIED</span>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 4 }}>
              Generated {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Budget Overview Section */}
        {showBudget && (
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1.5px solid #E5E7EB', paddingBottom: 6, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>💰 Budget Summary ({formInput.currency} {totalAlloc.toLocaleString()})</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {plan.budget.map((b) => (
                <div key={b.category} style={{ background: '#FAF5FF', padding: '10px 14px', borderRadius: 8, border: '1px solid #E9D5FF' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{b.category}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--purple)', fontFamily: 'var(--mono)', marginTop: 2 }}>
                    {formInput.currency} {b.allocatedAmount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vendors Directory Section */}
        {showVendors && (
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1.5px solid #E5E7EB', paddingBottom: 6, marginBottom: 12 }}>
              🤝 Key Vendor Roster
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {plan.vendors.map((v) => (
                <div key={v.id} style={{ border: '1.5px solid var(--black)', borderRadius: 8, padding: '12px 14px', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{v.category}</span>
                    <span className={v.status === 'Verified & Booked' ? 'badge badge-lime' : 'badge badge-yellow'}>
                      {v.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                    Price Target: <strong>{v.estimatedPriceRange}</strong>
                  </div>
                  {v.userNotes && (
                    <div style={{ fontSize: 11, color: '#4B5563', marginTop: 6, background: '#F3F4F6', padding: '4px 8px', borderRadius: 4 }}>
                      Note: {v.userNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ceremony Schedule Section */}
        {showSchedule && ceremonies && (
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1.5px solid #E5E7EB', paddingBottom: 6, marginBottom: 12 }}>
              🗓 Function &amp; Ceremony Schedule
            </h3>
            {ceremonies.days.map((d, di) => (
              <div key={di} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--purple)', fontFamily: 'var(--mono)', marginBottom: 6 }}>
                  {d.label} ({d.date})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {d.items.map((it) => (
                    <div key={it.id} style={{ display: 'flex', gap: 12, fontSize: 13, padding: '6px 10px', background: '#F9FAFB', borderRadius: 6 }}>
                      <span style={{ fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--black)', minWidth: 100 }}>
                        {it.start} – {it.end}
                      </span>
                      <span style={{ fontWeight: 700, flex: 1 }}>{it.what}</span>
                      <span style={{ color: 'var(--muted)' }}>{it.venue ?? ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Day-Of Run Sheet Section */}
        {showRunSheet && runSheet && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1.5px solid #E5E7EB', paddingBottom: 6, marginBottom: 12 }}>
              ⏱ Execution Run Sheet
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {runSheet.rows.map((r) => (
                <div key={r.id} style={{ display: 'flex', gap: 14, fontSize: 13, padding: '6px 10px', background: r.confirmed ? '#FAF5FF' : '#fff', border: '1px solid #E5E7EB', borderRadius: 6 }}>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--mono)', minWidth: 60 }}>{r.time}</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>{r.what}</span>
                  <span style={{ color: 'var(--purple)', fontWeight: 700 }}>{r.who}</span>
                  <span className={r.confirmed ? 'badge badge-lime' : 'badge badge-yellow'} style={{ fontSize: 10 }}>
                    {r.confirmed ? 'READY' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
