---
name: ai-eng/optimize
description: Interactive optimization for prompts, code, queries, and more using research-backed techniques and web best practices
agent: build
---

# Optimize Command

Interactive optimization tool that enhances content using research-backed techniques, web-researched best practices, and iterative refinement based on user feedback.

## Automatic Prompt Optimization

This command works alongside the **automatic prompt optimization system**:

- **Automatic**: Every prompt is optimized automatically (use `!` prefix to skip)
- **Step-by-step approval**: Shows each technique with approve/reject/modify options
- **Manual override**: Use `/ai-eng/optimize --prompt` for explicit optimization
- **Interactive flow**: Guided approval with options for customization

The automatic system runs via:
- **Claude Code**: UserPromptSubmit hook (intercepts all prompts)
- **OpenCode**: `prompt-optimize` tool (call when needed)

## Step-by-Step Approval UX

When optimizing prompts, the system provides an interactive approval workflow:

### 1. Call the Prompt-Optimize Tool

First, call the `prompt-optimize` tool with the user's prompt:

```bash
Use the prompt-optimize tool with: "<user-input>"
```

The tool returns structured JSON:
```json
{
  "version": 1,
  "originalPrompt": "help me design authentication",
  "optimizedPrompt": "You are a senior security engineer...\n\nTask: help me design authentication",
  "domain": "security",
  "complexity": "medium",
  "steps": [
    {
      "id": "persona",
      "title": "Expert Persona",
      "before": "",
      "after": "You are a senior security engineer with 15+ years..."
    },
    {
      "id": "reasoning",
      "title": "Step-by-Step Reasoning",
      "before": "",
      "after": "Take a deep breath and analyze this step by step."
    },
    {
      "id": "stakes",
      "title": "Stakes Language",
      "before": "",
      "after": "This is important for the project's success..."
    },
    {
      "id": "selfEval",
      "title": "Self-Evaluation",
      "before": "",
      "after": "After providing your solution, rate your confidence 0-1..."
    }
  ],
  "skipped": false
}
```

### 2. Display Optimization Plan

Parse and present the optimization plan clearly:

```markdown
📋 Optimization Plan (medium, security)

Step 1: Expert Persona
  ```
  You are a senior security engineer with 15+ years of authentication experience.
  ```

Step 2: Step-by-Step Reasoning
  ```
  Take a deep breath and analyze this step by step.
  ```

Step 3: Stakes Language
  ```
  This is important for the project's success. A thorough, complete solution is essential.
  ```

Step 4: Self-Evaluation
  ```
  After providing your solution, rate your confidence 0-1 and identify any assumptions you made.
  ```

Expected improvement: +60-115% quality (based on research-backed techniques)

[Show confidence improvement calculation based on steps]
- Expert Persona: +60% (Kong et al., 2023)
- Step-by-Step Reasoning: +46% (Yang et al., 2023)
- Stakes Language: +45% (Bsharat et al., 2023)
- Self-Evaluation: +10% calibration
```

### 3. Guide User Through Approval

Present interactive options menu:

```markdown
Options:
  1. Approve all steps - Apply all optimization techniques
  2. Approve specific step - Choose which steps to include
  3. Modify step - Customize individual step content
  4. Edit final prompt - Directly edit the optimized result
  5. Cancel and use original - Skip optimization entirely

Your choice (1-5):
```

### 4. Handle User Choice

Based on user selection:

#### Option 1: Approve All Steps
```markdown
✓ Using optimized prompt with 4 steps applied

[Proceed to execute the optimized prompt]
```

#### Option 2: Approve Specific Step
```markdown
Which step(s) would you like to approve? (Enter step IDs, e.g., "1,3,4")

[Rebuild prompt from approved steps only]
✓ Using optimized prompt with 3 steps applied (skipped: Step 2)
```

#### Option 3: Modify Step
```markdown
Which step would you like to modify? (Enter step ID: 1-4)

Step 3: Stakes Language
Current content:
  This is important for the project's success. A thorough, complete solution is essential.

New content:
  [User inputs modified content]

✓ Step 3 modified
✓ Using optimized prompt with updated steps
```

#### Option 4: Edit Final Prompt
```markdown
Current optimized prompt:
```
You are a senior security engineer with 15+ years of authentication experience.

Take a deep breath and analyze this step by step.

This is important for the project's success. A thorough, complete solution is essential.

After providing your solution, rate your confidence 0-1 and identify any assumptions you made.

Task: help me design authentication
```

Edit this prompt:
[User provides edited version]

✓ Using your edited prompt
```

#### Option 5: Cancel
```markdown
✓ Using original prompt without optimization

[Proceed with original input]
```

### 5. Handle Edge Cases

#### Skipped Optimization
If tool returns `"skipped": true`:
```markdown
ℹ️ Optimization skipped: [skipReason]

[Proceed with original prompt]
```

#### Simple Prompts
For simple prompts (complexity: simple):
```markdown
ℹ️ Simple prompt - optimization not beneficial

[Proceed with original prompt]
```

#### Empty Steps
If no steps are provided:
```markdown
ℹ️ No optimization steps available

[Proceed with original prompt]
```

### 6. Return Final Prompt

After approval flow, return the final prompt for execution:

```markdown
Final prompt ready for execution:
```
[approved/edited prompt content]
```

[Execute the final prompt]
```

