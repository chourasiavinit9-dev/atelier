'use client';
import { useState, useCallback, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import OnboardingWizard from '@/components/OnboardingWizard';
import TodayScreen from '@/components/TodayScreen';
import BudgetPlanner from '@/components/BudgetPlanner';
import TimelineScheduler from '@/components/TimelineScheduler';
import VendorChecklist from '@/components/VendorChecklist';
import ThemeStudio from '@/components/ThemeStudio';
import GuestsScreen from '@/components/GuestsScreen';
import CeremonyScreen from '@/components/CeremonyScreen';
import RunSheetScreen from '@/components/RunSheetScreen';
import GuestScheduleScreen from '@/components/GuestScheduleScreen';
import AssistantScreen from '@/components/AssistantScreen';
import BudgetLogScreen from '@/components/BudgetLogScreen';
import FamilySummaryScreen from '@/components/FamilySummaryScreen';
import CardStudio from '@/components/CardStudio';
import VendorMapScreen from '@/components/VendorMapScreen';
import { NAV_ITEMS, STORAGE_VERSION } from '@/lib/constants';
import type {
  EventFormInput, GeneratedPlan, BudgetCategoryAllocation,
  TimelineTask, EventTheme, Workspace, CardDesign, UiState, NavScreen,
} from '@/lib/types';
import type { GenerateResponse, ApiErrorResponse } from '@/lib/types';
import { WorkspaceSchema } from '@/lib/validators';
import { createDefaultCardDesign } from '@/lib/cardDesign';
import {
  generateInitialGuests,
  generateInitialCeremonies,
  generateInitialRunSheet,
  generateInitialGuestSchedule,
  generateInitialPayments,
} from '@/lib/domainLogic';
import {
  Download, Upload, RotateCcw, AlertTriangle, RefreshCw, X,
  LayoutDashboard, CircleDollarSign, CalendarDays, Users2,
  Palette, Sparkles, FileText, CalendarClock, UserCheck,
  Receipt, BookOpen, Mail, CreditCard, Menu, Map,
} from 'lucide-react';

interface ErrorState { message: string; code: string; retryable: boolean }

function makeId() { return Math.random().toString(36).slice(2, 11); }

function defaultUiState(): UiState {
  return {
    activeScreen: 'budget',
    taskFilter: 'All',
    budgetLogFilter: { category: 'All', month: '', text: '' },
    familySections: { event: true, budget: true, vendors: true, tasks: true, dates: true },
    pinnedTaskThemeIds: [],
    pinnedBudgetThemeIds: [],
  };
}

const SCREEN_ICONS: Record<NavScreen, React.ElementType> = {
  today: LayoutDashboard, wizard: LayoutDashboard,
  budget: CircleDollarSign, timeline: CalendarDays,
  vendors: Users2, themes: Palette,
  assistant: Sparkles, runsheet: FileText,
  ceremonies: CalendarClock, guests: UserCheck,
  guestschedule: Receipt, budgetlog: BookOpen,
  familysummary: BookOpen, invitations: Mail, cards: CreditCard,
  vendormap: Map,
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
interface SidebarProps {
  active: NavScreen;
  onNavigate: (s: NavScreen) => void;
  formInput: EventFormInput;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  sidebarOpen: boolean;
  onClose: () => void;
}

function Sidebar({ active, onNavigate, formInput, onExport, onImport, onReset, fileRef, sidebarOpen, onClose }: SidebarProps) {
  const groups = [...new Set(NAV_ITEMS.map((n) => n.group))];
  const days = daysUntil(formInput.eventDate);

  return (
    <>
      {/* Overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="sidebar"
        aria-label="Navigation"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
          width: 264, background: 'var(--black)', display: 'flex', flexDirection: 'column',
          borderRight: 'var(--border)',
          overflowY: 'auto',
        }}
        className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '2px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                background: 'var(--lime)', color: 'var(--black)',
                fontWeight: 800, fontSize: '0.95rem', padding: '0.35rem 0.75rem',
                border: 'var(--border)', borderRadius: 6, boxShadow: '2px 2px 0 var(--black)',
                fontFamily: 'var(--font)',
              }}>⚡ ATELIER</span>
            </div>
            <div className="pulse-dot" title="Active Plan" />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--mono)', marginTop: 8 }}>
            AI Event Orchestration
          </div>
        </div>

        {/* Event summary card */}
        <div style={{
          margin: '14px 12px',
          background: 'var(--white)',
          border: 'var(--border)',
          boxShadow: '3px 3px 0px var(--lime)',
          borderRadius: 12,
          padding: '12px 14px',
          color: 'var(--black)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {formInput.eventType}
            </span>
            <span className="badge badge-purple" style={{ fontSize: '0.62rem', padding: '0.1rem 0.45rem' }}>
              {formInput.cityTier}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#444', fontFamily: 'var(--mono)' }}>
            {formInput.city} · {formInput.guestCount} guests
          </div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="badge badge-solid-lime" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
              {days > 0 ? `⏳ ${days} DAYS TO GO` : days === 0 ? '🎉 TODAY!' : 'PAST EVENT'}
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '0 10px', paddingBottom: 16 }}>
          {groups.map((group) => (
            <div key={group}>
              <div className="nav-group-label">{group}</div>
              {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                const Icon = SCREEN_ICONS[item.id] ?? LayoutDashboard;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    data-testid={`nav-${item.id}`}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => { onNavigate(item.id); onClose(); }}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                    {isActive && <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', fontWeight: 800 }}>→</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Toolbar */}
        <div style={{ borderTop: '2px solid #222', padding: '12px 10px', display: 'flex', gap: 6 }}>
          <button onClick={onExport} data-testid="shell-export" className="btn-outline" style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.78rem', minHeight: 36 }} title="Export JSON">
            <Download size={13} aria-hidden="true" /> Export
          </button>
          <label className="btn-outline" style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.78rem', minHeight: 36, cursor: 'pointer' }} title="Import JSON">
            <Upload size={13} aria-hidden="true" /> Import
            <input ref={fileRef} type="file" accept=".json" onChange={onImport} className="sr-only" aria-label="Import workspace JSON" data-testid="shell-import" />
          </label>
          <button onClick={onReset} data-testid="shell-reset" className="btn-outline" style={{ padding: '0.4rem 0.6rem', minHeight: 36, color: '#DC2626' }} title="Reset">
            <RotateCcw size={13} aria-hidden="true" />
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const { workspace, saveWorkspace, clearWorkspace, hydrated } = useLocalStorage();
  const [activeScreen, setActiveScreen] = useState<NavScreen>(() => {
    if (typeof window !== 'undefined') {
      const tab = new URLSearchParams(window.location.search).get('tab') as NavScreen | null;
      if (tab && NAV_ITEMS.some((n) => n.id === tab)) return tab;
    }
    return 'budget';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [isTemplateFallback, setIsTemplateFallback] = useState(false);
  const [pinnedTaskIds, setPinnedTaskIds] = useState<Set<string>>(new Set());
  const [pinnedBudgetIds, setPinnedBudgetIds] = useState<Set<string>>(new Set());
  const [formInputCache, setFormInputCache] = useState<EventFormInput | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = useCallback(async (input: EventFormInput) => {
    setIsLoading(true); setError(null); setFormInputCache(input);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formInput: input }),
      });
      if (!res.ok) {
        const err = await res.json() as ApiErrorResponse;
        setError({ message: err.error, code: err.code, retryable: res.status !== 400 });
        return;
      }
      const data = await res.json() as GenerateResponse;
      setIsTemplateFallback(data.isTemplateFallback ?? false);
      const initialCeremonies = generateInitialCeremonies(input);
      const ws: Workspace = {
        version: STORAGE_VERSION, formInput: input, plan: data.plan,
        guests: generateInitialGuests(),
        ceremonies: initialCeremonies,
        runSheet: generateInitialRunSheet(input),
        guestSchedule: generateInitialGuestSchedule(input, initialCeremonies),
        payments: generateInitialPayments(data.plan.budget),
        invitation: null, ui: defaultUiState(), undoStack: [],
        cardDesign: createDefaultCardDesign(input, data.plan.budget),
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      saveWorkspace(ws);
      setActiveScreen('today');
    } catch {
      setError({ message: 'Network error. Please try again.', code: 'NETWORK', retryable: true });
    } finally { setIsLoading(false); }
  }, [saveWorkspace]);

  function handleToggleTask(taskId: string) {
    if (!workspace) return;
    const updated = workspace.plan.timeline.map((t) => {
      if (t.id !== taskId) return t;
      const nextStatus = t.status === 'Completed' ? 'Pending' : 'Completed';
      return { ...t, status: nextStatus as typeof t.status };
    });
    updatePlan({ timeline: updated });
  }

  function handleSyncCatering(confirmedCount: number) {
    if (!workspace) return;
    const updatedBudget = workspace.plan.budget.map((b) => {
      if (b.category !== 'Catering and refreshments') return b;
      const perGuestRate = 1200;
      return {
        ...b,
        allocatedAmount: Math.max(b.allocatedAmount, confirmedCount * perGuestRate),
      };
    });
    updatePlan({ budget: updatedBudget });
  }

  function updatePlan(patch: Partial<GeneratedPlan>) {
    if (!workspace) return;
    saveWorkspace({ ...workspace, plan: { ...workspace.plan, ...patch }, updatedAt: new Date().toISOString() });
  }

  function updateCardDesign(cardDesign: CardDesign) {
    if (!workspace) return;
    saveWorkspace({ ...workspace, cardDesign, updatedAt: new Date().toISOString() });
  }

  function handlePinToTasks(theme: EventTheme) {
    if (pinnedTaskIds.has(theme.id) || !workspace) return;
    const task: TimelineTask = {
      id: makeId(), title: `Theme: ${theme.name}`, category: 'Theme',
      dueDate: workspace.formInput.eventDate, priority: 'Medium', status: 'Pending', isPinned: true,
    };
    updatePlan({ timeline: [...workspace.plan.timeline, task] });
    setPinnedTaskIds((p) => new Set([...p, theme.id]));
  }

  function handlePinToBudget(theme: EventTheme) {
    if (pinnedBudgetIds.has(theme.id) || !workspace) return;
    const updated: BudgetCategoryAllocation[] = workspace.plan.budget.map((a, i) =>
      i !== 2 ? a : { ...a, items: [...a.items, { id: makeId(), category: a.category, description: `Theme: ${theme.name}`, estimatedCost: 0, actualCost: null, isCustom: true }] }
    );
    updatePlan({ budget: updated });
    setPinnedBudgetIds((p) => new Set([...p, theme.id]));
  }

  function handleExport() {
    if (!workspace) return;
    const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'atelier-workspace.json'; a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed: unknown = JSON.parse(ev.target?.result as string);
        const result = WorkspaceSchema.safeParse(parsed);
        if (!result.success) { alert('Invalid workspace file.'); return; }
        saveWorkspace({ ...result.data, cardDesign: result.data.cardDesign ?? createDefaultCardDesign(result.data.formInput, result.data.plan.budget) });
      } catch { alert('Could not parse JSON file.'); }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleReset() {
    if (!confirm('Reset workspace? All data will be lost.')) return;
    clearWorkspace(); setError(null);
    setPinnedTaskIds(new Set()); setPinnedBudgetIds(new Set());
  }

  // ── Loading state ──
  if (!hydrated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--lime)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} color="var(--dark)" />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }} role="status" aria-live="polite">Loading…</p>
        </div>
      </div>
    );
  }

  // ── Onboarding ──
  if (!workspace) {
    return <OnboardingWizard onSubmit={handleGenerate} isLoading={isLoading} />;
  }

  const { plan, formInput } = workspace;
  const currentGuests = (workspace.guests && workspace.guests.list.length > 0)
    ? workspace.guests
    : generateInitialGuests();

  const currentCeremonies = workspace.ceremonies ?? generateInitialCeremonies(formInput);
  const currentRunSheet = workspace.runSheet ?? generateInitialRunSheet(formInput);
  const currentGuestSchedule = (workspace.guestSchedule && workspace.guestSchedule.items.length > 0)
    ? workspace.guestSchedule
    : generateInitialGuestSchedule(formInput, currentCeremonies);
  const currentPayments = (workspace.payments && workspace.payments.length > 0)
    ? workspace.payments
    : generateInitialPayments(plan.budget);

  // ── Plan screens ──
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar
        active={activeScreen}
        onNavigate={setActiveScreen}
        formInput={formInput}
        onExport={handleExport}
        onImport={handleImport}
        onReset={handleReset}
        fileRef={fileInputRef}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="app-main-content">
        {/* Top bar (Neobrutalist Electric Violet Navbar) */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'var(--purple)',
          borderBottom: 'var(--border)',
          padding: '0 24px',
          display: 'flex', alignItems: 'center', gap: 16, height: 64,
          color: '#fff',
        }}>
          <button
            className="lg:hidden btn-white"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
            style={{ padding: '6px 10px', minHeight: 36 }}
          >
            <Menu size={18} aria-hidden="true" />
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              {NAV_ITEMS.find((n) => n.id === activeScreen)?.label ?? 'Plan'}
            </span>
            <span className="badge badge-solid-lime" style={{ fontSize: '0.65rem' }}>
              LIVE
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 8,
              padding: '0.35rem 0.8rem',
              fontSize: 12,
              color: '#fff',
              fontFamily: 'var(--mono)',
              fontWeight: 700,
            }}>
              💰 {formInput.currency} {formInput.totalBudget.toLocaleString()}
            </div>
            <div style={{
              background: 'var(--lime)',
              color: 'var(--black)',
              border: 'var(--border)',
              boxShadow: '2px 2px 0 var(--black)',
              borderRadius: 8,
              padding: '0.35rem 0.8rem',
              fontSize: 12,
              fontFamily: 'var(--mono)',
              fontWeight: 800,
            }}>
              ⏳ {daysUntil(formInput.eventDate)}D LEFT
            </div>
          </div>
        </header>

        {/* Alerts */}
        <div style={{ padding: error || isTemplateFallback ? '20px 24px 0' : 0 }}>
          {error && (
            <div role="alert" aria-live="assertive" className="alert-error" style={{ marginBottom: 12 }}>
              <AlertTriangle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{error.message}</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Code: {error.code}</div>
              </div>
              {error.retryable && formInputCache && (
                <button data-testid="shell-retry" onClick={() => handleGenerate(formInputCache)} className="btn-outline" style={{ fontSize: 13, padding: '6px 14px', minHeight: 36 }}>
                  <RefreshCw size={13} aria-hidden="true" /> Retry
                </button>
              )}
              <button onClick={() => setError(null)} aria-label="Dismiss error" data-testid="shell-error-dismiss" className="btn-ghost" style={{ padding: 6, minHeight: 36 }}>
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}
          {isTemplateFallback && (
            <div role="status" aria-live="polite" className="alert-warn" style={{ marginBottom: 12 }}>
              <AlertTriangle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Template plan shown — AI unavailable. Add your API key for a personalised plan.</span>
            </div>
          )}
        </div>

        {/* Content panels */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }} id="main-content">
          <div id="tabpanel-today" role="tabpanel" aria-labelledby="nav-today" hidden={activeScreen !== 'today'} tabIndex={0}>
            <TodayScreen
              workspace={{
                ...workspace,
                guests: currentGuests,
                ceremonies: currentCeremonies,
                runSheet: currentRunSheet,
                guestSchedule: currentGuestSchedule,
                payments: currentPayments,
              }}
              onNavigate={setActiveScreen}
              onToggleTask={handleToggleTask}
            />
          </div>

          <div id="tabpanel-budget" role="tabpanel" aria-labelledby="nav-budget" hidden={activeScreen !== 'budget'} tabIndex={0}>
            <BudgetPlanner allocations={plan.budget} currency={formInput.currency} onChange={(b) => updatePlan({ budget: b })} />
          </div>

          <div id="tabpanel-timeline" role="tabpanel" aria-labelledby="nav-timeline" hidden={activeScreen !== 'timeline'} tabIndex={0}>
            <TimelineScheduler tasks={plan.timeline} onChange={(t) => updatePlan({ timeline: t })} />
          </div>

          <div id="tabpanel-vendors" role="tabpanel" aria-labelledby="nav-vendors" hidden={activeScreen !== 'vendors'} tabIndex={0}>
            <VendorChecklist vendors={plan.vendors} onChange={(v) => updatePlan({ vendors: v })} />
          </div>

          <div id="tabpanel-themes" role="tabpanel" aria-labelledby="nav-themes" hidden={activeScreen !== 'themes'} tabIndex={0}>
            <ThemeStudio
              themes={plan.themes} currency={formInput.currency}
              onPinToTasks={handlePinToTasks} onPinToBudget={handlePinToBudget}
              pinnedTaskIds={pinnedTaskIds} pinnedBudgetIds={pinnedBudgetIds}
            />
          </div>

          <div id="tabpanel-guests" role="tabpanel" aria-labelledby="nav-guests" hidden={activeScreen !== 'guests'} tabIndex={0}>
            <GuestsScreen
              guests={currentGuests}
              targetHeadcount={formInput.guestCount}
              onChange={(g) => saveWorkspace({ ...workspace, guests: g, updatedAt: new Date().toISOString() })}
              onSyncCatering={handleSyncCatering}
            />
          </div>

          <div id="tabpanel-ceremonies" role="tabpanel" aria-labelledby="nav-ceremonies" hidden={activeScreen !== 'ceremonies'} tabIndex={0}>
            <CeremonyScreen
              ceremonies={currentCeremonies}
              eventType={formInput.eventType}
              eventDate={formInput.eventDate}
              onChange={(c) => saveWorkspace({ ...workspace, ceremonies: c, updatedAt: new Date().toISOString() })}
            />
          </div>

          <div id="tabpanel-runsheet" role="tabpanel" aria-labelledby="nav-runsheet" hidden={activeScreen !== 'runsheet'} tabIndex={0}>
            <RunSheetScreen
              runSheet={currentRunSheet}
              eventType={formInput.eventType}
              eventDate={formInput.eventDate}
              onChange={(rs) => saveWorkspace({ ...workspace, runSheet: rs, updatedAt: new Date().toISOString() })}
            />
          </div>

          <div id="tabpanel-guestschedule" role="tabpanel" aria-labelledby="nav-guestschedule" hidden={activeScreen !== 'guestschedule'} tabIndex={0}>
            <GuestScheduleScreen
              schedule={currentGuestSchedule}
              ceremonies={currentCeremonies}
              eventType={formInput.eventType}
              onChange={(gs) => saveWorkspace({ ...workspace, guestSchedule: gs, updatedAt: new Date().toISOString() })}
            />
          </div>

          <div id="tabpanel-assistant" role="tabpanel" aria-labelledby="nav-assistant" hidden={activeScreen !== 'assistant'} tabIndex={0}>
            <AssistantScreen
              budget={plan.budget}
              formInput={formInput}
              onApplyBudget={(b) => updatePlan({ budget: b })}
            />
          </div>

          <div id="tabpanel-budgetlog" role="tabpanel" aria-labelledby="nav-budgetlog" hidden={activeScreen !== 'budgetlog'} tabIndex={0}>
            <BudgetLogScreen
              payments={currentPayments}
              budget={plan.budget}
              currency={formInput.currency}
              onChange={(p) => saveWorkspace({ ...workspace, payments: p, updatedAt: new Date().toISOString() })}
            />
          </div>

          <div id="tabpanel-familysummary" role="tabpanel" aria-labelledby="nav-familysummary" hidden={activeScreen !== 'familysummary'} tabIndex={0}>
            <FamilySummaryScreen
              workspace={{
                ...workspace,
                guests: currentGuests,
                ceremonies: currentCeremonies,
                runSheet: currentRunSheet,
                guestSchedule: currentGuestSchedule,
                payments: currentPayments,
              }}
            />
          </div>

          <div id="tabpanel-invitations" role="tabpanel" aria-labelledby="nav-invitations" hidden={activeScreen !== 'invitations'} tabIndex={0}>
            <CardStudio
              design={{
                ...(workspace.cardDesign ?? createDefaultCardDesign(formInput, plan.budget)),
                template: 'floral',
              }}
              currency={formInput.currency}
              onChange={updateCardDesign}
            />
          </div>

          <div id="tabpanel-cards" role="tabpanel" aria-labelledby="nav-cards" hidden={activeScreen !== 'cards'} tabIndex={0}>
            <CardStudio
              design={workspace.cardDesign ?? createDefaultCardDesign(formInput, plan.budget)}
              currency={formInput.currency}
              onChange={updateCardDesign}
            />
          </div>

          <div id="tabpanel-vendormap" role="tabpanel" aria-labelledby="nav-vendormap" hidden={activeScreen !== 'vendormap'} tabIndex={0}>
            <VendorMapScreen
              vendors={plan.vendors}
              city={formInput.city}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
