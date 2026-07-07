type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

type LogContext = Record<string, unknown>;

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
};

function sanitize(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
      if (/password|token|secret|key|hash/i.test(key)) {
        return [key, "[redacted]"];
      }
      return [key, entry];
    }),
  );
}

function formatLog(entry: LogEntry) {
  return JSON.stringify({
    timestamp: entry.timestamp,
    level: entry.level,
    message: entry.message,
    context: entry.context ? sanitize(entry.context) : undefined,
    error: entry.error
      ? {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        }
      : undefined,
  });
}

function write(level: LogLevel, message: string, context?: LogContext, error?: Error) {
  const line = formatLog({
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error,
  });

  if (level === "ERROR") {
    console.error(line);
    return;
  }

  if (level === "WARN") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === "development") {
      write("DEBUG", message, context);
    }
  },
  info(message: string, context?: LogContext) {
    write("INFO", message, context);
  },
  warn(message: string, context?: LogContext) {
    write("WARN", message, context);
  },
  error(message: string, error?: Error, context?: LogContext) {
    write("ERROR", message, context, error);

    // Sentry/error tracking template:
    // Sentry.captureException(error, { extra: context });
  },
};
