import * as fs from 'fs';
import * as path from 'path';
import { RunReport } from './types';

export function generateReport(reports: RunReport[]) {
  console.log('\n--- Chatbot Test Harness Results ---');
  console.log(
    'Scenario'.padEnd(35) + 
    '| Passed/Total | Avg Latency (ms) | Avg Tokens | Verdict'
  );
  console.log('-'.repeat(95));

  let allPassed = true;

  for (const report of reports) {
    const passedStr = `${report.passed}/${report.runs}`.padEnd(12);
    const latencyStr = `${Math.round(report.avgLatencyMs)}`.padEnd(16);
    const tokensStr = `${Math.round(report.avgTokens)}`.padEnd(10);
    const verdictColor = report.verdict === 'PASS' ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    
    console.log(`${report.scenarioName.padEnd(35)}| ${passedStr} | ${latencyStr} | ${tokensStr} | ${verdictColor}`);

    if (report.verdict === 'FAIL') {
      allPassed = false;
    }
  }

  // Write failed responses to JSON
  const failures = reports.filter(r => r.failedResponses.length > 0);
  if (failures.length > 0) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsDir = path.join(__dirname, '..', '..', 'test-results');
    
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const filePath = path.join(resultsDir, `${timestamp}.json`);
    fs.writeFileSync(filePath, JSON.stringify(failures, null, 2));
    console.log(`\nDetailed failure logs written to: ${filePath}`);
  }

  return allPassed;
}
