import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E tests
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Timeout for each test
  timeout: 30 * 1000,
  
  // Test execution
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  
  // Reporter configuration
  reporter: 'html',
  
  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: process.env.TEST_BASE_URL || 'https://localhost:3001',
    
    // Ignore SSL certificate errors for localhost
    ignoreHTTPSErrors: true,
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    // Setup project - runs auth-setup.ts to create authentication state
    {
      name: 'setup',
      testMatch: /auth-setup\.ts/,
      // Longer timeout for auth setup (can take up to 15 minutes)
      timeout: 20 * 60 * 1000, // 20 minutes
      use: { 
        ...devices['Desktop Chrome'],
        // Must run in headed mode (not headless) so user can complete authentication
        headless: false,
      },
    },
    // Main test project - depends on setup and uses saved auth state
    {
      name: 'chromium',
      testMatch: /^(?!.*auth-setup\.ts$).*\.(spec|test)\.ts$/,
      use: { 
        ...devices['Desktop Chrome'],
        // Use saved authentication state (created by setup project)
        storageState: 'tests/.auth/user.json',
        // Run in headed mode so you can see what's happening
        headless: false,
      },
      dependencies: ['setup'],
    },
  ],

  // Run your local dev server before starting the tests
  // webServer: {
  //   command: 'npm run start',
  //   url: 'https://localhost:3001',
  //   reuseExistingServer: !process.env.CI,
  // },
});

