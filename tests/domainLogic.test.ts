/**
 * @file domainLogic.test.ts
 * Unit tests for domain-level business logic: plan health, next actions,
 * ICS calendar generation, ceremony clash detection, and completion computation.
 */
import { describe, it, expect } from 'vitest';
import {
  computePlanHealth,
  getSuggestedNextActions,
  buildIcsCalendar,
  detectCeremonyClashes,
  generateInitialGuests,
  generateInitialCeremonies,
  generateInitialRunSheet,
} from '../src/lib/domainLogic';
import { computeCompletionPercentage, isOverdue, sortTasksChronologically } from '../src/lib/timelineLogic';
import { generateTemplatePlan } from '../src/lib/templateFallback';
import type { Workspace } from '../src/lib/types';

// ─── Minimal workspace fixture ──────────────────────────────────────────────
const FUTURE_DATE = '2029-12-15';
const PAST_DATE   = '2020-01-01';

const sampleFormInput = {
  eventType: 'Wedding' as const,
  guestCount: 100,
  city: 'Pune',
  cityTier: 'Metro' as const,
  totalBudget: 500000,
  currency: 'INR' as const,
  eventDate: FUTURE_DATE,
  vibeAndPreferences: 'Elegant',
  traditions: '',
};

function makeWorkspace(overrides: Partial<Workspace> = {}): Workspace {
  return {
    version: 1,
    formInput: sampleFormInput,
    plan: generateTemplatePlan(sampleFormInput),
    guests: { list: [], useConfirmedHeadcount: false },
    ceremonies: null,
    runSheet: null,
    guestSchedule: { items: [], title: 'Event', intro: '' },
    payments: [],
    invitation: null,
    undoStack: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ui: {
      activeScreen: 'today',
      taskFilter: 'All',
      budgetLogFilter: { category: 'All', month: 'All', text: '' },
      familySections: { event: true, budget: true, vendors: true, tasks: true, dates: true },
      pinnedTaskThemeIds: [],
      pinnedBudgetThemeIds: [],
    },
    ...overrides,
  };
}

// ─── computePlanHealth ───────────────────────────────────────────────────────
describe('computePlanHealth', () => {
  it('returns a numeric score between 0 and 100 for a minimal workspace', () => {
    const health = computePlanHealth(makeWorkspace());
    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.score).toBeLessThanOrEqual(100);
  });

  it('returns a lower score when plan is missing or empty', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const health = computePlanHealth(makeWorkspace({ plan: undefined as any }));
    expect(health.score).toBeLessThan(50);
  });

  it('exposes sub-scores in parts breakdown', () => {
    const health = computePlanHealth(makeWorkspace());
    expect(typeof health.parts.budgetBalance).toBe('number');
    expect(typeof health.parts.tasksOnTime).toBe('number');
    expect(typeof health.parts.vendorsVerified).toBe('number');
    expect(typeof health.parts.runSheetConfirmed).toBe('number');
  });
});

// ─── getSuggestedNextActions ─────────────────────────────────────────────────
describe('getSuggestedNextActions', () => {
  it('returns an array of next actions', () => {
    const actions = getSuggestedNextActions(makeWorkspace());
    expect(Array.isArray(actions)).toBe(true);
  });

  it('each action has a human-readable label and reason', () => {
    const actions = getSuggestedNextActions(makeWorkspace());
    for (const action of actions) {
      expect(typeof action.label).toBe('string');
      expect(action.label.length).toBeGreaterThan(0);
      expect(typeof action.reason).toBe('string');
    }
  });
});

// ─── buildIcsCalendar ────────────────────────────────────────────────────────
describe('buildIcsCalendar', () => {
  const tasks = [
    { id: 't1', title: 'Book Venue', category: 'Planning' as const, dueDate: '2029-06-01', priority: 'High' as const, status: 'Pending' as const },
    { id: 't2', title: 'Hire Caterer', category: 'Catering' as const, dueDate: '2029-07-01', priority: 'Medium' as const, status: 'Pending' as const },
  ];

  it('produces a string starting with BEGIN:VCALENDAR', () => {
    const ics = buildIcsCalendar(tasks, FUTURE_DATE, 'My Wedding');
    expect(ics).toMatch(/^BEGIN:VCALENDAR/);
  });

  it('ends with END:VCALENDAR', () => {
    const ics = buildIcsCalendar(tasks, FUTURE_DATE, 'My Wedding');
    expect(ics.trimEnd()).toMatch(/END:VCALENDAR$/);
  });

  it('contains VEVENT blocks for each task', () => {
    const ics = buildIcsCalendar(tasks, FUTURE_DATE, 'My Wedding');
    const eventCount = (ics.match(/BEGIN:VEVENT/g) ?? []).length;
    expect(eventCount).toBe(tasks.length);
  });

  it('includes task titles in SUMMARY lines', () => {
    const ics = buildIcsCalendar(tasks, FUTURE_DATE, 'My Wedding');
    expect(ics).toContain('Book Venue');
    expect(ics).toContain('Hire Caterer');
  });

  it('returns valid ICS with empty task array', () => {
    const ics = buildIcsCalendar([], FUTURE_DATE, 'Empty Event');
    expect(ics).toMatch(/BEGIN:VCALENDAR/);
    expect(ics.match(/BEGIN:VEVENT/g) ?? []).toHaveLength(0);
  });
});

