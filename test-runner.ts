#!/usr/bin/env bun

/**
 * Test runner for ferg-engineering-system
 * 
 * Provides comprehensive testing with different test suites and reporting.
 * Usage:
 *   bun run test:runner              # Run all tests
 *   bun run test:runner --unit       # Run unit tests only
 *   bun run test:runner --integration # Run integration tests only
 *   bun run test:runner --performance # Run performance tests only
 *   bun run test:runner --build      # Run build tests only
 *   bun run test:runner --watch      # Watch mode for development
 */

import { spawn } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const TEST_SUITES = {
  unit: {
    file: 'tests/unit.test.ts',
    description: 'Unit tests for individual functions and utilities',
    timeout: 30000
  },
  integration: {
    file: 'tests/integration.test.ts',
    description: 'Integration tests for end-to-end workflows',
    timeout: 120000
  },
  performance: {
    file: 'tests/performance.test.ts',
    description: 'Performance tests and benchmarks',
    timeout: 60000
  },
  build: {
    file: 'tests/build.test.ts',
    description: 'Build system functionality tests',
    timeout: 60000
  }
}

function runCommand(command: string, args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'pipe',
      shell: true
    })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      resolve({ stdout, stderr, code: code || 0 })
    })
  })
}

async function runTestSuite(suiteName: string, suite: any): Promise<boolean> {
  console.log(`\n🧪 Running ${suiteName} tests...`)
  console.log(`   ${suite.description}`)
  console.log(`   File: ${suite.file}`)
  console.log(`   Timeout: ${suite.timeout}ms`)
  
  const startTime = Date.now()
  
  try {
    const { stdout, stderr, code } = await runCommand('bun', ['test', suite.file])
    
    const duration = Date.now() - startTime
    
    if (code === 0) {
      console.log(`✅ ${suiteName} tests passed in ${duration}ms`)
      
      // Extract test count from output
      const match = stdout.match(/(\d+) pass/)
      if (match) {
        console.log(`   ${match[1]} tests passed`)
      }
      
      return true
    } else {
      console.log(`❌ ${suiteName} tests failed in ${duration}ms`)
      console.log('   Error output:')
      console.log('   ' + stderr.split('\n').join('\n   '))
      return false
    }
  } catch (error) {
    console.log(`💥 ${suiteName} tests crashed: ${error}`)
    return false
  }
}

async function generateTestReport(results: Record<string, boolean>): Promise<void> {
  const totalSuites = Object.keys(results).length
  const passedSuites = Object.values(results).filter(Boolean).length
  const failedSuites = totalSuites - passedSuites
  
  const report = `# Test Report

Generated: ${new Date().toISOString()}

## Summary

- Total Test Suites: ${totalSuites}
- Passed: ${passedSuites}
- Failed: ${failedSuites}
- Success Rate: ${((passedSuites / totalSuites) * 100).toFixed(1)}%

## Results

${Object.entries(results).map(([suite, passed]) => 
  `- ${suite}: ${passed ? '✅ PASSED' : '❌ FAILED'}`
).join('\n')}

## Next Steps

${failedSuites > 0 ? 
  '🔧 Fix failing tests before merging or releasing.' : 
  '🎉 All tests passed! Ready for deployment.'
}

---

*This report was generated automatically by the ferg-engineering-system test runner.*
`
  
  writeFileSync('test-report.md', report)
  console.log(`\n📄 Test report saved to test-report.md`)
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const watchMode = args.includes('--watch')
  const coverageMode = args.includes('--coverage')
  
  // Determine which suites to run
  let suitesToRun = Object.keys(TEST_SUITES)
  
  if (args.includes('--unit')) suitesToRun = ['unit']
  else if (args.includes('--integration')) suitesToRun = ['integration']
  else if (args.includes('--performance')) suitesToRun = ['performance']
  else if (args.includes('--build')) suitesToRun = ['build']
  
  console.log('🚀 Ferg Engineering System Test Runner')
  console.log(`Running ${suitesToRun.length} test suite(s)...\n`)
  
  if (watchMode) {
    console.log('👀 Watch mode enabled - tests will re-run on file changes')
    // In watch mode, just run bun test with appropriate args
    const testArgs = ['test', '--watch']
    if (coverageMode) testArgs.push('--coverage')
    if (suitesToRun.length < Object.keys(TEST_SUITES).length) {
      testArgs.push(...suitesToRun.map(suite => TEST_SUITES[suite as keyof typeof TEST_SUITES].file))
    }
    
    const { code } = await runCommand('bun', testArgs)
    process.exit(code)
  }
  
  // Run test suites
  const results: Record<string, boolean> = {}
  const startTime = Date.now()
  
  for (const suiteName of suitesToRun) {
    const suite = TEST_SUITES[suiteName as keyof typeof TEST_SUITES]
    if (!suite) {
      console.log(`⚠️  Unknown test suite: ${suiteName}`)
      continue
    }
    
    results[suiteName] = await runTestSuite(suiteName, suite)
  }
  
  const totalDuration = Date.now() - startTime
  
  // Generate summary
  const passedCount = Object.values(results).filter(Boolean).length
  const totalCount = Object.keys(results).length
  
  console.log(`\n📊 Test Summary`)
  console.log(`   Total Duration: ${totalDuration}ms`)
  console.log(`   Suites: ${passedCount}/${totalCount} passed`)
  
  if (passedCount === totalCount) {
    console.log('🎉 All test suites passed!')
  } else {
    console.log('❌ Some test suites failed.')
  }
  
  // Generate report
  await generateTestReport(results)
  
  // Exit with appropriate code
  process.exit(passedCount === totalCount ? 0 : 1)
}

// Check if we're being run directly
if (import.meta.main) {
  main().catch(console.error)
}