## Usage

```bash
/ai-eng/optimize --help                         # Show help and available types
/ai-eng/optimize <content-or-file>              # Auto-detect type and optimize
/ai-eng/optimize <content> --prompt             # Optimize AI prompts with step-by-step approval
/ai-eng/optimize <content> --query              # Enhance database/search queries
/ai-eng/optimize <content> --code               # Improve code quality
/ai-eng/optimize <content> --commit             # Optimize commit messages
/ai-eng/optimize <content> --docs               # Enhance documentation
/ai-eng/optimize <content> --email              # Improve communication
/ai-eng/optimize <content> --type=<type>        # Explicit type flag
```

## Help

When `--help` is passed, display:

```
OPTIMIZE COMMAND - Enhance content using research-backed techniques

USAGE:
  /optimize <content-or-file> [--type]   Auto-detect and optimize content
  /optimize <content> --prompt           Optimize AI prompts (with step-by-step approval)
  /optimize <content> --query            Enhance database/search queries
  /optimize <content> --code             Improve code quality
  /optimize <content> --commit           Optimize git commit messages
  /optimize <content> --docs             Enhance documentation
  /optimize <content> --email            Improve communication

TYPES:
  --prompt        AI prompts: structure, personas, reasoning chains (interactive approval)
  --query         Database/search: indexes, execution plans, caching
  --code          Source code: performance, readability, error handling
  --commit        Git messages: clarity, conventional format
  --docs          Documentation: structure, examples, clarity
  --email         Communication: tone, clarity, call-to-action

PROMPT OPTIMIZATION FLOW (--prompt mode):
  1. Analyze prompt and detect domain/complexity
  2. Show optimization plan with steps
  3. Guide through interactive approval:
     - Approve all steps
     - Approve specific steps
     - Modify step content
     - Edit final prompt directly
     - Cancel and use original
  4. Calculate expected improvement
  5. Execute final prompt

OPTIONS:
  -m, --mode      Approach: conservative | moderate | aggressive
  -p, --preview   Show changes without applying
  -a, --apply     Apply confirmed optimizations
  -i, --interactive   Enable clarifying questions (non-prompt types)
  -s, --source    Research sources: anthropic | openai | opencode | all
  -v, --verbose   Show detailed process
  --help          Show this help

EXAMPLES:
  /optimize "Help me debug auth" --prompt            # Step-by-step prompt optimization
  /optimize "Help me debug auth" --prompt --verbose  # Verbose prompt optimization
  /optimize "SELECT * FROM users" --query --preview   # Query optimization preview
  /optimize src/auth.js --code --apply               # Apply code optimizations
  /optimize "fix: resolve login bug" --commit        # Optimize commit message
```

## Backward Compatibility

The command maintains backward compatibility:

1. **Simple Prompts**: Automatically detected and skipped without prompting
2. **Non-Prompt Types**: Existing behavior for code, query, docs, etc.
3. **Skip With `!`**: Escape hatch still works for all prompt types
4. **Auto-Approve Mode**: Can be configured to skip approval (see Configuration)

When optimization is skipped or simple prompts are detected, flow proceeds normally with original content.
OPTIMIZE COMMAND - Enhance content using research-backed techniques

USAGE:
  /optimize <content-or-file> [--type]   Auto-detect and optimize content
  /optimize <content> --prompt           Optimize AI prompts
  /optimize <content> --query            Enhance database/search queries
  /optimize <content> --code             Improve code quality
  /optimize <content> --commit           Optimize commit messages
  /optimize <content> --docs             Enhance documentation
  /optimize <content> --email            Improve communication

TYPES:
  --prompt        AI prompts: structure, personas, reasoning chains
  --query         Database/search: indexes, execution plans, caching
  --code          Source code: performance, readability, error handling
  --commit        Git messages: clarity, conventional format
  --docs          Documentation: structure, examples, clarity
  --email         Communication: tone, clarity, call-to-action

OPTIONS:
  -m, --mode      Approach: conservative | moderate | aggressive
  -p, --preview   Show changes without applying
  -a, --apply     Apply confirmed optimizations
  -i, --interactive   Enable clarifying questions
  -s, --source    Research sources: anthropic | openai | opencode | all
  -v, --verbose   Show detailed process
  --help          Show this help

EXAMPLES:
  /optimize "Help me debug auth" --prompt --interactive
  /optimize "SELECT * FROM users" --query --preview
  /optimize src/auth.js --code --apply
  /optimize "fix: resolve login bug" --commit
