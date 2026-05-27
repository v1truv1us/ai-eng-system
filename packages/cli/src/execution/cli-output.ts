/**
 * CLI output adapter that delegates to the UI module.
 *
 * Usage: Pass an instance of this to RalphLoop via the output option.
 * When ralph-loop.ts is refactored to accept an IOutput, this adapter
 * provides the CLI implementation.
 *
 * For now, ralph-loop.ts still calls UI directly. This adapter is
 * ready to be wired in when the injection is complete.
 */

import type { IOutput } from "./output";
import { UI } from "../cli/ui";

export class CliOutput implements IOutput {
    header(text: string): void {
        UI.header(text);
    }

    info(message: string): void {
        UI.info(message);
    }

    warn(message: string): void {
        UI.warn(message);
    }

    print(text: string): void {
        UI.print(text);
    }

    println(text?: string): void {
        UI.println(text);
    }

    style(text: string, type: "dim" | "bold" | "normal"): string {
        switch (type) {
            case "dim":
                return `${UI.Style.TEXT_DIM}${text}${UI.Style.TEXT_NORMAL}`;
            case "bold":
                return `${UI.Style.TEXT_NORMAL_BOLD}${text}${UI.Style.TEXT_NORMAL}`;
            default:
                return text;
        }
    }
}
