import { describe, it, expect } from 'vitest';
import { contrastRatioAgainstWhite } from '@/lib/vendorThemeLogic';

describe('Accessibility — WCAG Contrast Ratios', () => {
  it('black (#000000) has maximum contrast against white (21:1)', () => {
    const ratio = contrastRatioAgainstWhite('#000000');
    expect(ratio).toBeGreaterThanOrEqual(21);
  });

  it('white (#ffffff) has minimum contrast against white (1:1)', () => {
    const ratio = contrastRatioAgainstWhite('#ffffff');
    expect(ratio).toBeLessThanOrEqual(1.1);
  });

  it('dark navy (#1a1a2e) passes AA for normal text (>= 4.5:1)', () => {
    const ratio = contrastRatioAgainstWhite('#1a1a2e');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('forest green (#2d6a4f) passes AA for normal text (>= 4.5:1)', () => {
    const ratio = contrastRatioAgainstWhite('#2d6a4f');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('charcoal (#212529) passes AA (>= 4.5:1)', () => {
    const ratio = contrastRatioAgainstWhite('#212529');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('light grey (#e9ecef) fails AA for normal text (< 4.5:1)', () => {
    const ratio = contrastRatioAgainstWhite('#e9ecef');
    expect(ratio).toBeLessThan(4.5);
  });

  it('returns a numeric contrast ratio', () => {
    const ratio = contrastRatioAgainstWhite('#ff5733');
    expect(typeof ratio).toBe('number');
    expect(ratio).toBeGreaterThan(0);
  });
});
