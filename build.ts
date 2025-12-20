#!/usr/bin/env bun
/**
 * Build script for ai-eng-system
 * 
 * Transforms canonical content from content/ into platform-specific formats:
 * - dist/.claude-plugin/ for Claude Code
 * - dist/.opencode/ for OpenCode
 * 
 * Usage:
 *   bun run build.ts           # Build all platforms
 *   bun run build.ts --watch   # Watch mode
 *   bun run build.ts --validate # Validate only, no output
 */

import { readdir, readFile, writeFile, mkdir, rm, copyFile } from "fs/promises"
import { existsSync } from "fs"
import { join, basename, dirname, relative } from "path"
import { watch } from "fs"
import YAML from "yaml"

const ROOT = process.env.TEST_ROOT || import.meta.dir
const CONTENT_DIR = join(ROOT, "content")
const DIST_DIR = join(ROOT, "dist")
const SKILLS_DIR = join(ROOT, "skills")

// Platform output directories
const CLAUDE_DIR = join(DIST_DIR, ".claude-plugin")
const OPENCODE_DIR = join(DIST_DIR, ".opencode")

// Namespace configuration for OpenCode installations
const NAMESPACE_PREFIX = "ai-eng"

interface CommandMeta {
  name: string
  description: string
  agent?: string
  mode?: string
  subtask?: boolean
}

// NOTE: kept for validation + Claude metadata completeness.
// OpenCode output is MD-first and does not use a table transform.
interface AgentMeta {
  name: string
  description: string
  mode: string
}

/**
 * Parse YAML frontmatter from markdown content using a real YAML parser.
 *
 * NOTE: This is intentionally tolerant; if YAML parsing fails, we fall back
 * to an empty meta object so validation can surface the issue clearly.
 */
function parseFrontmatter(content: string): { meta: Record<string, any>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    return { meta: {}, body: content }
  }

  const [, frontmatterRaw, body] = match

  try {
    const meta = (YAML.parse(frontmatterRaw) ?? {}) as Record<string, any>
    return { meta, body: body.trim() }
  } catch {
    return { meta: {}, body: body.trim() }
  }
}

/**
 * MD-first OpenCode output helpers
 */
function splitMarkdownFrontmatter(content: string): {
  hasFrontmatter: boolean
  frontmatterRaw: string
  body: string
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    return { hasFrontmatter: false, frontmatterRaw: "", body: content }
  }

  const [, frontmatterRaw, body] = match
  return { hasFrontmatter: true, frontmatterRaw, body }
}

function parseFrontmatterRaw(frontmatterRaw: string): Record<string, any> {
  try {
    return (YAML.parse(frontmatterRaw) ?? {}) as Record<string, any>
  } catch {
    return {}
  }
}

function serializeFrontmatter(meta: Record<string, any>): string {
  // Keep output stable and readable.
  return YAML.stringify(meta).trimEnd()
}

