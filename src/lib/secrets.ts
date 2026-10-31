// Secret management — reads from env, never exposes to client
import 'server-only';

export interface AppSecrets {
  geminiApiKey: string;
  firestoreProjectId: string | undefined;
}

function getEnvVar(name: string): string | undefined {
  return process.env[name];
}

export function getGeminiApiKey(): string {
  const key = getEnvVar('GEMINI_API_KEY');
  if (!key) throw new MissingKeyError('GEMINI_API_KEY environment variable is not set');
  return key;
}

export function getFirestoreProjectId(): string | undefined {
  return getEnvVar('FIRESTORE_PROJECT_ID') ?? getEnvVar('GCLOUD_PROJECT');
}

export function hasGeminiKey(): boolean {
  return Boolean(getEnvVar('GEMINI_API_KEY'));
}

export class MissingKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingKeyError';
  }
}
