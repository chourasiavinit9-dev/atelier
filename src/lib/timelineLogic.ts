// Timeline / task scheduling logic — backward-planned from eventDate
import type { AiOutput } from './validators';
import type { TimelineTask } from './types';

function makeId(): string {
  return Math.random().toString(36).slice(2, 11);
}

// Add months to a date, clamped to a minimum of today + 1 day
function addMonths(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() - months);
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  return d < minDate ? minDate : d;
}

function addWeeks(base: Date, weeks: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() - weeks * 7);
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  return d < minDate ? minDate : d;
}

function toIso(d: Date): string {
  return d.toISOString().split('T')[0]!;
}

/**
 * Sorts timeline tasks chronologically by their ISO due date string.
 * @param tasks - Array of timeline tasks in any order
 * @returns New sorted array — original array is not mutated
 */
export function sortTasksChronologically(tasks: TimelineTask[]): TimelineTask[] {
  return [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/**
 * Returns true if a task is past its due date and not yet completed.
 * @param task - Timeline task to evaluate
 * @returns `true` when dueDate < today and status !== 'Completed'
 */
export function isOverdue(task: TimelineTask): boolean {
  if (task.status === 'Completed') return false;
  return new Date(task.dueDate) < new Date(new Date().toISOString().split('T')[0]!);
}

/**
 * Computes the percentage of tasks with status 'Completed'.
 * @param tasks - Array of timeline tasks
 * @returns Integer percentage (0–100); returns 0 for an empty array
 */
export function computeCompletionPercentage(tasks: TimelineTask[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === 'Completed').length;
  return Math.round((done / tasks.length) * 100);
}

/**
 * Converts AI-generated timeline milestones into fully hydrated TimelineTask objects
 * with backward-planned due dates anchored to the event date.
 * @param aiOutput - Validated AI output containing raw timeline milestone titles
 * @param eventDate - ISO 8601 event date string (e.g. "2027-03-15")
 * @returns Chronologically sorted array of TimelineTask objects
 */
export function buildTimeline(aiOutput: AiOutput, eventDate: string): TimelineTask[] {
  const base = new Date(eventDate);
  const milestones = [6, 3, 1]; // months before
  const weeksBefore = [1];

  const tasks: TimelineTask[] = aiOutput.timeline.map((rawTask, idx) => {
    const milestoneIdx = idx % (milestones.length + weeksBefore.length);
    let dueDate: string;
    if (milestoneIdx < milestones.length) {
      dueDate = toIso(addMonths(base, milestones[milestoneIdx]!));
    } else {
      dueDate = toIso(addWeeks(base, weeksBefore[milestoneIdx - milestones.length]!));
    }
    return {
      id: makeId(),
      title: rawTask.title,
      category: rawTask.category,
      dueDate,
      priority: rawTask.priority,
      status: 'Pending' as const,
    };
  });

  return sortTasksChronologically(tasks);
}
