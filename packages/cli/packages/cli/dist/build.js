#!/usr/bin/env bun
// @bun

// build.ts
import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
var ROOT = dirname(fileURLToPath(import.meta.url));
var DIST_DIR = join(ROOT, "dist");
async function buildCLI() {
  console.log("\uD83D\uDD27 Building CLI package...");
  await mkdir(DIST_DIR, { recursive: true });
  const indexPath = join(ROOT, "src", "index.ts");
  if (!existsSync(indexPath)) {
    throw new Error("src/index.ts not found");
  }
  const result = await Bun.build({
    entrypoints: [indexPath],
    outdir: DIST_DIR,
    target: "node",
    format: "esm",
    sourcemap: "inline",
    minify: false,
    splitting: false,
    external: [
      "@ai-eng-system/core",
      "@opencode-ai/sdk",
      "@opencode-ai/plugin"
    ]
  });
  if (!result.success) {
    const messages = result.logs.map((l) => `${l.level}: ${l.message}`).join(`
`);
    throw new Error(`Failed to build CLI:
${messages}`);
  }
  const cliRunPath = join(ROOT, "src", "cli", "run-cli.ts");
  if (existsSync(cliRunPath)) {
    const cliResult = await Bun.build({
      entrypoints: [cliRunPath],
      outdir: join(DIST_DIR, "cli"),
      target: "node",
      format: "esm",
      sourcemap: "inline",
      minify: false,
      splitting: false,
      external: ["@ai-eng-system/core"]
    });
    if (!cliResult.success) {
      const messages = cliResult.logs.map((l) => `${l.level}: ${l.message}`).join(`
`);
      throw new Error(`Failed to build CLI runner:
${messages}`);
    }
    const builtCliPath = join(DIST_DIR, "cli", "run-cli.js");
    if (existsSync(builtCliPath)) {
      const content = await Bun.file(builtCliPath).text();
      let finalContent = content;
      if (!content.startsWith("#!")) {
        finalContent = `#!/usr/bin/env bun
` + content;
      }
      await Bun.write(builtCliPath, finalContent);
      const chmodProcess = Bun.spawn(["chmod", "+x", builtCliPath], {
        stdio: ["inherit", "inherit", "inherit"]
      });
      await chmodProcess.exited;
    }
  }
  console.log("\u2705 CLI package built successfully");
}
async function generateDeclarations() {
  console.log("\uD83D\uDCDD Generating TypeScript declarations...");
  const result = Bun.spawn([
    "tsc",
    "--project",
    "tsconfig.json",
    "--declaration",
    "--emitDeclarationOnly",
    "--noEmit",
    "false"
  ], {
    cwd: ROOT,
    stdio: ["inherit", "inherit", "inherit"]
  });
  const exitCode = await result.exited;
  if (exitCode !== 0) {
    throw new Error("TypeScript declaration generation failed");
  }
  console.log("\u2705 Declarations generated");
}
async function main() {
  try {
    await generateDeclarations();
    await buildCLI();
    console.log("\uD83C\uDF89 CLI package build complete");
  } catch (error) {
    console.error("\u274C Build failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
if (__require.main == __require.module) {
  main();
}
export {
  generateDeclarations,
  buildCLI
};
