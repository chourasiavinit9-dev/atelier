'use client';
import { useState } from 'react';
import type { BudgetCategoryAllocation, EventFormInput, BudgetCategory } from '@/lib/types';
import { allocateBudget } from '@/lib/budgetLogic';
import { Sparkles, Calculator, FileText, Check, Plus } from 'lucide-react';
import ToggleButton from '@/components/ToggleButton';

interface Props {
  budget: BudgetCategoryAllocation[];
  formInput: EventFormInput;
  onApplyBudget: (updated: BudgetCategoryAllocation[]) => void;
}

export default function AssistantScreen({ budget, formInput, onApplyBudget }: Props) {
  const [activeTab, setActiveTab] = useState<'whatif' | 'quote'>('whatif');

  // What-If State
  const [simBudget, setSimBudget] = useState(formInput.totalBudget);
  const [simGuests, setSimGuests] = useState(formInput.guestCount);
  const [applied, setApplied] = useState(false);

  // Quote Reader State
  const [quoteCategory, setQuoteCategory] = useState<BudgetCategory>('Catering and refreshments');
  const [quoteVendor, setQuoteVendor] = useState('');
  const [quoteAmount, setQuoteAmount] = useState<number | ''>('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteSaved, setQuoteSaved] = useState(false);

  // Calculate simulated budget allocations
  const simAmounts = allocateBudget(simBudget, formInput.eventType);
  const simulatedBudget: BudgetCategoryAllocation[] = budget.map((b, i) => ({
    ...b,
    allocatedAmount: simAmounts[i] ?? b.allocatedAmount,
  }));

  function handleApplyWhatIf() {
    onApplyBudget(simulatedBudget);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  }

  function handleApplyQuote() {
    if (!quoteAmount || quoteAmount <= 0) return;
    const updated = budget.map((b) => {
      if (b.category !== quoteCategory) return b;
      return {
        ...b,
        items: [
          ...b.items,
          {
            id: Math.random().toString(36).slice(2, 11),
            category: b.category,
            description: `${quoteVendor || 'Scanned Quote'}: ${quoteNotes || 'Verified Quote'}`,
            estimatedCost: Number(quoteAmount),
            actualCost: Number(quoteAmount),
            isCustom: true,
          },
        ],
      };
    });
    onApplyBudget(updated);
    setQuoteSaved(true);
    setTimeout(() => setQuoteSaved(false), 3000);
    setQuoteVendor('');
    setQuoteAmount('');
    setQuoteNotes('');
  }

  return (
    <section aria-labelledby="assistant-heading" aria-live="polite">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <span className="badge badge-purple" style={{ marginBottom: 6 }}>GENAI COPILOT</span>
        <h2 id="assistant-heading" className="section-title">Planning Assistant &amp; Simulation</h2>
        <p className="section-subtitle">
          Interactive What-If budget modeling and vendor quote scanner.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <ToggleButton
          active={activeTab === 'whatif'}
          onClick={() => setActiveTab('whatif')}
          style={{ fontSize: 13, padding: '8px 18px', minHeight: 40 }}
        >
          <Calculator size={15} aria-hidden="true" /> What-If Budget Simulator
        </ToggleButton>
        <ToggleButton
          active={activeTab === 'quote'}
          onClick={() => setActiveTab('quote')}
          style={{ fontSize: 13, padding: '8px 18px', minHeight: 40 }}
        >
          <FileText size={15} aria-hidden="true" /> Vendor Quote Reader
        </ToggleButton>
      </div>

      {/* What-If Simulator Panel */}
      {activeTab === 'whatif' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: '22px 24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>
              Simulate Budget &amp; Guest Changes
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 14, alignItems: 'center' }}>
              <div>
                <label className="label">Total Budget ({formInput.currency})</label>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={simBudget}
                  onChange={(e) => setSimBudget(Number(e.target.value) || 0)}
                  className="input"
                  style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--mono)' }}
                />
              </div>
              <div>
                <label className="label">Estimated Guests</label>
                <input
                  type="number"
                  min={10}
                  max={5000}
                  value={simGuests}
                  onChange={(e) => setSimGuests(Number(e.target.value) || 0)}
                  className="input"
                  style={{ fontSize: 15, fontWeight: 800 }}
                />
              </div>
              <div style={{ paddingTop: 20 }}>
                <button
                  onClick={handleApplyWhatIf}
                  className="btn btn-lime"
                  style={{ padding: '10px 20px', minHeight: 46 }}
                >
                  {applied ? <Check size={16} /> : <Sparkles size={16} />}
                  {applied ? 'Applied to Plan!' : 'Apply Scenario'}
                </button>
              </div>
            </div>
          </div>

          {/* Allocation Comparison Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 140px 140px 120px',
              gap: 12, padding: '12px 18px', background: 'var(--purple-bg)',
              borderBottom: 'var(--border)', fontSize: 11, fontWeight: 800,
              fontFamily: 'var(--mono)',
            }}>
              <span>CATEGORY</span>
              <span>CURRENT ALLOCATION</span>
              <span>SIMULATED ALLOCATION</span>
              <span>DIFFERENCE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {budget.map((b, i) => {
                const simVal = simAmounts[i] ?? b.allocatedAmount;
                const diff = simVal - b.allocatedAmount;
                return (
                  <div
                    key={b.category}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 140px 140px 120px',
                      gap: 12, padding: '12px 18px', alignItems: 'center',
                      borderBottom: i !== budget.length - 1 ? '1px solid #E5E7EB' : 'none',
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{b.category}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>
                      {formInput.currency} {b.allocatedAmount.toLocaleString()}
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 800, color: 'var(--purple)' }}>
                      {formInput.currency} {simVal.toLocaleString()}
                    </span>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 800,
                      color: diff > 0 ? '#059669' : diff < 0 ? '#DC2626' : 'var(--muted)',
                    }}>
                      {diff > 0 ? `+${diff.toLocaleString()}` : diff < 0 ? diff.toLocaleString() : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quote Reader Panel */}
      {activeTab === 'quote' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
            Vendor Quote &amp; Estimate Scanner
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
            Enter vendor quote details to audit pricing and reconcile against your budget line items.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
            <div>
              <label className="label">Category</label>
              <select
                value={quoteCategory}
                onChange={(e) => setQuoteCategory(e.target.value as BudgetCategory)}
                className="input"
                style={{ fontWeight: 800 }}
              >
                {budget.map((b) => <option key={b.category} value={b.category}>{b.category}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Vendor Name / Business</label>
              <input
                type="text"
                value={quoteVendor}
                onChange={(e) => setQuoteVendor(e.target.value)}
                placeholder="e.g. Royal Banquet &amp; Lawns"
                className="input"
              />
            </div>
            <div>
              <label className="label">Quoted Amount ({formInput.currency})</label>
              <input
                type="number"
                min={0}
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(Number(e.target.value) || '')}
                placeholder="Total quote figure…"
                className="input"
                style={{ fontWeight: 800, fontFamily: 'var(--mono)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="label">Scope of Services &amp; Items Included</label>
            <textarea
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Includes 3-course dinner, cutlery, 10 service staff, welcome mocktails…"
              className="input"
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            onClick={handleApplyQuote}
            disabled={!quoteAmount || quoteAmount <= 0}
            className="btn btn-lime"
            style={{ fontSize: 14, padding: '10px 22px' }}
          >
            {quoteSaved ? <Check size={16} /> : <Plus size={16} />}
            {quoteSaved ? 'Added to Budget Line Items!' : 'Add Quote as Confirmed Item'}
          </button>
        </div>
      )}
    </section>
  );
}
