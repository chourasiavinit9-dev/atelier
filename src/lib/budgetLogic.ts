// Budget allocation logic — deterministic, testable, largest-remainder method
import { BUDGET_CATEGORIES, BUDGET_PERCENTAGES } from './constants';
import type { BudgetCategory, BudgetCategoryAllocation, BudgetLineItem, EventType } from './types';
import type { AiOutput } from './validators';

// Distribute total using largest-remainder method so sum === total exactly
export function allocateBudget(total: number, eventType: EventType): number[] {
  const percentages = BUDGET_PERCENTAGES[eventType];
  const rawAmounts = percentages.map((p) => (p / 100) * total);
  const floored = rawAmounts.map(Math.floor);
  const remainder = total - floored.reduce((a, b) => a + b, 0);
  const fractionalParts = rawAmounts.map((v, i) => ({ i, frac: v - floored[i]! }));
  fractionalParts.sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder; k++) {
    floored[fractionalParts[k]!.i]! += 1;
  }
  return floored;
}

// Reconcile AI line items to match the deterministic category totals
function reconcileItems(
  items: BudgetLineItem[],
  categoryTotal: number
): BudgetLineItem[] {
  const rawSum = items.reduce((s, item) => s + item.estimatedCost, 0);
  if (rawSum === 0) return items;
  const scale = categoryTotal / rawSum;
  const scaled = items.map((item) => ({
    ...item,
    estimatedCost: Math.round(item.estimatedCost * scale),
  }));
  // Fix rounding on last item
  const scaledSum = scaled.reduce((s, item) => s + item.estimatedCost, 0);
  const diff = categoryTotal - scaledSum;
  if (scaled.length > 0) scaled[scaled.length - 1]!.estimatedCost += diff;
  return scaled;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 11);
}

// Build full BudgetCategoryAllocation from AI output + deterministic totals
export function buildBudgetAllocations(
  aiOutput: AiOutput,
  total: number,
  eventType: EventType
): BudgetCategoryAllocation[] {
  const amounts = allocateBudget(total, eventType);

  return BUDGET_CATEGORIES.map((category: BudgetCategory, idx: number) => {
    const allocatedAmount = amounts[idx] ?? 0;
    const aiCategory = aiOutput.budget.find((b) => b.category === category);
    const rawItems: BudgetLineItem[] = (aiCategory?.items ?? []).map((item) => ({
      id: makeId(),
      category,
      description: item.description,
      estimatedCost: item.estimatedCost,
      actualCost: null,
    }));
    const items = reconcileItems(rawItems, allocatedAmount);
    const assumptions = aiCategory?.assumptions ?? [];
    const confidence = aiCategory?.confidence ?? 'Medium';
    return { category, allocatedAmount, items, assumptions, confidence };
  });
}

// Compute per-category variance
export function computeVariance(category: BudgetCategoryAllocation): {
  label: 'Under Budget' | 'On Budget' | 'Over Budget';
  amount: number;
} {
  const actual = category.items.reduce((s, i) => s + (i.actualCost ?? i.estimatedCost), 0);
  const diff = category.allocatedAmount - actual;
  if (diff > 0) return { label: 'Under Budget', amount: diff };
  if (diff < 0) return { label: 'Over Budget', amount: Math.abs(diff) };
  return { label: 'On Budget', amount: 0 };
}
