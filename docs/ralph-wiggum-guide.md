# Ralph Wiggum Best Practices & Troubleshooting

## Best Practices

### For Effective Builds

1. **Clear Feature Descriptions**: Provide specific, actionable feature requirements
2. **Start Small**: Use for well-defined features with clear acceptance criteria
3. **Use Checkpoints**: Enable `--checkpoint` for complex features to review progress
4. **Monitor Tokens**: Watch token usage to manage API costs
5. **Set Appropriate Limits**: Adjust `--max-cycles` and `--max-phase-iterations` based on complexity

### When to Use

**Ideal Scenarios**:
- Well-defined features with clear success criteria
- Greenfield implementations (no complex legacy integration)
- Overnight/weekend automation runs
- TDD-driven features with comprehensive tests

**When NOT to Use**:
- Features requiring human design decisions
- Ambiguous requirements without clear acceptance criteria
- Critical production systems (use manual control)
- Complex architectural migrations (use multi-phase approach)

## Troubleshooting

### "Subagent stuck in loop"

**Symptoms**: Same subagent producing repetitive outputs or no progress

**Actions**:
1. Check subagent history in checkpoint (`subagent_history` array)
2. Review stuck_recovery_log for attempted strategies
3. Increase `--stuck-threshold` if too aggressive (default: 5)
4. Increase `--max-retries` to allow more recovery attempts (default: 3)
5. Enable `--verbose` to see stuck detection messages
6. If auto-recovery is failing, set `--auto-recover=false` and intervene manually
7. Use `--partial-results=true` to accept incomplete work when stuck

### "Build stuck in loop"

**Symptoms**: Same phase repeating without progress

**Actions**:
1. Check stuck detection alert (should trigger after 3 cycles)
2. Review gap analysis logs
3. Check subagent_history for stuck patterns
4. Use `--checkpoint=all` to inspect state
5. Consider adjusting `--max-phase-iterations`
6. Abort and manually review artifacts

### "Subagent timing out repeatedly"

**Symptoms**: Multiple consecutive timeouts for same subagent

**Actions**:
1. Increase `--subagent-timeout` (default: 30s, try 60s or 120s)
2. Increase `--timeout-multiplier` for retries (default: 2x)
3. Break task into smaller pieces to reduce individual timeout risk
4. Check if OpenCode is responsive
5. Reduce parallelism if multiple agents are competing for resources

### "Token usage too high"

**Symptoms**: Excessive API costs

**Actions**:
1. Reduce `--max-cycles`
2. Reduce `--max-phase-iterations`
3. Reduce `--max-retries` (default: 3)
4. Use `--verbose` to identify expensive phases
5. Consider starting from existing artifacts (`--from-spec`, etc.)
6. Check subagent_history for agents making excessive iterations
7. Set aggressive stuck thresholds to fail fast on stuck agents

### "Quality gates failing"

**Symptoms**: Build can't pass quality gates

**Actions**:
1. Check quality gate command output
2. Use verbose mode to see specific failures
3. Review work phase implementation
4. Adjust quality gate if appropriate
5. Check if quality gates are timing out (increase timeout)
6. Run quality gates individually to isolate the failing gate

### "Resume fails"

**Symptoms**: Can't resume from checkpoint

**Actions**:
1. Verify checkpoint file exists
2. Check branch matches checkpoint.branch
3. Review checkpoint.json for corruption
4. Check subagent_history for incomplete executions
5. Start fresh build if checkpoint is corrupted
