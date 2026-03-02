/**
 * Phase 4: Shared logging utility for edge functions.
 * Structured logging with consistent format across all functions.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  fn: string;
  msg: string;
  data?: Record<string, unknown>;
  durationMs?: number;
  requestId?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL: LogLevel = 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatEntry(entry: LogEntry): string {
  const parts = [`[${entry.fn}]`, entry.msg];
  if (entry.durationMs !== undefined) parts.push(`(${entry.durationMs}ms)`);
  if (entry.requestId) parts.push(`req=${entry.requestId}`);
  return parts.join(' ');
}

/**
 * Create a scoped logger for an edge function.
 */
export function createLogger(functionName: string, requestId?: string) {
  const log = (level: LogLevel, msg: string, data?: Record<string, unknown>) => {
    if (!shouldLog(level)) return;
    const entry: LogEntry = { level, fn: functionName, msg, data, requestId };
    const formatted = formatEntry(entry);
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';

    switch (level) {
      case 'debug': console.debug(formatted + dataStr); break;
      case 'info': console.log(formatted + dataStr); break;
      case 'warn': console.warn(formatted + dataStr); break;
      case 'error': console.error(formatted + dataStr); break;
    }
  };

  return {
    debug: (msg: string, data?: Record<string, unknown>) => log('debug', msg, data),
    info: (msg: string, data?: Record<string, unknown>) => log('info', msg, data),
    warn: (msg: string, data?: Record<string, unknown>) => log('warn', msg, data),
    error: (msg: string, data?: Record<string, unknown>) => log('error', msg, data),
    /** Time an async operation and log its duration. */
    async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
      const start = performance.now();
      try {
        const result = await fn();
        const ms = Math.round(performance.now() - start);
        log('info', `${label} completed`, { durationMs: ms });
        return result;
      } catch (err) {
        const ms = Math.round(performance.now() - start);
        log('error', `${label} failed`, { durationMs: ms, error: String(err) });
        throw err;
      }
    },
  };
}

/**
 * Generate a short request ID for tracing.
 */
export function generateRequestId(): string {
  return crypto.randomUUID().slice(0, 8);
}