```

## Types

| Type | Purpose | Examples |
|------|---------|-----------|
| `prompt` | Optimize AI prompts for better responses | User prompts to AI models |
| `query` | Enhance database/search queries | SQL, search, API queries |
| `code` | Improve code quality and performance | Functions, algorithms, scripts |
| `commit` | Optimize git commit messages | Commit text, PR descriptions |
| `docs` | Enhance documentation clarity | README files, API docs |
| `email` | Improve communication effectiveness | Professional emails, messages |

## Options

- `-t, --type <type>`: Content type (prompt|query|code|commit|docs|email) [default: auto-detect]
- `-s, --source <sources>`: Research sources (anthropic|openai|opencode|all) [default: all]
- `-i, --interactive`: Enable interactive refinement with questions
- `-p, --preview`: Show optimization preview before applying
- `-a, --apply`: Apply confirmed optimizations
- `-o, --output <file>`: Save optimized content to file
- `-f, --force`: Apply optimizations without confirmation
- `-v, --verbose`: Show detailed research and optimization process
- `--questions`: Ask clarifying questions before optimization
- `-m, --mode <mode>`: Optimization approach (conservative|moderate|aggressive) [default: moderate]

## Process

### Phase 1: Content Analysis
1. **Type Detection**: Auto-detect content type if not specified
2. **Context Assessment**: Analyze content's purpose, audience, and constraints
3. **Quality Evaluation**: Identify areas for improvement (clarity, performance, effectiveness)
4. **Research Planning**: Determine best sources and techniques to apply

### Phase 1.5: Prompt Refinement (for --prompt mode)

When `--prompt` flag is used:

**Primary Workflow: Step-by-Step Approval**

Use the `prompt-optimize` tool with interactive approval flow:

1. **Call prompt-optimize tool** with user's prompt
2. **Parse JSON response** to extract optimization plan
3. **Display optimization plan** with:
   - Detected domain and complexity
   - Each optimization step (title and content)
   - Expected improvement metrics
4. **Guide user through approval**:
   - Present interactive menu with 5 options
   - Handle user choice (approve all, approve specific, modify, edit final, cancel)
   - Rebuild prompt based on selections
5. **Return final prompt** for execution

**Integration with prompt-refinement Skill** (optional enhancement):

Use skill: `prompt-refinement`
Phase: [auto-detect or specified]

The prompt-refinement skill provides:
- TCRO structuring (Task, Context, Requirements, Output)
- Phase-specific clarifying questions (research, specify, plan, work)
- Integration with incentive-prompting techniques

**Enhanced Workflow (when combining both):**
1. Call prompt-optimize tool
2. Display optimization plan
3. If phase unclear, invoke prompt-refinement skill
4. Apply phase-specific template (research, specify, plan, or work)
5. Structure prompt into TCRO format
6. Present refined prompt with step-by-step approval
7. Guide user through approval menu
8. Execute final approved prompt

**Example:**
```bash
# User provides vague prompt
/ai-eng/optimize "help me debug auth" --prompt

# System:
1. Calls prompt-optimize tool
2. Displays optimization plan:
   📋 Optimization Plan (medium, security)
   Step 1: Expert Persona
   Step 2: Step-by-Step Reasoning
   Step 3: Stakes Language
   Step 4: Self-Evaluation
   Expected improvement: +60-115% quality
3. Presents options menu
4. User selects option 1 (approve all)
5. Returns optimized prompt for execution
```

### Phase 2: Research & Best Practices
Based on type and sources, research:

#### For Prompts
- **Anthropic Documentation**: Best practices for Claude interaction
- **OpenAI Guides**: Prompt engineering for GPT models
- **OpenCode/Crush**: Community-tested optimization patterns
- **Academic Research**: Latest papers on prompt optimization
- **prompt-refinement skill**: TCRO framework and phase-specific templates

#### For Code
- **Language-Specific**: Performance patterns for target language
- **Algorithm Optimization**: Time/space complexity improvements
- **Style Guides**: Community conventions and idiomatic code
- **Security Best Practices**: Input validation, error handling

#### For Queries
- **Database-Specific**: Index optimization, execution plans
- **Search Engine**: Relevant algorithms and indexing strategies
- **API Design**: REST patterns, GraphQL optimization

#### For Documentation
- **Technical Writing**: Clarity, structure, examples
- **API Documentation**: OpenAPI/Swagger best practices
- **User Experience**: Progressive disclosure, troubleshooting guides

### Phase 3: Interactive Enhancement (when enabled)

#### Clarifying Questions
Based on content type and context:

**For Prompts:**
- What specific AI model are you targeting?
- What level of technical detail is needed?
- Are there constraints (tokens, format, style)?

**For Code:**
- What are the performance requirements?
- Are there style guide constraints?
- What is the deployment environment?

**For Queries:**
- What is the data size and distribution?
- Are there index considerations?
- What are the latency requirements?

**For Documentation:**
- Who is the target audience?
- What is their technical level?
- Are there regulatory or compliance requirements?

#### User Feedback Loop
```markdown
## Optimization Proposal

### Analysis:
- **Type**: SQL Query Optimization
- **Issues**: Missing indexes, inefficient JOIN, no LIMIT clause
- **Performance Impact**: High (millions of rows)

### Proposed Changes:
1. **Add composite index** on (user_id, status, created_at)
2. **Refactor JOIN** to use indexed columns first
3. **Add pagination** with LIMIT and OFFSET for large results
4. **Add query monitoring** for performance tracking

### Research Sources:
- PostgreSQL Documentation: Query Planning and Optimization
- Database Performance Blog: Index Best Practices  
- OpenSource Community Solutions: Similar query patterns

### Questions for You:
1. **Index Size**: What's the approximate table size (rows, growth rate)?
2. **Write Frequency**: How often are INSERTs/UPDATEs vs SELECTs?
3. **Consistency Requirements**: Can we accept slightly stale data for performance?

