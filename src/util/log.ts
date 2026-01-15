/**
 * Structured logging for ai-eng ralph
 *
 * Supports both stderr output (with --print-logs) and file-based logging
 */
import path from "node:path";
import fs from "node:fs/promises";

export namespace Log {
    export type Level = "DEBUG" | "INFO" | "WARN" | "ERROR";

    const levelPriority: Record<Level, number> = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
    };

    let currentLevel: Level = "INFO";
    let logPath = "";
    let write: (msg: string) => any = (msg) => process.stderr.write(msg);

    function shouldLog(level: Level): boolean {
        return levelPriority[level] >= levelPriority[currentLevel];
    }

    export interface Options {
        print: boolean; // When true, write to stderr
        level?: Level;
        logDir?: string; // Directory for log files
    }

    export function file(): string {
        return logPath;
    }

    export async function init(options: Options): Promise<void> {
        if (options.level) currentLevel = options.level;

        // Build the write function that outputs to BOTH stderr AND file
        const stderrWriter = (msg: string) => {
            process.stderr.write(msg);
        };

        if (options.logDir) {
            const timestamp = new Date()
                .toISOString()
                .replace(/[:.]/g, "-")
                .slice(0, -1);
            logPath = path.join(options.logDir, `ralph-${timestamp}.log`);
            await fs.mkdir(options.logDir, { recursive: true });

            const file = Bun.file(logPath);
            const fileWriter = file.writer();

            // Always write to stderr if print is enabled
            // Also always write to file if logDir is provided
            write = (msg) => {
                if (options.print) {
                    stderrWriter(msg);
                }
                fileWriter.write(msg);
                fileWriter.flush();
            };
        } else if (options.print) {
            // Only print to stderr
            write = stderrWriter;
        }
    }

    export interface Logger {
        debug(message: string, extra?: Record<string, any>): void;
        info(message: string, extra?: Record<string, any>): void;
        warn(message: string, extra?: Record<string, any>): void;
        error(message: string, extra?: Record<string, any>): void;
    }

    function formatExtra(extra?: Record<string, any>): string {
        if (!extra) return "";
        const extraStr = Object.entries(extra)
            .map(
                ([k, v]) =>
                    `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`,
            )
            .join(" ");
        return extraStr ? ` ${extraStr}` : "";
    }

    export function create(tags?: Record<string, string>): Logger {
        const tagStr = tags
            ? Object.entries(tags)
                  .map(([k, v]) => `${k}=${v}`)
                  .join(" ")
            : "";
        const tagStrWithSpace = tagStr ? `${tagStr} ` : "";

        return {
            debug(message: string, extra?: Record<string, any>) {
                if (shouldLog("DEBUG")) {
                    write(
                        `DEBUG ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}\n`,
                    );
                }
            },
            info(message: string, extra?: Record<string, any>) {
                if (shouldLog("INFO")) {
                    write(
                        `INFO  ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}\n`,
                    );
                }
            },
            warn(message: string, extra?: Record<string, any>) {
                if (shouldLog("WARN")) {
                    write(
                        `WARN  ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}\n`,
                    );
                }
            },
            error(message: string, extra?: Record<string, any>) {
                if (shouldLog("ERROR")) {
                    write(
                        `ERROR ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}\n`,
                    );
                }
            },
        };
    }

    export const Default = create({ service: "ralph" });
}
