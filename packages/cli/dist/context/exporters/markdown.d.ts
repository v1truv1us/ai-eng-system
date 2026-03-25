/**
 * Markdown exporter for CommandContextEnvelope.
 */
import type { CommandContextEnvelope, ContextConfig } from "../types";
import type { ContextExporter } from "./types";
export declare class MarkdownContextExporter implements ContextExporter {
    private outputDir;
    constructor(config: ContextConfig);
    exportEnvelope(envelope: CommandContextEnvelope): Promise<void>;
}
