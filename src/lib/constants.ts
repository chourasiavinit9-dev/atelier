// All magic values, configuration constants, and enumerations for Atelier

import type { BudgetCategory, EventType, CityTier, NavScreen } from './types';

// ─── Model & API ─────────────────────────────────────────────────────────────
export const GEMINI_MODEL = 'gemini-3.5-flash' as const;
export const GEMINI_TIMEOUT_MS = 30_000 as const;
export const GEMINI_MAX_RETRIES = 3 as const;
export const GEMINI_RETRY_BASE_MS = 1_000 as const;
export const GEMINI_RETRY_MAX_MS = 8_000 as const;

// ─── Rate Limiting ────────────────────────────────────────────────────────────
export const RATE_LIMIT_BURST_COUNT = 5 as const;
export const RATE_LIMIT_BURST_WINDOW_MS = 3_000 as const;
export const RATE_LIMIT_SLIDING_COUNT = 20 as const;
export const RATE_LIMIT_SLIDING_WINDOW_MS = 600_000 as const; // 10 min
export const MAX_PAYLOAD_BYTES = 102_400 as const; // 100 KB
export const QUOTE_FILE_MAX_BYTES = 5_242_880 as const; // 5 MB

// ─── Validation Limits ────────────────────────────────────────────────────────
export const VIBE_MAX_CHARS = 500 as const;
export const TRADITIONS_MAX_CHARS = 200 as const;
export const LANGUAGE_MAX_CHARS = 80 as const;
export const GUEST_COUNT_MIN = 1 as const;
export const GUEST_COUNT_MAX = 5_000 as const;
export const GUEST_LIST_MAX = 5_000 as const;
export const BUDGET_MIN = 1 as const;
export const NOTES_MAX_CHARS = 1_000 as const;
export const CITY_MAX_CHARS = 100 as const;
export const PAID_TO_MAX_CHARS = 60 as const;
export const PAYMENT_NOTE_MAX_CHARS = 200 as const;
export const GUEST_SCHEDULE_INTRO_MAX = 160 as const;
export const INVITATION_FIELD_MAX = 180 as const; // absolute ceiling; each slot has its own
export const CEREMONY_FUNCTION_MAX = 20 as const; // max user-selected functions

// ─── Storage ──────────────────────────────────────────────────────────────────
export const STORAGE_KEY = 'atelier_workspace' as const;
export const LEGACY_STORAGE_KEY = 'auraplan_workspace' as const;
export const STORAGE_VERSION = 2 as const;     // bumped — new slices added
export const UNDO_STACK_MAX = 10 as const;
export const PRINT_BODY_CLASS = 'atelier-printing' as const;

// ─── Cache ────────────────────────────────────────────────────────────────────
export const CACHE_TTL_MS = 3_600_000 as const; // 1 hour
export const CACHE_COLLECTION = 'plan_cache' as const;

// ─── Budget categories (ordered) ──────────────────────────────────────────────
export const BUDGET_CATEGORIES: BudgetCategory[] = [
  'Venue and booking charges',
  'Catering and refreshments',
  'Decorations and flowers',
  'Photography and videography',
  'Entertainment',
  'Invitations and stationery',
  'Transportation and miscellaneous',
];

// Catering index (used for "use confirmed headcount" recalculation)
export const CATERING_CATEGORY_INDEX = 1 as const;

// Base allocation percentages per event type (must sum to 100)
export const BUDGET_PERCENTAGES: Record<EventType, number[]> = {
  Wedding:         [30, 25, 15, 12,  8, 5, 5],
  Birthday:        [25, 30, 20, 10,  8, 3, 4],
  'Community Event':[35, 28, 12,  8,  7, 4, 6],
};

// City-tier multipliers (applied to estimated price ranges)
export const CITY_TIER_MULTIPLIER: Record<CityTier, number> = {
  Metro:  1.0,
  'Tier-2': 0.7,
  'Tier-3': 0.5,
};

// ─── Timeline milestones ──────────────────────────────────────────────────────
export const TIMELINE_MILESTONES_MONTHS = [6, 3, 1] as const;
export const TIMELINE_MILESTONES_WEEKS = [1] as const;
export const TIMELINE_DAY_BEFORE = 1 as const;

