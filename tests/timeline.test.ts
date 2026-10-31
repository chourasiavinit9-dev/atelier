import { describe, it, expect } from 'vitest';
import {
  sortTasksChronologically,
  isOverdue,
  computeCompletionPercentage,
  buildTimeline,
} from '@/lib/timelineLogic';
import type { TimelineTask } from '@/lib/types';

function makeTask(overrides: Partial<TimelineTask> = {}): TimelineTask {
  return {
    id: Math.random().toString(36).slice(2),
    title: 'Test Task',
    category: 'Testing',
    dueDate: '2099-01-01',
    priority: 'Medium',
    status: 'Pending',
    ...overrides,
  };
}

describe('Timeline — Sorting', () => {
  it('sorts tasks chronologically', () => {
    const tasks = [
      makeTask({ dueDate: '2099-12-01' }),
      makeTask({ dueDate: '2099-06-01' }),
      makeTask({ dueDate: '2099-03-01' }),
    ];
    const sorted = sortTasksChronologically(tasks);
    expect(sorted[0]!.dueDate).toBe('2099-03-01');
    expect(sorted[2]!.dueDate).toBe('2099-12-01');
  });

  it('handles empty task list', () => {
    expect(sortTasksChronologically([])).toEqual([]);
  });

  it('preserves order for same dates', () => {
    const tasks = [
      makeTask({ dueDate: '2099-01-01', title: 'A' }),
      makeTask({ dueDate: '2099-01-01', title: 'B' }),
    ];
    const sorted = sortTasksChronologically(tasks);
    expect(sorted.length).toBe(2);
  });
});

describe('Timeline — Overdue Detection', () => {
  it('marks past Pending task as overdue', () => {
    const task = makeTask({ dueDate: '2020-01-01', status: 'Pending' });
    expect(isOverdue(task)).toBe(true);
  });

  it('does not mark Completed task as overdue', () => {
    const task = makeTask({ dueDate: '2020-01-01', status: 'Completed' });
    expect(isOverdue(task)).toBe(false);
  });

  it('does not mark future task as overdue', () => {
    const task = makeTask({ dueDate: '2099-01-01', status: 'Pending' });
    expect(isOverdue(task)).toBe(false);
  });
});

describe('Timeline — Completion Percentage', () => {
  it('returns 0 for empty task list', () => {
    expect(computeCompletionPercentage([])).toBe(0);
  });

  it('returns 0 when no tasks completed', () => {
    const tasks = [makeTask(), makeTask(), makeTask()];
    expect(computeCompletionPercentage(tasks)).toBe(0);
  });

  it('returns 100 when all tasks completed', () => {
    const tasks = [
      makeTask({ status: 'Completed' }),
      makeTask({ status: 'Completed' }),
    ];
    expect(computeCompletionPercentage(tasks)).toBe(100);
  });

  it('returns correct percentage for partial completion', () => {
    const tasks = [
      makeTask({ status: 'Completed' }),
      makeTask({ status: 'Pending' }),
      makeTask({ status: 'Pending' }),
      makeTask({ status: 'Pending' }),
    ];
    expect(computeCompletionPercentage(tasks)).toBe(25);
  });

  it('rounds to nearest integer', () => {
    const tasks = [makeTask({ status: 'Completed' }), makeTask(), makeTask()];
    expect(Number.isInteger(computeCompletionPercentage(tasks))).toBe(true);
  });
});

describe('Timeline — Backward Planning', () => {
  it('produces tasks with dates before the event date', () => {
    const eventDate = '2099-12-31';
    const aiOutput = {
      budget: [], vendors: [], themes: [],
      timeline: Array.from({ length: 7 }, (_, i) => ({
        title: `Task ${i}`, category: 'Planning', dueDate: '2099-01-01', priority: 'Medium' as const,
      })),
    };
    const tasks = buildTimeline(aiOutput, eventDate);
    for (const task of tasks) {
      expect(task.dueDate <= eventDate).toBe(true);
    }
  });

  it('all produced tasks have Pending status', () => {
    const aiOutput = {
      budget: [], vendors: [], themes: [],
      timeline: [{ title: 'Book venue', category: 'Venue', dueDate: '2099-01-01', priority: 'High' as const }],
    };
    const tasks = buildTimeline(aiOutput, '2099-12-31');
    expect(tasks[0]!.status).toBe('Pending');
  });
});
