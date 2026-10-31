'use client';

import type { ChangeEvent } from 'react';
import { CARD_PALETTES } from '@/lib/cardDesign';
import type { CardDesign, CardDesignColors, CardDesignFields } from '@/lib/types';
import styles from './CardStudio.module.css';

interface Props {
  design: CardDesign;
  onFieldChange: (field: keyof CardDesignFields, value: string) => void;
  onDesignChange: (patch: Partial<CardDesign>) => void;
  onPortraitChange: (file: File | undefined) => void;
}

function Field({ field, label, value, max, onChange }: { field: keyof CardDesignFields; label: string; value: string; max: number; onChange: Props['onFieldChange'] }) {
  const id = `card-field-${field}`;
  return <label className={styles.field} htmlFor={id}>{label}<input id={id} maxLength={max} value={value} onChange={(event) => onChange(field, event.target.value)} /></label>;
}

function MessageField({ value, onChange }: { value: string; onChange: Props['onFieldChange'] }) {
  return <label className={styles.field} htmlFor="card-field-message">Message<textarea id="card-field-message" rows={3} maxLength={180} value={value} onChange={(event) => onChange('message', event.target.value)} /></label>;
}

function CommonFields({ design, onFieldChange }: Props) {
  const fields = design.fields;
  return <div className={styles.fieldStack}>
    <Field field="eventTitle" label="Card headline" value={fields.eventTitle} max={70} onChange={onFieldChange} />
    <Field field="hostNames" label="Names or hosts" value={fields.hostNames} max={48} onChange={onFieldChange} />
    <div className={styles.fieldGrid}><Field field="eventDate" label="Date" value={fields.eventDate} max={40} onChange={onFieldChange} /><Field field="eventTime" label="Time" value={fields.eventTime} max={32} onChange={onFieldChange} /></div>
    <Field field="venue" label="Venue" value={fields.venue} max={55} onChange={onFieldChange} />
    <MessageField value={fields.message} onChange={onFieldChange} />
  </div>;
}

function BadgeFields({ design, onFieldChange, onPortraitChange }: Props) {
  const fields = design.fields;
  return <div className={styles.fieldStack}>
    <Field field="cardBrand" label="Brand line" value={fields.cardBrand} max={32} onChange={onFieldChange} />
    <div className={styles.fieldGrid}><Field field="memberId" label="Member ID" value={fields.memberId} max={24} onChange={onFieldChange} /><Field field="perk" label="Guest perk" value={fields.perk} max={34} onChange={onFieldChange} /></div>
    <Field field="website" label="Footer" value={fields.website} max={42} onChange={onFieldChange} />
    <label className={styles.field} htmlFor="card-portrait">Portrait <span className={styles.fieldHint}>Optional · stays in this workspace</span><input id="card-portrait" type="file" accept="image/*" onChange={(event: ChangeEvent<HTMLInputElement>) => onPortraitChange(event.target.files?.[0])} /></label>
  </div>;
}

function ReceiptFields({ design, onFieldChange }: Props) {
  const fields = design.fields;
  return <div className={styles.fieldStack}>
    <Field field="receiptHeading" label="Receipt heading" value={fields.receiptHeading} max={36} onChange={onFieldChange} />
    <div className={styles.fieldGrid}><Field field="receiptItem1" label="Line item 1" value={fields.receiptItem1} max={30} onChange={onFieldChange} /><Field field="receiptPrice1" label="Amount" value={fields.receiptPrice1} max={24} onChange={onFieldChange} /></div>
    <div className={styles.fieldGrid}><Field field="receiptItem2" label="Line item 2" value={fields.receiptItem2} max={30} onChange={onFieldChange} /><Field field="receiptPrice2" label="Amount" value={fields.receiptPrice2} max={24} onChange={onFieldChange} /></div>
    <div className={styles.fieldGrid}><Field field="receiptItem3" label="Line item 3" value={fields.receiptItem3} max={30} onChange={onFieldChange} /><Field field="receiptPrice3" label="Amount" value={fields.receiptPrice3} max={24} onChange={onFieldChange} /></div>
    <Field field="receiptFooter" label="Receipt footer" value={fields.receiptFooter} max={60} onChange={onFieldChange} />
  </div>;
}

function TicketFields({ design, onFieldChange }: Props) {
  const fields = design.fields;
  return <div className={styles.fieldStack}>
    <Field field="ticketLabel" label="Ticket label" value={fields.ticketLabel} max={24} onChange={onFieldChange} />
    <Field field="seat" label="Seat or table" value={fields.seat} max={24} onChange={onFieldChange} />
    <Field field="dressCode" label="Dress code" value={fields.dressCode} max={32} onChange={onFieldChange} />
    <Field field="entryCode" label="Entry code" value={fields.entryCode} max={24} onChange={onFieldChange} />
  </div>;
}