function sanitizePathSegment(segment: string): string {
  const s = segment.trim()
  if (!s) return "general"
  return s
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

/**
 * Transform agent markdown for OpenCode:
 * - prefer `category:` from YAML frontmatter
 * - keep YAML frontmatter but delete `name:` so OpenCode uses path-derived name
 */
function transformAgentMarkdownForOpenCode(content: string): { markdown: string; category: string } {
  const { hasFrontmatter, frontmatterRaw, body } = splitMarkdownFrontmatter(content)

  if (!hasFrontmatter) {
    return { markdown: content, category: "general" }
  }

  const meta = parseFrontmatterRaw(frontmatterRaw)
  const category = sanitizePathSegment(meta.category ?? "general")

  // IMPORTANT: OpenCode derives agent name from file path, but frontmatter `name`
  // overrides it. Remove `name` to keep namespaced path-derived names.
  delete meta.name

  const transformedFrontmatter = serializeFrontmatter(meta)

  // Reassemble. Preserve body exactly as captured (no trim), since prompts can be sensitive.
  const markdown = `---\n${transformedFrontmatter}\n---\n${body}`

  return { markdown, category }
}

async function validateOpenCodeOutput(opencodeRootDir: string): Promise<void> {
  const commandRoot = join(opencodeRootDir, "command", NAMESPACE_PREFIX)
  const agentRoot = join(opencodeRootDir, "agent", NAMESPACE_PREFIX)

  const commandFiles = await getMarkdownFiles(commandRoot)
  const agentFiles = await getMarkdownFiles(agentRoot)

  const errors: string[] = []

  for (const filePath of commandFiles) {
    const content = await readFile(filePath, "utf-8")
    const { meta, body } = parseFrontmatter(content)

    if (!meta.description) {
      errors.push(`OpenCode command missing description: ${filePath}`)
    }

    // Commands can be short, but should not be empty prompts.
    if (!body.trim()) {
      errors.push(`OpenCode command has empty body: ${filePath}`)
    }
  }

  for (const filePath of agentFiles) {
    const content = await readFile(filePath, "utf-8")
    const { meta, body } = parseFrontmatter(content)

    // Name MUST be absent (path-derived naming is required for namespacing).
    if (meta.name) {
      errors.push(`OpenCode agent frontmatter must not include name (path-derived): ${filePath}`)
    }

    if (!meta.description) {
      errors.push(`OpenCode agent missing description: ${filePath}`)
    }

    // Default for OpenCode is subagent; presence recommended but not strictly necessary.
    if (!meta.mode) {
      errors.push(`OpenCode agent missing mode: ${filePath}`)
    }

    if (!body.trim()) {
      errors.push(`OpenCode agent has empty body: ${filePath}`)
    }

    // Ensure nested category directory exists: ai-eng/<category>/<agent>.md
    const rel = relative(agentRoot, filePath)
    const parts = rel.split("/")
    if (parts.length < 2) {
      errors.push(`OpenCode agent must be nested under a category folder: ${filePath}`)
    }
  }

  if (errors.length > 0) {
    console.error("\n❌ OpenCode output validation failed:\n")
    for (const err of errors) console.error(` - ${err}`)
    throw new Error(`OpenCode validation failed with ${errors.length} error(s)`) 
  }
}

/**
 * Get all markdown files recursively
 */
async function getMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  
  if (!existsSync(dir)) return files

  const entries = await readdir(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await getMarkdownFiles(fullPath))
    } else if (entry.name.endsWith(".md")) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Build Claude Code agents
 */
async function buildClaudeAgents(): Promise<void> {
  const agentsDir = join(CLAUDE_DIR, "agents")
  await mkdir(agentsDir, { recursive: true })
  
  const agentFiles = await getMarkdownFiles(join(CONTENT_DIR, "agents"))
  for (const file of agentFiles) {
    await copyFile(file, join(agentsDir, basename(file)))
  }
}

/**
 * Copy directory recursively
 */
const copyRecursive = async (src: string, dest: string) => {
  const entries = await readdir(src, { withFileTypes: true })
  await mkdir(dest, { recursive: true })
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    
    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath)
    } else {
      await copyFile(srcPath, destPath)
    }
  }
}

/**
 * Build Claude Code skills
 */
async function buildClaudeSkills(): Promise<void> {
  const skillsDir = join(CLAUDE_DIR, "skills")
  await mkdir(skillsDir, { recursive: true })
  
  // Copy skills to dist/.claude-plugin/skills/
  await copyRecursive(SKILLS_DIR, join(CLAUDE_DIR, "skills"))
}

/**
 * Build Claude Code plugin.json and hooks
 */
