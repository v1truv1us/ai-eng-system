#!/usr/bin/env node
/**
 * Test script to simulate OpenCode plugin loading
 */

import { AiEngSystem } from './dist/index.js'
import fs from 'fs'
import path from 'path'

console.log('Testing ai-eng-system plugin loading...\n')

// Simulate what OpenCode does when loading a plugin
const mockContext = {
    directory: '/tmp/test-opencode-project',
    client: null,
    project: null,
    $: null
}

// Load the plugin
await AiEngSystem(mockContext).then(result => {
    console.log('Plugin loaded:', JSON.stringify(result, null, 2))
    console.log('\nChecking installation...')

    const targetDir = '/tmp/test-opencode-project/.opencode'

    if (fs.existsSync(path.join(targetDir, 'command', 'ai-eng'))) {
        const commands = fs.readdirSync(path.join(targetDir, 'command', 'ai-eng'))
        console.log(`✅ Commands installed: ${commands.length} files`)
        console.log(`   Files: ${commands.slice(0, 5).join(', ')}${commands.length > 5 ? '...' : ''}`)
    } else {
        console.log('❌ Commands not found')
    }

    if (fs.existsSync(path.join(targetDir, 'agent', 'ai-eng'))) {
        function countFiles(dir) {
            let count = 0
            const entries = fs.readdirSync(dir)
            for (const entry of entries) {
                const fullPath = path.join(dir, entry)
                const stat = fs.statSync(fullPath)
                if (stat.isDirectory()) {
                    count += countFiles(fullPath)
                } else if (entry.endsWith('.md')) {
                    count++
                }
            }
            return count
        }
        const agentCount = countFiles(path.join(targetDir, 'agent', 'ai-eng'))
        console.log(`✅ Agents installed: ${agentCount} files`)
    } else {
        console.log('❌ Agents not found')
    }

    if (fs.existsSync(path.join(targetDir, 'skills'))) {
        function countFiles(dir) {
            let count = 0
            const entries = fs.readdirSync(dir)
            for (const entry of entries) {
                const fullPath = path.join(dir, entry)
                const stat = fs.statSync(fullPath)
                if (stat.isDirectory()) {
                    count += countFiles(fullPath)
                } else {
                    count++
                }
            }
            return count
        }
        const skillCount = countFiles(path.join(targetDir, 'skills'))
        console.log(`✅ Skills installed: ${skillCount} files`)
    } else {
        console.log('❌ Skills not found')
    }

    console.log('\nInstallation test complete!')
}).catch(err => {
    console.error('Error loading plugin:', err)
    process.exit(1)
})