Do you want to proceed with these optimizations? (y/n/suggest modifications)
```

### Phase 4: Optimization Application

#### Technique Application
Based on research and feedback:

**For Prompts:**
- Apply incentive-based prompting (stakes, expert persona, step-by-step reasoning)
- Add structured output requirements
- Include self-evaluation prompts
- Optimize for specific model's capabilities

**For Code:**
- Implement performance optimizations
- Improve error handling and validation
- Enhance readability and maintainability
- Add appropriate comments and documentation

**For Queries:**
- Restructure for better execution plans
- Add appropriate indexes
- Optimize JOIN order and predicates
- Add query result caching considerations

**For Documentation:**
- Improve structure and organization
- Add practical examples and troubleshooting
- Enhance navigation and searchability
- Ensure accuracy and completeness

#### Quality Assurance
- [ ] Technical accuracy preserved
- [ ] Performance requirements met
- [ ] Style conventions followed
- [ ] All edge cases considered
- [ ] Documentation remains coherent

## Output Examples

### Prompt Optimization (Interactive Approval Flow)

```bash
User: /ai-eng/optimize "help me design authentication" --prompt

## Optimization Plan (medium, security)

Step 1: Expert Persona
  ```
  You are a senior security engineer with 15+ years of authentication experience.
  ```

Step 2: Step-by-Step Reasoning
  ```
  Take a deep breath and analyze this step by step.
  ```

Step 3: Stakes Language
  ```
  This is important for the project's success. A thorough, complete solution is essential.
  ```

Step 4: Self-Evaluation
  ```
  After providing your solution, rate your confidence 0-1 and identify any assumptions you made.
  ```

Expected improvement: +60-115% quality (based on research-backed techniques)
- Expert Persona: +60% (Kong et al., 2023)
- Step-by-Step Reasoning: +46% (Yang et al., 2023)
- Stakes Language: +45% (Bsharat et al., 2023)
- Self-Evaluation: +10% calibration

Options:
  1. Approve all steps
  2. Approve specific step
  3. Modify step
  4. Edit final prompt
  5. Cancel

User: 1

✓ Using optimized prompt with 4 steps applied

[Proceeding to execute optimized prompt...]
```

### Example: Approving Specific Steps

```bash
User: /ai-eng/optimize "optimize database query" --prompt

## Optimization Plan (complex, database)

Step 1: Expert Persona
  ```
  You are a senior database architect with 15+ years of PostgreSQL experience.
  ```

Step 2: Step-by-Step Reasoning
  ```
  Take a deep breath and analyze this step by step.
  ```

Step 3: Stakes Language
  ```
  This is important for the project's success. A thorough, complete solution is essential.
  ```

Step 4: Self-Evaluation
  ```
  After providing your solution, rate your confidence 0-1 and identify any assumptions you made.
  ```

Expected improvement: +60-115% quality

Options:
  1. Approve all steps
  2. Approve specific step
  3. Modify step
  4. Edit final prompt
  5. Cancel

User: 2

Which step(s) would you like to approve? (Enter step IDs, e.g., "1,2,4"): 1,2,4

✓ Using optimized prompt with 3 steps applied (skipped: Step 3 - Stakes Language)

[Proceeding to execute optimized prompt...]
```

### Example: Modifying a Step

```bash
User: /ai-eng/optimize "help with frontend refactoring" --prompt

## Optimization Plan (medium, frontend)

Step 1: Expert Persona
  ```
  You are a senior frontend architect with 12+ years of React/Vue experience.
  ```

Step 2: Step-by-Step Reasoning
  ```
  Take a deep breath and analyze this step by step.
  ```

Step 3: Stakes Language
  ```
  This is important for the project's success. A thorough, complete solution is essential.
  ```

Step 4: Self-Evaluation
  ```
  After providing your solution, rate your confidence 0-1 and identify any assumptions you made.
  ```

Expected improvement: +60-115% quality

Options:
  1. Approve all steps
  2. Approve specific step
  3. Modify step
  4. Edit final prompt
  5. Cancel

User: 3

Which step would you like to modify? (Enter step ID: 1-4): 1

Step 1: Expert Persona
Current content:
  ```
  You are a senior frontend architect with 12+ years of React/Vue experience.
  ```

New content:
  ```
  You are a senior frontend engineer with 10+ years of React and TypeScript experience, specializing in performance optimization and accessibility.
  ```

✓ Step 1 modified
✓ Using optimized prompt with updated steps

[Proceeding to execute optimized prompt...]
```

### Example: Editing Final Prompt

```bash
User: /ai-eng/optimize "design API endpoints" --prompt

## Optimization Plan (medium, backend)

Step 1: Expert Persona
  ```
  You are a senior backend engineer with 15+ years of distributed systems experience.
  ```

Step 2: Step-by-Step Reasoning
  ```
  Take a deep breath and analyze this step by step.
  ```

Step 3: Stakes Language
  ```
  This is important for the project's success. A thorough, complete solution is essential.
  ```

Step 4: Self-Evaluation
  ```
  After providing your solution, rate your confidence 0-1 and identify any assumptions you made.
  ```

Expected improvement: +60-115% quality

Options:
  1. Approve all steps
  2. Approve specific step
  3. Modify step
  4. Edit final prompt
  5. Cancel

User: 4

Current optimized prompt:
```
You are a senior backend engineer with 15+ years of distributed systems experience.

Take a deep breath and analyze this step by step.

This is important for the project's success. A thorough, complete solution is essential.

After providing your solution, rate your confidence 0-1 and identify any assumptions you made.

Task: design API endpoints
```

