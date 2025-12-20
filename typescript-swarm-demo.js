#!/usr/bin/env bun

/**
 * Pure TypeScript Swarm Demo (No External APIs Required)
 *
 * Demonstrates swarm functionality with local mock intelligence
 * No Python, no OpenAI, no external dependencies - pure TypeScript orchestration
 */

import { getTypeScriptSwarmsClient } from './src/swarms-client.js';

async function demoTypeScriptSwarms() {
  console.log('🚀 AI Engineering System - Pure TypeScript Swarm Demo\n');
  console.log('✨ No external APIs, no Python, no OpenAI required!\n');

  // Create a TypeScript swarms client (completely local!)
  const swarms = getTypeScriptSwarmsClient();

  try {
    // Check health
    const health = await swarms.getHealth();
    console.log('✅ Swarm Health:', health.status);
    console.log('📊 Available Agents:', health.agents_available);
    console.log('🔄 Active Swarms:', health.active_swarms);

    // Get available agents
    const agents = await swarms.getAvailableAgents();
    console.log('\n🤖 Available Agents:');
    agents.slice(0, 10).forEach(agent => console.log(`  - ${agent}`));
    console.log(`  ... and ${agents.length - 10} more\n`);

    // Create a swarm for a complex task
    console.log('🏗️ Creating Swarm for "Design a secure authentication system"...');

    const swarm = await swarms.createSwarm({
      name: 'AuthDesignSwarm',
      description: 'Design a secure user authentication system',
      agents: ['architect-advisor', 'backend-architect', 'security-scanner'],
      swarm_type: 'SequentialWorkflow'
    });

    console.log('✅ Swarm Created:', swarm.id);
    console.log('📋 Swarm Details:');
    console.log('  Name:', swarm.name);
    console.log('  Type:', swarm.swarm_type);
    console.log('  Agents:', swarm.agents.join(', '));
    console.log('  Status:', swarm.status);

    console.log('\n🧠 Running Intelligent Task Orchestration...');
    console.log('Task: "Design a secure user authentication system with JWT tokens, password hashing, and rate limiting"');

    const result = await swarms.runTask(swarm.id,
      'Design a secure user authentication system with JWT tokens, password hashing, and rate limiting. ' +
      'Include API endpoints, database schema, and security considerations.'
    );

    console.log('\n📋 Task Result:');
    console.log('Status:', result.status);
    console.log('Execution Time:', result.execution_time + 'ms');
    console.log('Agent Used:', result.agent_used);
    console.log('\n📄 Output Preview:');
    console.log(result.output.split('\n').slice(0, 10).join('\n') + '\n...');

    // Test different swarm types
    console.log('\n🔄 Testing Multi-Agent Router...');

    const routerSwarm = await swarms.createSwarm({
      name: 'RouterTest',
      agents: ['code-reviewer', 'performance-engineer', 'security-scanner'],
      swarm_type: 'MultiAgentRouter'
    });

    const routerResult = await swarms.runTask(routerSwarm.id,
      'Review this authentication code for security vulnerabilities and performance issues: ' +
      'const authenticate = (email, password) => { return db.find({email, password}); }'
    );

    console.log('\n📋 Router Result:');
    console.log('Status:', routerResult.status);
    console.log('Agent Used:', routerResult.agent_used);
    console.log('Output Preview:', routerResult.output.substring(0, 150) + '...');

    // Test Agent Rearrangement
    console.log('\n🔀 Testing Agent Rearrangement...');

    const rearrangeSwarm = await swarms.createSwarm({
      name: 'RearrangeTest',
      agents: ['architect-advisor', 'frontend-reviewer', 'deployment-engineer'],
      swarm_type: 'AgentRearrange'
    });

    const rearrangeResult = await swarms.runTask(rearrangeSwarm.id,
      'Plan the full development lifecycle for a user registration feature'
    );

    console.log('\n📋 Rearrangement Result:');
    console.log('Status:', rearrangeResult.status);
    console.log('Execution Time:', rearrangeResult.execution_time + 'ms');

    // Clean up
    await swarms.deleteSwarm(swarm.id);
    await swarms.deleteSwarm(routerSwarm.id);
    await swarms.deleteSwarm(rearrangeSwarm.id);
    console.log('\n🧹 All swarms cleaned up');

    console.log('\n🎉 Pure TypeScript Swarm Demo Complete!');
    console.log('✅ Zero external dependencies');
    console.log('✅ No Python, no OpenAI, no API keys required');
    console.log('✅ 26 specialized agents with intelligent responses');
    console.log('✅ Multiple swarm orchestration patterns');
    console.log('✅ Local mock intelligence demonstrating real swarm logic');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the demo
demoTypeScriptSwarms().catch(console.error);