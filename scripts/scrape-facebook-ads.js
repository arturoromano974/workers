#!/usr/bin/env node
/**
 * Facebook Ads Library Scraper - Standalone Node.js Script
 *
 * This script uses Playwright to scrape the Facebook Ads Library
 * and find accounts with 50+ ads on a specific topic.
 *
 * Requirements:
 * - Node.js 18+
 * - Playwright installed: npm install playwright
 *
 * Usage:
 *   node scripts/scrape-facebook-ads.js
 *   node scripts/scrape-facebook-ads.js --query="emagrecimento" --country="BR" --minAds=50
 */

// Note: This is a standalone script, not a Cloudflare Worker
// To use this, you need to install Playwright:
// npm install playwright

const DEFAULT_CONFIG = {
  searchQuery: "emagrecimento",
  country: "BR",
  minAds: 50,
  maxScrolls: 10, // Maximum number of times to scroll to load more ads
  scrollDelay: 2000, // Delay between scrolls in milliseconds
};

async function scrapeFacebookAds(config = DEFAULT_CONFIG) {
  console.log("Facebook Ads Library Scraper");
  console.log("============================");
  console.log(`Search Query: ${config.searchQuery}`);
  console.log(`Country: ${config.country}`);
  console.log(`Minimum Ads: ${config.minAds}`);
  console.log("");

  // Check if Playwright is available
  let playwright;
  try {
    playwright = require("playwright");
  } catch (error) {
    console.error("Error: Playwright is not installed.");
    console.error("Please install it by running: npm install playwright");
    process.exit(1);
  }

  // Construct the Facebook Ads Library URL
  const baseUrl = "https://www.facebook.com/ads/library/";
  const params = new URLSearchParams({
    active_status: "active",
    ad_type: "all",
    country: config.country,
    is_targeted_country: "false",
    media_type: "all",
    q: config.searchQuery,
    search_type: "keyword_unordered",
    "sort_data[mode]": "total_impressions",
    "sort_data[direction]": "desc",
  });

  const url = `${baseUrl}?${params.toString()}`;
  console.log(`URL: ${url}`);
  console.log("");

  let browser;
  try {
    // Launch browser
    console.log("Launching browser...");
    browser = await playwright.chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // Navigate to the Facebook Ads Library
    console.log("Navigating to Facebook Ads Library...");
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

    // Wait for ads to load
    console.log("Waiting for ads to load...");
    await page.waitForTimeout(5000);

    // Take a screenshot for debugging
    await page.screenshot({ path: "/tmp/facebook-ads-library.png" });
    console.log("Screenshot saved to /tmp/facebook-ads-library.png");

    // Scroll to load more ads
    console.log(`Scrolling to load more ads (max ${config.maxScrolls} scrolls)...`);
    for (let i = 0; i < config.maxScrolls; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(config.scrollDelay);
      console.log(`  Scroll ${i + 1}/${config.maxScrolls}`);
    }

    // Extract ad information
    console.log("\nExtracting ad information...");

    // Facebook Ads Library uses dynamic selectors, so we need to adapt based on the actual page structure
    // Common selectors to try:
    const possibleSelectors = [
      '[data-testid="AdCard"]',
      '[data-pagelet*="AdCard"]',
      'div[class*="ad-card"]',
      'div[class*="AdCard"]',
      'div[role="article"]',
    ];

    let adElements = [];
    for (const selector of possibleSelectors) {
      try {
        adElements = await page.$$(selector);
        if (adElements.length > 0) {
          console.log(`Found ${adElements.length} ads using selector: ${selector}`);
          break;
        }
      } catch (error) {
        // Try next selector
      }
    }

    if (adElements.length === 0) {
      console.warn("Warning: No ads found. Facebook may have changed their HTML structure.");
      console.warn("Please inspect the page and update the selectors.");

      // Get page content for debugging
      const html = await page.content();
      console.log("\nPage HTML saved to /tmp/facebook-ads-debug.html");
      const fs = require("fs");
      fs.writeFileSync("/tmp/facebook-ads-debug.html", html);

      await browser.close();
      return;
    }

    // Extract account information from ads
    console.log("\nProcessing ads...");
    const accountMap = new Map();

    for (let i = 0; i < adElements.length; i++) {
      const adElement = adElements[i];

      try {
        // Extract advertiser/account information
        // This selector may need to be adjusted based on Facebook's current HTML structure
        const accountNameElement = await adElement.$(
          'span[class*="advertiser"], a[href*="/ads/library/?id="], div[class*="PageName"]'
        );

        if (accountNameElement) {
          const accountName = await accountNameElement.textContent();
          const accountLink = await accountNameElement.evaluate((el) => {
            // Try to find the account link
            const link = el.closest("a");
            return link ? link.href : null;
          });

          if (accountName && accountLink) {
            const accountId = accountLink.match(/id=(\d+)/)?.[1] || accountName;

            if (!accountMap.has(accountId)) {
              accountMap.set(accountId, {
                accountName: accountName.trim(),
                accountLink: accountLink,
                accountId: accountId,
                adCount: 0,
              });
            }

            accountMap.get(accountId).adCount++;
          }
        }
      } catch (error) {
        console.warn(`  Warning: Failed to extract info from ad ${i + 1}: ${error.message}`);
      }

      if ((i + 1) % 10 === 0) {
        console.log(`  Processed ${i + 1}/${adElements.length} ads`);
      }
    }

    // Filter accounts with minimum ad count
    console.log("\n\nResults:");
    console.log("========");

    const qualifyingAccounts = Array.from(accountMap.values())
      .filter((account) => account.adCount >= config.minAds)
      .sort((a, b) => b.adCount - a.adCount);

    if (qualifyingAccounts.length === 0) {
      console.log(`No accounts found with ${config.minAds}+ ads.`);
      console.log("\nAll accounts found:");
      Array.from(accountMap.values())
        .sort((a, b) => b.adCount - a.adCount)
        .forEach((account) => {
          console.log(`  - ${account.accountName}: ${account.adCount} ads`);
          console.log(`    ${account.accountLink}`);
        });
    } else {
      console.log(`Found ${qualifyingAccounts.length} account(s) with ${config.minAds}+ ads:\n`);

      qualifyingAccounts.forEach((account, index) => {
        console.log(`${index + 1}. ${account.accountName}`);
        console.log(`   Ads: ${account.adCount}`);
        console.log(`   Link: ${account.accountLink}`);
        console.log("");
      });

      // Save results to JSON file
      const fs = require("fs");
      const resultsPath = "/tmp/facebook-ads-results.json";
      fs.writeFileSync(
        resultsPath,
        JSON.stringify(
          {
            searchQuery: config.searchQuery,
            country: config.country,
            minAds: config.minAds,
            totalAdsScraped: adElements.length,
            qualifyingAccounts: qualifyingAccounts,
            allAccounts: Array.from(accountMap.values()),
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
      );
      console.log(`Results saved to ${resultsPath}`);
    }

    await browser.close();
  } catch (error) {
    console.error("\nError occurred:");
    console.error(error);

    if (browser) {
      await browser.close();
    }

    process.exit(1);
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  args.forEach((arg) => {
    if (arg.startsWith("--query=")) {
      config.searchQuery = arg.split("=")[1];
    } else if (arg.startsWith("--country=")) {
      config.country = arg.split("=")[1];
    } else if (arg.startsWith("--minAds=")) {
      config.minAds = parseInt(arg.split("=")[1], 10);
    } else if (arg.startsWith("--maxScrolls=")) {
      config.maxScrolls = parseInt(arg.split("=")[1], 10);
    }
  });

  return config;
}

// Main execution
if (require.main === module) {
  const config = parseArgs();
  scrapeFacebookAds(config);
}

module.exports = { scrapeFacebookAds };