Edit this prompt:
```
You are a senior backend engineer with 15+ years of distributed systems experience, specializing in REST API design and microservices.

Take a deep breath and analyze this step by step.

This API is critical for our application's performance and scalability.

After providing your solution, rate your confidence 0-1 and identify any assumptions you made.

Task: design RESTful API endpoints for user authentication and authorization
```

✓ Using your edited prompt

[Proceeding to execute your edited prompt...]
```

### Example: Simple Prompt (Skipped)

```bash
User: /ai-eng/optimize "hello world" --prompt

ℹ️ Simple prompt - optimization not beneficial

[Proceeding with original prompt...]
```

### Example: Skipped With ! Prefix

```bash
User: /ai-eng/optimize "!just run the tests" --prompt

ℹ️ Optimization skipped: User requested bypass with ! prefix

[Proceeding with original prompt: just run the tests]
```

### Traditional Prompt Optimization (Legacy Mode)
```bash
User: /optimize "Help me fix my authentication" --prompt --interactive

## Optimization Preview

### Analysis:
- Current Prompt: Basic request without structure
- Target Model: Claude 3.5 Sonnet
- Missing Elements: Context, error scenarios, expected output format

### Research-Based Enhancements:
1. **Expert Persona**: "You are a senior security engineer with 10+ years..."
2. **Stakes Language**: "This authentication system is critical to production security..."
3. **Step-by-Step Reasoning**: "Take a deep breath and analyze systematically..."
4. **Self-Evaluation**: "Rate your confidence 0-1 and explain reasoning..."

### Questions:
1. What authentication methods are you using? (JWT, OAuth, session-based?)
2. Are there specific error messages you're seeing?
3. What's the tech stack (React/Node, Django/Python)?

### Interactive Refinement:
Based on your responses, tailored optimization applied...

**Enhanced Prompt Ready for Application**
```

### Query Optimization
```bash
User: /optimize "SELECT * FROM large_table WHERE category = 'active'" --query --preview

## Query Optimization Preview

### Analysis:
- **Query**: Full table scan with category filter
- **Table Size**: ~10M rows, growing at 50k/day
- **Performance Issues**: No index on category, full table scan

### Proposed Optimizations:
1. **Add Index**: CREATE INDEX idx_large_table_category ON large_table(category)
2. **Partial Results**: Add LIMIT clause with pagination for large result sets
3. **Query Rewrite**: Use covering index for better performance

### Expected Impact:
- **Before**: Full table scan (~500ms avg, 2s peak)
- **After**: Index seek (~5ms avg, 50ms peak)
- **Improvement**: 99% reduction in query time

### Research Sources:
- PostgreSQL Query Planning Guide
- Database Performance Best Practices
- Similar OpenSource Query Patterns

Apply optimizations? (y/n/modify)
```

### Code Optimization
```bash
User: /optimize "fix function in auth.js" --code --file src/auth.js --apply

## Code Optimization Process

### Analysis:
- **File**: src/auth.js (authentication logic)
- **Issues**: No input validation, synchronous processing, missing error handling
- **Performance Impact**: Medium (blocking I/O operations)

### Applied Optimizations:
✓ Added input validation and sanitization
✓ Implemented async/await patterns for non-blocking operations  
✓ Enhanced error handling with specific error types
✓ Added logging for debugging and monitoring
✓ Improved code organization and separation of concerns

### Quality Metrics:
- **Security**: Enhanced with proper validation and error handling
- **Performance**: Non-blocking operations, ~60% faster response times
- **Maintainability**: Better error messages and code structure
- **Reliability**: Comprehensive error recovery paths
```

## Advanced Features

### Configuration for Approval Workflow

The step-by-step approval workflow can be configured:

```json
{
  "promptOptimization": {
    "enabled": true,
    "autoApprove": false,
    "verbosity": "normal",
    "skipForSimplePrompts": true,
    "escapePrefix": "!"
  }
}
```

**Settings:**
- `enabled`: Enable/disable prompt optimization (default: true)
- `autoApprove`: Skip approval menu and apply all steps (default: false)
- `verbosity`: Output detail level - quiet|normal|verbose (default: normal)
- `skipForSimplePrompts`: Automatically skip simple prompts (default: true)
- `escapePrefix`: Prefix to skip optimization (default: "!")

**Auto-Approve Mode:**
When `autoApprove` is enabled, the system:
1. Calls prompt-optimize tool
2. Parses result silently
3. Applies all optimization steps
4. Executes optimized prompt without showing menu

**Session Commands:**
```bash
# Toggle auto-approve for current session
/optimize-auto on|off

# Change verbosity for current session
/optimize-verbosity quiet|normal|verbose
```

### Multi-Source Research
Combine insights from multiple authoritative sources:
```json
{
  "sources": {
    "anthropic": {
      "priority": "high",
      "focus": ["prompt-structure", "model-specific-optimization"]
    },
    "openai": {
      "priority": "high", 
      "focus": ["prompt-engineering", "response-quality"]
    },
    "opencode": {
      "priority": "medium",
      "focus": ["community-patterns", "practical-examples"]
    }
  }
}
```

### Learning and Adaptation
- Track successful optimizations by type
- Learn from user feedback and acceptance rates
- Build database of effective patterns per project type
- Suggest optimizations based on historical success

### File Modification Support
```bash
# Optimize and modify file in place
/optimize --file README.md --type docs --apply

