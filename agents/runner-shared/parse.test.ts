import { describe, expect, test } from "bun:test";
import { parseArgs } from "./parse.js";

describe("parseArgs", () => {
  test("no flags: returns all args as positionals", () => {
    const result = parseArgs(["hello world"], []);
    expect(result.positionals).toEqual(["hello world"]);
    expect(result.flags).toEqual({});
  });

  test("parses --templates flag with comma-separated values", () => {
    const result = parseArgs(["--templates", "A1,M2", "my query"], ["--templates"]);
    expect(result.positionals).toEqual(["my query"]);
    expect(result.flags["--templates"]).toBe("A1,M2");
  });

  test("parses --agent flag", () => {
    const result = parseArgs(["--agent", "reviewer", "query"], ["--agent"]);
    expect(result.positionals).toEqual(["query"]);
    expect(result.flags["--agent"]).toBe("reviewer");
  });

  test("handles mixed flags and positionals", () => {
    const result = parseArgs(
      ["--templates", "A1", "--agent", "foo", "query", "here"],
      ["--templates", "--agent"],
    );
    expect(result.positionals).toEqual(["query", "here"]);
    expect(result.flags["--templates"]).toBe("A1");
    expect(result.flags["--agent"]).toBe("foo");
  });

  test("treats unknown --flags as boolean", () => {
    const result = parseArgs(["--dry-run", "query"], []);
    expect(result.positionals).toEqual(["query"]);
    expect(result.flags["--dry-run"]).toBe(true);
  });

  test("handles flag at end with no value", () => {
    const result = parseArgs(["query", "--agent"], ["--agent"]);
    expect(result.positionals).toEqual(["query"]);
    expect(result.flags["--agent"]).toBe("");
  });
});
