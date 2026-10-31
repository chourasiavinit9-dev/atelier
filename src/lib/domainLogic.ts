import type {
  Workspace, PlanHealth, NextAction, EventFormInput, GuestsState, Guest,
  CeremonySchedule, CeremonyDay, RunSheet, RunSheetRow, GuestScheduleCard,
  GuestScheduleItem, Payment, TimelineTask, ClashWarning, BudgetCategoryAllocation,
} from './types';
import { CEREMONY_FUNCTIONS, SAMPLE_GUEST_NAMES } from './constants';

function makeId(): string {
  return Math.random().toString(36).slice(2, 11);
}

// ─── Plan Health Calculation ──────────────────────────────────────────────────
/**
 * Computes a 0–100 composite plan-health score for the given workspace.
 *
 * @description Scores are derived from four equally-weighted sub-scores
 * (0–25 each): budget variance, task completion rate, vendor verification
 * rate, and run-sheet confirmation rate. The final score is clamped to
 * [10, 100].
 *
 * @param ws - The full workspace snapshot to evaluate.
 * @returns A {@link PlanHealth} object containing the total `score` and the
 *   individual `parts` breakdown.
 */
export function computePlanHealth(ws: Workspace): PlanHealth {
  const { plan, runSheet } = ws;

  // 1. Budget variance score (0–25)
  const totalAlloc = plan.budget.reduce((s, b) => s + b.allocatedAmount, 0);
  const totalActual = plan.budget.reduce((s, b) => s + b.items.reduce((si, i) => si + (i.actualCost ?? 0), 0), 0);
  const budgetRatio = totalAlloc > 0 ? totalActual / totalAlloc : 0;
  const budgetBalance = Math.round(budgetRatio <= 1 ? 25 : Math.max(0, 25 - (budgetRatio - 1) * 50));

  // 2. Tasks on time score (0–25)
  const totalTasks = plan.timeline.length;
  const completedTasks = plan.timeline.filter((t) => t.status === 'Completed').length;
  const tasksOnTime = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 25) : 15;

  // 3. Vendors verified score (0–25)
  const totalVendors = plan.vendors.length;
  const bookedVendors = plan.vendors.filter((v) => v.status === 'Verified & Booked').length;
  const vendorsVerified = totalVendors > 0 ? Math.round((bookedVendors / totalVendors) * 25) : 10;

  // 4. RunSheet / Execution confirmed score (0–25)
  const rows = runSheet?.rows ?? [];
  const confirmedRows = rows.filter((r) => r.confirmed).length;
  const runSheetConfirmed = rows.length > 0 ? Math.round((confirmedRows / rows.length) * 25) : 15;

  const score = Math.min(100, Math.max(10, budgetBalance + tasksOnTime + vendorsVerified + runSheetConfirmed));

  return {
    score,
    parts: { budgetBalance, tasksOnTime, vendorsVerified, runSheetConfirmed },
  };
}

// ─── Suggested Next Actions ───────────────────────────────────────────────────
/**
 * Derives up to three prioritised suggested next actions for the planner.
 *
 * @description Checks four areas in order: unbooked vendors, high-priority
 * incomplete tasks, an empty guest list, and a missing run-sheet. At most
 * three actions are returned so the UI stays focused.
 *
 * @param ws - The current workspace snapshot.
 * @returns An array of up to three {@link NextAction} objects, each with a
 *   human-readable label, reason, and navigation target.
 */
