import type {
  BudgetCategoryAllocation, CardDesign, CardDesignColors, CardDesignFields,
  CardPalette, Currency, EventFormInput,
} from './types';

export const CARD_PALETTES: Record<Exclude<CardPalette, 'custom'>, CardDesignColors> = {
  berry: { accent: '#a83c61', deep: '#54273e', leaf: '#899579', paper: '#fff8ee' },
  dragonfruit: { accent: '#dc4d78', deep: '#5d2d58', leaf: '#9b806a', paper: '#fff6f1' },
  citrus: { accent: '#d98249', deep: '#71442f', leaf: '#83945e', paper: '#fff8e7' },
  coastal: { accent: '#578d8a', deep: '#345961', leaf: '#879674', paper: '#f6f7ed' },
};

function formatEventDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function formatCardAmount(value: number, currency: Currency): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

function createEventFields(input: EventFormInput): Partial<CardDesignFields> {
  const eventTitle = input.eventType === 'Wedding' ? 'A day to remember' : `${input.eventType} celebration`;
  const message = input.vibeAndPreferences.slice(0, 150) || 'A gathering made special by the people we love.';
  return { eventTitle, hostNames: 'Your names', eventDate: formatEventDate(input.eventDate), eventTime: '6:00 PM', venue: input.city, message };
}

function createReceiptFields(input: EventFormInput, budget: BudgetCategoryAllocation[]): Partial<CardDesignFields> {
  const amount = (index: number) => formatCardAmount(budget[index]?.allocatedAmount ?? 0, input.currency);
  return {
    receiptHeading: 'A night to remember', receiptItem1: 'Venue & welcome', receiptPrice1: amount(0),
    receiptItem2: 'Dinner under the stars', receiptPrice2: amount(1), receiptItem3: 'Music & dancing',
    receiptPrice3: amount(4), receiptFooter: 'THE LITTLE DETAILS THAT MAKE A DAY',
  };
}

function createTicketFields(input: EventFormInput): Partial<CardDesignFields> {
  const code = `ATL-${input.eventDate.replace(/-/g, '').slice(-6)}`;
  return { ticketLabel: 'INVITATION · ADMIT ONE', seat: 'TABLE 07 · GARDEN', dressCode: 'FESTIVE FORMAL', entryCode: code };
}

function createBadgeFields(input: EventFormInput): Partial<CardDesignFields> {
  const code = `ATL-${input.eventDate.replace(/-/g, '').slice(-6)}`;
  return { cardBrand: 'ATELIER · EVENT EDITION', memberId: code, perk: 'One beautiful evening', website: `ATELIER · ${input.city}` };
}

export function createDefaultCardDesign(input: EventFormInput, budget: BudgetCategoryAllocation[]): CardDesign {
  return {
    template: 'ticket', palette: 'berry', colors: { ...CARD_PALETTES.berry }, font: 'editorial',
    finish: 'linen', layout: 'balanced', showBarcode: true, showBotanicals: true,
    fields: {
      eventTitle: '', hostNames: '', eventDate: '', eventTime: '', venue: '', message: '', cardBrand: '',
      memberId: '', perk: '', website: '', receiptHeading: '', receiptItem1: '', receiptPrice1: '',
      receiptItem2: '', receiptPrice2: '', receiptItem3: '', receiptPrice3: '', receiptFooter: '',
      ticketLabel: '', seat: '', dressCode: '', entryCode: '',
      ...createEventFields(input), ...createReceiptFields(input, budget),
      ...createTicketFields(input), ...createBadgeFields(input),
    },
  };
}

export function receiptTotal(fields: CardDesignFields): number {
  return [fields.receiptPrice1, fields.receiptPrice2, fields.receiptPrice3]
    .reduce((sum, price) => sum + (Number(price.replace(/[^\d.-]/g, '')) || 0), 0);
}
