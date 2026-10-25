import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1,
  timeout: 30000, expect: { timeout: 6000 },
  outputDir: 'test-results', reporter: [['list'], ['json', { outputFile: 'artifacts/e2e-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:4173', headless: true, channel: 'chrome', viewport: { width: 1440, height: 1000 }, locale: 'es-EC', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run dev -- --host=127.0.0.1 --port=4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI, timeout: 30000 },
});
