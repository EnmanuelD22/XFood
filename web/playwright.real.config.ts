import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/real",
  outputDir: "./test-results/real",
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: process.env.XFOOD_REAL_WEB_URL ?? "https://localhost:3003",
    ignoreHTTPSErrors: true, // Solo certificados locales/de CI; CD exige HTTPS válido.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
