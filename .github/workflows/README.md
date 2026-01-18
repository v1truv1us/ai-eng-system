# OIDC Publishing Workflows

This directory contains the fresh OIDC publishing workflows that bypass GitHub Actions caching to ensure proper provenance for the ai-eng-system monorepo.

## 🚀 New OIDC Workflows

### 1. `publish-core-oidc.yml`
- **Purpose**: Publish the core package with OIDC provenance
- **Trigger**: `core-v*` tags or manual dispatch
- **Features**:
  - OIDC trusted publishing with cryptographic provenance
  - Comprehensive validation and testing
  - Automated GitHub release creation
  - Package verification after publish

### 2. `publish-cli-oidc.yml`
- **Purpose**: Publish the CLI package with OIDC provenance
- **Trigger**: `cli-v*` tags or manual dispatch
- **Features**:
  - OIDC trusted publishing
  - CLI binary validation
  - Cross-platform compatibility checks
  - Automated GitHub release with installation instructions

### 3. `publish-all-oidc.yml`
- **Purpose**: Publish all packages together with coordinated versioning
- **Trigger**: `v*` tags or manual dispatch
- **Features**:
  - Matrix strategy for parallel publishing
  - Selective package publishing
  - Unified GitHub release for all packages
  - Coordinated version management

### 4. `test-oidc-publishing.yml`
- **Purpose**: Test OIDC publishing configuration without actually publishing
- **Trigger**: Manual dispatch or pull request changes
- **Features**:
  - Dry-run publishing validation
  - OIDC permission testing
  - Package structure validation
  - Workflow syntax validation

## 🔐 OIDC Configuration

### Permissions
```yaml
permissions:
  contents: read
  id-token: write  # Required for OIDC trusted publishing
```

### Environment Variables
```bash
NPM_CONFIG_PROVENANCE=true  # Enable provenance
NPM_CONFIG_AUDIT=false     # Disable audit during CI
NPM_CONFIG_FUND=false       # Disable fund messages
```

### NPM Registry Configuration
```bash
@ai-eng-system:registry=https://registry.npmjs.org/
registry=https://registry.npmjs.org/
```

## 📦 Package Structure

### Core Package (`@ai-eng-system/core`)
- **Location**: `packages/core/`
- **Current Version**: 0.4.5
- **Files**: dist/, content/, skills/, README.md, LICENSE

### CLI Package (`@ai-eng-system/cli`)
- **Location**: `packages/cli/`
- **Current Version**: 0.4.4
- **Binary**: `ai-eng`
- **Dependencies**: @ai-eng-system/core

## 🏷️ Tag Patterns

### Individual Package Tags
- Core: `core-v0.4.6` → Publishes only core package
- CLI: `cli-v0.5.1` → Publishes only CLI package

### Full Release Tags
- Combined: `v0.5.0` → Publishes all packages with same version

## 🛡️ Security Features

### OIDC Provenance
- ✅ Cryptographic signatures for each publish
- ✅ GitHub repository verification
- ✅ Tamper-evident publishing
- ✅ Zero-trust security model

### Package Validation
- ✅ Version format validation
- ✅ Package integrity checks
- ✅ Build artifact verification
- ✅ NPM registry authentication

### Workflow Security
- ✅ Minimal permissions principle
- ✅ Environment-based protection
- ✅ Automated rollback capabilities
- ✅ Audit trail maintenance

## 🧪 Testing OIDC Publishing

### Manual Testing
```bash
# Test core package publishing (dry-run)
gh workflow run test-oidc-publishing.yml -f dry_run=true -f package=core

# Test CLI package publishing (dry-run)
gh workflow run test-oidc-publishing.yml -f dry_run=true -f package=cli

# Test all packages (dry-run)
gh workflow run test-oidc-publishing.yml -f dry_run=true -f package=all
```

### Production Publishing
```bash
# Publish core package
gh workflow run publish-core-oidc.yml -f version=0.5.0 -f dry_run=false

# Publish CLI package
gh workflow run publish-cli-oidc.yml -f version=0.5.0 -f dry_run=false

# Publish all packages
gh workflow run publish-all-oidc.yml -f version=0.5.0 -f packages=core,cli -f dry_run=false
```

### Tag-Based Publishing
```bash
# Tag for core package
git tag core-v0.5.0
git push origin core-v0.5.0

# Tag for CLI package
git tag cli-v0.5.0
git push origin cli-v0.5.0

# Tag for full release
git tag v0.5.0
git push origin v0.5.0
```

## 🔍 Verification

### Provenance Verification
```bash
# Check package provenance
npm view @ai-eng-system/core@0.5.0 --json | jq '.dist'
npm view @ai-eng-system/cli@0.5.0 --json | jq '.dist'
```

### GitHub Release Verification
- Check the "Provenance" section in GitHub releases
- Verify cryptographic signatures
- Confirm workflow linkage

### NPM Registry Verification
- Visit https://www.npmjs.com/package/@ai-eng-system/core
- Look for provenance badge
- Check package metadata

## 📋 Troubleshooting

### Common Issues

#### 1. OIDC Token Not Generated
**Symptoms**: `id-token: write` permission error
**Solution**: 
- Verify permissions in workflow
- Check GitHub organization settings
- Ensure OIDC is enabled

#### 2. Package Verification Failed
**Symptoms**: Package not found after publish
**Solution**:
- Wait for NPM propagation (up to 5 minutes)
- Check package name and version
- Verify NPM registry configuration

#### 3. Provenance Missing
**Symptoms**: No provenance in package metadata
**Solution**:
- Ensure `--provenance` flag is used
- Verify `NPM_CONFIG_PROVENANCE=true`
- Check trusted publisher configuration

### Debug Commands
```bash
# Check workflow permissions
gh api repos/:owner/:repo/actions/permissions/workflow

# Verify OIDC token
gh api --method POST /repos/:owner/:repo/actions/runners/:run_id/token

# Debug npm configuration
npm config list
```

## 🔄 Migration from Old Workflows

### What Changed
1. **Fresh workflow names** to bypass GitHub Actions cache
2. **Enhanced OIDC configuration** with provenance
3. **Comprehensive validation** and testing
4. **Unified release management** across packages
5. **Improved error handling** and reporting

### Migration Steps
1. ✅ Create new OIDC workflows
2. ✅ Test with dry-run mode
3. ✅ Verify trusted publisher configuration
4. ✅ Update documentation
5. 🔄 Transition to new workflows
6. ⏳ Remove old workflows after validation

## 📚 Resources

- [NPM OIDC Documentation](https://docs.npmjs.com/guides/publishing-with-an-oidc-token)
- [GitHub OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Provenance Verification](https://docs.npmjs.com/cli/v9/commands/npm-view)

## 🚨 Important Notes

1. **Cache Bypass**: New workflow names ensure no GitHub Actions caching issues
2. **Provenance Required**: All packages now require OIDC provenance
3. **Security First**: Minimal permissions and zero-trust publishing model
4. **Automated Testing**: Comprehensive validation before every publish
5. **Rollback Ready**: Automated rollback capabilities for failed publishes

## 📞 Support

If you encounter issues with OIDC publishing:

1. Check the workflow logs for detailed error messages
2. Run the test workflow to validate configuration
3. Verify NPM trusted publisher settings
4. Ensure GitHub repository permissions are correct

For immediate assistance, create an issue in the repository with:
- Workflow run ID
- Error messages
- Steps taken
- Expected vs actual behavior