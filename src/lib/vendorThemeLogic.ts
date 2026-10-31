// Vendor and theme assembly from AI output
import type { AiOutput } from './validators';
import type { EventTheme, VendorCard } from './types';

function makeId(): string {
  return Math.random().toString(36).slice(2, 11);
}

// Compute relative luminance from hex
function hexToLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const linearize = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

// WCAG 2.1 contrast ratio against white (#FFFFFF)
export function contrastRatioAgainstWhite(hex: string): number {
  const L = hexToLuminance(hex);
  const white = 1.0;
  return parseFloat(((white + 0.05) / (L + 0.05)).toFixed(2));
}

export function buildVendors(aiOutput: AiOutput): VendorCard[] {
  return aiOutput.vendors.map((v) => ({
    id: makeId(),
    category: v.category,
    bookingLeadTime: v.bookingLeadTime,
    vettingQuestions: v.vettingQuestions.map((q) => ({
      id: makeId(),
      question: q,
      checked: false,
    })),
    estimatedPriceRange: v.estimatedPriceRange,
    userNotes: '',
    status: 'Researching' as const,
  }));
}

export function buildThemes(aiOutput: AiOutput, budgetTier: string): EventTheme[] {
  return aiOutput.themes.map((t) => ({
    id: makeId(),
    name: t.name,
    description: t.description,
    colorPalette: t.colorPalette.map((c) => ({
      hex: c.hex,
      label: c.label,
      contrastRatio: contrastRatioAgainstWhite(c.hex),
    })),
    decorMotifs: t.decorMotifs,
    menuHighlights: t.menuHighlights,
    guestEngagementIdeas: t.guestEngagementIdeas,
    budgetTier,
  }));
}