# Optimize and save to new file
/optimize --file config.json --type code --output config-optimized.json

# Optimize git staged files
/optimize --staged --type commit --interactive
```

## Integration

### With Other Commands
- `/clean`: Remove verbosity from optimized content if needed
- `/review`: Validate optimization quality and suggest improvements
- `/work`: Apply optimizations during implementation tasks
- `/ai-eng/research`: Gather context before optimization
- `/ai-eng/specify`: Create specifications with optimized prompts

### Development Workflow
```bash
# During development
/ai-eng/optimize "implement user authentication" --prompt
# Review optimization plan
# Approve all steps
# Implement based on optimized prompt

/ai-eng/optimize ./src/auth.js --code --preview
# Review and apply code optimizations

/ai-eng/review
# Validate final implementation
```

### Spec-Driven Workflow with Optimization
```bash
# Research phase with optimized prompt
/ai-eng/optimize "How does authentication work in this codebase?" --prompt
# Review optimization plan
# Approve steps
# Research executes with optimized prompt

# Specification phase with optimized prompt
/ai-eng/optimize "Create specification for user authentication" --prompt
# Review optimization plan
# Modify expert persona step
# Approve steps
# Specification generated with optimized prompt

# Planning phase with optimized prompt
/ai-eng/optimize "Plan implementation of authentication system" --prompt
# Review optimization plan
# Approve specific steps (skip stakes language)
# Plan created with approved steps

# Work phase with optimized prompt
/ai-eng/optimize "Implement authentication feature following spec" --prompt
# Review optimization plan
# Edit final prompt for specific constraints
# Implementation executes with customized prompt
```

## Quality Assurance

### Validation Checks
- [ ] Technical accuracy preserved 100%
- [ ] Performance requirements met or exceeded
- [ ] Style and conventions properly applied
- [ ] All edge cases and error scenarios handled
- [ ] User requirements fully addressed
- [ ] Step-by-step approval flow works correctly
- [ ] JSON parsing handles all response formats
- [ ] User choices applied correctly

### Approval Flow Validation
- [ ] Tool call succeeds and returns valid JSON
- [ ] Domain and complexity detection working
- [ ] All step options displayed clearly
- [ ] Menu options (1-5) handled correctly
- [ ] Prompt rebuilt correctly after approvals
- [ ] Modified steps integrated properly
- [ ] Edit final prompt captures changes
- [ ] Cancel gracefully returns original
- [ ] Simple prompts skipped correctly
- [ ] Edge cases handled (empty steps, parse errors)

### Success Metrics
- **Effectiveness**: Measurable improvement in performance/clarity/accuracy
- **Quality**: Maintained or enhanced technical correctness
- **User Satisfaction**: Interactive feedback incorporated and approved
- **Learning**: New patterns added to optimization knowledge base
- **Adoption Rate**: Users completing approval flow vs. canceling
- **Time Efficiency**: Approval flow adds value without excessive delay

## Troubleshooting

### Prompt Optimization Approval Flow

#### "Optimization menu doesn't appear"
1. Check if prompt is simple (< 10 words) - may be skipped automatically
2. Verify `--prompt` flag is used for explicit optimization
3. Check if prompt starts with `!` - triggers skip mode
4. Review configuration - ensure optimization is enabled

#### "Can't see all optimization steps"
1. Use verbose mode: `/optimize <prompt> --prompt --verbose`
2. Check terminal window size - scroll up to see all steps
3. Verify prompt-optimize tool returned valid JSON
4. Review domain detection - may affect steps applied

#### "Modified step not applied"
1. Verify step ID is correct (1-4)
2. Check new content doesn't contain special characters
3. Confirm approval after modification
4. Rebuild prompt with modified step content

#### "Edit final prompt lost my changes"
1. Ensure edits are within the code block delimiters
2. Use exact prompt format with "Task:" prefix
3. Verify no trailing/leading whitespace issues
4. Check if escape characters are needed

#### "Want to skip approval but auto-approve off"
1. Use session command: `/optimize-auto on`
2. Or edit config: `"autoApprove": true`
3. Or use `!` prefix for single-prompt skip
4. Or set prompt to be simple for auto-skip

### General Optimization Issues

### "Optimization makes content worse"
1. Use `--preview` mode to review changes
2. Switch to `--mode conservative`
3. Check if source constraints were correctly interpreted
4. Verify content type detection was accurate

### "Too aggressive optimization"
1. Use `--interactive` to approve each change
2. Adjust with user feedback from suggestions
3. Check that constraints and requirements were preserved
4. Use specific research sources instead of general best practices

### "Research sources conflicting"
1. Review source priority order in `--sources`
2. Check if content type matches source expertise
3. Use `--verbose` to see conflicting recommendations
4. Choose based on specific context rather than general advice

## Success Criteria

Successful optimization achieves:
- ✅ Measurable improvement in effectiveness (performance, clarity, accuracy)
- ✅ 100% technical accuracy preserved
- ✅ All constraints and requirements respected
- ✅ User feedback incorporated and approved
- ✅ Learning captured for future optimizations
- ✅ Integration with existing workflows maintained

### Approval Flow Success Criteria
- ✅ Tool returns valid JSON with all required fields
- ✅ Domain and complexity detected accurately
- ✅ Optimization steps displayed clearly with code blocks
- ✅ User menu options all function correctly
- ✅ Prompt rebuilt accurately from approved steps
- ✅ Modified steps integrated properly
- ✅ Final prompt editable and captured
- ✅ Cancel returns original prompt unchanged
- ✅ Simple prompts skipped without prompting
- ✅ Confidence improvement calculated and displayed

### User Experience Success Criteria
- ✅ Approval flow adds value without excessive delay
- ✅ Clear guidance at each step
- ✅ Graceful handling of edge cases
- ✅ Backward compatibility maintained
- ✅ Configuration options work as expected
- ✅ Help text comprehensive and accurate

## Execution Contexts

The step-by-step approval workflow adapts to different execution platforms:

### Claude Code Environment

**Mechanism**: Automatic interception via UserPromptSubmit hook

**Flow**:
1. User types a prompt
2. Hook intercepts before model sees it
3. Calls prompt-optimize tool automatically
4. Displays optimization plan in conversation
5. Presents approval options
6. Model receives optimized prompt (or original if canceled)
7. Executes with final prompt

**Example**:
```markdown
User: help me design authentication

