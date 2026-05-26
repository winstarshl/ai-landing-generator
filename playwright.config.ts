import { defineConfig } from "@playwright/test";

/**
 * E2E runs against a production build. The Anthropic-backed API routes are
 * intercepted at the browser level (page.route), so no API key is needed and
 * runs are deterministic. The /p/[token] page is rendered by the real server.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 390, height: 844 }, // mobile-first
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { ANTHROPIC_API_KEY: "test-key-not-used-mocks-intercept" },
  },
});
