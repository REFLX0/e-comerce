export interface ScenarioContext {
  testUserEmail: string;
  testOrderId: string;
  testOrderNumber: string;
}

export interface Scenario {
  name: string;
  messages: string[] | ((ctx: ScenarioContext) => string[] | Promise<string[]>);
  setup?: (ctx: ScenarioContext) => Promise<void>;
  assert: (response: any, ctx: ScenarioContext) => boolean;
  teardown?: (ctx: ScenarioContext) => Promise<void>;
}

export interface RunReport {
  scenarioName: string;
  runs: number;
  passed: number;
  avgLatencyMs: number;
  avgTokens: number;
  verdict: 'PASS' | 'FAIL';
  failedResponses: any[];
}
