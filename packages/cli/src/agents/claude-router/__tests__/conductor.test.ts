import { describe, expect, it } from "bun:test";
import {
    ALL_ADAPTERS,
    ANTHROPIC_MODEL_FAMILY,
    ANTHROPIC_MODELS,
    CODEX_MODEL_FAMILY,
    CURSOR_MODEL_FAMILY,
    getAdapter,
    OPENCODE_MODEL_FAMILY,
    PI_MODEL_FAMILY,
} from "../adapters";
import {
    assessComplexity,
    buildPlan,
    conduct,
    detectIntent,
    planTask,
    route,
    routeTask,
    selectRole,
    shouldChain,
} from "../conductor";
import { SubagentRole, TaskComplexity, TaskIntent } from "../core/types";

// ---------------------------------------------------------------------------
// Complexity assessment (core — harness-neutral)
// ---------------------------------------------------------------------------

describe("assessComplexity", () => {
    it("classifies trivial lookup tasks", () => {
        expect(assessComplexity("find all files with the word export")).toBe(
            TaskComplexity.TRIVIAL,
        );
        expect(assessComplexity("quick: where is the config?")).toBe(
            TaskComplexity.TRIVIAL,
        );
        expect(assessComplexity("scan the project for TODO comments")).toBe(
            TaskComplexity.TRIVIAL,
        );
    });

    it("classifies moderate implementation tasks", () => {
        expect(
            assessComplexity("implement a new endpoint for user signup"),
        ).toBe(TaskComplexity.MODERATE);
        expect(assessComplexity("fix the failing test in auth module")).toBe(
            TaskComplexity.MODERATE,
        );
        expect(assessComplexity("add a method to the UserService class")).toBe(
            TaskComplexity.MODERATE,
        );
    });

    it("classifies complex architectural tasks", () => {
        expect(
            assessComplexity(
                "design a new architecture for the payment system",
            ),
        ).toBe(TaskComplexity.COMPLEX);
        expect(
            assessComplexity(
                "plan the migration from monolith to microservices",
            ),
        ).toBe(TaskComplexity.COMPLEX);
        expect(
            assessComplexity(
                "evaluate trade-offs between SQL and NoSQL for this use case",
            ),
        ).toBe(TaskComplexity.COMPLEX);
    });

    it("defaults to moderate when no keywords match", () => {
        expect(assessComplexity("do something with the code")).toBe(
            TaskComplexity.MODERATE,
        );
    });

    it("prioritizes complex over moderate and trivial", () => {
        expect(
            assessComplexity("architect and implement a new caching layer"),
        ).toBe(TaskComplexity.COMPLEX);
    });
});

// ---------------------------------------------------------------------------
// Intent detection (core — harness-neutral)
// ---------------------------------------------------------------------------

describe("detectIntent", () => {
    it("detects lookup intent", () => {
        expect(detectIntent("find all TypeScript files in the project")).toBe(
            TaskIntent.LOOKUP,
        );
        expect(detectIntent("search for uses of deprecated API")).toBe(
            TaskIntent.LOOKUP,
        );
    });

    it("detects implementation intent", () => {
        expect(detectIntent("implement user authentication flow")).toBe(
            TaskIntent.IMPLEMENTATION,
        );
        expect(
            detectIntent("create a new React component for the dashboard"),
        ).toBe(TaskIntent.IMPLEMENTATION);
    });

    it("detects planning intent", () => {
        expect(detectIntent("plan the v2 API redesign")).toBe(
            TaskIntent.PLANNING,
        );
        expect(detectIntent("evaluate options for state management")).toBe(
            TaskIntent.PLANNING,
        );
    });

    it("detects debugging intent", () => {
        expect(detectIntent("fix the null pointer error in UserService")).toBe(
            TaskIntent.DEBUGGING,
        );
        expect(detectIntent("debug why the build is failing on CI")).toBe(
            TaskIntent.DEBUGGING,
        );
    });

    it("detects refactoring intent", () => {
        expect(detectIntent("refactor the data access layer")).toBe(
            TaskIntent.REFACTORING,
        );
        expect(detectIntent("simplify the authentication middleware")).toBe(
            TaskIntent.REFACTORING,
        );
    });

    it("falls back to complexity-based default when no keywords match", () => {
        const intent = detectIntent("do something");
        expect([
            TaskIntent.LOOKUP,
            TaskIntent.IMPLEMENTATION,
            TaskIntent.PLANNING,
        ]).toContain(intent);
    });
});

