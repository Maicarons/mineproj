const PREFIX = 'mineproj';

export interface Logger {
  log: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

export function createLogger(quiet = false): Logger {
  return {
    log: (message) => {
      if (!quiet) console.log(`[${PREFIX}] ${message}`);
    },
    warn: (message) => {
      console.warn(`[${PREFIX}] WARN: ${message}`);
    },
    error: (message) => {
      console.error(`[${PREFIX}] ERROR: ${message}`);
    },
  };
}