// ─── Themes ───────────────────────────────────────────────────────────────────
export const THEME_COUNT = 3 as const;

// ─── Plan Health weights ──────────────────────────────────────────────────────
export const HEALTH_WEIGHT_BUDGET = 25 as const;
export const HEALTH_WEIGHT_TASKS = 25 as const;
export const HEALTH_WEIGHT_VENDORS = 25 as const;
export const HEALTH_WEIGHT_RUNSHEET = 25 as const;

// ─── Navigation screens ───────────────────────────────────────────────────────
export const NAV_ITEMS: { id: NavScreen; label: string; group: string }[] = [
  { id: 'today',        label: 'Today',             group: 'Overview' },
  { id: 'budget',       label: 'Budget',             group: 'Planning' },
  { id: 'timeline',     label: 'Timeline',           group: 'Planning' },
  { id: 'vendors',      label: 'Vendors',            group: 'Planning' },
  { id: 'themes',       label: 'Ideas & Themes',     group: 'Planning' },
  { id: 'guests',       label: 'Guests',             group: 'People' },
  { id: 'ceremonies',   label: 'Ceremony Schedule',  group: 'Day-of' },
  { id: 'runsheet',     label: 'Run Sheet',          group: 'Day-of' },
  { id: 'guestschedule',label: 'Guest Schedule Card',group: 'Day-of' },
  { id: 'assistant',    label: 'AI Assistant',       group: 'AI Tools' },
  { id: 'budgetlog',    label: 'Budget Log',         group: 'Finance' },
  { id: 'familysummary',label: 'Family Summary',     group: 'Sharing' },
  { id: 'invitations',  label: 'Invitations',        group: 'Sharing' },
  { id: 'cards',        label: 'Card Studio',        group: 'Sharing' },
  { id: 'vendormap',    label: 'Vendor Map',         group: 'Explore' },
];

// Keep TABS for backward-compat with existing components during migration
export const TABS = [
  { id: 'budget',   label: 'Budget Planner' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'vendors',  label: 'Vendors' },
  { id: 'themes',   label: 'Theme Studio' },
  { id: 'cards',    label: 'Card Studio' },
] as const;
export type TabId = (typeof TABS)[number]['id'];

// ─── Disclaimer ───────────────────────────────────────────────────────────────
export const AI_DISCLAIMER =
  'AI-Generated Estimates (Not Confirmed Vendor Quotes)' as const;

// ─── Prompt-injection defense delimiters ──────────────────────────────────────
export const USER_INPUT_START = '<<<USER_DATA_START>>>' as const;
export const USER_INPUT_END   = '<<<USER_DATA_END>>>'   as const;

// ─── Guest RSVP options ───────────────────────────────────────────────────────
export const RSVP_OPTIONS = ['Invited', 'Yes', 'No', 'Maybe'] as const;

// ─── Payment methods ──────────────────────────────────────────────────────────
export const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank transfer', 'Cheque'] as const;

// ─── Ceremony functions by event type ────────────────────────────────────────
export const CEREMONY_FUNCTIONS: Record<EventType, string[]> = {
  Wedding: [
    'Haldi', 'Mehendi', 'Sangeet', 'Baraat', 'Ceremony', 'Reception',
    'Engagement', 'Sagai', 'Haldi Party', 'Cocktail Night',
  ],
  Birthday: [
    'Cake Cutting', 'Games', 'Dinner', 'Welcome', 'Speeches',
    'Dancing', 'Gift Opening',
  ],
  'Community Event': [
    'Registration', 'Opening Ceremony', 'Programme Items', 'Keynote',
    'Workshop', 'Lunch Break', 'Cultural Performance', 'Vote of Thanks',
  ],
};