// ─── detectCeremonyClashes ───────────────────────────────────────────────────
describe('detectCeremonyClashes', () => {
  it('returns empty array when there are no days', () => {
    const clashes = detectCeremonyClashes([]);
    expect(clashes).toHaveLength(0);
  });

  it('detects overlapping ceremonies on the same day', () => {
    const days = [{
      id: 'd1',
      date: '2029-12-15',
      label: 'Wedding Day',
      items: [
        { id: 'c1', what: 'Mehendi', start: '09:00', end: '12:00', who: 'Family', venue: 'Hall A' },
        { id: 'c2', what: 'Haldi', start: '11:00', end: '13:00', who: 'Family', venue: 'Hall A' },
      ],
    }];
    const clashes = detectCeremonyClashes(days);
    expect(clashes.length).toBeGreaterThan(0);
  });

  it('does NOT flag non-overlapping ceremonies', () => {
    const days = [{
      id: 'd1',
      date: '2029-12-15',
      label: 'Wedding Day',
      items: [
        { id: 'c1', what: 'Mehendi', start: '09:00', end: '11:00', who: 'Family', venue: 'Hall A' },
        { id: 'c2', what: 'Haldi', start: '12:00', end: '14:00', who: 'Family', venue: 'Hall A' },
      ],
    }];
    const clashes = detectCeremonyClashes(days);
    expect(clashes).toHaveLength(0);
  });
});

// ─── generateInitialGuests ───────────────────────────────────────────────────
describe('generateInitialGuests', () => {
  it('returns an object with list array', () => {
    const guests = generateInitialGuests();
    expect(Array.isArray(guests.list)).toBe(true);
    expect(guests.list.length).toBeGreaterThan(0);
  });
});

// ─── generateInitialCeremonies ───────────────────────────────────────────────
describe('generateInitialCeremonies', () => {
  it('returns days array for a Wedding event', () => {
    const result = generateInitialCeremonies(makeWorkspace().formInput);
    expect(Array.isArray(result.days)).toBe(true);
    expect(result.days.length).toBeGreaterThan(0);
  });
});

// ─── generateInitialRunSheet ─────────────────────────────────────────────────
describe('generateInitialRunSheet', () => {
  it('returns rows array for a Wedding', () => {
    const result = generateInitialRunSheet(makeWorkspace().formInput);
    expect(Array.isArray(result.rows)).toBe(true);
    expect(result.rows.length).toBeGreaterThan(0);
  });
});

// ─── Timeline helpers (bonus coverage) ──────────────────────────────────────
describe('Timeline helpers', () => {
  const tasks = [
    { id: 'a', title: 'Z Task', category: 'Planning' as const, dueDate: '2030-12-01', priority: 'Low' as const, status: 'Pending' as const },
    { id: 'b', title: 'A Task', category: 'Planning' as const, dueDate: '2028-01-01', priority: 'High' as const, status: 'Pending' as const },
    { id: 'c', title: 'M Task', category: 'Catering' as const, dueDate: '2029-06-15', priority: 'Medium' as const, status: 'Completed' as const },
  ];

  it('sortTasksChronologically orders by dueDate ascending', () => {
    const sorted = sortTasksChronologically(tasks);
    expect(sorted[0]!.id).toBe('b');
    expect(sorted[2]!.id).toBe('a');
  });

  it('isOverdue returns false for future tasks', () => {
    expect(isOverdue(tasks[0]!)).toBe(false);
  });

  it('isOverdue returns false for Completed tasks even if past', () => {
    const past = { ...tasks[0]!, dueDate: PAST_DATE, status: 'Completed' as const };
    expect(isOverdue(past)).toBe(false);
  });

  it('isOverdue returns true for past Pending tasks', () => {
    const past = { ...tasks[0]!, dueDate: PAST_DATE, status: 'Pending' as const };
    expect(isOverdue(past)).toBe(true);
  });

  it('computeCompletionPercentage returns 0 for empty array', () => {
    expect(computeCompletionPercentage([])).toBe(0);
  });

  it('computeCompletionPercentage counts only Completed tasks', () => {
    expect(computeCompletionPercentage(tasks)).toBe(33); // 1 of 3
  });

  it('computeCompletionPercentage returns 100 when all tasks completed', () => {
    const allDone = tasks.map(t => ({ ...t, status: 'Completed' as const }));
    expect(computeCompletionPercentage(allDone)).toBe(100);
  });
});

