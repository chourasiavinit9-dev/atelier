// Template fallback plan — generated locally when Gemini is unavailable
import type { EventFormInput, GeneratedPlan } from './types';
import { BUDGET_CATEGORIES } from './constants';
import { allocateBudget } from './budgetLogic';

function makeId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function addMonths(base: Date, months: number): string {
  const d = new Date(base);
  d.setMonth(d.getMonth() - months);
  return d.toISOString().split('T')[0]!;
}

export function generateTemplatePlan(input: EventFormInput): GeneratedPlan {
  const eventDate = new Date(input.eventDate);
  const amounts = allocateBudget(input.totalBudget, input.eventType);
  const budget = BUDGET_CATEGORIES.map((cat, i) => ({
    category: cat,
    allocatedAmount: amounts[i] ?? 0,
    assumptions: ['Template estimate — replace with real quotes'],
    confidence: 'Low' as const,
    items: [
      {
        id: makeId(),
        category: cat,
        description: `Estimated ${cat}`,
        estimatedCost: amounts[i] ?? 0,
        actualCost: null,
      },
    ],
  }));

  const timeline = [
    { title: 'Set event goals and guest list', category: 'Planning', months: 6, priority: 'High' as const },
    { title: 'Book venue', category: 'Venue', months: 5, priority: 'High' as const },
    { title: 'Hire caterer', category: 'Catering', months: 4, priority: 'High' as const },
    { title: 'Book photographer', category: 'Photography', months: 3, priority: 'Medium' as const },
    { title: 'Send invitations', category: 'Invitations', months: 2, priority: 'Medium' as const },
    { title: 'Confirm all vendors', category: 'Vendors', months: 1, priority: 'High' as const },
    { title: 'Final headcount & seating plan', category: 'Logistics', months: 0, priority: 'High' as const },
  ].map((t) => ({
    id: makeId(),
    title: t.title,
    category: t.category,
    dueDate: addMonths(eventDate, t.months),
    priority: t.priority,
    status: 'Pending' as const,
  }));

  const vendors = [
    { category: 'Venue', lead: '6 months', qs: ['What is included in the hire fee?', 'What is the cancellation policy?', 'Is parking available?'], range: `${input.currency} ${Math.round(amounts[0]! * 0.8)}–${amounts[0]}` },
    { category: 'Catering', lead: '4 months', qs: ['Do you accommodate dietary restrictions?', 'Can we do a tasting session?', 'What is the per-head rate?'], range: `${input.currency} ${Math.round(amounts[1]! * 0.8)}–${amounts[1]}` },
    { category: 'Photography', lead: '4 months', qs: ['Can we see a full event gallery?', 'How are photos delivered?', 'Do you have backup equipment?'], range: `${input.currency} ${Math.round(amounts[3]! * 0.8)}–${amounts[3]}` },
  ].map((v) => ({
    id: makeId(),
    category: v.category,
    bookingLeadTime: v.lead,
    vettingQuestions: v.qs.map((q) => ({ id: makeId(), question: q, checked: false })),
    estimatedPriceRange: v.range,
    userNotes: '',
    status: 'Researching' as const,
  }));

  const themes = [
    { name: 'Classic Elegance', desc: 'Timeless, formal, understated luxury', colors: [{ hex: '#1a1a2e', label: 'Midnight Navy' }, { hex: '#c9a84c', label: 'Champagne Gold' }] },
    { name: 'Garden Fresh', desc: 'Natural, floral, outdoor-inspired', colors: [{ hex: '#2d6a4f', label: 'Forest Green' }, { hex: '#f8f9fa', label: 'Ivory White' }] },
    { name: 'Modern Minimal', desc: 'Clean, contemporary, monochromatic', colors: [{ hex: '#212529', label: 'Charcoal' }, { hex: '#e9ecef', label: 'Light Grey' }] },
  ].map((t) => ({
    id: makeId(),
    name: t.name,
    description: t.desc,
    colorPalette: t.colors.map((c) => ({ hex: c.hex, label: c.label, contrastRatio: 4.5 })),
    decorMotifs: ['Florals', 'Candles', 'Draping'],
    menuHighlights: ['Seasonal appetizers', 'Main course', 'Dessert station'],
    guestEngagementIdeas: ['Photo booth', 'Live music', 'Games area'],
    budgetTier: input.cityTier,
  }));

  return { budget, timeline, vendors, themes, isTemplateFallback: true };
}
