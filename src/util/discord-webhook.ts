/**
 * Discord Webhook Integration
 *
 * Sends notifications to Discord channels via webhooks.
 * Supports rich embeds for cycle progress, errors, and completions.
 */

import { Log } from "./log";

const log = Log.create({ service: "discord-webhook" });

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
export class DiscordWebhookClient {
    private webhookUrl: string;
    private username: string;
    private avatarUrl?: string;
    private enabled = false;

    constructor(options: DiscordWebhookOptions) {
        this.webhookUrl = options.webhookUrl;
        this.username = options.username ?? "Ralph";
        this.avatarUrl = options.avatarUrl;
        this.enabled = true;

        // Validate webhook URL format
        if (!this.webhookUrl || !this.isValidWebhookUrl(this.webhookUrl)) {
            log.warn("Invalid Discord webhook URL, notifications disabled", {
                webhookUrl: this.maskWebhookUrl(this.webhookUrl),
            });
            this.enabled = false;
        }

        log.info("Discord webhook client initialized", {
            enabled: this.enabled,
            username: this.username,
        });
    }

    private isValidWebhookUrl(url: string): boolean {
        // Discord webhook URLs look like: https://discord.com/api/webhooks/{id}/{token}
        return /^https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[a-zA-Z0-9_-]+$/.test(
            url,
        );
    }

    private maskWebhookUrl(url: string): string {
        if (!url) return "(not set)";
        // Mask the token part
        return url.replace(/\/[a-zA-Z0-9_-]+$/, "/********");
    }

    /**
     * Send a message to Discord
     */
    async send(message: DiscordMessage): Promise<boolean> {
        if (!this.enabled) {
            log.debug("Discord notifications disabled, skipping send");
            return false;
        }

        try {
            const payload: DiscordMessage = {
                content: message.content,
                username: message.username ?? this.username,
                avatarUrl: message.avatarUrl ?? this.avatarUrl,
                tts: message.tts ?? false,
                embeds: message.embeds,
            };

            log.debug("Sending Discord notification", {
                hasContent: !!message.content,
                embedCount: message.embeds?.length ?? 0,
            });

            const response = await fetch(this.webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                log.error("Discord webhook request failed", {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText,
                });
                return false;
            }

            log.debug("Discord notification sent successfully");
            return true;
        } catch (error) {
            log.error("Failed to send Discord notification", {
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }

    /**
     * Send a simple text message
     */
    async notify(content: string): Promise<boolean> {
        return this.send({ content });
    }

    /**
     * Send an embed message
     */
    async notifyWithEmbed(
        embed: DiscordEmbed,
        content?: string,
    ): Promise<boolean> {
        return this.send({
            content,
            embeds: [embed],
        });
    }

    /**
     * Send cycle start notification
     */
    async notifyCycleStart(
        cycleNumber: number,
        maxCycles: number,
        prompt: string,
    ): Promise<boolean> {
        const embed: DiscordEmbed = {
            title: `🔄 Cycle ${cycleNumber}/${maxCycles} Started`,
            description: `\`\`\`\n${prompt.slice(0, 500)}${prompt.length > 500 ? "..." : ""}\n\`\`\``,
            color: 0x5865f2, // Discord blurple
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: "📋 Phase",
                    value: "Research → Specify → Plan → Work → Review",
                    inline: true,
                },
                {
                    name: "⏱️ Status",
                    value: "Running",
                    inline: true,
                },
            ],
        };

        return this.notifyWithEmbed(
            embed,
            `🚀 **Ralph Cycle ${cycleNumber}/${maxCycles} Started**`,
        );
    }

    /**
     * Send cycle completion notification
     */
    async notifyCycleComplete(
        cycleNumber: number,
        completedCycles: number,
        summary: string,
        durationMs: number,
    ): Promise<boolean> {
        const durationMinutes = Math.floor(durationMs / 60000);
        const durationSeconds = Math.floor((durationMs % 60000) / 1000);

        const embed: DiscordEmbed = {
            title: `✅ Cycle ${cycleNumber} Completed`,
            description: summary.slice(0, 2000) || "No summary available",
            color: 0x57f287, // Discord green
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: "📊 Progress",
                    value: `${completedCycles} cycles completed`,
                    inline: true,
                },
                {
                    name: "⏱️ Duration",
                    value: `${durationMinutes}m ${durationSeconds}s`,
                    inline: true,
                },
            ],
        };