async function buildClaudePlugin(): Promise<void> {
  // Read version from package.json
  const packageJson = JSON.parse(await readFile(join(ROOT, "package.json"), "utf-8"))

  // Get command files first to include in plugin.json
  const commandFiles = await getMarkdownFiles(join(CONTENT_DIR, "commands"))
  const commands = commandFiles.map(file => `./commands/${basename(file)}`)

  const pluginJson = {
    name: "ai-eng-system",
    version: packageJson.version,
    description: "AI Engineering System with context engineering and research orchestration for Claude Code",
    author: "v1truv1us",
    license: "MIT",
    commands: commands
  }

  await writeFile(
    join(CLAUDE_DIR, "plugin.json"),
    JSON.stringify(pluginJson, null, 2)
  )

  // Create hooks.json for session notifications
  const hooksJson = {
    hooks: {
      SessionStart: [
        {
          description: "Initialize ai-eng-system on session start",
          hooks: [
             {
               type: "notification",
               message: "Ferg Engineering System loaded. Commands: /ai-eng/plan, /ai-eng/review, /ai-eng/seo, /ai-eng/work, /ai-eng/compound, /ai-eng/deploy, /ai-eng/optimize, /ai-eng/recursive-init"
             }
          ]
        }
      ]
    }
  }

  await writeFile(
    join(CLAUDE_DIR, "hooks.json"),
    JSON.stringify(hooksJson, null, 2)
  )

  // Copy commands (Claude uses YAML frontmatter format directly)
  const commandsDir = join(CLAUDE_DIR, "commands")
  await mkdir(commandsDir, { recursive: true })

  for (const file of commandFiles) {
    const content = await readFile(file, "utf-8")
    const dest = join(commandsDir, basename(file))
    await writeFile(dest, content)
  }

  // Copy marketplace.json if it exists
  const marketplaceJsonPath = join(ROOT, "marketplace.json")
  if (existsSync(marketplaceJsonPath)) {
    await copyFile(marketplaceJsonPath, join(CLAUDE_DIR, "marketplace.json"))
    console.log(`   ✓ marketplace.json`)
  }

  console.log(`   ✓ ${commandFiles.length} commands`)
  console.log(`   ✓ plugin.json`)
}

/**
 * Build OpenCode output
 */
async function buildOpenCode(): Promise<void> {
  console.log("📦 Building OpenCode plugin...")

  const commandsDir = join(OPENCODE_DIR, "command", NAMESPACE_PREFIX)
  const agentsDir = join(OPENCODE_DIR, "agent", NAMESPACE_PREFIX)

  await mkdir(commandsDir, { recursive: true })
  await mkdir(agentsDir, { recursive: true })

  // Copy commands as-is (MD-first). OpenCode will parse YAML frontmatter.
  const commandFiles = await getMarkdownFiles(join(CONTENT_DIR, "commands"))
  for (const file of commandFiles) {
    const content = await readFile(file, "utf-8")
    const dest = join(commandsDir, basename(file))
    await writeFile(dest, content)
  }
  console.log(`   ✓ ${commandFiles.length} commands`)

  // Write agents (MD-first) but delete `name:` from frontmatter so OpenCode
  // uses the path-derived name. Also nest by YAML `category` to achieve names like:
  // ai-eng/<category>/<agent>
  const agentFiles = await getMarkdownFiles(join(CONTENT_DIR, "agents"))
  for (const file of agentFiles) {
    const content = await readFile(file, "utf-8")
    const { markdown, category } = transformAgentMarkdownForOpenCode(content)

    const categoryDir = join(agentsDir, category)
    await mkdir(categoryDir, { recursive: true })

    const dest = join(categoryDir, basename(file))
    await writeFile(dest, markdown)
  }
  console.log(`   ✓ ${agentFiles.length} agents`)

  // Validate OpenCode output so we fail fast on publish/build.
  await validateOpenCodeOutput(OPENCODE_DIR)
  console.log(`   ✓ OpenCode output validated`)

  // Copy opencode.jsonc configuration
  const opencodeConfigSrc = join(ROOT, ".opencode", "opencode.jsonc")
  const opencodeConfigDest = join(OPENCODE_DIR, "opencode.jsonc")
  if (existsSync(opencodeConfigSrc)) {
    await copyFile(opencodeConfigSrc, opencodeConfigDest)
    console.log(`   ✓ configuration copied`)
  } else {
    console.log(`   ⚠️  configuration not found`)
  }

  // Copy plugin file
  const pluginSrc = join(ROOT, ".opencode", "plugin", "ai-eng-system.ts")
  const pluginDest = join(OPENCODE_DIR, "plugin", "ai-eng-system.ts")
  if (existsSync(pluginSrc)) {
    await mkdir(dirname(pluginDest), { recursive: true })
    await copyFile(pluginSrc, pluginDest)
    console.log(`   ✓ plugin copied`)
  } else {
    console.log(`   ⚠️  plugin not found`)
  }
}

