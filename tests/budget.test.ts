import { describe, it, expect } from 'vitest';
import { allocateBudget, computeVariance } from '@/lib/budgetLogic';
import { BUDGET_CATEGORIES } from '@/lib/constants';
import type { EventType } from '@/lib/types';

const EVENT_TYPES: EventType[] = ['Wedding', 'Birthday', 'Community Event'];

describe('Budget Allocation — Largest Remainder Method', () => {
  it('sums exactly to total for Wedding', () => {
    const amounts = allocateBudget(500000, 'Wedding');
    expect(amounts.reduce((a, b) => a + b, 0)).toBe(500000);
  });

  it('sums exactly to total for Birthday', () => {
    const amounts = allocateBudget(100000, 'Birthday');
    expect(amounts.reduce((a, b) => a + b, 0)).toBe(100000);
  });

  it('sums exactly to total for Community Event', () => {
    const amounts = allocateBudget(250000, 'Community Event');
    expect(amounts.reduce((a, b) => a + b, 0)).toBe(250000);
  });

  it('produces exactly 7 categories', () => {
    expect(allocateBudget(100000, 'Wedding').length).toBe(7);
  });

  it('all amounts are non-negative integers', () => {
    const amounts = allocateBudget(99999, 'Birthday');
    for (const a of amounts) {
      expect(a).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(a)).toBe(true);
    }
  });

  it('handles odd totals (ensures rounding correctness)', () => {
    for (const et of EVENT_TYPES) {
      const total = 123457;
      const amounts = allocateBudget(total, et);
      expect(amounts.reduce((a, b) => a + b, 0)).toBe(total);
    }
  });

  it('handles large totals (1 crore)', () => {
    const amounts = allocateBudget(10_000_000, 'Wedding');
    expect(amounts.reduce((a, b) => a + b, 0)).toBe(10_000_000);
  });

  it('handles small budget (INR 10,000)', () => {
    const amounts = allocateBudget(10000, 'Birthday');
    expect(amounts.reduce((a, b) => a + b, 0)).toBe(10000);
  });

  it('10 random totals across all event types all sum correctly', () => {
    const totals = [50000, 75001, 200000, 333333, 500000, 1000000, 2500000, 99999, 1234567, 7777777];
    for (const et of EVENT_TYPES) {
      for (const total of totals) {
        const amounts = allocateBudget(total, et);
        expect(amounts.reduce((a, b) => a + b, 0)).toBe(total);
      }
    }
  });
});

describe('Variance Computation', () => {
  it('detects Over Budget when actual exceeds allocated', () => {
    const alloc = { category: BUDGET_CATEGORIES[0]!, allocatedAmount: 1000, assumptions: [], confidence: 'Medium' as const, items: [{ id: '1', category: BUDGET_CATEGORIES[0]!, description: 'x', estimatedCost: 1000, actualCost: 1500 }] };
    const v = computeVariance(alloc);
    expect(v.label).toBe('Over Budget');
    expect(v.amount).toBe(500);
  });

  it('detects Under Budget when actual is less than allocated', () => {
    const alloc = { category: BUDGET_CATEGORIES[0]!, allocatedAmount: 1000, assumptions: [], confidence: 'Medium' as const, items: [{ id: '1', category: BUDGET_CATEGORIES[0]!, description: 'x', estimatedCost: 1000, actualCost: 800 }] };
    const v = computeVariance(alloc);
    expect(v.label).toBe('Under Budget');
    expect(v.amount).toBe(200);
  });

  it('detects On Budget when actual equals allocated', () => {
    const alloc = { category: BUDGET_CATEGORIES[0]!, allocatedAmount: 1000, assumptions: [], confidence: 'Medium' as const, items: [{ id: '1', category: BUDGET_CATEGORIES[0]!, description: 'x', estimatedCost: 1000, actualCost: 1000 }] };
    const v = computeVariance(alloc);
    expect(v.label).toBe('On Budget');
  });

  it('handles zero actual cost (fully under)', () => {
    const alloc = { category: BUDGET_CATEGORIES[0]!, allocatedAmount: 5000, assumptions: [], confidence: 'Medium' as const, items: [] };
    const v = computeVariance(alloc);
    expect(v.label).toBe('Under Budget');
    expect(v.amount).toBe(5000);
  });
});
