import { describe, it, expect } from 'vitest';
import { generateTemplatePlan } from '@/lib/templateFallback';
import { GeneratedPlanSchema } from '@/lib/validators';
import type { EventFormInput } from '@/lib/types';

const BASE_INPUT: EventFormInput = {
  eventType: 'Wedding',
  guestCount: 100,
  city: 'Delhi',
  cityTier: 'Metro',
  totalBudget: 300000,
  currency: 'INR',
  eventDate: '2099-12-31',
  vibeAndPreferences: 'Traditional, grand, 500 guests.',
};

describe('Template Fallback Plan', () => {
  it('generates a valid plan that passes GeneratedPlanSchema', () => {
    const plan = generateTemplatePlan(BASE_INPUT);
    // Remove isTemplateFallback for schema check (it is optional)
    const result = GeneratedPlanSchema.safeParse(plan);
    if (!result.success) console.error(result.error.issues);
    expect(result.success).toBe(true);
  });

  it('budget categories sum exactly to total budget', () => {
    const plan = generateTemplatePlan(BASE_INPUT);
    const sum = plan.budget.reduce((s, b) => s + b.allocatedAmount, 0);
    expect(sum).toBe(BASE_INPUT.totalBudget);
  });

  it('marks plan as template fallback', () => {
    const plan = generateTemplatePlan(BASE_INPUT);
    expect(plan.isTemplateFallback).toBe(true);
  });

  it('produces exactly 7 budget categories', () => {
    const plan = generateTemplatePlan(BASE_INPUT);
    expect(plan.budget.length).toBe(7);
  });

  it('produces 3 themes', () => {
    const plan = generateTemplatePlan(BASE_INPUT);
    expect(plan.themes.length).toBe(3);
  });

  it('works for Birthday event type', () => {
    const plan = generateTemplatePlan({ ...BASE_INPUT, eventType: 'Birthday' });
    const sum = plan.budget.reduce((s, b) => s + b.allocatedAmount, 0);
    expect(sum).toBe(BASE_INPUT.totalBudget);
  });

  it('works for Community Event type', () => {
    const plan = generateTemplatePlan({ ...BASE_INPUT, eventType: 'Community Event' });
    const sum = plan.budget.reduce((s, b) => s + b.allocatedAmount, 0);
    expect(sum).toBe(BASE_INPUT.totalBudget);
  });
});