export function getSuggestedNextActions(ws: Workspace): NextAction[] {
  const actions: NextAction[] = [];
  const unbookedVendor = ws.plan.vendors.find((v) => v.status !== 'Verified & Booked');
  if (unbookedVendor) {
    actions.push({
      label: `Vetting ${unbookedVendor.category}`,
      reason: `Booking lead time is ${unbookedVendor.bookingLeadTime}. Contact vendors now.`,
      navigateTo: 'vendors',
    });
  }

  const pendingTask = ws.plan.timeline.find((t) => t.status !== 'Completed' && t.priority === 'High');
  if (pendingTask) {
    actions.push({
      taskId: pendingTask.id,
      label: pendingTask.title,
      reason: `Due ${pendingTask.dueDate} (${pendingTask.category})`,
      navigateTo: 'timeline',
    });
  }

  if ((ws.guests?.list?.length ?? 0) === 0) {
    actions.push({
      label: 'Build Guest List & Track RSVPs',
      reason: `Target is ${ws.formInput.guestCount} guests. Import names or paste CSV.`,
      navigateTo: 'guests',
    });
  }

  if (!ws.runSheet || ws.runSheet.rows.length === 0) {
    actions.push({
      label: 'Setup Day-Of Execution Run Sheet',
      reason: 'Coordinate vendors, photographers and family roles minute-by-minute.',
      navigateTo: 'runsheet',
    });
  }

  return actions.slice(0, 3);
}

// ─── Default Generators ───────────────────────────────────────────────────────
/**
 * Generates a default guest list from the built-in sample names.
 *
 * @description Creates a guest list seeded with {@link SAMPLE_GUEST_NAMES},
 * assigning varied RSVP statuses so the UI shows a realistic spread on first
 * load. No parameters are required — this is always deterministic except for
 * the randomly generated IDs.
 *
 * @returns A {@link GuestsState} containing the pre-populated list and
 *   `useConfirmedHeadcount` set to `false`.
 */
export function generateInitialGuests(): GuestsState {
  const list: Guest[] = SAMPLE_GUEST_NAMES.map((name, i) => ({
    id: makeId(),
    name,
    rsvp: i < 6 ? 'Yes' : i < 9 ? 'Maybe' : 'Invited',
  }));

  return { list, useConfirmedHeadcount: false };
}

/**
 * Builds an event-type-appropriate initial ceremony schedule.
 *
 * @description Produces a two-day schedule for weddings, a single-evening
 * schedule for birthday parties, and a single-day summit schedule for all
 * other event types. Each day is populated with realistic placeholder items
 * drawn from the {@link CEREMONY_FUNCTIONS} constants.
 *
 * @param input - The event form data collected during onboarding, used to
 *   determine event type, date, and city.
 * @returns A {@link CeremonySchedule} containing ceremony days, assumption
 *   strings, and a list of applicable ceremony functions.
 */
