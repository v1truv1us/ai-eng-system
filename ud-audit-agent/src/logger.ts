import pino, { type Logger } from "pino";

let logger: Logger | null = null;

export function getLogger(): Logger {
  if (!logger) {
    logger = pino({
      level: process.env.LOG_LEVEL || "info",
      transport:
        process.env.NODE_ENV === "production"
          ? undefined
          : {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
              },
            },
    });
  }
  return logger;
}

export function createChildLogger(bindings: Record<string, unknown>): Logger {
  return getLogger().child(bindings);
}