// ---------------------------------------------------------------------------
// Role selection (core — harness-neutral)
// ---------------------------------------------------------------------------

describe("selectRole", () => {
    it("routes lookup intent to LookupAgent", () => {
        expect(selectRole(TaskComplexity.TRIVIAL, TaskIntent.LOOKUP)).toBe(
            SubagentRole.LOOKUP,
        );
    });

    it("routes implementation + moderate to WorkAgent", () => {
        expect(
            selectRole(TaskComplexity.MODERATE, TaskIntent.IMPLEMENTATION),
        ).toBe(SubagentRole.WORK);
    });

    it("routes implementation + complex to PlannerAgent", () => {
        expect(
            selectRole(TaskComplexity.COMPLEX, TaskIntent.IMPLEMENTATION),
        ).toBe(SubagentRole.PLANNER);
    });

    it("routes planning intent to PlannerAgent", () => {
        expect(selectRole(TaskComplexity.COMPLEX, TaskIntent.PLANNING)).toBe(
            SubagentRole.PLANNER,
        );
    });

    it("routes debugging intent to DebuggerAgent", () => {
        expect(selectRole(TaskComplexity.MODERATE, TaskIntent.DEBUGGING)).toBe(
            SubagentRole.DEBUGGER,
        );
    });

    it("routes refactoring intent to RefactorAgent", () => {
        expect(
            selectRole(TaskComplexity.MODERATE, TaskIntent.REFACTORING),
        ).toBe(SubagentRole.REFACTORER);
    });
});

// ---------------------------------------------------------------------------
// Routing decision (uses Anthropic model family by default)
// ---------------------------------------------------------------------------

describe("route", () => {
    it("produces a complete routing decision", () => {
        const decision = route(
            "find all files with TODO",
            ANTHROPIC_MODEL_FAMILY,
        );
        expect(decision.role).toBe(SubagentRole.LOOKUP);
        expect(decision.model).toBe(ANTHROPIC_MODELS.HAIKU);
        expect(decision.complexity).toBe(TaskComplexity.TRIVIAL);
        expect(decision.intent).toBe(TaskIntent.LOOKUP);
        expect(decision.reason).toContain("LookupAgent");
    });

    it("routes debugging tasks to DebuggerAgent with Sonnet", () => {
        const decision = route(
            "fix the error in the payment module",
            ANTHROPIC_MODEL_FAMILY,
        );
        expect(decision.role).toBe(SubagentRole.DEBUGGER);
        expect(decision.model).toBe(ANTHROPIC_MODELS.SONNET);
    });

    it("routes architecture tasks to PlannerAgent with Opus", () => {
        const decision = route(
            "design a new architecture for user management",
            ANTHROPIC_MODEL_FAMILY,
        );
        expect(decision.role).toBe(SubagentRole.PLANNER);
        expect(decision.model).toBe(ANTHROPIC_MODELS.OPUS);
    });
});

// ---------------------------------------------------------------------------
// Chaining (core — harness-neutral)
// ---------------------------------------------------------------------------

