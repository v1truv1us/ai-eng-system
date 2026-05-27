import { z } from "zod";

/**
 * Every numeric metric in a brief carries the SDK tool_use id that produced
 * it. The ProvenanceValidator (see provenance-validator.ts) cross-checks
 * these against the captured message stream and rejects briefs citing
 * tool_use ids that never appeared.
 */
export const NumericMetricSchema = z.object({
    value: z.number(),
    sourceToolCallId: z.string().min(1, "sourceToolCallId is required"),
});
export type NumericMetric = z.infer<typeof NumericMetricSchema>;

export const SourceStatusSchema = z.object({
    status: z.enum(["ok", "degraded", "unavailable"]),
    note: z.string().optional(),
});
export type SourceStatus = z.infer<typeof SourceStatusSchema>;

const TitleAndUrlSchema = z.object({
    title: z.string(),
    url: z.string().url().optional(),
});

export const BriefItemSchema = TitleAndUrlSchema.extend({
    why: z.string().optional(),
    sourceToolCallId: z.string().min(1),
    metrics: z.array(NumericMetricSchema).default([]),
});
export type BriefItem = z.infer<typeof BriefItemSchema>;

export const CalendarEventSchema = z.object({
    title: z.string(),
    start: z.string(),
    end: z.string(),
    sourceToolCallId: z.string().min(1),
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

export const RiskSchema = z.object({
    title: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    sourceToolCallId: z.string().min(1),
});
export type Risk = z.infer<typeof RiskSchema>;

export const TomorrowBriefSchema = z.object({
    workflow: z.literal("tomorrow"),
    generatedAt: z.string().datetime(),
    forDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startFreshOn: z.array(BriefItemSchema).max(3),
    carryovers: z.array(BriefItemSchema).max(5),
    skipOrNoise: z.array(BriefItemSchema).default([]),
    calendar: z.array(CalendarEventSchema).default([]),
    risks: z.array(RiskSchema).default([]),
    sources: z.record(z.string(), SourceStatusSchema),
});
export type TomorrowBrief = z.infer<typeof TomorrowBriefSchema>;

export const MorningBriefSchema = TomorrowBriefSchema.omit({
    workflow: true,
    forDate: true,
}).extend({
    workflow: z.literal("morning"),
    forDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type MorningBrief = z.infer<typeof MorningBriefSchema>;

export const WeekAheadBriefSchema = TomorrowBriefSchema.omit({
    workflow: true,
}).extend({
    workflow: z.literal("week-ahead"),
});
export type WeekAheadBrief = z.infer<typeof WeekAheadBriefSchema>;

export const DreamDigestSchema = z.object({
    workflow: z.literal("dream-digest"),
    generatedAt: z.string().datetime(),
    forDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    patterns: z
        .array(
            z.object({
                title: z.string(),
                description: z.string(),
                citations: z
                    .array(z.string())
                    .min(2, "patterns require >=2 supporting citations"),
                sourceToolCallId: z.string().min(1),
            }),
        )
        .min(0),
    sources: z.record(z.string(), SourceStatusSchema),
});
export type DreamDigest = z.infer<typeof DreamDigestSchema>;

export const AnyBriefSchema = z.discriminatedUnion("workflow", [
    TomorrowBriefSchema,
    MorningBriefSchema,
    WeekAheadBriefSchema,
    DreamDigestSchema,
]);
export type AnyBrief = z.infer<typeof AnyBriefSchema>;
