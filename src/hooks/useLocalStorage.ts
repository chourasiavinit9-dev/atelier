'use client';
import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEY, LEGACY_STORAGE_KEY, STORAGE_VERSION } from '@/lib/constants';
import { WorkspaceSchema } from '@/lib/validators';
import type { Workspace } from '@/lib/types';

type StorageState = Workspace | null;

function readStorage(): StorageState {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const result = WorkspaceSchema.safeParse(parsed);
    if (!result.success) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (result.data.version !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return result.data;
  } catch {
    return null;
  }
}

function writeStorage(workspace: Workspace): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

interface StorageHookState {
  workspace: StorageState;
  hydrated: boolean;
}

export function useLocalStorage() {
  const [state, setState] = useState<StorageHookState>({ workspace: null, hydrated: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional SSR-safe hydration: reads localStorage only after mount
    setState({ workspace: readStorage(), hydrated: true });
  }, []);

  const saveWorkspace = useCallback((ws: Workspace) => {
    writeStorage(ws);
    setState((prev) => ({ ...prev, workspace: ws }));
  }, []);

  const clearWorkspace = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    setState((prev) => ({ ...prev, workspace: null }));
  }, []);

  return { workspace: state.workspace, saveWorkspace, clearWorkspace, hydrated: state.hydrated };
}
