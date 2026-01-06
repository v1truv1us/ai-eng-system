# Ralph Wiggum Stuck Detection & Recovery

## Stuck Detection Signals

Monitor for these patterns during subagent execution:

1. **Repetitive Outputs**: Same or very similar responses in 3+ consecutive attempts
2. **No Progress**: Task completion metrics not improving after 5+ iterations
3. **Circular Reasoning**: Agent going back and forth between the same ideas
4. **Timeouts**: Repeated timeouts (2+ consecutive) on the same operation
5. **Error Cycling**: Same errors recurring without new approaches

## Stuck Recovery Strategies

When stuck is detected, apply these recovery strategies in order:

**Strategy 1: Re-Prompt with New Perspective** (for low-medium severity)
- Add: "You've been working on this for X iterations. Try a completely different approach."
- Add: "Step back and reconsider the problem from first principles."
- Add: "What would a senior engineer from [different company] do differently?"

**Strategy 2: Break Down Task** (for medium-high severity)
- Split task into smaller sub-tasks
- Process each sub-task independently
- Combine results after all sub-tasks complete

**Strategy 3: Timeout Adjustment** (for timeout issues)
- Increase timeout by 2x, then 4x (capped at 10 minutes)
- If still timing out, switch to Strategy 2

**Strategy 4: Alternative Agent** (for high-critical severity)
- Switch to a different agent with overlapping capabilities
- Example: @full-stack-developer → @backend-architect + @frontend-reviewer

**Strategy 5: Fallback to Manual Intervention** (for critical issues)
- Save checkpoint with stuck state
- Provide detailed stuck analysis
- Request human guidance
- Resume from checkpoint after intervention

## Implementation Details

For complete implementation details including TypeScript code examples, detection algorithms, and execution with retry logic, see the Ralph Wiggum command documentation.
