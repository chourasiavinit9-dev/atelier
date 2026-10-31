import { describe, it, expect } from 'vitest';
import { EventFormInputSchema } from '@/lib/validators';

function getFutureDate(daysAhead = 30): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0]!;
}

const VALID_INPUT = {
  eventType: 'Wedding' as const,
  guestCount: 150,
  city: 'Mumbai',
  cityTier: 'Metro' as const,
  totalBudget: 500000,
  currency: 'INR' as const,
  eventDate: getFutureDate(30),
  vibeAndPreferences: 'Elegant and romantic outdoor ceremony.',
};

describe('Validators — EventFormInputSchema', () => {
  it('accepts a valid input', () => {
    expect(EventFormInputSchema.safeParse(VALID_INPUT).success).toBe(true);
  });

  it('rejects negative budget', () => {
    const result = EventFormInputSchema.safeParse({ ...VALID_INPUT, totalBudget: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects zero budget', () => {
    const result = EventFormInputSchema.safeParse({ ...VALID_INPUT, totalBudget: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects zero guest count', () => {
    const result = EventFormInputSchema.safeParse({ ...VALID_INPUT, guestCount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects guest count above max (5001)', () => {
    const result = EventFormInputSchema.safeParse({ ...VALID_INPUT, guestCount: 5001 });
    expect(result.success).toBe(false);
  });

  it('accepts max guest count (5000)', () => {
    const result = EventFormInputSchema.safeParse({ ...VALID_INPUT, guestCount: 5000 });
    expect(result.success).toBe(true);
  });

  it('rejects past event date', () => {
    const result = EventFormInputSchema.safeParse({ ...VALID_INPUT, eventDate: '2000-01-01' });
    expect(result.success).toBe(false);
  });

  it('rejects vibe text exceeding 500 chars', () => {
    const longText = 'a'.repeat(501);
    const result = EventFormInputSchema.safeParse({ ...VALID_INPUT, vibeAndPreferences: longText });
    expect(result.success).toBe(false);
  });

  it('accepts vibe text at exactly 500 chars', () => {
    const exactText = 'a'.repeat(500);
    const result = EventFormInputSchema.safeParse({ ...VALID_INPUT, vibeAndPreferences: exactText });
    expect(result.success).toBe(true);
  });

  it('strips control characters from text fields', () => {
    const result = EventFormInputSchema.safeParse({
      ...VALID_INPUT,
      vibeAndPreferences: 'Hello\x00World\x1F',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.vibeAndPreferences).not.toContain('\x00');
    }
  });

  it('rejects injection characters test — strips control chars and validates length', () => {
    const injection = '\x00\x01\x02\x03'.repeat(200); // 800 control chars = empty after strip
    const result = EventFormInputSchema.safeParse({ ...VALID_INPUT, vibeAndPreferences: injection });
    // After stripping control chars, becomes empty string — should succeed (0 <= 500)
    expect(result.success).toBe(true);
  });

  it('rejects empty city', () => {
    const result = EventFormInputSchema.safeParse({ ...VALID_INPUT, city: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid event type', () => {
    const result = EventFormInputSchema.safeParse({ ...VALID_INPUT, eventType: 'Party' });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const { eventType, ...rest } = VALID_INPUT;
    void eventType;
    const result = EventFormInputSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});
