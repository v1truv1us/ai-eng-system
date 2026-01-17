/**
 * Discord Webhook Integration
 *
 * Sends notifications to Discord channels via webhooks.
 * Supports rich embeds for cycle progress, errors, and completions.
 */
export interface DiscordWebhookOptions {
    /** Discord webhook URL */
    webhookUrl: string;
    /** Bot username (optional, defaults to "Ralph") */
    username?: string;
    /** Bot avatar URL (optional) */
    avatarUrl?: string;
}
export interface DiscordEmbed {
    /** Embed title */
    title?: string;
    /** Embed description */
    description?: string;
    /** Embed color (decimal, e.g., 0x00FF00 for green) */
    color?: number;
    /** Footer text */
    footer?: string;
    /** Footer icon URL */
    footerIconUrl?: string;
    /** Timestamp (ISO 8601 format) */
    timestamp?: string;
    /** Thumbnail image URL */
    thumbnailUrl?: string;
    /** Image URL */
    imageUrl?: string;
    /** Author name */
    authorName?: string;
    /** Author URL */
    authorUrl?: string;
    /** Author icon URL */
    authorIconUrl?: string;
    /** Fields (name/value pairs) */
    fields?: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
}
export interface DiscordMessage {
    /** Message content (plain text) */
    content?: string;
    /** Username override */
    username?: string;
    /** Avatar URL override */
    avatarUrl?: string;
    /** Whether to process @everyone mentions */
    tts?: boolean;
    /** Embeds to send */
    embeds?: DiscordEmbed[];
}
/**
 * Discord Webhook Client
 */
export declare class DiscordWebhookClient {
    private webhookUrl;
    private username;
    private avatarUrl?;
    private enabled;
    constructor(options: DiscordWebhookOptions);
    private isValidWebhookUrl;
    private maskWebhookUrl;
    /**
     * Send a message to Discord
     */
    send(message: DiscordMessage): Promise<boolean>;
    /**
     * Send a simple text message
     */
    notify(content: string): Promise<boolean>;
    /**
     * Send an embed message
     */
    notifyWithEmbed(embed: DiscordEmbed, content?: string): Promise<boolean>;
    /**
     * Send cycle start notification
     */
    notifyCycleStart(cycleNumber: number, maxCycles: number, prompt: string): Promise<boolean>;
    /**
     * Send cycle completion notification
     */
    notifyCycleComplete(cycleNumber: number, completedCycles: number, summary: string, durationMs: number): Promise<boolean>;
    /**
     * Send phase completion notification
     */
    notifyPhaseComplete(cycleNumber: number, phase: string, summary: string): Promise<boolean>;
    /**
     * Send error notification
     */
    notifyError(cycleNumber: number, phase: string, error: string): Promise<boolean>;
    /**
     * Send timeout notification
     */
    notifyTimeout(cycleNumber: number, phase: string, timeoutMs: number): Promise<boolean>;
    /**
     * Send run completion notification
     */
    notifyRunComplete(totalCycles: number, durationMs: number, finalSummary: string): Promise<boolean>;
    /**
     * Send stuck/abort notification
     */
    notifyStuckOrAborted(cycleNumber: number, reason: string): Promise<boolean>;
}
/**
 * Create a Discord webhook client from environment variables
 */
export declare function createDiscordWebhookFromEnv(): DiscordWebhookClient | null;
