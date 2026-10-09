import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end-Tests mit axe (ROADMAP §9, §14): vier Projekte, mobil und Desktop, jeweils hell und dunkel.
 *
 * Voraussetzung: ein aktueller Production-Build. `bun run build` muss vorher laufen (CI baut vor den
 * E2E-Tests); der Webserver startet nur `next start`. Der Server läuft mit simuliertem Mailversand und
 * festen Dev-Geheimnissen (beides nur außerhalb von Vercel Production erlaubt, siehe lib/env.ts).
 */

const PORT = 3400;
const BASE_URL = `http://localhost:${PORT}`;
const CI = Boolean(process.env.CI);

const mobile = {
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
} as const;

const desktop = {
  viewport: { width: 1440, height: 900 },
  isMobile: false,
  hasTouch: false,
  deviceScaleFactor: 1,
} as const;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 7_500 },
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: BASE_URL,
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    // Deterministisch: keine Bewegung, Übergänge nur als kurze Überblendung (globals.css).
    contextOptions: { reducedMotion: 'reduce' },
    trace: CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'mobile-light', use: { ...devices['Desktop Chrome'], ...mobile, colorScheme: 'light' } },
    { name: 'mobile-dark', use: { ...devices['Desktop Chrome'], ...mobile, colorScheme: 'dark' } },
    { name: 'desktop-light', use: { ...devices['Desktop Chrome'], ...desktop, colorScheme: 'light' } },
    { name: 'desktop-dark', use: { ...devices['Desktop Chrome'], ...desktop, colorScheme: 'dark' } },
  ],
  webServer: {
    command: `bunx next start -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      EMAIL_SIMULATION: 'true',
      ALLOW_DEV_SECRETS: 'true',
      APP_URL: BASE_URL,
      NEXT_TELEMETRY_DISABLED: '1',
    },
  },
});
