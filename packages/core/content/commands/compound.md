---
name: ai-eng/compound
description: Document a solved problem to compound team knowledge
agent: build
---

# Compound Command

Document a solved problem to build team knowledge over time.

 systematically document the solution, ensuring all critical details are captured in a format that will be useful for future team members.

## Why This Matters

Every solved problem should make future similar problems easier. Poor documentation or incomplete capture of solutions means the same problems will be solved repeatedly, wasting time and losing valuable insights. This documentation task is critical for building cumulative team knowledge and accelerating future problem-solving.

## The Challenge

The create documentation that is both comprehensive and concise - capturing all essential details without overwhelming future readers. The challenge is distilling complex problem-solving into clear, actionable guidance that balances thoroughness with readability. Success means someone encountering a similar problem can solve it quickly using your documentation.

## Process

1. **Gather context** about the problem and solution
2. **Create documentation** at `docs/solutions/[category]/[topic].md`
3. **Include:**
   - Problem description
   - Solution explanation
   - Code examples
   - Gotchas and edge cases
   - Related links
   - Date added
4. **Update docs index** to include the new solution

## Philosophy

Each solved problem should make future similar problems easier. This is compounding engineering - every unit of work improves the system for next time.

After documenting the solution, rate your confidence in its completeness and usefulness (0.0-1.0). Identify any assumptions you made, details that may be missing, or areas where future readers might need clarification. Note any edge cases or variations of the problem that weren't covered.
