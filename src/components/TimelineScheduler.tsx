'use client';
import { useState } from 'react';
import type { TimelineTask, Priority, TaskStatus } from '@/lib/types';
import { isOverdue, computeCompletionPercentage, sortTasksChronologically } from '@/lib/timelineLogic';
import { CheckCircle2, Circle, Clock, AlertCircle, Filter, Calendar } from 'lucide-react';
import ToggleButton from '@/components/ToggleButton';

interface Props {
  tasks: TimelineTask[];
  onChange: (tasks: TimelineTask[]) => void;
}

const STATUS_OPTS: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'Completed') return <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />;
  if (status === 'In Progress') return <Clock className="w-5 h-5 text-amber-600" aria-hidden="true" />;
  return <Circle className="w-5 h-5 text-neutral-400" aria-hidden="true" />;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === 'High') return <span className="badge badge-red">HIGH</span>;
  if (priority === 'Medium') return <span className="badge badge-yellow">MED</span>;
  return <span className="badge badge-purple">LOW</span>;
}

function TaskRow({ task, onToggle, onStatusChange }: {
  task: TimelineTask;
  onToggle: () => void;
  onStatusChange: (s: TaskStatus) => void;
}) {
  const overdue = isOverdue(task);
  const isDone = task.status === 'Completed';

  return (
    <div
      className="card"
      style={{
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: isDone ? '#F4F4F5' : 'var(--white)',
        opacity: isDone ? 0.8 : 1,
      }}
    >
      <button
        onClick={onToggle}
        data-testid={`task-toggle-${task.id}`}
        aria-label={isDone ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
        className="flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors"
      >
        <StatusIcon status={task.status} />
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--black)',
            textDecoration: isDone ? 'line-through' : 'none',
          }}>
            {task.title}
          </span>
          {overdue && (
            <span className="badge badge-red" role="status">
              <AlertCircle size={10} aria-hidden="true" /> OVERDUE
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap', fontFamily: 'var(--mono)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={12} aria-hidden="true" />
            {task.dueDate}
          </span>
          <span>•</span>
          <span className="tag">{task.category}</span>
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      <select
        value={task.status}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
        aria-label={`Status for ${task.title}`}
        data-testid={`task-status-${task.id}`}
        className="input"
        style={{
          width: 'auto',
          fontSize: 12,
          padding: '6px 10px',
          minHeight: 36,
          fontWeight: 700,
          fontFamily: 'var(--mono)',
          background: task.status === 'Completed' ? '#D1FAE5' : task.status === 'In Progress' ? '#FEF3C7' : '#fff',
        }}
      >
        {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}

export default function TimelineScheduler({ tasks, onChange }: Props) {
  const [filter, setFilter] = useState<TaskStatus | 'All'>('All');
  const sorted = sortTasksChronologically(tasks);
  const filtered = filter === 'All' ? sorted : sorted.filter((t) => t.status === filter);
  const pct = computeCompletionPercentage(tasks);
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  function toggleTask(id: string) {
    onChange(tasks.map((t) =>
      t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t
    ));
  }

  function setStatus(id: string, status: TaskStatus) {
    onChange(tasks.map((t) => t.id === id ? { ...t, status } : t));
  }

  return (
    <section aria-labelledby="timeline-heading" aria-live="polite">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <span className="badge badge-purple" style={{ marginBottom: 6 }}>BACKWARD SCHEDULE</span>
        <h2 id="timeline-heading" className="section-title">Timeline &amp; Tasks</h2>
        <p className="section-subtitle">Milestones reverse-engineered from your event date.</p>
      </div>

      {/* Progress Strip */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--mono)' }}>COMPLETION STATUS:</span>
            <span className="badge badge-solid-lime">{completedCount} OF {tasks.length} COMPLETE</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--purple)' }}>{pct}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Overall completion ${pct}%`}
          className="progress-track"
        >
          <div className="progress-bar" style={{ width: `${pct}%`, background: 'var(--lime)' }} />
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        <Filter size={15} aria-hidden="true" style={{ color: 'var(--black)' }} />
        <span style={{ fontSize: 12, fontWeight: 800, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>Filter:</span>
        {(['All', ...STATUS_OPTS] as const).map((s) => (
          <ToggleButton
            key={s}
            active={filter === s}
            onClick={() => setFilter(filter === s && s !== 'All' ? 'All' : s)}
            data-testid={`timeline-filter-${s.toLowerCase().replace(/\s+/g, '-')}`}
            style={{ padding: '4px 12px', minHeight: 32, fontSize: 12 }}
          >
            {s}
          </ToggleButton>
        ))}
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} aria-live="polite" aria-label="Task list">
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--muted)' }}>
            No tasks match the selected filter.
          </div>
        ) : (
          filtered.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onStatusChange={(s) => setStatus(task.id, s)}
            />
          ))
        )}
      </div>
    </section>
  );
}
