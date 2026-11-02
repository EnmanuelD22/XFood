import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  // The dev server compiles each route on first visit; give navigations room on a cold start.
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3100",
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: { command: "npm run dev -- --port 3100", url: "http://localhost:3100", reuseExistingServer: !process.env.CI },
});
