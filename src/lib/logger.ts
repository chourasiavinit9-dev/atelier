// Structured JSON logger for Cloud Logging compatibility
import 'server-only';

type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

interface LogEntry {
  severity: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function writeLog(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = {
    severity: level,
    message,
    timestamp: new Date().toISOString(),
    ...sanitizeContext(context),
  };
  // Use stderr for WARNING/ERROR, stdout for others (Cloud Logging picks both up)
  const output = level === 'ERROR' || level === 'WARNING' ? process.stderr : process.stdout;
  output.write(JSON.stringify(entry) + '\n');
}

function sanitizeContext(ctx?: Record<string, unknown>): Record<string, unknown> {
  if (!ctx) return {};
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(ctx)) {
    if (isSecretKey(key)) safe[key] = '[REDACTED]';
    else safe[key] = value;
  }
  return safe;
}

function isSecretKey(key: string): boolean {
  const lower = key.toLowerCase();
  return lower.includes('key') || lower.includes('secret') || lower.includes('token');
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => writeLog('DEBUG', msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => writeLog('INFO', msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => writeLog('WARNING', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => writeLog('ERROR', msg, ctx),
};
