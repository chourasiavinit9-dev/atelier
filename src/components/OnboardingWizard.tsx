'use client';
import { useState, useId } from 'react';
import { EventFormInputSchema } from '@/lib/validators';
import type { EventFormInput } from '@/lib/types';
import { Calendar, Users, MapPin, Wallet, Sparkles, ArrowRight, Heart, PartyPopper, Globe2 } from 'lucide-react';

interface Props {
  onSubmit: (input: EventFormInput) => void;
  isLoading: boolean;
}

type FieldErrors = Partial<Record<keyof EventFormInput, string>>;

const EVENT_TYPES = ['Wedding', 'Birthday', 'Community Event'] as const;
const CITY_TIERS = ['Metro', 'Tier-2', 'Tier-3'] as const;
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'] as const;

const EVENT_ICONS = { Wedding: Heart, Birthday: PartyPopper, 'Community Event': Globe2 };

function getTomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0]!;
}

// Reusable field wrapper
function Field({ label, id, error, errId, children }: { label: React.ReactNode; id: string; error?: string; errId: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error && <p id={errId} role="alert" className="field-error">{error}</p>}
    </div>
  );
}

export default function OnboardingWizard({ onSubmit, isLoading }: Props) {
  const uid = useId();
  const [form, setForm] = useState<Partial<EventFormInput>>({
    eventType: 'Wedding', guestCount: 100, cityTier: 'Metro',
    currency: 'INR', totalBudget: 500000,
    eventDate: getTomorrowIso(), city: '', vibeAndPreferences: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleChange<K extends keyof EventFormInput>(key: K, value: EventFormInput[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = EventFormInputSchema.safeParse(form);
    if (!result.success) {
      const fe: FieldErrors = {};
      for (const issue of result.error.issues) {
        const k = issue.path[0] as keyof EventFormInput;
        if (k && !fe[k]) fe[k] = issue.message;
      }
      setErrors(fe); return;
    }
    onSubmit(result.data);
  }

  const fid = (f: keyof EventFormInput) => `${uid}-${f}`;
  const eid = (f: keyof EventFormInput) => `${uid}-${f}-err`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--purple-bg)' }}>
      {/* ── Left panel — hero ── */}
      <div style={{
        width: '44%', background: 'var(--black)', padding: '48px 40px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        borderRight: 'var(--border)',
      }} className="hidden lg:flex">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: 'var(--lime)', color: 'var(--black)',
              fontWeight: 800, fontSize: '1rem', padding: '0.4rem 0.85rem',
              border: 'var(--border)', borderRadius: 6, boxShadow: '2px 2px 0 var(--black)',
              fontFamily: 'var(--font)',
            }}>⚡ ATELIER</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', fontFamily: 'var(--mono)' }}>
              Orchestrate &amp; Plan
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.25)',
            padding: '0.3rem 0.8rem', borderRadius: 9999, fontSize: '0.74rem',
            fontWeight: 700, color: '#fff', fontFamily: 'var(--mono)',
          }}>
            <span className="pulse-dot" />
            <span>100% LOCAL PRIVACY</span>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ margin: 'auto 0' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--lime)', color: 'var(--black)', border: 'var(--border)',
            boxShadow: 'var(--shadow)', borderRadius: 9999, padding: '0.35rem 1rem',
            fontSize: '0.78rem', fontWeight: 800, marginBottom: '1.25rem',
            textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--mono)',
          }}>
            ⚡ GenAI Planning Assistant
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 4.2vw, 4rem)', fontWeight: 800, color: '#fff',
            lineHeight: 1.06, letterSpacing: '-0.04em', marginBottom: '1.25rem',
          }}>
            Plan Your<br />
            <span style={{ color: 'var(--lime)' }}>Perfect Event.</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: 400, marginBottom: '2rem' }}>
            Instant budgets, backward-planned timelines, vendor vetting checklists, and personalized theme concepts.
          </p>

          {/* Feature Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { title: 'Smart Budget', desc: '7 categories reconciled' },
              { title: 'Task Timeline', desc: 'Reverse-scheduled' },
              { title: 'Vendor Vetting', desc: 'Critical questions & leads' },
              { title: 'Theme Studio', desc: 'WCAG contrast audited' },
            ].map((f) => (
              <div key={f.title} style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: 10,
                padding: '12px 14px',
              }}>
                <div style={{ fontWeight: 800, color: 'var(--lime)', fontSize: 13, fontFamily: 'var(--mono)' }}>⚡ {f.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '8px 12px', fontSize: 11, color: 'rgba(255,255,255,0.4)',
          fontFamily: 'var(--mono)',
        }}>
          💡 Estimates only. No auto-send, no silent modifications.
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ width: '100%', maxWidth: 540, boxShadow: 'var(--shadow-lg)', padding: '2.25rem 2rem' }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }} className="lg:hidden">
            <span style={{
              background: 'var(--lime)', color: 'var(--black)',
              fontWeight: 800, fontSize: '0.95rem', padding: '0.35rem 0.75rem',
              border: 'var(--border)', borderRadius: 6, boxShadow: '2px 2px 0 var(--black)',
            }}>⚡ ATELIER</span>
            <span className="badge badge-purple">100% LOCAL</span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <span className="badge badge-purple" style={{ marginBottom: 8 }}>CONFIGURATOR</span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--black)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Configure Event
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4, fontFamily: 'var(--font)' }}>
              Set your target headcounts and budget parameters.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <section aria-labelledby="wizard-heading" id="wizard-heading" style={{ display: 'none' }}>New event details</section>

            {/* Event Type */}
            <fieldset style={{ border: 'none', padding: 0, margin: '0 0 20px' }}>
              <legend className="label">
                <Sparkles size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} aria-hidden="true" />
                Select Event Type
              </legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {EVENT_TYPES.map((type) => {
                  const Icon = EVENT_ICONS[type];
                  const active = form.eventType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      data-testid={`wizard-type-${type}`}
                      onClick={() => handleChange('eventType', type)}
                      aria-pressed={active}
                      style={{
                        minHeight: 68, padding: '10px 6px',
                        border: 'var(--border)',
                        borderRadius: 10,
                        background: active ? 'var(--lime)' : 'var(--white)',
                        color: 'var(--black)',
                        cursor: 'pointer', fontFamily: 'var(--font)',
                        fontWeight: 800, fontSize: 13,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                        boxShadow: active ? '4px 4px 0px var(--black)' : '2px 2px 0px var(--black)',
                        transform: active ? 'translate(-2px, -2px)' : 'none',
                        transition: 'transform 0.12s, box-shadow 0.12s',
                      }}
                    >
                      <Icon size={18} aria-hidden="true" />
                      {type}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Guests & Budget */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <Field label={<><Users size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} aria-hidden="true" />Guests</>} id={fid('guestCount')} error={errors.guestCount} errId={eid('guestCount')}>
                <input
                  id={fid('guestCount')} data-testid="wizard-guest-count"
                  type="number" min={1} max={5000}
                  value={form.guestCount ?? ''}
                  onChange={(e) => handleChange('guestCount', Number(e.target.value))}
                  aria-describedby={errors.guestCount ? eid('guestCount') : undefined}
                  aria-invalid={!!errors.guestCount}
                  className="input"
                />
              </Field>
              <div>
                <label className="label"><Wallet size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} aria-hidden="true" />Budget</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <select
                    value={form.currency} onChange={(e) => handleChange('currency', e.target.value as EventFormInput['currency'])}
                    aria-label="Currency" data-testid="wizard-currency"
                    className="input" style={{ width: 80, padding: '0.75rem 0.5rem', fontWeight: 800 }}
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    id={fid('totalBudget')} data-testid="wizard-budget"
                    type="number" min={1}
                    value={form.totalBudget ?? ''}
                    onChange={(e) => handleChange('totalBudget', Number(e.target.value))}
                    aria-describedby={errors.totalBudget ? eid('totalBudget') : undefined}
                    aria-invalid={!!errors.totalBudget}
                    className="input" style={{ flex: 1, fontWeight: 700 }}
                  />
                </div>
                {errors.totalBudget && <p id={eid('totalBudget')} role="alert" className="field-error">{errors.totalBudget}</p>}
              </div>
            </div>

            {/* City & Tier */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <Field label={<><MapPin size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} aria-hidden="true" />City</>} id={fid('city')} error={errors.city} errId={eid('city')}>
                <input
                  id={fid('city')} data-testid="wizard-city"
                  type="text" value={form.city ?? ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g. Mumbai"
                  aria-describedby={errors.city ? eid('city') : undefined}
                  aria-invalid={!!errors.city}
                  className="input"
                />
              </Field>
              <Field label="City Tier" id={fid('cityTier')} errId={eid('cityTier')}>
                <select
                  id={fid('cityTier')} data-testid="wizard-city-tier"
                  value={form.cityTier}
                  onChange={(e) => handleChange('cityTier', e.target.value as EventFormInput['cityTier'])}
                  className="input"
                  style={{ fontWeight: 700 }}
                >
                  {CITY_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>

            {/* Date */}
            <div style={{ marginBottom: 20 }}>
              <Field label={<><Calendar size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} aria-hidden="true" />Event Date</>} id={fid('eventDate')} error={errors.eventDate} errId={eid('eventDate')}>
                <input
                  id={fid('eventDate')} data-testid="wizard-event-date"
                  type="date" value={form.eventDate ?? ''} min={getTomorrowIso()}
                  onChange={(e) => handleChange('eventDate', e.target.value)}
                  aria-describedby={errors.eventDate ? eid('eventDate') : undefined}
                  aria-invalid={!!errors.eventDate}
                  className="input"
                  style={{ fontWeight: 700 }}
                />
              </Field>
            </div>

            {/* Vibe */}
            <div style={{ marginBottom: 28 }}>
              <label htmlFor={fid('vibeAndPreferences')} className="label">
                <Sparkles size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} aria-hidden="true" />
                Vibe &amp; Preferences
                <span style={{ fontWeight: 600, textTransform: 'none', color: 'var(--muted)', marginLeft: 8 }}>(optional)</span>
              </label>
              <textarea
                id={fid('vibeAndPreferences')} data-testid="wizard-vibe"
                value={form.vibeAndPreferences ?? ''} maxLength={500} rows={3}
                onChange={(e) => handleChange('vibeAndPreferences', e.target.value)}
                placeholder="e.g. Elegant outdoor ceremony, sunset views, live jazz, royal feast…"
                aria-describedby={errors.vibeAndPreferences ? eid('vibeAndPreferences') : undefined}
                aria-invalid={!!errors.vibeAndPreferences}
                className="input" style={{ resize: 'none' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {errors.vibeAndPreferences
                  ? <p id={eid('vibeAndPreferences')} role="alert" className="field-error">{errors.vibeAndPreferences}</p>
                  : <span />}
                <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', fontWeight: 700 }}>
                  {(form.vibeAndPreferences ?? '').length}/500
                </span>
              </div>
            </div>

            <button
              type="submit" disabled={isLoading}
              data-testid="wizard-submit"
              className="btn btn-lime"
              style={{ width: '100%', fontSize: '1.05rem', padding: '0.85rem 1.5rem', minHeight: 52 }}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span style={{ width: 18, height: 18, border: '2.5px solid var(--black)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} aria-hidden="true" />
                  Generating Plan…
                </>
              ) : (
                <>⚡ GENERATE FULL PLAN <ArrowRight size={18} aria-hidden="true" /></>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
