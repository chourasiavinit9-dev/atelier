'use client';

import CardPreview from '@/components/CardPreview';
import CardStudioControls from '@/components/CardStudioControls';
import CardStudioHeader from '@/components/CardStudioHeader';
import { useCardStudioIO } from '@/hooks/useCardStudioIO';
import type { CardDesign, CardDesignFields, Currency } from '@/lib/types';
import styles from './CardStudio.module.css';

interface Props { design: CardDesign; currency: Currency; onChange: (design: CardDesign) => void; }

function updateField(design: CardDesign, onChange: Props['onChange'], field: keyof CardDesignFields, value: string) {
  const safeValue = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, 180);
  onChange({ ...design, fields: { ...design.fields, [field]: safeValue } });
}

function updateDesign(design: CardDesign, onChange: Props['onChange'], patch: Partial<CardDesign>) {
  onChange({ ...design, ...patch });
}

export default function CardStudio({ design, currency, onChange }: Props) {
  const io = useCardStudioIO(design, onChange);
  const fieldChange = (field: keyof CardDesignFields, value: string) => updateField(design, onChange, field, value);
  const designChange = (patch: Partial<CardDesign>) => updateDesign(design, onChange, patch);
  return <section id="card-studio-root" className={styles.root} aria-labelledby="card-studio-title">
    <CardStudioHeader design={design} status={io.status} onTemplateChange={(template) => designChange({ template })} onImport={io.importFile} onExport={io.exportFile} />
    <div className={styles.workspace}><CardStudioControls design={design} onFieldChange={fieldChange} onDesignChange={designChange} onPortraitChange={io.uploadPortrait} />
      <CardPreview design={design} currency={currency} onPrint={io.printCard} />
    </div>
  </section>;
}
