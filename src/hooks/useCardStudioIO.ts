'use client';

import { useEffect, useState } from 'react';
import { compressPortrait, exportCardDesign, importCardDesign } from '@/lib/cardDesignFiles';
import type { CardDesign } from '@/lib/types';
import { PRINT_BODY_CLASS } from '@/lib/constants';

async function loadDesignFile(file: File, onChange: (design: CardDesign) => void, setStatus: (message: string) => void) {
  try { onChange(await importCardDesign(file)); setStatus('Design imported and saved.'); }
  catch (error) { setStatus(error instanceof Error ? error.message : 'Could not import this design.'); }
}

async function loadPortrait(file: File | undefined, design: CardDesign, onChange: (design: CardDesign) => void, setStatus: (message: string) => void) {
  if (!file) return;
  try { onChange({ ...design, portraitDataUrl: await compressPortrait(file) }); setStatus('Portrait added to this card.'); }
  catch (error) { setStatus(error instanceof Error ? error.message : 'Could not add this portrait.'); }
}

function usePrintCleanup() {
  useEffect(() => {
    const cleanup = () => {
      document.body.classList.remove(PRINT_BODY_CLASS);
      document.body.classList.remove('auraplan-printing');
    };
    window.addEventListener('afterprint', cleanup);
    return () => window.removeEventListener('afterprint', cleanup);
  }, []);
}

export function useCardStudioIO(design: CardDesign, onChange: (design: CardDesign) => void) {
  const [status, setStatus] = useState('Saved in your event workspace.');
  usePrintCleanup();
  return {
    status,
    importFile: (file: File) => loadDesignFile(file, onChange, setStatus),
    uploadPortrait: (file: File | undefined) => loadPortrait(file, design, onChange, setStatus),
    exportFile: () => exportCardDesign(design),
    printCard: () => {
      document.body.classList.add(PRINT_BODY_CLASS);
      window.print();
    },
  };
}