// ─── Invitation templates (data, no raster images or stock art) ───────────────
export const INVITATION_TEMPLATES = [
  {
    id: 'floral-wedding',
    name: 'Floral Wedding',
    eventTypes: ['Wedding'] as EventType[],
    palettes: ['blush', 'ivory', 'sage'],
    variant: 'invitation' as const,
    slots: [
      { key: 'host', label: 'Host Names', maxLength: 60, required: true },
      { key: 'bride', label: 'Bride', maxLength: 40, required: true },
      { key: 'groom', label: 'Groom', maxLength: 40, required: true },
      { key: 'date', label: 'Date', maxLength: 40, required: true },
      { key: 'time', label: 'Time', maxLength: 30, required: true },
      { key: 'venue', label: 'Venue', maxLength: 80, required: true },
      { key: 'rsvp', label: 'RSVP Contact', maxLength: 60, required: false },
      { key: 'personal', label: 'Personal Note', maxLength: 120, required: false },
    ],
  },
  {
    id: 'classic-save-date',
    name: 'Classic Save the Date',
    eventTypes: ['Wedding', 'Birthday', 'Community Event'] as EventType[],
    palettes: ['navy', 'emerald', 'slate'],
    variant: 'save-the-date' as const,
    slots: [
      { key: 'host', label: 'Host / Couple Names', maxLength: 60, required: true },
      { key: 'date', label: 'Date', maxLength: 40, required: true },
      { key: 'city', label: 'City', maxLength: 40, required: true },
      { key: 'personal', label: 'Personal Line', maxLength: 100, required: false },
    ],
  },
  {
    id: 'festive-birthday',
    name: 'Festive Birthday',
    eventTypes: ['Birthday'] as EventType[],
    palettes: ['coral', 'gold', 'lavender'],
    variant: 'invitation' as const,
    slots: [
      { key: 'host', label: 'Hosted by', maxLength: 60, required: true },
      { key: 'name', label: 'Name of Birthday Person', maxLength: 50, required: true },
      { key: 'milestone', label: 'Milestone (e.g. Turns 30!)', maxLength: 40, required: false },
      { key: 'date', label: 'Date', maxLength: 40, required: true },
      { key: 'time', label: 'Time', maxLength: 30, required: true },
      { key: 'venue', label: 'Venue', maxLength: 80, required: true },
      { key: 'rsvp', label: 'RSVP Contact', maxLength: 60, required: false },
    ],
  },
  {
    id: 'community-programme',
    name: 'Community Programme',
    eventTypes: ['Community Event'] as EventType[],
    palettes: ['teal', 'amber', 'indigo'],
    variant: 'invitation' as const,
    slots: [
      { key: 'org', label: 'Organiser', maxLength: 60, required: true },
      { key: 'event', label: 'Event Name', maxLength: 60, required: true },
      { key: 'date', label: 'Date', maxLength: 40, required: true },
      { key: 'time', label: 'Time', maxLength: 30, required: true },
      { key: 'venue', label: 'Venue', maxLength: 80, required: true },
      { key: 'contact', label: 'Contact / RSVP', maxLength: 60, required: false },
      { key: 'personal', label: 'Welcome Line', maxLength: 120, required: false },
    ],
  },
  {
    id: 'thank-you-card',
    name: 'Thank You Card',
    eventTypes: ['Wedding', 'Birthday', 'Community Event'] as EventType[],
    palettes: ['blush', 'sage', 'slate'],
    variant: 'thank-you' as const,
    slots: [
      { key: 'from', label: 'From', maxLength: 60, required: true },
      { key: 'personal', label: 'Thank You Message', maxLength: 180, required: true },
      { key: 'date', label: 'Date', maxLength: 40, required: false },
    ],
  },
  {
    id: 'minimal-modern',
    name: 'Minimal Modern',
    eventTypes: ['Wedding', 'Birthday', 'Community Event'] as EventType[],
    palettes: ['charcoal', 'white', 'gold'],
    variant: 'invitation' as const,
    slots: [
      { key: 'host', label: 'Host', maxLength: 60, required: true },
      { key: 'event', label: 'Event', maxLength: 60, required: true },
      { key: 'date', label: 'Date', maxLength: 40, required: true },
      { key: 'time', label: 'Time', maxLength: 30, required: true },
      { key: 'venue', label: 'Venue', maxLength: 80, required: true },
      { key: 'rsvp', label: 'RSVP', maxLength: 60, required: false },
      { key: 'personal', label: 'Personal Line', maxLength: 120, required: false },
    ],
  },
] as const;

