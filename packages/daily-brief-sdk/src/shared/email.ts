/**
 * Email transport abstraction. Production path uses nodemailer over SMTP
 * with creds from process.env or a .env file loaded by the caller.
 *
 * The interface is small enough to mock in tests and small enough to drop
 * a mailx-shell-out alternative behind it later.
 */

export interface EmailMessage {
    subject: string;
    html: string;
    text?: string;
}

export interface EmailTransport {
    send(message: EmailMessage): Promise<void>;
}

export interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    to: string;
}

/**
 * Read SMTP config from process.env. Throws if required keys are missing
 * — explicit failure beats silent fall-through.
 */
export function readSmtpConfigFromEnv(env: NodeJS.ProcessEnv = process.env): SmtpConfig {
    const required = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "BRIEF_TO"] as const;
    const missing = required.filter((k) => !env[k]);
    if (missing.length > 0) {
        throw new Error(
            `daily-brief-sdk: missing required env vars: ${missing.join(", ")}. Set them in the environment or a .env file.`,
        );
    }
    return {
        host: env.SMTP_HOST as string,
        port: env.SMTP_PORT ? Number.parseInt(env.SMTP_PORT, 10) : 587,
        user: env.SMTP_USER as string,
        pass: env.SMTP_PASS as string,
        from: env.SMTP_FROM ?? (env.SMTP_USER as string),
        to: env.BRIEF_TO as string,
    };
}

/**
 * Build a nodemailer-backed transport. The actual nodemailer import is
 * deferred so tests don't have to load it (and so the package can ship
 * without exploding when nodemailer isn't installed yet).
 */
export async function makeNodemailerTransport(
    config: SmtpConfig,
): Promise<EmailTransport> {
    type NodemailerModule = {
        createTransport: (opts: unknown) => {
            sendMail: (msg: unknown) => Promise<unknown>;
        };
    };
    const nodemailer = (await import("nodemailer")) as unknown as NodemailerModule;
    const transport = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: { user: config.user, pass: config.pass },
    });

    return {
        async send(message: EmailMessage) {
            await transport.sendMail({
                from: config.from,
                to: config.to,
                subject: message.subject,
                html: message.html,
                text: message.text,
            });
        },
    };
}

/**
 * In-memory transport used by tests. Records every send for later
 * assertions; never reaches a real SMTP server.
 */
export class InMemoryTransport implements EmailTransport {
    public sent: EmailMessage[] = [];
    async send(message: EmailMessage): Promise<void> {
        this.sent.push(message);
    }
}
