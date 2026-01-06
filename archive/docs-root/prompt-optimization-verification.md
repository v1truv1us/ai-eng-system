# Prompt Optimization System - Verification Guide

This guide helps verify that the automatic prompt optimization system is working correctly on both Claude Code and OpenCode.

---

## Quick Test

### Test 1: Simple Prompt (Should Skip Optimization)

**Prompt**: `hello`

**Expected Behavior**:
- Claude Code: No optimization shown, simple greeting response
- OpenCode: `🔓 Optimization skipped for simple prompt`

**Verification**:
```bash
# Test prompt
echo '{"prompt": "hello"}' | python3 .claude/hooks/prompt-optimizer-hook.py
```

### Test 2: Complex Prompt (Should Show Optimization)

**Prompt**: `help me fix the authentication bug`

**Expected Behavior**:
- Shows optimization techniques:
  - Expert Persona (security engineer)
  - Reasoning Chain (step-by-step)
  - Stakes Language (production critical)
  - Self-Evaluation (confidence rating)
- Domain detected: Security
- Complexity detected: Medium

**Verification**:
```bash
# Test with Claude Code hook
echo '{"prompt": "help me fix the authentication bug"}' | python3 .claude/hooks/prompt-optimizer-hook.py
```

### Test 3: Escape Hatch (Should Skip Optimization)

**Prompt**: `!just say hello`

**Expected Behavior**:
- No optimization shown
- Direct response to "just say hello"

**Verification**:
```bash
# Test escape hatch
echo '{"prompt": "!just say hello"}' | python3 .claude/hooks/prompt-optimizer-hook.py
```

---

## Platform-Specific Verification

### Claude Code

#### Check Hook Registration

```bash
cat .claude/hooks/hooks.json
```

**Expected Output**:
```json
{
  "hooks": {
    "SessionStart": [...],
    "UserPromptSubmit": [
      {
        "description": "Step-by-step prompt optimization",
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ${CLAUDE_PROJECT_DIR}/.claude/hooks/prompt-optimizer-hook.py",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

#### Check Hook Script

```bash
# Verify script is executable
ls -la .claude/hooks/prompt-optimizer-hook.py

# Should show: -rwxr-xr-x
```

**If not executable**:
```bash
chmod +x .claude/hooks/prompt-optimizer-hook.py
```

#### Test Hook Manually

```bash
# Test simple prompt
echo '{"prompt": "hello"}' | python3 .claude/hooks/prompt-optimizer-hook.py

# Test complex prompt
echo '{"prompt": "help me design a scalable architecture"}' | python3 .claude/hooks/prompt-optimizer-hook.py

# Test escape hatch
echo '{"prompt": "!bypass optimization"}' | python3 .claude/hooks/prompt-optimizer-hook.py
```

**Expected Output Format**:
```json
{
  "prompt": "<optimized or original prompt>",
  "context": "🔧 Optimized X techniques",
  "suppressOutput": false
}
```

### OpenCode

#### Check Tool File

```bash
# Verify tool exists
ls -la dist/.opencode/tool/prompt-optimize.ts

# After build, verify in dist/
ls -la dist/.opencode/tool/prompt-optimize.ts
```

#### Build and Test

```bash
# Build the project
bun run build

# Check if tool was copied
ls -la dist/.opencode/tool/prompt-optimize.ts
```

**Expected Tool Behavior**:
- Tool description mentions optimization techniques
- Returns optimized prompt when called
- Supports escape prefix (`!`)

---

## Configuration Verification

### Check Default Configuration

```bash
# Default config values
```

**Expected Values**:
- `enabled`: `true`
- `autoApprove`: `false`
- `verbosity`: `"normal"`
- `escapePrefix`: `"!"`
- `defaultTechniques`: `["analysis", "expert_persona", "reasoning_chain", "stakes_language", "self_evaluation"]`

### Test Custom Configuration

Create `ai-eng-config.json`:

```json
{
  "promptOptimization": {
    "enabled": true,
    "autoApprove": true,
    "verbosity": "verbose",
    "skipForSimplePrompts": true,
    "escapePrefix": "!"
  }
}
```

**Verification**:
- Config should be loaded automatically
- Settings should be used for all prompts
- Changes to config should take effect on next prompt

---

## Integration Tests

### Test 1: End-to-End Flow

**Steps**:
1. Start Claude Code or OpenCode
2. Send: `help me debug the auth system`
3. Observe the optimization steps
4. Either approve all or customize
5. Check final response quality

**Expected**:
- Step-by-step optimization shown
- Domain: Security
- Complexity: Medium
- Techniques applied: Expert Persona, Reasoning, Stakes, Self-Eval

### Test 2: Multiple Domains

**Prompts to test**:
```
help me fix the React component    # Frontend domain
optimize this SQL query             # Database domain
set up CI/CD pipeline             # DevOps domain
```

**Expected**:
- Each prompt shows appropriate domain
- Persona matches domain expertise
- All show optimization steps

### Test 3: Verbosity Levels

Test with configuration:

```bash
# Test quiet mode
# In ai-eng-config.json: "verbosity": "quiet"

# Test normal mode (default)
# In ai-eng-config.json: "verbosity": "normal"