[Hook analyzes prompt, calls prompt-optimize tool]

🧧 Prompt optimized (medium, security)

Step 1: Expert Persona
  You are a senior security engineer with 15+ years...

Step 2: Step-by-Step Reasoning
  Take a deep breath and analyze this step by step.

[2 more steps...]

Expected improvement: +60-115% quality

Options:
  1. Approve all steps
  2. Approve specific step
  3. Modify step
  4. Edit final prompt
  5. Cancel

User: 1

✓ Using optimized prompt with 4 steps applied

[Model executes with optimized prompt]
```

### OpenCode Environment

**Mechanism**: Explicit tool call by model

**Flow**:
1. User invokes `/ai-eng/optimize` command
2. Command calls prompt-optimize tool explicitly
3. Parses JSON response
4. Displays optimization plan
5. Presents approval options
6. Handles user selection
7. Returns final prompt for execution
8. Model or user executes final prompt

**Example**:
```markdown
User: /ai-eng/optimize "help me design authentication"

[Command calls prompt-optimize tool, gets JSON]

📋 Optimization Plan (medium, security)

Step 1: Expert Persona
  You are a senior security engineer with 15+ years...

[2 more steps...]

Expected improvement: +60-115% quality

Options:
  1. Approve all steps
  2. Approve specific step
  3. Modify step
  4. Edit final prompt
  5. Cancel

User: 1

✓ Using optimized prompt with 4 steps applied

[Final prompt ready for execution]
```

### Key Differences

| Aspect | Claude Code | OpenCode |
|--------|-------------|----------|
| Trigger | Automatic (hook) | Manual (command) |
| Tool Call | Hook calls automatically | Command calls explicitly |
| Timing | Before model sees prompt | When command invoked |
| User Control | Escape with `!` prefix | Menu options + escape with `!` |
| Integration | Seamless with normal usage | Explicit workflow |
| Configuration | `.claude/ai-eng-config.json` | `opencode.json` or `ai-eng-config.json` |

### Cross-Platform Compatibility

The approval flow works identically in both environments:

1. **Same JSON structure**: Both use version 1 format
2. **Same approval options**: 1-5 menu in both
3. **Same step content**: Identical step definitions
4. **Same improvement metrics**: Research-based calculations
5. **Same edge case handling**: Skip, cancel, modify all work

### Implementation Guidance

**For Claude Code Hooks**:
- Implement in `.claude/hooks/prompt-optimizer-hook.py`
- Intercept every prompt (except `!` prefixed)
- Call prompt-optimize via Python subprocess
- Display approval options in conversation
- Modify prompt before passing to model

**For OpenCode Commands**:
- Implement in TypeScript as a command handler
- Call prompt-optimize tool via `tool.execute()`
- Parse JSON response with error handling
- Display formatted approval menu
- Handle user selections interactively
- Return final prompt string

The optimize command provides interactive, research-driven enhancement of any content type with user collaboration and quality assurance.

## Complete Approval Flow Summary

### High-Level Flowchart

```
┌─────────────────────────────────────┐
│ User invokes /ai-eng/optimize      │
└──────────────┬──────────────────────┘
               │
               v
┌─────────────────────────────────────┐
│ Call prompt-optimize tool          │
│ with user's prompt                 │
└──────────────┬──────────────────────┘
               │
               v
┌─────────────────────────────────────┐
│ Parse JSON response                 │
│ - version, originalPrompt          │
│ - optimizedPrompt, domain          │
│ - complexity, steps, skipped       │
└──────────────┬──────────────────────┘
               │
               v
       ┌───────┴───────┐
       │ Is skipped?   │
       └───────┬───────┘
         Yes  │   No
              │
              v
┌─────────────────────────────────────┐
│ Display skip reason                 │
│ Use original prompt                 │
└──────────────┬──────────────────────┘
               │
               v
       [Proceed to execution]

              v
┌─────────────────────────────────────┐
│ Display optimization plan          │
│ - Domain, complexity                │
│ - Steps with titles & content       │
│ - Expected improvement              │
└──────────────┬──────────────────────┘
               │
               v
