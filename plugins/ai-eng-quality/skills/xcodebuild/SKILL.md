---
name: xcodebuild
description: Build, test, and archive iOS/macOS apps with xcodebuild and Xcode CLI tools. Use for CI integration, scheme management, simulator control, and build troubleshooting.
metadata:
  category: user-invoked
disable-model-invocation: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Xcode Build Engineering

## Current Versions (Verify Before Use)

```bash
xcodebuild -version                 # Xcode version
xcrun simctl list devices           # Available simulators
xcrun --show-sdk-path               # SDK path
swift --version                     # Swift version
```

Check [Xcode release notes](https://developer.apple.com/documentation/xcode-release-notes) for the latest version.

## Core Principles

1. **Command-line first.** If you can't build from `xcodebuild`, your CI will break.
2. **Schemes are shared.** Every scheme used in CI must be marked "Shared" in Xcode.
3. **DerivedData is disposable.** Clean builds should succeed. Cache selectively.
4. **Simulators are ephemeral.** Don't depend on simulator state between runs.

## Build Commands

```bash
# Basic build
xcodebuild -workspace MyApp.xcworkspace -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 15' build

# Run tests
xcodebuild -workspace MyApp.xcworkspace -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 15' test

# Archive for distribution
xcodebuild -workspace MyApp.xcworkspace -scheme MyApp -configuration Release archive -archivePath build/MyApp.xcarchive

# Export IPA
xcodebuild -exportArchive -archivePath build/MyApp.xcarchive -exportPath build -exportOptionsPlist ExportOptions.plist
```

## CI Integration

```yaml
# .github/workflows/ios.yml
- uses: maxim-lobanov/setup-xcode@v1
  with:
    xcode-version: latest-stable
- run: xcodebuild -workspace MyApp.xcworkspace -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 15' test
```

## Common Anti-Patterns

| Anti-Pattern | Why It's Wrong | Fix |
|---|---|---|
| Non-shared scheme in CI | CI can't find the scheme | Check "Shared" in Manage Schemes |
| Hardcoded simulator name | Breaks when new Xcode drops old simulators | Use `xcrun simctl list` dynamically |
| Signing in CI without match | Manual provisioning is fragile | Use fastlane match or Xcode Cloud |
| Committing DerivedData | Bloated repo, conflicts | Add to `.gitignore` |
| No `-derivedDataPath` | Pollutes default location, cache issues | Explicit path in CI |

## Validation Checklist

- [ ] Build succeeds with clean DerivedData
- [ ] Tests pass on CI simulator
- [ ] All schemes used in CI are shared
- [ ] `-derivedDataPath` set explicitly in CI
- [ ] Code signing works in CI (manual or automatic)
- [ ] Archive + export tested before release

## Official Resources

- [xcodebuild man page](https://keith.github.io/xcode-man-pages/xcodebuild.html)
- [Xcode CLI docs](https://developer.apple.com/library/archive/technotes/tn2339/_index.html)
- [fastlane](https://docs.fastlane.tools/) for signing and distribution automation
