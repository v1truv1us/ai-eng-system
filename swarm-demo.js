#!/usr/bin/env bun

/**
 * Swarm Usage Demo
 *
 * This script demonstrates how to use the ai-eng-system swarm functionality
 * to orchestrate multiple agents for complex tasks.
 */

import { createSwarmsClient } from './src/local-swarms-executor.js';

async function demoSwarmUsage() {
  console.log('🚀 AI Engineering System - Swarm Demo\n');

  // Create a local swarms client
  const swarms = createSwarmsClient({ mode: 'local' });

  try {
    // Check if swarms are available
    const health = await swarms.getHealth();
    console.log('✅ Swarm Health:', health.status);
    console.log('📊 Available Agents:', health.agents_available);
    console.log('🔄 Active Swarms:', health.active_swarms);

    if (health.status !== 'healthy') {
      console.log('❌ Swarms not available - Python/swarms not installed');
      console.log('💡 To enable swarms: pip install swarms');
      return;
    }

    // Get available agents
    const agents = await swarms.getAvailableAgents();
    console.log('\n🤖 Available Agents:');
    agents.forEach(agent => console.log(`  - ${agent}`));

    // Create a swarm for a complex task
    console.log('\n🏗️ Creating Swarm for "Design a user authentication system"...');

    const swarm = await swarms.createSwarm({
      name: 'AuthSystemDesign',
      description: 'Design a secure user authentication system',
      agents: ['architect-advisor', 'backend-architect', 'security-scanner'],
      swarm_type: 'SequentialWorkflow'
    });

    console.log('✅ Swarm Created:', swarm.id);

    // Run the task
    console.log('\n⚡ Running Task...');
    const result = await swarms.runTask(swarm.id, 'Design a secure user authentication system with JWT tokens, password hashing, and rate limiting');

    console.log('\n📋 Task Result:');
    console.log('Status:', result.status);
    console.log('Execution Time:', result.execution_time + 'ms');
    console.log('Agent Used:', result.agent_used);
    console.log('\n📄 Output:');
    console.log(result.output);

    // Clean up
    await swarms.deleteSwarm(swarm.id);
    console.log('\n🧹 Swarm cleaned up');

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.message.includes('Python') || error.message.includes('swarms')) {
      console.log('\n💡 To fix this error:');
      console.log('1. Install Python 3.8+');
      console.log('2. pip install swarms');
      console.log('3. Make sure swarms is in your PATH');
    }
  }
}

// Run the demo
demoSwarmUsage().catch(console.error);