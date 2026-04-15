declare const _default: {
    description: string;
    args: {
        prompt: import("zod").ZodString;
    };
    execute(args: {
        prompt: string;
    }, context: import("@opencode-ai/plugin").ToolContext): Promise<string>;
};
export default _default;
