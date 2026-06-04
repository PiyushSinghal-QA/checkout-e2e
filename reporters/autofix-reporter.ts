import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

/**
 * Pushes this run's results to the AutoFix agent so it can analyse + triage them.
 * Fire-and-forget: if the agent isn't running, the suite still passes normally.
 *
 * Configure the target with AUTOFIX_URL (default http://localhost:4000/webhooks/e2e).
 */
export default class AutofixReporter implements Reporter {
  private failures = new Set<string>();
  private passed = 0;
  private failed = 0;

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === 'passed') this.passed += 1;
    else if (result.status === 'failed' || result.status === 'timedOut') {
      this.failed += 1;
      this.failures.add(test.title);
    }
  }

  async onEnd(): Promise<void> {
    const url = process.env.AUTOFIX_URL || 'http://localhost:4000/webhooks/e2e';
    const payload = {
      repository: 'checkout-service',
      suite: 'checkout-e2e',
      failures: [...this.failures],
      stats: { passed: this.passed, failed: this.failed, total: this.passed + this.failed },
    };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log(`\n[autofix] pushed ${payload.failures.length} failure(s) to ${url} → HTTP ${res.status}`);
    } catch (e) {
      console.log(`\n[autofix] AutoFix agent not reachable at ${url} — push skipped (${(e as Error).message})`);
    }
  }
}
