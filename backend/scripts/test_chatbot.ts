import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ChatService, ChatMessage } from '../src/chat/chat.service';
import { createFixtures, teardownFixtures } from './test-harness/fixtures';
import { generateReport } from './test-harness/report';
import { RunReport, Scenario, ScenarioContext } from './test-harness/types';

import { boundaryScenarios } from './test-harness/scenarios/boundary';
import { identityScenarios } from './test-harness/scenarios/identity';
import { toolSearchScenarios } from './test-harness/scenarios/tool-search';
import { toolCartScenarios } from './test-harness/scenarios/tool-cart';
import { orderTrackingScenarios } from './test-harness/scenarios/order-tracking';
import { adversarialScenarios } from './test-harness/scenarios/adversarial';

const RUNS_PER_SCENARIO = 3;

async function bootstrap() {
  console.log('Bootstrapping Nest context...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const chatService = app.get(ChatService);
  
  console.log('Creating DB fixtures...');
  const ctx = await createFixtures();

  const allScenarios: Scenario[] = [
    ...boundaryScenarios,
    ...identityScenarios,
    ...toolSearchScenarios,
    ...toolCartScenarios,
    ...orderTrackingScenarios,
    ...adversarialScenarios,
  ];

  const reports: RunReport[] = [];

  console.log(`Starting execution of ${allScenarios.length} scenarios (${RUNS_PER_SCENARIO} runs each)`);

  for (const scenario of allScenarios) {
    if (scenario.setup) await scenario.setup(ctx);

    let passedCount = 0;
    let totalLatency = 0;
    const failedResponses: any[] = [];

    const messagesContent = typeof scenario.messages === 'function'
      ? await scenario.messages(ctx)
      : scenario.messages;

    for (let i = 0; i < RUNS_PER_SCENARIO; i++) {
      const messages: ChatMessage[] = messagesContent.map(content => ({ role: 'user', content }));
      
      const start = Date.now();
      try {
        const response = await chatService.chat(messages, ctx.testUserEmail);
        const latency = Date.now() - start;
        totalLatency += latency;

        const passed = scenario.assert(response, ctx);
        if (passed) {
          passedCount++;
        } else {
          failedResponses.push({ run: i + 1, request: messagesContent, response });
        }
      } catch (err: any) {
        const latency = Date.now() - start;
        totalLatency += latency;
        failedResponses.push({ run: i + 1, request: messagesContent, error: err?.message || String(err) });
      }
    }

    if (scenario.teardown) await scenario.teardown(ctx);

    const verdict = (passedCount / RUNS_PER_SCENARIO) >= (2/3) ? 'PASS' : 'FAIL';
    
    reports.push({
      scenarioName: scenario.name,
      runs: RUNS_PER_SCENARIO,
      passed: passedCount,
      avgLatencyMs: totalLatency / RUNS_PER_SCENARIO,
      avgTokens: 0, // Hard to measure unless OpenRouter sends token count in the internal chatService structure.
      verdict,
      failedResponses
    });
    
    process.stdout.write('.'); // progress indicator
  }

  console.log('\nCleaning up fixtures...');
  await teardownFixtures(ctx);
  
  await app.close();

  const success = generateReport(reports);
  process.exit(success ? 0 : 1);
}

bootstrap().catch(err => {
  console.error('Fatal error during test harness execution:', err);
  process.exit(1);
});
