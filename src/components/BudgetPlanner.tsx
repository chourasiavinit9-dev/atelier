'use client';
import type { BudgetCategoryAllocation, BudgetLineItem } from '@/lib/types';
import { AI_DISCLAIMER } from '@/lib/constants';
import { computeVariance } from '@/lib/budgetLogic';
import { TrendingUp, TrendingDown, Minus, Plus, Trash2, AlertTriangle } from 'lucide-react';

interface Props {
  allocations: BudgetCategoryAllocation[];
  currency: string;
  onChange: (allocations: BudgetCategoryAllocation[]) => void;
}

function fmt(n: number, currency: string) {
  return `${currency} ${n.toLocaleString('en-IN')}`;
}

function makeId() {
  return Math.random().toString(36).slice(2, 11);
}

function VarianceBadge({ label, amount, currency }: { label: string; amount: number; currency: string }) {
  if (label === 'On Budget') return <span className="badge badge-lime"><Minus size={11} aria-hidden="true" /> ON BUDGET</span>;
  if (label === 'Under Budget') return <span className="badge badge-purple"><TrendingDown size={11} aria-hidden="true" /> UNDER {fmt(amount, currency)}</span>;
  return <span className="badge badge-red"><TrendingUp size={11} aria-hidden="true" /> OVER {fmt(amount, currency)}</span>;
}

function CategoryCard({
  alloc, currency, onUpdate,
}: {
  alloc: BudgetCategoryAllocation;
  currency: string;
  onUpdate: (updated: BudgetCategoryAllocation) => void;
}) {
  const variance = computeVariance(alloc);
  const totalActual = alloc.items.reduce((s, i) => s + (i.actualCost ?? 0), 0);
  const progress = Math.min(100, Math.round((totalActual / alloc.allocatedAmount) * 100));

  function updateItem(id: string, patch: Partial<BudgetLineItem>) {
    onUpdate({ ...alloc, items: alloc.items.map((i) => i.id === id ? { ...i, ...patch } : i) });
  }

  function addItem() {
    const newItem: BudgetLineItem = { id: makeId(), category: alloc.category, description: 'New item', estimatedCost: 0, actualCost: 0, isCustom: true };
    onUpdate({ ...alloc, items: [...alloc.items, newItem] });
  }

  function removeItem(id: string) {
    onUpdate({ ...alloc, items: alloc.items.filter((i) => i.id !== id) });
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <h3 style={{ fontWeight: 800, color: 'var(--black)', fontSize: 16, lineHeight: 1.2 }}>{alloc.category}</h3>
          <p style={{ color: 'var(--purple)', fontSize: 18, fontWeight: 800, marginTop: 2, fontFamily: 'var(--mono)' }}>{fmt(alloc.allocatedAmount, currency)}</p>
        </div>
        <VarianceBadge label={variance.label} amount={variance.amount} currency={currency} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--black)', marginBottom: 6, fontWeight: 700, fontFamily: 'var(--mono)' }}>
          <span>SPENT: {fmt(totalActual, currency)}</span>
          <span>{progress}%</span>
        </div>
        <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${alloc.category} budget usage ${progress}%`} className="progress-track">
          <div className="progress-bar"
            style={{ width: `${Math.min(progress, 100)}%`, background: progress > 100 ? '#EF4444' : progress > 80 ? 'var(--lime-dark)' : 'var(--lime)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 92px 92px 36px', gap: 6, fontSize: 11, color: 'var(--black)', fontWeight: 800, padding: '0 2px', fontFamily: 'var(--mono)' }}>
          <span>ITEM</span><span style={{ textAlign: 'center' }}>EST</span><span style={{ textAlign: 'center' }}>ACTUAL</span><span />
        </div>
        {alloc.items.map((item) => (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 92px 92px 36px', gap: 6, alignItems: 'center' }}>
            <input value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })}
              aria-label="Item description" data-testid={`budget-item-desc-${item.id}`}
              className="input" style={{ fontSize: 13, padding: '6px 10px', minHeight: 36, fontWeight: 600 }} />
            <input type="number" min={0} value={item.estimatedCost}
              onChange={(e) => updateItem(item.id, { estimatedCost: Number(e.target.value) })}
              aria-label="Estimated cost" data-testid={`budget-item-est-${item.id}`}
              className="input" style={{ fontSize: 13, padding: '6px 8px', minHeight: 36, color: 'var(--purple)', fontWeight: 800, fontFamily: 'var(--mono)' }} />
            <input type="number" min={0} value={item.actualCost ?? ''}
              onChange={(e) => updateItem(item.id, { actualCost: Number(e.target.value) })}
              aria-label="Actual cost" data-testid={`budget-item-actual-${item.id}`}
              className="input" style={{ fontSize: 13, padding: '6px 8px', minHeight: 36, color: '#047857', fontWeight: 800, fontFamily: 'var(--mono)' }} />
            <button onClick={() => removeItem(item.id)} aria-label={`Remove ${item.description}`}
              data-testid={`budget-item-remove-${item.id}`}
              className="btn-outline" style={{ padding: 4, minHeight: 36, color: '#DC2626' }}>
              <Trash2 size={13} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <button onClick={addItem} data-testid={`budget-add-item-${alloc.category.replace(/\s+/g,'-')}`}
        className="btn-outline" style={{ fontSize: 12, padding: '6px 12px', minHeight: 34, gap: 4 }}>
        <Plus size={13} aria-hidden="true" /> Add custom item
      </button>
    </div>
  );
}

export default function BudgetPlanner({ allocations, currency, onChange }: Props) {
  const total = allocations.reduce((s, a) => s + a.allocatedAmount, 0);
  const totalActual = allocations.reduce((s, a) => s + a.items.reduce((si, i) => si + (i.actualCost ?? 0), 0), 0);

  function updateCategory(updated: BudgetCategoryAllocation) {
    onChange(allocations.map((a) => a.category === updated.category ? updated : a));
  }

  return (
    <section aria-labelledby="budget-heading" aria-live="polite">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <span className="badge badge-purple" style={{ marginBottom: 6 }}>FINANCIAL BREAKDOWN</span>
        <h2 id="budget-heading" className="section-title">Budget Allocation &amp; Tracking</h2>
        <p className="section-subtitle">Real-time spending tracked against algorithmic largest-remainder allocations.</p>
      </div>

      {/* Neobrutalist 3 Metrics Strip */}
      <div className="metric-strip">
        <div className="metric-card purple">
          <div className="metric-label" style={{ color: 'rgba(255,255,255,0.75)' }}>Target Budget</div>
          <div className="metric-value">{fmt(total, currency)}</div>
        </div>
        <div className="metric-card lime">
          <div className="metric-label">Actual Spent</div>
          <div className="metric-value" style={{ color: totalActual > total ? '#DC2626' : 'var(--black)' }}>
            {fmt(totalActual, currency)}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Remaining Balance</div>
          <div className="metric-value" style={{ color: 'var(--purple)' }}>
            {fmt(Math.max(0, total - totalActual), currency)}
          </div>
        </div>
      </div>

      <div className="alert-warn" style={{ marginBottom: 24 }}>
        <AlertTriangle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
        <span>{AI_DISCLAIMER}</span>
      </div>

      <div style={{ display: 'grid', gap: 16 }} className="md:grid-cols-2">
        {allocations.map((alloc) => (
          <CategoryCard key={alloc.category} alloc={alloc} currency={currency} onUpdate={updateCategory} />
        ))}
      </div>
    </section>
  );
}