        return this.notifyWithEmbed(
            embed,
            `✅ **Ralph Cycle ${cycleNumber} Complete**`,
        );
    }

    /**
     * Send phase completion notification
     */
    async notifyPhaseComplete(
        cycleNumber: number,
        phase: string,
        summary: string,
    ): Promise<boolean> {
        const embed: DiscordEmbed = {
            title: `📝 Phase Complete: ${phase}`,
            description: summary.slice(0, 1000),
            color: 0xfee75c, // Discord yellow
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: "🔄 Cycle",
                    value: String(cycleNumber),
                    inline: true,
                },
            ],
        };

        return this.notifyWithEmbed(embed);
    }

    /**
     * Send error notification
     */
    async notifyError(
        cycleNumber: number,
        phase: string,
        error: string,
    ): Promise<boolean> {
        const embed: DiscordEmbed = {
            title: `❌ Error in Cycle ${cycleNumber}`,
            description: `**Phase:** ${phase}\n\n**Error:**\n\`\`\`\n${error.slice(0, 1500)}\n\`\`\``,
            color: 0xed4245, // Discord red
            timestamp: new Date().toISOString(),
        };

        return this.notifyWithEmbed(embed, "🚨 **Ralph Error**");
    }

    /**
     * Send timeout notification
     */
    async notifyTimeout(
        cycleNumber: number,
        phase: string,
        timeoutMs: number,
    ): Promise<boolean> {
        const timeoutMinutes = Math.floor(timeoutMs / 60000);

        const embed: DiscordEmbed = {
            title: `⏰ Timeout in Cycle ${cycleNumber}`,
            description: `**Phase:** ${phase}\n**Timeout:** ${timeoutMinutes} minutes`,
            color: 0xeb459e, // Discord pink
            timestamp: new Date().toISOString(),
        };

        return this.notifyWithEmbed(embed, "⏰ **Ralph Timeout**");
    }

    /**
     * Send run completion notification
     */
    async notifyRunComplete(
        totalCycles: number,
        durationMs: number,
        finalSummary: string,
    ): Promise<boolean> {
        const durationHours = Math.floor(durationMs / 3600000);
        const durationMinutes = Math.floor((durationMs % 3600000) / 60000);

        const embed: DiscordEmbed = {
            title: "🏁 Run Complete",
            description: finalSummary.slice(0, 2000),
            color: 0x57f287, // Discord green
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: "🔄 Total Cycles",
                    value: String(totalCycles),
                    inline: true,
                },
                {
                    name: "⏱️ Total Duration",
                    value:
                        durationHours > 0
                            ? `${durationHours}h ${durationMinutes}m`
                            : `${durationMinutes}m`,
                    inline: true,
                },
            ],
        };

        return this.notifyWithEmbed(embed, "🏁 **Ralph Run Complete**");
    }

    /**
     * Send stuck/abort notification
     */
    async notifyStuckOrAborted(
        cycleNumber: number,
        reason: string,
    ): Promise<boolean> {
        const embed: DiscordEmbed = {
            title: `🛑 Run ${reason}`,
            description: `Cycle ${cycleNumber} reached stuck threshold or was aborted`,
            color: 0x5865f2, // Discord blurple
            timestamp: new Date().toISOString(),
        };

        return this.notifyWithEmbed(embed, `🛑 **Ralph ${reason}**`);
    }
}

/**
 * Create a Discord webhook client from environment variables
 */
export function createDiscordWebhookFromEnv(): DiscordWebhookClient | null {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();

    if (!webhookUrl) {
        log.debug(
            "No DISCORD_WEBHOOK_URL env var set, Discord notifications disabled",
        );
        return null;
    }

    return new DiscordWebhookClient({
        webhookUrl,
        username: process.env.DISCORD_BOT_USERNAME ?? "Ralph",
        avatarUrl: process.env.DISCORD_BOT_AVATAR_URL,
    });
}
