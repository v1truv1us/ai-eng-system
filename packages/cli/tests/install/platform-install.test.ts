/**
 * Install platform flag and toolkit path helpers
 */

import { describe, expect, it } from "bun:test";
import { parseArgs } from "node:util";
import path from "node:path";
import {
    getInstallTargetDir,
    resolveToolkitRoot,
} from "../../src/install/toolkit-path";

describe("install platform flags", () => {
    it("should parse --platform cursor", () => {
        const { values } = parseArgs({
            args: ["--platform", "cursor"],
            options: { platform: { type: "string" } },
            allowPositionals: true,
        });
        expect(values.platform).toBe("cursor");
    });

    it("should map cursor install target under .cursor/plugins", () => {
        const target = getInstallTargetDir(
            "cursor",
            "/tmp/my-project",
        );
        expect(target).toBe(
            path.join("/tmp/my-project", ".cursor", "plugins", "ai-eng-system"),
        );
    });

    it("should resolve toolkit from workspace", () => {
        const root = resolveToolkitRoot();
        expect(root).toContain("packages/toolkit");
    });
});
