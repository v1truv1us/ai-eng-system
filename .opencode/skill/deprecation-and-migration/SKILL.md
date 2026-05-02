---
name: deprecation-and-migration
description: Code-as-liability mindset, compulsory vs advisory deprecation, migration patterns, zombie code removal. Use when removing old systems, migrating users, or sunsetting features.
---

# Deprecation and Migration

## Overview

Treat code as a liability that must justify its existence. Deprecate deliberately, migrate incrementally, and remove dead code systematically. Every line of code you remove is a line you never have to maintain again.

## When to Use

- Removing old APIs or features
- Migrating users from one system to another
- Cleaning up unused code
- Replacing deprecated dependencies

## Deprecation Types

### Advisory Deprecation

- Mark as deprecated in documentation and type annotations
- Log warnings when the deprecated path is used
- Provide a clear migration path
- Set a timeline for removal

### Compulsory Deprecation

- Add runtime warnings that cannot be silenced
- Set a hard removal date
- Communicate the timeline to all affected teams
- Provide automated migration tools if possible

## Migration Patterns

### Strangler Fig

Build the new system alongside the old:
1. Route new traffic to the new system
2. Migrate existing traffic incrementally
3. Remove the old system once all traffic has migrated

### Parallel Run

Run both systems simultaneously:
1. Send traffic to both systems
2. Compare outputs for consistency
3. Switch over once confidence is established
4. Remove the old system

### Feature Flag Cutover

Use feature flags to control migration:
1. Deploy the new system behind a flag
2. Enable for internal users first
3. Enable for a percentage of external users
4. Enable for all users
5. Remove the flag and old code

## Zombie Code Removal

Identify and remove code that is no longer used:
- Search for unreachable exports
- Check for unreferenced files
- Look for dependencies that are imported but never called
- Remove with confidence when tests cover the remaining paths

## Process

### Step 1: Identify What to Deprecate

- Audit usage of the old system
- Identify all dependents
- Assess migration complexity

### Step 2: Communicate the Plan

- Document the deprecation timeline
- Provide migration guides
- Announce through appropriate channels

### Step 3: Implement Migration Path

- Add deprecation warnings
- Provide migration tools or scripts
- Update documentation

### Step 4: Remove the Old System

- Verify all consumers have migrated
- Remove the deprecated code
- Clean up related configuration and documentation

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Old code does not hurt anything" | Dead code increases cognitive load, maintenance burden, and binary size. |
| "Someone might be using this" | Usage audits and deprecation windows address this. Ship it or remove it. |
| "Migration is too disruptive" | Gradual migration patterns minimize disruption. Sudden breakage maximizes it. |

## Verification

- [ ] Deprecation timeline is documented and communicated
- [ ] Migration path is clear and tested
- [ ] All consumers have migrated before removal
- [ ] Old code, configuration, and documentation are removed

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "Old code doesn't hurt anything" | Dead code increases cognitive load, maintenance burden, and binary size. |
| "Someone might be using this" | Usage audits and deprecation windows address this. Ship it or remove it. |
| "Migration is too disruptive" | Gradual migration patterns minimize disruption. Sudden breakage maximizes it. |
| "I'll deprecate it but never remove it" | Deprecation without removal is just documentation. The goal is removal. |
| "The migration tool is too much work" | Manual migration is slower and more error-prone. Automate where possible. |
