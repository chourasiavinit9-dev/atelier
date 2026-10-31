import { CardDesignSchema } from './validators';
import type { CardDesign } from './types';

export async function importCardDesign(file: File): Promise<CardDesign> {
  if (file.size > 1_000_000) throw new Error('Choose a design file under 1 MB.');
  const parsed = CardDesignSchema.safeParse(JSON.parse(await file.text()) as unknown);
  if (!parsed.success) throw new Error('This is not a valid Atelier card design.');
  return parsed.data;
}

export function exportCardDesign(design: CardDesign): void {
  const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `atelier-${design.template}-design.json`;
  document.body.append(anchor);
  anchor.click();
  window.setTimeout(() => { URL.revokeObjectURL(url); anchor.remove(); }, 1_000);
}

export async function compressPortrait(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > 10_000_000) throw new Error('Choose a portrait under 10 MB.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 360 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) { bitmap.close(); throw new Error('Could not prepare this portrait.'); }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const portrait = canvas.toDataURL('image/jpeg', 0.76);
  if (portrait.length > 500_000) throw new Error('This portrait is too detailed to save. Choose another image.');
  return portrait;
}