# Test verbose mode
# In ai-eng-config.json: "verbosity": "verbose"
```

**Expected**:
- `quiet`: Minimal output, just optimized prompt
- `normal`: Condensed single box with all steps
- `verbose`: Step-by-step with approve/reject/modify

---

## Troubleshooting

### Issue: Hook Not Running

**Symptoms**: Prompts not being optimized in Claude Code

**Checklist**:
1. ✓ `.claude/hooks/hooks.json` exists
2. ✓ `UserPromptSubmit` hook is registered
3. ✓ `prompt-optimizer-hook.py` path is correct
4. ✓ Script is executable (`chmod +x`)
5. ✓ Python is available (`python3 --version`)

**Solutions**:
```bash
# Restart Claude Code after adding hook
# Check Claude Code logs for hook errors
# Test hook manually (see above)
```

### Issue: Optimization Not Applied

**Symptoms**: Optimization shown but prompt not actually enhanced

**Checklist**:
1. ✓ Hook returns valid JSON
2. ✓ `prompt` field is set in output
3. ✓ No errors in stderr
4. ✓ `suppressOutput` is `false` (not suppressing)

**Solutions**:
```bash
# Enable debug mode
# Add to ai-eng-config.json: "debug": true

# Check hook output manually
# Look for "prompt" field in JSON output
```

### Issue: Wrong Domain Detected

**Symptoms**: Security prompt gets frontend persona

**Checklist**:
1. ✓ Keywords are in `DOMAIN_KEYWORDS`
2. ✓ Case-insensitive matching works
3. ✓ Domain detection order is correct

**Solutions**:
- Add more keywords to domain lists
- Adjust detection priority
- Check for false positives in other domains

### Issue: Wrong Complexity

**Symptoms**: Simple greeting marked as complex

**Checklist**:
1. ✓ Word count thresholds are correct
2. ✓ Keyword detection adds appropriate score
3. ✓ Question marks reduce score

**Solutions**:
```python
# In .claude/hooks/prompt-optimizer-hook.py
# Adjust COMPLEXITY_KEYWORDS or scoring
# Adjust threshold values (5, 12, etc.)
```

---

## Success Criteria

### Basic Verification

- [ ] Escape hatch works (`!` prefix)
- [ ] Simple prompts skip optimization
- [ ] Complex prompts get optimization
- [ ] Domain detection is accurate
- [ ] Complexity detection is accurate

### Advanced Verification

- [ ] All techniques show correct research basis
- [ ] Personas match domain expertise
- [ ] Auto-approve toggle works
- [ ] Verbosity levels work correctly
- [ ] Preferences persist across sessions
- [ ] Configuration loading works

### Platform-Specific

**Claude Code**:
- [ ] Hook runs on every prompt
- [ ] Hook output is valid JSON
- [ ] Hook completes within timeout (30s)
- [ ] Session start notification shows

**OpenCode**:
- [ ] Tool is discoverable
- [ ] Tool can be called manually
- [ ] Tool description is helpful
- [ ] Tool returns optimized prompt

---

## Log Analysis

### Enable Debug Logging

For detailed troubleshooting, check the hook output:

```bash
# Run hook with verbose logging
echo '{"prompt": "test"}' | python3 -c "
import json, sys
import hook  # Your hook module
# Hook logic with print() calls for debugging
"
```

### Common Issues

**Issue**: "Module not found" errors

**Cause**: Python dependencies not installed

**Solution**:
```bash
# The hook uses only stdlib, so no external deps needed
# If you add deps, ensure they're in requirements.txt
```

**Issue**: "Permission denied" errors

**Cause**: Hook script not executable

**Solution**:
```bash
chmod +x .claude/hooks/prompt-optimizer-hook.py
```

---

## Performance Testing

### Latency Measurement

```bash
# Measure hook execution time
time echo '{"prompt": "test"}' | python3 .claude/hooks/prompt-optimizer-hook.py
```

**Expected**:
- Simple prompt: <50ms
- Complex prompt: <100ms
- Very long prompt: <200ms

### Memory Usage

```bash
# Check memory usage
/usr/bin/time -v echo '{"prompt": "test"}' | python3 .claude/hooks/prompt-optimizer-hook.py
```

**Expected**:
- Memory usage: <50MB
- No memory leaks on repeated calls

---

## Final Checklist

Before considering implementation complete:

- [ ] All core modules built (types, analyzer, techniques, optimizer, formatter)
- [ ] Claude Code hook registered and tested
- [ ] OpenCode tool built and testable
- [ ] Configuration system works
- [ ] Escape hatch verified
- [ ] Domain detection accurate for all domains
- [ ] Complexity detection accurate (simple/medium/complex)
- [ ] Verbosity modes work (quiet/normal/verbose)
- [ ] Preferences persist correctly
- [ ] Auto-approve toggle works
- [ ] Documentation is complete
- [ ] This verification guide is complete

---

## Getting Help

If you encounter issues not covered here:

1. Check hook/tool logs for errors
2. Test with minimal prompt first
3. Verify all file permissions
4. Check platform-specific documentation
5. Report bugs with detailed reproduction steps

**Good luck testing! 🧪**