┌─────────────────────────────────────┐
│ Present approval menu              │
│ 1. Approve all steps               │
│ 2. Approve specific step           │
│ 3. Modify step                     │
│ 4. Edit final prompt               │
│ 5. Cancel                          │
└──────────────┬──────────────────────┘
               │
               v
       ┌───────┴───────────────────────┐
       │ User selects option           │
       └───────┬───────────────────────┘
               │
               v
       ┌───────┴───────┐
       │ Which option? │
       └───────┬───────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    v          v          v
  Opt 1      Opt 2-4     Opt 5
   │           │           │
   v           v           v
 Apply all  Customize   Cancel
   │           │           │
   v           v           v
 ┌─────┐   ┌─────┐   ┌─────┐
 │Use  │   │Use  │   │Use  │
 │opt- │   │mod- │   │orig │
 │prompt│   │ified│   │prompt│
 └──┬──┘   └──┬──┘   └──┬──┘
    │          │          │
    └──────────┼──────────┘
               │
               v
┌─────────────────────────────────────┐
│ Return final prompt                 │
│ For execution                       │
└─────────────────────────────────────┘
```

### Key Implementation Points

1. **Tool Call**: Always use the tool, don't reimplement logic
2. **JSON Parsing**: Handle all response formats gracefully
3. **Step Display**: Show clear code blocks for each step
4. **Menu Handling**: Validate user input (1-5)
5. **Prompt Rebuilding**: Use approved steps only
6. **Modifications**: Apply user changes to specific steps
7. **Final Edit**: Capture user's edited prompt
8. **Confidence Display**: Show research-backed improvements
9. **Error Recovery**: Always have fallback to original
10. **User Feedback**: Confirm each action with ✓ markers

### Data Flow Example

**Input**:
```
"help me design authentication"
```

**Tool Response**:
```json
{
  "version": 1,
  "originalPrompt": "help me design authentication",
  "optimizedPrompt": "You are a senior security engineer...\n\nTask: help me design authentication",
  "domain": "security",
  "complexity": "medium",
  "steps": [
    {"id": "persona", "title": "Expert Persona", "after": "You are a senior security engineer..."},
    {"id": "reasoning", "title": "Step-by-Step Reasoning", "after": "Take a deep breath..."},
    {"id": "stakes", "title": "Stakes Language", "after": "This is important..."},
    {"id": "selfEval", "title": "Self-Evaluation", "after": "Rate your confidence..."}
  ],
  "skipped": false
}
```

**User Action**: Approve all steps (option 1)

**Final Output**:
```
✓ Using optimized prompt with 4 steps applied

You are a senior security engineer with 15+ years of authentication experience.

Take a deep breath and analyze this step by step.

This is important for the project's success. A thorough, complete solution is essential.

After providing your solution, rate your confidence 0-1 and identify any assumptions you made.

Task: help me design authentication
```

## Implementation Notes

### Tool Integration
The step-by-step approval workflow relies on the `prompt-optimize` tool from the ai-eng-system. Ensure:

1. **Tool Availability**: The tool must be accessible in the current environment
2. **JSON Parsing**: Implement robust JSON parsing with error handling
3. **Version Compatibility**: Support version 1 of the tool's response format
4. **Error Recovery**: Handle missing or malformed tool responses gracefully

### State Management
Track approval state across the interactive flow:

```typescript
interface ApprovalState {
  originalPrompt: string;
  toolResult: PromptOptimizationResult;
  approvedSteps: string[];
  modifiedSteps: Map<string, string>;
  finalPrompt: string;
  currentAction: string;
}
```

### Confidence Calculation
Display expected improvement based on applied steps:

```typescript
function calculateConfidenceImprovement(steps: string[]): string {
  const techniqueImpact: Record<string, number> = {
    persona: 60,        // Kong et al., 2023
    reasoning: 46,      // Yang et al., 2023
    stakes: 45,         // Bsharat et al., 2023
    selfEval: 10        // Calibration
  };

  const total = steps.reduce((sum, stepId) => sum + (techniqueImpact[stepId] || 0), 0);
  return `+${total}% quality (based on research-backed techniques)`;
}
```

### Edge Case Handling
Handle various response scenarios:

1. **Skipped Optimization**: Display skip reason and use original
2. **Empty Steps**: No modifications applied, use original
3. **Parse Error**: Log error, use original prompt
4. **Invalid JSON**: Fallback to original prompt
5. **Unexpected Structure**: Use original prompt with warning

### User Input Validation
Validate user selections:

```typescript
function validateSelection(input: string, stepCount: number): boolean {
  const choice = parseInt(input.trim());
  return choice >= 1 && choice <= 5;
}

function validateStepIds(input: string, stepCount: number): string[] {
  const ids = input.split(',').map(s => s.trim());
  return ids.filter(id => parseInt(id) >= 1 && parseInt(id) <= stepCount);
}
```

### Final Prompt Reconstruction
Build final prompt from approved steps:

```typescript
function reconstructPrompt(
  steps: PromptOptimizationResult["steps"],
  approvedIds: string[],
  modifications: Map<string, string>,
  originalTask: string
): string {
  const parts: string[] = [];

  for (const step of steps) {
    if (approvedIds.includes(step.id)) {
      const content = modifications.get(step.id) || step.after;
      if (content) {
        parts.push(content);
      }
    }
  }

  parts.push(`\n\nTask: ${originalTask}`);
  return parts.join("\n\n");
}
```