describe("shouldChain", () => {
    it("detects plan-and-implement patterns", () => {
        expect(shouldChain("plan and implement a new caching layer")).toBe(
            true,
        );
        expect(shouldChain("design and build the auth system")).toBe(true);
    });

    it("detects multi-step signals", () => {
        expect(shouldChain("analyze the codebase, then fix the issues")).toBe(
            true,
        );
        expect(shouldChain("review the code and then update the tests")).toBe(
            true,
        );
    });

    it("does not chain single-intent tasks", () => {
        expect(shouldChain("find all files with the word export")).toBe(false);
        expect(shouldChain("fix the bug in the login handler")).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Execution plan (uses Anthropic model family)
// ---------------------------------------------------------------------------

describe("buildPlan", () => {
    it("creates a single-step plan for simple tasks", () => {
        const plan = buildPlan(
            "find all TODO comments",
            ANTHROPIC_MODEL_FAMILY,
        );
        expect(plan.isChained).toBe(false);
        expect(plan.steps).toHaveLength(1);
        expect(plan.steps[0].decision.role).toBe(SubagentRole.LOOKUP);
    });

    it("creates a multi-step chain for plan-and-implement tasks", () => {
        const plan = buildPlan(
            "plan and implement a new caching layer",
            ANTHROPIC_MODEL_FAMILY,
        );
        expect(plan.isChained).toBe(true);
        expect(plan.steps).toHaveLength(2);
        expect(plan.steps[0].decision.role).toBe(SubagentRole.PLANNER);
        expect(plan.steps[1].decision.role).toBe(SubagentRole.WORK);
    });

    it("includes the {previous_output} template in chain steps", () => {
        const plan = buildPlan(
            "plan and implement a new feature",
            ANTHROPIC_MODEL_FAMILY,
        );
        expect(plan.steps[1].prompt).toContain("{previous_output}");
    });
});

// ---------------------------------------------------------------------------
// Full conductor
// ---------------------------------------------------------------------------

describe("conduct", () => {
    it("executes a single-step task and returns a result", async () => {
        const result = await conduct({
            task: "find all exports in the project",
        });
        expect(result.success).toBe(true);
        expect(result.results).toHaveLength(1);
        expect(result.results[0].role).toBe(SubagentRole.LOOKUP);
        expect(result.results[0].model).toBe(ANTHROPIC_MODELS.HAIKU);
        expect(result.plan.complexity).toBe(TaskComplexity.TRIVIAL);
        expect(result.totalTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("executes a chained task", async () => {
        const result = await conduct({
            task: "plan and implement a new user registration system",
        });
        expect(result.plan.isChained).toBe(true);
        expect(result.results).toHaveLength(2);
        expect(result.results[0].role).toBe(SubagentRole.PLANNER);
        expect(result.results[1].role).toBe(SubagentRole.WORK);
    });
});

// ---------------------------------------------------------------------------
// Adapter registry
// ---------------------------------------------------------------------------

describe("adapter registry", () => {
    it("contains all five harness adapters", () => {
        expect(Object.keys(ALL_ADAPTERS)).toHaveLength(5);
        expect(ALL_ADAPTERS.anthropic).toBeDefined();
        expect(ALL_ADAPTERS.cursor).toBeDefined();
        expect(ALL_ADAPTERS.opencode).toBeDefined();
        expect(ALL_ADAPTERS.codex).toBeDefined();
        expect(ALL_ADAPTERS.pi).toBeDefined();
    });

    it("getAdapter throws for unknown harness", () => {
        expect(() => getAdapter("unknown" as any)).toThrow();
    });
});

// ---------------------------------------------------------------------------
// Anthropic model family
// ---------------------------------------------------------------------------

describe("Anthropic model family", () => {
    it("maps every role to a valid Anthropic model", () => {
        const validModels = Object.values(ANTHROPIC_MODELS);
        for (const model of Object.values(ANTHROPIC_MODEL_FAMILY)) {
            expect(validModels).toContain(model);
        }
    });

    it("Haiku is only used for LookupAgent", () => {
        for (const [role, model] of Object.entries(ANTHROPIC_MODEL_FAMILY)) {
            if (model === ANTHROPIC_MODELS.HAIKU) {
                expect(role).toBe(SubagentRole.LOOKUP);
            }
        }
    });
});

// ---------------------------------------------------------------------------
// Multi-harness model families
// ---------------------------------------------------------------------------

describe("Codex (OpenAI) model family", () => {
    it("maps lookup to gpt-5.4-mini", () => {
        expect(CODEX_MODEL_FAMILY[SubagentRole.LOOKUP]).toBe("gpt-5.4-mini");
    });

    it("maps work to gpt-5.4", () => {
        expect(CODEX_MODEL_FAMILY[SubagentRole.WORK]).toBe("gpt-5.4");
    });

    it("maps planner to gpt-5.5", () => {
        expect(CODEX_MODEL_FAMILY[SubagentRole.PLANNER]).toBe("gpt-5.5");
    });

    it("routes a lookup task to gpt-5.4-mini via codex adapter", () => {
        const decision = route("find all exports", CODEX_MODEL_FAMILY);
        expect(decision.model).toBe("gpt-5.4-mini");
    });

    it("routes an architecture task to gpt-5.5 via codex adapter", () => {
        const decision = route(
            "design a new architecture for payments",
            CODEX_MODEL_FAMILY,
        );
        expect(decision.model).toBe("gpt-5.5");
    });
});

describe("Cursor model family", () => {
    it("maps lookup to composer-mini", () => {
        expect(CURSOR_MODEL_FAMILY[SubagentRole.LOOKUP]).toBe("composer-mini");
    });

    it("maps work to composer-2.5", () => {
        expect(CURSOR_MODEL_FAMILY[SubagentRole.WORK]).toBe("composer-2.5");
    });

    it("routes a lookup task to composer-mini via cursor adapter", () => {
        const decision = route("find all files", CURSOR_MODEL_FAMILY);
        expect(decision.model).toBe("composer-mini");
    });
});

describe("OpenCode model family", () => {
    it("maps every role to a model string", () => {
        for (const role of Object.values(SubagentRole)) {
            expect(OPENCODE_MODEL_FAMILY[role]).toBeTruthy();
        }
    });
});

describe("Pi model family", () => {
    it("maps every role to a model string", () => {
        for (const role of Object.values(SubagentRole)) {
            expect(PI_MODEL_FAMILY[role]).toBeTruthy();
        }
    });
});

// ---------------------------------------------------------------------------
// Cross-harness routing consistency
// ---------------------------------------------------------------------------

describe("cross-harness routing consistency", () => {
    const harnessFamilies = {
        anthropic: ANTHROPIC_MODEL_FAMILY,
        codex: CODEX_MODEL_FAMILY,
        cursor: CURSOR_MODEL_FAMILY,
        opencode: OPENCODE_MODEL_FAMILY,
        pi: PI_MODEL_FAMILY,
    };

    it("routes the same task to the same role regardless of harness", () => {
        const task = "find all TypeScript files in the project";
        for (const [name, family] of Object.entries(harnessFamilies)) {
            const decision = route(task, family);
            expect(decision.role).toBe(SubagentRole.LOOKUP),
                `Expected LOOKUP for harness ${name}`;
        }
    });

    it("routes debugging tasks to DebuggerAgent for all harnesses", () => {
        const task = "fix the TypeError in the payment handler";
        for (const [name, family] of Object.entries(harnessFamilies)) {
            const decision = route(task, family);
            expect(decision.role).toBe(SubagentRole.DEBUGGER),
                `Expected DEBUGGER for harness ${name}`;
        }
    });
});

// ---------------------------------------------------------------------------
// Smoke test: correct routing across complexity levels
// ---------------------------------------------------------------------------

describe("smoke test: correct routing across complexity levels", () => {
    const cases: Array<{ input: string; expectedRole: SubagentRole }> = [
        {
            input: "where is the main entry point?",
            expectedRole: SubagentRole.LOOKUP,
        },
        {
            input: "list all files in the src directory",
            expectedRole: SubagentRole.LOOKUP,
        },
        {
            input: "implement a new REST endpoint for user profile",
            expectedRole: SubagentRole.WORK,
        },
        {
            input: "fix the TypeError in the payment handler",
            expectedRole: SubagentRole.DEBUGGER,
        },
        {
            input: "refactor the database connection pool",
            expectedRole: SubagentRole.REFACTORER,
        },
        {
            input: "architect a real-time notification system",
            expectedRole: SubagentRole.PLANNER,
        },
        {
            input: "design a comprehensive migration strategy",
            expectedRole: SubagentRole.PLANNER,
        },
        {
            input: "write a test for the email validator",
            expectedRole: SubagentRole.WORK,
        },
    ];

    for (const { input, expectedRole } of cases) {
        it(`routes "${input}" to ${expectedRole}`, () => {
            const decision = routeTask(input);
            expect(decision.role).toBe(expectedRole);
        });
    }
});

// ---------------------------------------------------------------------------
// routeTask and planTask convenience functions
// ---------------------------------------------------------------------------

describe("routeTask / planTask convenience functions", () => {
    it("routeTask defaults to Anthropic adapter", () => {
        const decision = routeTask("find all exports");
        expect(decision.model).toBe(ANTHROPIC_MODELS.HAIKU);
    });

    it("routeTask accepts a harness name", () => {
        const decision = routeTask("find all exports", "codex");
        expect(decision.model).toBe("gpt-5.4-mini");
    });

    it("planTask defaults to Anthropic adapter", () => {
        const plan = planTask("implement a new feature");
        expect(plan.steps[0].decision.model).toBe(ANTHROPIC_MODELS.SONNET);
    });

    it("planTask accepts a harness name", () => {
        const plan = planTask("implement a new feature", "codex");
        expect(plan.steps[0].decision.model).toBe("gpt-5.4");
    });
});