export function generateInitialCeremonies(input: EventFormInput): CeremonySchedule {
  const isWedding = input.eventType === 'Wedding';
  const isBirthday = input.eventType === 'Birthday';

  const days: CeremonyDay[] = isWedding
    ? [
        {
          date: input.eventDate,
          label: 'Day 1 — Traditional Rituals & Sangeet',
          items: [
            { id: makeId(), start: '10:00', end: '12:30', what: 'Haldi & Floral Bath Ceremony', who: 'Family & Close Friends', venue: 'Garden Courtyard' },
            { id: makeId(), start: '13:00', end: '15:00', what: 'Traditional Welcome Feast', who: 'All Guests', venue: 'Dining Pavilion' },
            { id: makeId(), start: '18:30', end: '22:30', what: 'Sangeet & Dance Musical Evening', who: 'Bride & Groom Parties', venue: 'Grand Ballroom' },
          ],
        },
        {
          date: input.eventDate,
          label: 'Day 2 — Auspicious Vows & Reception',
          items: [
            { id: makeId(), start: '10:30', end: '12:30', what: 'Baraat Procession & Varmala', who: 'Groom & Wedding Entourage', venue: 'Main Gate & Mandap' },
            { id: makeId(), start: '12:30', end: '14:30', what: 'Sacred Vows & Pheras', who: 'Family & Guests', venue: 'Floral Mandap' },
            { id: makeId(), start: '19:30', end: '23:30', what: 'Gala Dinner Reception & Speeches', who: 'All Attendees', venue: 'Palace Lawns' },
          ],
        },
      ]
    : isBirthday
    ? [
        {
          date: input.eventDate,
          label: 'Celebration Evening',
          items: [
            { id: makeId(), start: '17:00', end: '18:00', what: 'Guest Arrival & Welcome Cocktails', who: 'Host & Ushers', venue: 'Lounge' },
            { id: makeId(), start: '18:15', end: '19:30', what: 'Interactive Games & Photo Booth', who: 'All Friends & Guests', venue: 'Main Hall' },
            { id: makeId(), start: '19:45', end: '20:30', what: 'Cake Cutting Ceremony & Speeches', who: 'Birthday VIP & Family', venue: 'Stage Area' },
            { id: makeId(), start: '20:30', end: '23:00', what: 'Gourmet Dinner & Live DJ Dance Floor', who: 'All Guests', venue: 'Banquet Terrace' },
          ],
        },
      ]
    : [
        {
          date: input.eventDate,
          label: 'Community Summit Day',
          items: [
            { id: makeId(), start: '09:00', end: '10:00', what: 'Registration & Morning Coffee', who: 'Volunteers & Attendees', venue: 'Atrium' },
            { id: makeId(), start: '10:00', end: '11:30', what: 'Keynote Address & Panel Discussion', who: 'Guest Speakers', venue: 'Auditorium' },
            { id: makeId(), start: '12:30', end: '14:00', what: 'Networking Lunch & Showcase', who: 'All Delegates', venue: 'Exhibit Hall' },
            { id: makeId(), start: '14:30', end: '17:00', what: 'Workshops & Closing Remarks', who: 'Track Leads', venue: 'Breakout Rooms' },
          ],
        },
      ];

  const availableFunctions = (CEREMONY_FUNCTIONS[input.eventType] ?? ['Ceremony', 'Reception', 'Dinner']).slice(0, 4);

  return {
    days,
    assumptions: ['Standard 2-hour buffer between morning and evening functions', 'Venues confirmed'],
    functions: availableFunctions,
  };
}

/**
 * Creates a day-of-execution run-sheet seeded with realistic timeline rows.
 *
 * @description Wedding events receive a ten-row run-sheet covering hair &
 * make-up through dinner service. All other event types receive an
 * eight-row run-sheet spanning venue access through the dance floor.
 *
 * @param input - The event form data; only `eventType` is used to branch
 *   the template selection.
 * @returns A {@link RunSheet} with pre-populated rows, planning assumptions,
 *   and an ISO-8601 `generatedAt` timestamp.
 */
