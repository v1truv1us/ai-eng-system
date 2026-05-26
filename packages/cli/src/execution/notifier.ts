/**
 * Notification interface for decoupling execution engine from notification backends.
 *
 * The execution engine calls these methods; the CLI wires the concrete implementation
 * (currently Discord, future: Slack, stdout, etc.) at the boundary.
 *
 * Phase 6.1: Defined here for future injection. Currently unused —
 * ralph-loop.ts still imports DiscordWebhookClient directly.
 * When ready to inject, add a `notifier` parameter to RalphLoop constructor.
 */

export interface INotifier {
    notifyCycleStart(cycleNumber: number, prompt: string): void;
    notifyCycleComplete(cycleNumber: number, summary: string): void;
    notifyError(cycleNumber: number, error: string): void;
    notifyStuckOrAborted(cycleNumber: number, reason: string): void;
    notifyRunComplete(summary: string, totalCycles: number): void;
}