function FloralFields({ design, onFieldChange }: Props) {
  const fields = design.fields;
  return <div className={styles.fieldStack}>
    <Field field="eventTitle" label="Celebration name" value={fields.eventTitle} max={70} onChange={onFieldChange} />
    <Field field="hostNames" label="Hosts / Names" value={fields.hostNames} max={48} onChange={onFieldChange} />
    <Field field="eventDate" label="Date headline" value={fields.eventDate} max={40} onChange={onFieldChange} />
    <MessageField value={fields.message} onChange={onFieldChange} />
  </div>;
}

function TemplateFields(props: Props) {
  const { design, onFieldChange } = props;
  const content = design.template === 'floral' ? <FloralFields {...props} /> : design.template === 'badge' ? <BadgeFields {...props} /> : design.template === 'receipt' ? <ReceiptFields {...props} /> : <TicketFields {...props} />;
  return <><CommonFields design={design} onFieldChange={onFieldChange} onDesignChange={props.onDesignChange} onPortraitChange={props.onPortraitChange} /><div className={styles.sectionDivider}><span>{design.template === 'floral' ? 'FLORAL INVITATION' : design.template === 'badge' ? 'BADGE DETAILS' : design.template === 'receipt' ? 'RECEIPT DETAILS' : 'TICKET DETAILS'}</span></div>{content}</>;
}

function PaletteSelect({ value, colors, onChange }: { value: CardDesign['palette']; colors: CardDesignColors; onChange: (palette: CardDesign['palette'], colors: CardDesignColors) => void }) {
  return <label className={styles.field} htmlFor="card-palette">Natural palette<select id="card-palette" value={value} onChange={(event) => {
    const palette = event.target.value as CardDesign['palette'];
    onChange(palette, palette === 'custom' ? colors : { ...CARD_PALETTES[palette] });
  }}><option value="berry">Berry Garden</option><option value="dragonfruit">Dragonfruit</option><option value="citrus">Citrus Grove</option><option value="coastal">Coastal Botanica</option><option value="custom">Custom colors</option></select></label>;
}

function ColorFields({ colors, onChange }: { colors: CardDesignColors; onChange: (colors: CardDesignColors) => void }) {
  const rows = [{ key: 'accent', label: 'Berry' }, { key: 'deep', label: 'Plum' }, { key: 'leaf', label: 'Sage' }, { key: 'paper', label: 'Paper' }] as const;
  return <div className={styles.colorGrid}>{rows.map(({ key, label }) => <label key={key} htmlFor={`card-color-${key}`} className={styles.colorField}>{label}<input id={`card-color-${key}`} type="color" value={colors[key]} aria-label={`Choose ${label.toLowerCase()} color`} onChange={(event) => onChange({ ...colors, [key]: event.target.value })} /></label>)}</div>;
}

function StyleFields({ design, onDesignChange }: Props) {
  return <div className={styles.styleFields}>
    <PaletteSelect value={design.palette} colors={design.colors} onChange={(palette, colors) => onDesignChange({ palette, colors })} />
    <ColorFields colors={design.colors} onChange={(colors) => onDesignChange({ colors, palette: 'custom' })} />
    <div className={styles.fieldGrid}><label className={styles.field} htmlFor="card-font">Typography<select id="card-font" value={design.font} onChange={(event) => onDesignChange({ font: event.target.value as CardDesign['font'] })}><option value="editorial">Editorial serif</option><option value="modern">Modern sans</option><option value="script">Soft script</option></select></label><label className={styles.field} htmlFor="card-finish">Paper finish<select id="card-finish" value={design.finish} onChange={(event) => onDesignChange({ finish: event.target.value as CardDesign['finish'] })}><option value="linen">Linen</option><option value="smooth">Smooth</option><option value="speckle">Speckled</option></select></label></div>
    <label className={styles.field} htmlFor="card-layout">Layout<select id="card-layout" value={design.layout} onChange={(event) => onDesignChange({ layout: event.target.value as CardDesign['layout'] })}><option value="balanced">Balanced</option><option value="editorial">Editorial</option><option value="compact">Compact</option></select></label>
    <div className={styles.toggleGrid}><label htmlFor="card-show-barcode"><input id="card-show-barcode" type="checkbox" checked={design.showBarcode} onChange={(event) => onDesignChange({ showBarcode: event.target.checked })} /> Barcode / code</label><label htmlFor="card-show-botanicals"><input id="card-show-botanicals" type="checkbox" checked={design.showBotanicals} onChange={(event) => onDesignChange({ showBotanicals: event.target.checked })} /> Botanical details</label></div>
  </div>;
}

export default function CardStudioControls(props: Props) {
  return <aside className={styles.controls} aria-label="Card editor">
    <section className={styles.panel}><div className={styles.panelHeading}><div><span>01 · CONTENT</span><h2>Make it yours</h2></div><span className={styles.sparkle} aria-hidden="true">✳</span></div><TemplateFields {...props} /></section>
    <section className={styles.panel}><div className={styles.panelHeading}><div><span>02 · STYLE</span><h2>Color, type &amp; finish</h2></div></div><StyleFields {...props} /></section>
  </aside>;
}
