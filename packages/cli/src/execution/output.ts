/**
 * Output interface for decoupling the execution engine from CLI rendering.
 *
 * The execution engine calls these methods; the CLI provides the concrete
 * implementation (currently delegates to the UI module).
 *
 * This allows the execution engine to be tested without a terminal
 * and enables future non-CLI interfaces (API, daemon mode).
 */

export interface IOutput {
    header(text: string): void;
    info(message: string): void;
    warn(message: string): void;
    print(text: string): void;
    println(text?: string): void;
    style(text: string, type: "dim" | "bold" | "normal"): string;
}

/**
 * Style constants for consistent output formatting.
 */
export const OutputStyle = {
    DIM: "\x1b[2m",
    NORMAL: "\x1b[0m",
    BOLD: "\x1b[1m",
} as const;