export function generateInitialRunSheet(input: EventFormInput): RunSheet {
  const isWedding = input.eventType === 'Wedding';

  const rows: RunSheetRow[] = isWedding
    ? [
        { id: makeId(), time: '07:30', what: 'Bridal & Groom Makeup Artist Call Time', who: 'Stylist & Bridal Party', confirmed: true },
        { id: makeId(), time: '08:30', what: 'Floral Decorator & Mandap Setup Inspection', who: 'Decor Vendor & Event Manager', confirmed: true },
        { id: makeId(), time: '09:30', what: 'Photographer & Cinematographer Pre-Shoot', who: 'Photo Team', confirmed: true },
        { id: makeId(), time: '10:30', what: 'Baraat Assembly & DJ Sound Check', who: 'Groom Family & DJ', confirmed: false },
        { id: makeId(), time: '11:15', what: 'Milni & Welcoming of Guests', who: 'Bride Family', confirmed: false },
        { id: makeId(), time: '12:00', what: 'Varmala & Main Ceremony on Mandap', who: 'Couple & Priest', confirmed: false },
        { id: makeId(), time: '13:30', what: 'Buffet Lunch Opens', who: 'Catering Lead', confirmed: true },
        { id: makeId(), time: '18:30', what: 'Evening Stage Lighting & Sound Check', who: 'AV Tech Lead', confirmed: false },
        { id: makeId(), time: '19:45', what: 'Grand Entrance & Cake Toast', who: 'Couple & MC', confirmed: false },
        { id: makeId(), time: '20:30', what: 'Dinner Service & Live Band', who: 'Catering & Artists', confirmed: true },
      ]
    : [
        { id: makeId(), time: '15:00', what: 'Venue Access & Balloon / Decor Assembly', who: 'Decorator & Host', confirmed: true },
        { id: makeId(), time: '16:00', what: 'Cake Delivery & Cold Storage Placement', who: 'Bakery Vendor', confirmed: true },
        { id: makeId(), time: '16:30', what: 'DJ & Playlist Soundcheck', who: 'DJ / Sound Engineer', confirmed: true },
        { id: makeId(), time: '17:00', what: 'Doors Open & Welcome Drinks', who: 'Host & Catering Team', confirmed: true },
        { id: makeId(), time: '18:00', what: 'Welcome Games & Fun Activities', who: 'Event Host / MC', confirmed: false },
        { id: makeId(), time: '19:30', what: 'Birthday Cake Cutting & Candle Lighting', who: 'Birthday VIP & Family', confirmed: false },
        { id: makeId(), time: '20:15', what: 'Dinner Service Commences', who: 'Catering Staff', confirmed: true },
        { id: makeId(), time: '21:30', what: 'Dance Floor & Celebration Highlights', who: 'DJ & Guests', confirmed: false },
      ];

  return {
    rows,
    assumptions: ['Buffer of 15 minutes built into each slot', 'All vendors equipped with walkie-talkies/cell numbers'],
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generates a shareable guest-facing schedule card from ceremony data.
 *
 * @description When a ceremony schedule is provided, each ceremony item is
 * mapped to a guest-schedule item with dress-code and arrival note. If no
 * ceremony schedule exists, three generic placeholder items are produced
 * instead, using the city from the form input as the venue.
 *
 * @param input - The event form data, supplying event type, date, and city.
 * @param ceremonies - Optional ceremony schedule to derive items from;
 *   if `null` or `undefined`, a generic three-item fallback is used.
 * @returns A {@link GuestScheduleCard} with a title, intro text, and
 *   ordered list of schedule items ready for PDF or card export.
 */
export function generateInitialGuestSchedule(input: EventFormInput, ceremonies?: CeremonySchedule | null): GuestScheduleCard {
  const items: GuestScheduleItem[] = ceremonies?.days?.flatMap((day) =>
    day.items.map((it) => ({
      id: makeId(),
      function: it.what,
      date: day.date,
      startTime: it.start,
      venue: it.venue ?? input.city,
      dressCode: input.eventType === 'Wedding' ? 'Festive Traditional / Smart Cocktail' : 'Festive Chic',
      note: 'Please arrive 15 minutes prior for seating.',
    }))
  ) ?? [
    {
      id: makeId(),
      function: 'Welcome & Gathering',
      date: input.eventDate,
      startTime: '17:30',
      venue: `${input.city} Central Pavilion`,
      dressCode: 'Smart Casual / Semi-Formal',
      note: 'Valet parking available at North Gate.',
    },
    {
      id: makeId(),
      function: 'Main Celebration Ceremony',
      date: input.eventDate,
      startTime: '19:00',
      venue: `${input.city} Grand Ballroom`,
      dressCode: 'Festive / Traditional Elegance',
      note: 'Photography moments and speeches.',
    },
    {
      id: makeId(),
      function: 'Grand Gala Dinner & Dance',
      date: input.eventDate,
      startTime: '20:30',
      venue: `${input.city} Dining Lawns`,
      dressCode: 'Comfortable Party Wear',
      note: 'Buffet dinner and live music entertainment.',
    },
  ];

  return {
    title: `${input.eventType}: ${input.city} Celebration`,
    intro: 'We are thrilled to celebrate this special milestone with you! Here is your quick day-of itinerary.',
    items,
  };
}

/**
 * Seeds an initial payments ledger from the top budget categories.
 *
 * @description Takes the first three budget categories and creates a 25 %
 * booking-deposit payment for each, dated today. Categories whose allocated
 * amount rounds down to zero are silently skipped.
 *
 * @param budget - The full array of budget category allocations from the
 *   generated plan.
 * @returns An array of {@link Payment} objects (zero to three entries)
 *   representing initial vendor deposits.
 */
export function generateInitialPayments(budget: BudgetCategoryAllocation[]): Payment[] {
  const payments: Payment[] = [];
  const today = new Date().toISOString().split('T')[0]!;

  budget.slice(0, 3).forEach((cat) => {
    const advance = Math.round(cat.allocatedAmount * 0.25);
    if (advance > 0) {
      payments.push({
        id: makeId(),
        itemId: cat.items[0]?.id ?? makeId(),
        date: today,
        amount: advance,
        paidTo: `${cat.category} Vendor`,
        note: `25% Booking Deposit for ${cat.category}`,
        method: 'Bank transfer',
      });
    }
  });

  return payments;
}

// ─── ICS Calendar File Export ─────────────────────────────────────────────────
/**
 * Serialises timeline tasks into a standards-compliant iCalendar (.ics) string.
 *
 * @description Each task becomes a `VEVENT` with an all-day `DTSTART` /
 * `DTEND` entry. Special characters (commas, semicolons, backslashes) in
 * text fields are sanitised, and values are truncated to 80 characters to
 * comply with the iCalendar line-length recommendation.
 *
 * @param tasks - The timeline tasks to include as calendar events.
 * @param _eventDate - Reserved for future use (e.g., setting the calendar's
 *   primary event date); currently unused.
 * @param eventTitle - The human-readable calendar name used in the
 *   `X-WR-CALNAME` property.
 * @returns A CRLF-delimited iCalendar string suitable for saving as a
 *   `.ics` file or attaching to an email invite.
 */
export function buildIcsCalendar(tasks: TimelineTask[], _eventDate: string, eventTitle: string): string {
  const clean = (s: string) => s.replace(/[,;\\]/g, ' ').slice(0, 80);
  const formatDate = (iso: string) => iso.replace(/-/g, '');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Atelier//Event Orchestrator//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${clean(eventTitle)} Timeline`,
  ];

  tasks.forEach((t) => {
    const dt = formatDate(t.dueDate);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${t.id}@atelier.local`,
      `DTSTAMP:${formatDate(new Date().toISOString().split('T')[0]!)}T000000Z`,
      `DTSTART;VALUE=DATE:${dt}`,
      `DTEND;VALUE=DATE:${dt}`,
      `SUMMARY:${clean(t.title)}`,
      `DESCRIPTION:${clean(t.category)} task (Priority: ${t.priority})`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// ─── Clash Detection ──────────────────────────────────────────────────────────
/**
 * Detects overlapping ceremony items within each ceremony day.
 *
 * @description Compares every pair of items on the same day using a standard
 * interval-overlap check (`aStart < bEnd && bStart < aEnd`). Overlaps across
 * different days are intentionally ignored.
 *
 * @param days - An array of ceremony days, each containing a list of
 *   time-bound ceremony items with `start` and `end` in `"HH:MM"` format.
 * @returns An array of {@link ClashWarning} objects; empty when no overlaps
 *   are detected.
 */
export function detectCeremonyClashes(days: CeremonyDay[]): ClashWarning[] {
  const warnings: ClashWarning[] = [];

  days.forEach((day) => {
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return (h ?? 0) * 60 + (m ?? 0);
    };

    for (let i = 0; i < day.items.length; i++) {
      for (let j = i + 1; j < day.items.length; j++) {
        const a = day.items[i]!;
        const b = day.items[j]!;
        const aStart = toMinutes(a.start);
        const aEnd = toMinutes(a.end);
        const bStart = toMinutes(b.start);
        const bEnd = toMinutes(b.end);

        if (aStart < bEnd && bStart < aEnd) {
          warnings.push({
            dayDate: day.date,
            itemId: b.id,
            message: `Time overlap detected between "${a.what}" (${a.start}–${a.end}) and "${b.what}" (${b.start}–${b.end}) on ${day.label}.`,
          });
        }
      }
    }
  });

  return warnings;
}