/**
 * Copy skills (shared between platforms)
 */
async function copySkills(): Promise<void> {
  console.log("📦 Copying skills...")
  
  const destDir = join(DIST_DIR, "skills")
  
  if (existsSync(SKILLS_DIR)) {
    await mkdir(destDir, { recursive: true })
    await copyRecursive(SKILLS_DIR, destDir)
  }
  
  console.log(`   ✓ skills copied`)
}

/**
 * Main build function
 */
async function build(): Promise<void> {
  const startTime = Date.now()
  
   console.log("\n🚀 Building ai-eng-system...\n")

  // Clean dist
  if (existsSync(DIST_DIR)) {
    await rm(DIST_DIR, { recursive: true })
  }
  await mkdir(DIST_DIR, { recursive: true })

  // Check if content directory exists
  if (!existsSync(CONTENT_DIR)) {
    console.error("❌ Error: content/ directory not found")
    console.error("   Run migration first or create content/ manually")
    process.exit(1)
  }

  // Build all platforms
  await buildClaudeAgents()
  await buildClaudeSkills()
  await buildClaudePlugin()
  await buildOpenCode()
  await copySkills()

  const elapsed = Date.now() - startTime
  console.log(`\n✅ Build complete in ${elapsed}ms`)
  console.log(`   Output: ${DIST_DIR}/`)
}

/**
 * Validate content without building
 */
async function validate(): Promise<void> {
  console.log("\n🔍 Validating content...\n")

  if (!existsSync(CONTENT_DIR)) {
    console.error("❌ content/ directory not found")
    process.exit(1)
  }

  const commandFiles = await getMarkdownFiles(join(CONTENT_DIR, "commands"))
  const agentFiles = await getMarkdownFiles(join(CONTENT_DIR, "agents"))

  let errors = 0

  for (const file of commandFiles) {
    const content = await readFile(file, "utf-8")
    const { meta } = parseFrontmatter(content)
    
    if (!meta.name) {
      console.error(`❌ ${file}: missing 'name' in frontmatter`)
      errors++
    }
    if (!meta.description) {
      console.error(`❌ ${file}: missing 'description' in frontmatter`)
      errors++
    }
  }

  for (const file of agentFiles) {
    const content = await readFile(file, "utf-8")
    const { meta } = parseFrontmatter(content)
    
    if (!meta.name) {
      console.error(`❌ ${file}: missing 'name' in frontmatter`)
      errors++
    }
    if (!meta.description) {
      console.error(`❌ ${file}: missing 'description' in frontmatter`)
      errors++
    }
  }

  if (errors > 0) {
    console.error(`\n❌ Validation failed with ${errors} error(s)`)
    process.exit(1)
  }

  console.log(`✅ Validated ${commandFiles.length} commands, ${agentFiles.length} agents`)
}

// CLI
const args = process.argv.slice(2)

if (args.includes("--validate")) {
  await validate()
} else if (args.includes("--watch")) {
  console.log("👀 Watching for changes...")
  await build()
  
  watch(CONTENT_DIR, { recursive: true }, async (event, filename) => {
    if (filename?.endsWith(".md")) {
      console.log(`\n📝 Changed: ${filename}`)
      await build()
    }
  })
} else {
  await build()
}
