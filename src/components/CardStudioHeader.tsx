'use client';

import { useRef, type KeyboardEvent } from 'react';
import { BadgeCheck, Download, ReceiptText, Sparkles, Ticket, Upload } from 'lucide-react';
import type { CardDesign, CardTemplate } from '@/lib/types';
import styles from './CardStudio.module.css';

interface Props {
  design: CardDesign;
  status: string;
  onTemplateChange: (template: CardTemplate) => void;
  onImport: (file: File) => void;
  onExport: () => void;
}

const templates: { id: CardTemplate; label: string; size: string; Icon: typeof Ticket }[] = [
  { id: 'floral', label: 'Floral invitation', size: '5 × 7 in', Icon: Sparkles },
  { id: 'ticket', label: 'Foldout ticket', size: '7 × 3 in', Icon: Ticket },
  { id: 'badge', label: 'VIP access pass', size: '3.5 × 5.5 in', Icon: BadgeCheck },
  { id: 'receipt', label: 'Receipt collage', size: '5 × 7 in', Icon: ReceiptText },
];

function handleTemplateKey(event: KeyboardEvent<HTMLButtonElement>, selected: CardTemplate, onChange: Props['onTemplateChange']) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  const index = templates.findIndex((template) => template.id === selected);
  const next = templates[(index + (event.key === 'ArrowRight' ? 1 : templates.length - 1)) % templates.length];
  if (!next) return;
  onChange(next.id);
  document.getElementById(`card-template-${next.id}`)?.focus();
}

function TemplatePicker({ selected, onChange }: { selected: CardTemplate; onChange: Props['onTemplateChange'] }) {
  const thumbClasses: Record<CardTemplate, string> = { floral: styles.thumbFloral || '', badge: styles.thumbBadge, receipt: styles.thumbReceipt, ticket: styles.thumbTicket };
  return <div className={styles.templateGrid} role="tablist" aria-label="Card format">
    {templates.map(({ id, label, size, Icon }) => <button key={id} id={`card-template-${id}`} type="button" role="tab" aria-selected={selected === id} aria-controls="card-studio-preview" tabIndex={selected === id ? 0 : -1} className={styles.templateButton} onClick={() => onChange(id)} onKeyDown={(event) => handleTemplateKey(event, id, onChange)}>
      <span className={`${styles.thumb} ${thumbClasses[id]}`} aria-hidden="true"><Icon /></span><span className={styles.templateCopy}><strong>{label}</strong><small>{size}</small></span><span className={styles.templateCheck} aria-hidden="true">✓</span>
    </button>)}
  </div>;
}

function StudioActions({ status, onImport, onExport }: Pick<Props, 'status' | 'onImport' | 'onExport'>) {
  const inputRef = useRef<HTMLInputElement>(null);
  function acceptFile() {
    const file = inputRef.current?.files?.[0];
    if (file) onImport(file);
    if (inputRef.current) inputRef.current.value = '';
  }
  return <div className={styles.toolbar}><span className={styles.saved} role="status" aria-live="polite">{status}</span>
    <label className={styles.button} htmlFor="card-design-import"><Upload aria-hidden="true" />Import</label>
    <input ref={inputRef} id="card-design-import" className={styles.hiddenInput} type="file" accept="application/json,.json" onChange={acceptFile} />
    <button className={styles.button} type="button" onClick={onExport}><Download aria-hidden="true" />Export</button>
  </div>;
}

export default function CardStudioHeader(props: Props) {
  return <><div className={styles.heading}><div><p className={styles.eyebrow}><Sparkles aria-hidden="true" /> ATELIER PRINT STUDIO</p><h1 id="card-studio-title" className={styles.title}>Make a card worth keeping.</h1><p className={styles.subtitle}>Choose a format, edit each detail, and print a keepsake for your event.</p></div><StudioActions status={props.status} onImport={props.onImport} onExport={props.onExport} /></div><TemplatePicker selected={props.design.template} onChange={props.onTemplateChange} /></>;
}