export type InvitationTemplateId = (typeof INVITATION_TEMPLATES)[number]['id'];

// ─── Map & Geolocation Constants ─────────────────────────────────────────────
export const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search' as const;
export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' as const;
export const OSM_ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' as const;
export const LEAFLET_VERSION = '1.9.4' as const;
export const LEAFLET_CDN_BASE = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}` as const;
export const LEAFLET_CSS_URL = `${LEAFLET_CDN_BASE}/leaflet.min.css` as const;
export const LEAFLET_ICON_URL = `${LEAFLET_CDN_BASE}/images/marker-icon.png` as const;
export const LEAFLET_ICON_RETINA_URL = `${LEAFLET_CDN_BASE}/images/marker-icon-2x.png` as const;
export const LEAFLET_SHADOW_URL = `${LEAFLET_CDN_BASE}/images/marker-shadow.png` as const;
export const GMAPS_DIRECTIONS_BASE = 'https://www.google.com/maps/dir/' as const;

export const MAP_DEFAULT_ZOOM = 13 as const;
export const MAP_MAX_ZOOM = 19 as const;
export const MAP_SEARCH_RADIUS_KM = 20 as const;
export const MAP_DEFAULT_RADIUS_KM = 10 as const;
export const MAP_VIEWBOX_DELTA = 0.15 as const;
export const MAP_RESULT_LIMIT = 12 as const;
export const GEOLOCATION_TIMEOUT_MS = 10_000 as const;

export const VENDOR_CATEGORY_QUERIES: Record<string, string> = {
  'Venue':         'wedding hall banquet venue',
  'Catering':      'catering service restaurant',
  'Photography':   'photographer studio',
  'Entertainment': 'DJ band entertainment',
  'Decoration':    'flower decoration event',
  'Invitations':   'printing stationery',
  'Transport':     'car rental transport',
} as const;

// ─── Initial Sample Guests ───────────────────────────────────────────────────
export const SAMPLE_GUEST_NAMES: readonly string[] = [
  'Aarav Sharma', 'Priya Patel', 'Rohan Mehta', 'Ananya Deshmukh',
  'Vikram Malhotra', 'Neha Verma', 'Rajesh Kulkarni', 'Kavita Nair',
  'Amitabh Gupta', 'Deepika Rao', 'Siddharth Joshi', 'Meera Kapoor',
] as const;

// ─── Card Preview Fallbacks & Defaults ───────────────────────────────────────
export const CARD_PREVIEW_DEFAULTS = {
  floral: {
    eventTitle: 'Summer Garden Soirée',
    eventDate: 'Saturday, July 26',
    message: 'Join us to celebrate',
  },
  ticket: {
    hostNames: 'Elena & Alexander',
    eventDate: '28.08.2026',
    venue: 'GRAND PAVILION, SKYLINE BOULEVARD',
    dressCode: 'Black Tie Elegance',
    eventTime: '18:00',
    ticketLabel: 'WEDDING PREMIERE ACCESS PASS',
  },
  member: {
    cardBrand: 'ATELIER · EVENT PRIVILEGE',
    hostNames: 'DISTINGUISHED GUEST',
    memberId: 'ATL-9840-706',
    perk: 'VIP Reserved Lounge & Fast-Track Access',
    message: 'HONOURED TO WELCOME YOU TO AN UNFORGETTABLE EVENING OF CELEBRATION',
    website: 'ATELIER.EVENTS',
  },
  receipt: {
    storeName: "The Grand Reception",
    eventDate: 'SUNDAY EVENING',
    item1: 'ARTISANAL HORS D\'OEUVRES',
    price1: '96.00',
    item2: 'CUSTOM MIXOLOGY BAR COCKTAILS',
    price2: '128.00',
    item3: 'EXECUTIVE CHEF MULTI-COURSE BANQUET',
    price3: '228.00',
    defaultTotal: 807,
  },
} as const;
