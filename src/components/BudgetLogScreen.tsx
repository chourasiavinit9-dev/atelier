'use client';
import { useState } from 'react';
import type { Payment, BudgetCategoryAllocation, PaymentMethod, BudgetCategory } from '@/lib/types';
import { Plus, Trash2, Download, CreditCard } from 'lucide-react';

interface Props {
  payments: Payment[];
  onChange: (payments: Payment[]) => void;
  currency: string;
  budget: BudgetCategoryAllocation[];
}

function makeId() {
  return Math.random().toString(36).slice(2, 11);
}

const METHODS: PaymentMethod[] = ['Bank transfer', 'Card', 'Cash', 'UPI', 'Cheque'];

export default function BudgetLogScreen({ payments, onChange, currency, budget }: Props) {
  const [newPayee, setNewPayee] = useState('');
  const [newAmount, setNewAmount] = useState<number | ''>('');
  const [newCategory, setNewCategory] = useState<BudgetCategory>(budget[0]?.category ?? 'Venue and booking charges');
  const [newMethod, setNewMethod] = useState<PaymentMethod>('Bank transfer');
  const [newNote, setNewNote] = useState('');

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const totalBudget = budget.reduce((s, b) => s + b.allocatedAmount, 0);

  function addPayment() {
    if (!newPayee.trim() || !newAmount || newAmount <= 0) return;
    const payment: Payment = {
      id: makeId(),
      itemId: makeId(),
      date: new Date().toISOString().split('T')[0]!,
      amount: Number(newAmount),
      paidTo: newPayee.trim(),
      note: newNote.trim() || `${newCategory} payment`,
      method: newMethod,
    };
    onChange([payment, ...payments]);
    setNewPayee('');
    setNewAmount('');
    setNewNote('');
  }

  function removePayment(id: string) {
    onChange(payments.filter((p) => p.id !== id));
  }

  function exportCSV() {
    const header = 'Date,Paid To,Amount,Currency,Method,Notes\n';
    const rows = payments.map((p) => `"${p.date}","${p.paidTo}",${p.amount},"${currency}","${p.method ?? ''}","${p.note}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget-payments-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section aria-labelledby="budgetlog-heading" aria-live="polite">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: 6 }}>PAYMENT AUDIT &amp; LEDGER</span>
          <h2 id="budgetlog-heading" className="section-title">Budget Log &amp; Vendor Payments</h2>
          <p className="section-subtitle">
            Track transaction history, milestone installments, and vendor advance slips.
          </p>
        </div>
        <button onClick={exportCSV} className="btn-outline" style={{ fontSize: 12 }}>
          <Download size={13} aria-hidden="true" /> Export Ledger CSV
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="metric-strip">
        <div className="metric-card purple">
          <div className="metric-label" style={{ color: 'rgba(255,255,255,0.75)' }}>Total Budget</div>
          <div className="metric-value">{currency} {totalBudget.toLocaleString()}</div>
        </div>
        <div className="metric-card lime">
          <div className="metric-label">Total Disbursed</div>
          <div className="metric-value">{currency} {totalPaid.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Outstanding Balance</div>
          <div className="metric-value">{currency} {Math.max(0, totalBudget - totalPaid).toLocaleString()}</div>
        </div>
      </div>

      {/* Record Payment Form */}
      <div className="card" style={{ marginBottom: 20, padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CreditCard size={16} color="var(--purple)" />
          <span>Record New Vendor Payment</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            value={newPayee}
            onChange={(e) => setNewPayee(e.target.value)}
            placeholder="Vendor / Payee Name…"
            className="input"
            style={{ fontSize: 13, padding: '6px 10px', minHeight: 38 }}
          />
          <input
            type="number"
            min={1}
            value={newAmount}
            onChange={(e) => setNewAmount(Number(e.target.value) || '')}
            placeholder={`Amount in ${currency}…`}
            className="input"
            style={{ fontSize: 13, padding: '6px 10px', minHeight: 38, fontWeight: 700, fontFamily: 'var(--mono)' }}
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as BudgetCategory)}
            className="input"
            style={{ fontSize: 12, padding: '6px 8px', minHeight: 38, fontWeight: 700 }}
          >
            {budget.map((b) => <option key={b.category} value={b.category}>{b.category}</option>)}
          </select>
          <select
            value={newMethod}
            onChange={(e) => setNewMethod(e.target.value as PaymentMethod)}
            className="input"
            style={{ fontSize: 12, padding: '6px 8px', minHeight: 38 }}
          >
            {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Reference / Transaction ID…"
            className="input"
            style={{ fontSize: 13, padding: '6px 10px', minHeight: 38 }}
          />
          <button
            onClick={addPayment}
            className="btn btn-lime"
            style={{ padding: '6px 14px', minHeight: 38, fontSize: 12 }}
          >
            <Plus size={13} aria-hidden="true" /> Record
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '110px 1fr 130px 140px 1fr 44px',
          gap: 12, padding: '12px 18px', background: 'var(--purple-bg)',
          borderBottom: 'var(--border)', fontSize: 11, fontWeight: 800,
          fontFamily: 'var(--mono)', color: 'var(--black)',
        }}>
          <span>DATE</span>
          <span>PAID TO</span>
          <span>AMOUNT</span>
          <span>METHOD</span>
          <span>REFERENCE / NOTE</span>
          <span />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {payments.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              No payments recorded yet. Record vendor deposits above.
            </div>
          ) : (
            payments.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr 130px 140px 1fr 44px',
                  gap: 12,
                  padding: '12px 18px',
                  alignItems: 'center',
                  borderBottom: i !== payments.length - 1 ? '1px solid #E5E7EB' : 'none',
                }}
              >
                <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{p.date}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--black)' }}>{p.paidTo}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#047857', fontFamily: 'var(--mono)' }}>
                  {currency} {p.amount.toLocaleString()}
                </span>
                <span className="badge badge-purple" style={{ fontSize: 10 }}>{p.method ?? 'Transfer'}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.note}</span>
                <button
                  type="button"
                  onClick={() => removePayment(p.id)}
                  aria-label="Delete payment"
                  className="btn-outline"
                  style={{ padding: 4, minHeight: 32, color: '#DC2626' }}
                >
                  <Trash2 size={13} aria-hidden="true" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
