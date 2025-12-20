#!/usr/bin/env bun

/**
 * Swarm Usage Demo - Mock Mode
 *
 * Demonstrates swarm functionality with mock responses when Python/swarms is not available
 */

import { createSwarmsClient } from './src/local-swarms-executor.js';

async function demoSwarmMock() {
  console.log('🚀 AI Engineering System - Swarm Demo (Mock Mode)\n');

  // Create a local swarms client
  const swarms = createSwarmsClient({ mode: 'local' });

  try {
    // Get available agents (this works without Python)
    const agents = await swarms.getAvailableAgents();
    console.log('🤖 Available Agents:');
    agents.slice(0, 10).forEach(agent => console.log(`  - ${agent}`));
    console.log(`  ... and ${agents.length - 10} more\n`);

    // Create a swarm for a complex task
    console.log('🏗️ Creating Swarm for "Design a user authentication system"...');

    const swarm = await swarms.createSwarm({
      name: 'AuthSystemDesign',
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
    console.log('  Created:', swarm.created_at);

    // Run the task (will use mock response since swarms not installed)
    console.log('\n⚡ Running Task...');
    console.log('Task: "Design a secure user authentication system with JWT tokens, password hashing, and rate limiting"');

    const result = await swarms.runTask(swarm.id, 'Design a secure user authentication system with JWT tokens, password hashing, and rate limiting');

    console.log('\n📋 Task Result:');
    console.log('Status:', result.status);
    console.log('Execution Time:', result.execution_time + 'ms');
    console.log('Agent Used:', result.agent_used);
    console.log('\n📄 Output:');
    console.log(result.output);

    // Show how to use swarms in commands
    console.log('\n🔧 How to Use Swarms in Commands:');
    console.log('1. Commands can create swarms automatically');
    console.log('2. Agents collaborate on complex tasks');
    console.log('3. Results are synthesized from multiple perspectives');
    console.log('4. Tasks are broken down and orchestrated');

    // Clean up
    await swarms.deleteSwarm(swarm.id);
    console.log('\n🧹 Swarm cleaned up');

    console.log('\n💡 To enable real swarm execution:');
    console.log('1. Install Python 3.8+');
    console.log('2. pip install swarms');
    console.log('3. The system will automatically use real swarm intelligence');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the demo
demoSwarmMock().catch(console.error);