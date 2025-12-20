import { test as setup } from '@playwright/test';
import * as fs from 'fs';

/**
 * Authentication setup for E2E tests
 * 
 * This script opens a browser and waits for you to manually complete SSO authentication.
 * SSO may open popup windows for authentication and MFA - complete all steps in any windows that open.
 * Once authenticated, it saves the session state for reuse in tests.
 * 
 * Run this once with: npm run test:e2e:auth-setup
 */
setup('🔐 authenticate and save session', async ({ page, context }) => {
  const APP_URL = process.env.TEST_APP_URL || '/experience/0';
  const baseURL = process.env.TEST_BASE_URL || 'https://localhost:3001';
  const authPath = 'tests/.auth/user.json';

  // --- SMART SKIP: Check if existing session is still valid ---
  if (fs.existsSync(authPath)) {
    console.log('🔍 Existing authentication file found. Checking validity...');
    
    // Create a temporary context with the existing state to probe the app
    const probeContext = await context.browser().newContext({ 
      storageState: authPath,
      ignoreHTTPSErrors: true 
    });
    const probePage = await probeContext.newPage();
    
    try {
      await probePage.goto(baseURL + APP_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await probePage.waitForTimeout(3000); 
      
      const currentUrl = probePage.url();
      const isLoginPage = /sign.*in|login|oauth|saml|microsoft|okta|auth|sso/i.test(currentUrl);
      const buttons = await probePage.locator('button').count();
      const isAppLoaded = !isLoginPage && (buttons > 5 || /experience/.test(currentUrl));

      if (isAppLoaded) {
        console.log('✅ Session is still valid! Skipping manual authentication setup.');
        await probeContext.close();
        return; 
      }
      console.log('❌ Session expired or invalid. Proceeding with fresh authentication.');
    } catch (e) {
      console.log('⚠️ Probe failed or timed out, proceeding with fresh authentication.');
    } finally {
      await probeContext.close();
    }
  }
  
  console.log('\n========================================');
  console.log('🔐 Authentication Setup');
  console.log('========================================');
  console.log(`Navigating to: ${baseURL}${APP_URL}`);
  console.log('\n📋 Instructions:');
  console.log('1. Complete SSO authentication in ANY browser windows that open');
  console.log('2. Complete MFA/2FA if prompted (may be in a popup window)');
  console.log('3. Wait for the app to FULLY load (you should see widgets/form elements)');
  console.log('4. The script will wait patiently and detect when you\'re done');
  console.log('========================================\n');
  
  // Set up popup handler - SSO often opens popups for authentication
  let popupHandled = false;
  const popupPromise = context.waitForEvent('page', { timeout: 60000 }).catch(() => null);
  
  context.on('page', async (newPage) => {
    console.log('🪟 Popup window detected! Complete authentication in the popup.');
    popupHandled = true;
    
    // Wait for popup to close (indicates auth is proceeding)
    newPage.on('close', () => {
      console.log('✅ Popup window closed - authentication proceeding...');
    });
  });
  
  // Navigate to the app - this will trigger SSO
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  
  console.log('⏳ Waiting for SSO authentication...');
  console.log('   (You have up to 15 minutes - take your time!)');
  console.log('');
  console.log('⚠️  IMPORTANT:');
  console.log('   - Complete authentication in ANY windows that open');
  console.log('   - Complete MFA/2FA if required');
  console.log('   - Wait for the main app to fully load');
  console.log('   - The script will wait until everything is done');
  console.log('');
  
  // Wait for authentication to complete and app to load
  let authenticated = false;
  const maxWaitTime = 900000; // 15 minutes - plenty of time for SSO + MFA
  const startTime = Date.now();
  let lastStatusTime = startTime;
  let consecutiveGoodChecks = 0; // Need multiple good checks to confirm
  
  while (!authenticated && (Date.now() - startTime) < maxWaitTime) {
    await page.waitForTimeout(3000); // Check every 3 seconds (more patient)
    
    const currentUrl = page.url();
    const urlHasExperience = /experience/.test(currentUrl);
    
    // Check if we're still on a login/SSO page (be more lenient)
    const passwordFields = await page.locator('input[type="password"]').count();
    const signInButtons = await page.locator('button:has-text("Sign In"), button:has-text("Log In"), [aria-label*="sign in" i]').count();
    const isLoginPage = 
      /sign.*in|login|oauth|saml|microsoft|okta|auth|sso/i.test(currentUrl) ||
      (passwordFields > 0 && signInButtons > 0);
    
    // Check if app has loaded widgets/elements (be more lenient)
    const allInputs = await page.locator('input').count();
    const textInputs = await page.locator('input[type="text"], input[type="number"]').count();
    const selects = await page.locator('select, [role="combobox"]').count();
    const buttons = await page.locator('button').count();
    // More lenient: just need some buttons OR inputs/selects (app might be loading)
    const hasWidgets = buttons > 2 || textInputs > 0 || selects > 0;
    
    // Check if loading indicators are gone
    const visibleLoaders = await page.locator('.loading-content:visible, .jimu-primary-loading-app:visible, [class*="loading"]:visible').count();
    const loadingGone = visibleLoaders === 0;
    
    // Additional check: look for Experience Builder specific elements
    const hasExbElements = await page.locator('[class*="exb"], [class*="jimu"], [data-exb-widget], [data-widget-id]').count() > 0;
    
    // Show status every 30 seconds (less frequent, less annoying)
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    if (elapsed - Math.floor((Date.now() - lastStatusTime) / 1000) >= 30 || elapsed === 0) {
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      console.log(`   ⏳ Still waiting... (${minutes}m ${seconds}s elapsed)`);
      console.log(`   📍 URL: ${currentUrl.substring(0, 100)}${currentUrl.length > 100 ? '...' : ''}`);
      console.log(`   🔍 Status: Login page=${isLoginPage}, Widgets=${hasWidgets} (${textInputs} inputs, ${selects} selects), Loading=${!loadingGone}`);
      if (popupHandled) {
        console.log('   🪟 Popup window was detected - make sure you completed auth in it');
      }
      lastStatusTime = Date.now();
    }
    
    // Verify authentication is complete (need multiple consecutive good checks)
    if (urlHasExperience && !isLoginPage && hasWidgets && loadingGone) {
      consecutiveGoodChecks++;
      
      if (consecutiveGoodChecks === 1) {
        console.log('');
        console.log('✅ Initial authentication detected! Verifying app is fully loaded...');
      }
      
      // Need 3 consecutive good checks (9 seconds) to be sure
      if (consecutiveGoodChecks >= 3) {
        console.log('');
        console.log('✅ Authentication verified! Finalizing...');
        
        // Wait for network to settle
        try {
          await page.waitForLoadState('networkidle', { timeout: 30000 });
        } catch (e) {
          // Continue anyway - networkidle can be flaky
        }
        
        // Additional wait for React to fully render
        await page.waitForTimeout(5000);
        
        // Final verification - check for actual form elements
        const finalTextInputs = await page.locator('input[type="text"], input[type="number"]').count();
        const finalSelects = await page.locator('select, [role="combobox"]').count();
        const finalButtons = await page.locator('button').count();
        
        console.log(`   📊 Final check: ${finalTextInputs} text inputs, ${finalSelects} selects, ${finalButtons} buttons`);
        
        // More lenient check - if we have buttons and we're on the experience URL, we're good
        if (finalTextInputs > 0 || finalSelects > 0 || (finalButtons > 2 && urlHasExperience)) {
          authenticated = true;
          console.log('✅ VERIFIED: App is fully loaded!');
          break;
        } else {
          console.log(`   ⏳ Still checking... (${finalTextInputs} inputs, ${finalSelects} selects, ${finalButtons} buttons)`);
          // Don't reset immediately - give it a few more checks
          if (consecutiveGoodChecks > 5) {
            console.log('   ⚠️  Taking longer than expected, but URL looks good. Saving anyway...');
            authenticated = true;
            break;
          }
        }
      }
    } else {
      // Reset counter if any check fails
      consecutiveGoodChecks = 0;
    }
  }
  
  if (!authenticated) {
    console.log('');
    console.log('❌ ERROR: Could not verify authentication completion!');
    console.log('');
    console.log('   Please check:');
    console.log('   1. Did you complete SSO sign-in in the main window?');
    console.log('   2. Did you complete SSO/MFA in any popup windows that opened?');
    console.log('   3. Did you complete any MFA/2FA steps?');
    console.log('   4. Can you see the app with widgets/form elements now?');
    console.log('   5. Current URL: ' + page.url());
    console.log('');
    
    const screenshotPath = 'test-results/auth-setup-failed.png';
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`   📸 Screenshot saved to: ${screenshotPath}`);
    } catch (e) {
      console.log('   Could not save screenshot');
    }
    
    throw new Error('Authentication verification failed. Please check the screenshot and try again.');
  }
  
  // Final status
  const currentUrl = page.url();
  const finalTextInputs = await page.locator('input[type="text"], input[type="number"]').count();
  const finalSelects = await page.locator('select, [role="combobox"]').count();
  const finalButtons = await page.locator('button').count();
  
  console.log('');
  console.log('========================================');
  console.log('✅ Authentication Complete!');
  console.log('========================================');
  console.log(`📍 Final URL: ${currentUrl}`);
  console.log(`📊 Page elements: ${finalTextInputs} text inputs, ${finalSelects} selects, ${finalButtons} buttons`);
  console.log('');
  
  // Save the authenticated state
  await context.storageState({ path: authPath });
  
  console.log('💾 Authentication state saved to:', authPath);
  console.log('');
  console.log('🎉 Setup complete! You can now run tests with:');
  console.log('   npm run test:e2e');
  console.log('========================================\n');
});
