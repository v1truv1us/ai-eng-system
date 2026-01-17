/**
 * CLI UI utilities for ai-eng ralph
 *
 * Console styling and output helpers
 */
import { EOL } from "node:os";

export namespace UI {
    export const Style = {
        // Colors
        TEXT_HIGHLIGHT: "\x1b[96m",
        TEXT_HIGHLIGHT_BOLD: "\x1b[96m\x1b[1m",
        TEXT_DIM: "\x1b[90m",
        TEXT_DIM_BOLD: "\x1b[90m\x1b[1m",
        TEXT_NORMAL: "\x1b[0m",
        TEXT_NORMAL_BOLD: "\x1b[1m",
        TEXT_WARNING: "\x1b[93m",
        TEXT_WARNING_BOLD: "\x1b[93m\x1b[1m",
        TEXT_DANGER: "\x1b[91m",
        TEXT_DANGER_BOLD: "\x1b[91m\x1b[1m",
        TEXT_SUCCESS: "\x1b[92m",
        TEXT_SUCCESS_BOLD: "\x1b[92m\x1b[1m",
        TEXT_INFO: "\x1b[94m",
        TEXT_INFO_BOLD: "\x1b[94m\x1b[1m",
    };

    export function println(...message: string[]): void {
        process.stderr.write(message.join(" ") + EOL);
    }

    export function print(...message: string[]): void {
        process.stderr.write(message.join(" "));
    }

    export function error(message: string): void {
        println(
            `${Style.TEXT_DANGER_BOLD}Error: ${Style.TEXT_NORMAL}${message}`,
        );
    }

    export function success(message: string): void {
        println(`${Style.TEXT_SUCCESS_BOLD}✓ ${Style.TEXT_NORMAL}${message}`);
    }

    export function info(message: string): void {
        println(`${Style.TEXT_INFO_BOLD}ℹ ${Style.TEXT_NORMAL}${message}`);
    }

    export function warn(message: string): void {
        println(`${Style.TEXT_WARNING_BOLD}! ${Style.TEXT_NORMAL}${message}`);
    }

    export function header(title: string): void {
        println();
        println(Style.TEXT_HIGHLIGHT_BOLD + title + Style.TEXT_NORMAL);
        println(Style.TEXT_DIM + "─".repeat(50) + Style.TEXT_NORMAL);
    }
}
