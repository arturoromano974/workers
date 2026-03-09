# Facebook Ads Library Scraper

This solution provides tools to scrape the Facebook Ads Library and find accounts with 50+ ads on specific topics.

## Problem Statement

Search for accounts in Facebook Ads Library with the following criteria:
- **Search Term**: "emagrecimento" (weight loss)
- **Country**: Brazil (BR)
- **Minimum Ads**: 50+ ads per account
- **Sorting**: By total impressions (descending)

**URL**: https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=emagrecimento&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc

## Solutions Provided

### 1. Standalone Node.js Script (Recommended)

**File**: `scripts/scrape-facebook-ads.js`

This is a standalone Node.js script that uses Playwright to automate browser interactions and scrape Facebook Ads Library.

#### Requirements
- Node.js 18+
- Playwright

#### Installation

```bash
# Install Playwright
npm install playwright

# Or install globally
npm install -g playwright
npx playwright install chromium
```

#### Usage

```bash
# Basic usage (uses default parameters)
node scripts/scrape-facebook-ads.js

# Custom search
node scripts/scrape-facebook-ads.js --query="emagrecimento" --country="BR" --minAds=50

# With custom scroll settings
node scripts/scrape-facebook-ads.js --query="emagrecimento" --maxScrolls=20
```

#### Parameters

- `--query`: Search term (default: "emagrecimento")
- `--country`: Country code (default: "BR")
- `--minAds`: Minimum number of ads required (default: 50)
- `--maxScrolls`: Maximum number of scrolls to load more ads (default: 10)

#### Output

The script will:
1. Launch a headless browser
2. Navigate to Facebook Ads Library
3. Load and scroll through ads
4. Extract account information
5. Filter accounts with 50+ ads
6. Display results in the console
7. Save results to `/tmp/facebook-ads-results.json`
8. Save a screenshot to `/tmp/facebook-ads-library.png`

**Example Output**:
```
Facebook Ads Library Scraper
============================
Search Query: emagrecimento
Country: BR
Minimum Ads: 50

Found 3 account(s) with 50+ ads:

1. [Account Name]
   Ads: 127
   Link: https://www.facebook.com/ads/library/?id=123456789

2. [Account Name]
   Ads: 89
   Link: https://www.facebook.com/ads/library/?id=987654321

3. [Account Name]
   Ads: 56
   Link: https://www.facebook.com/ads/library/?id=555666777

Results saved to /tmp/facebook-ads-results.json
```

### 2. Cloudflare Worker Template

**File**: `src/facebook-ads-scraper.ts`

This is a Cloudflare Worker template that demonstrates the structure for a Facebook Ads scraper. However, note that **Cloudflare Workers cannot run Playwright directly** due to runtime limitations.

#### Limitations

- Cloudflare Workers don't support browser automation
- No access to Playwright, Puppeteer, or similar tools
- CPU time limit of ~50ms per request

#### Alternatives for Cloudflare Workers

If you need to run this on Cloudflare infrastructure:

1. **Use a separate service**: Deploy the Node.js script on a server (e.g., AWS Lambda, Google Cloud Functions) and call it from the Worker
2. **Use Browserless.io**: A cloud browser automation service that provides an API
3. **Use Facebook Graph API**: If available, use official APIs instead of scraping
4. **Cloudflare Browser Rendering API**: When it becomes available for Workers

#### Usage (Conceptual)

```bash
# Deploy the worker
wrangler deploy src/facebook-ads-scraper.ts

# Call the endpoint
curl https://your-worker.workers.dev/scrape?query=emagrecimento&country=BR&minAds=50
```

## Implementation Notes

### Facebook Ads Library Structure

Facebook Ads Library is a public database where you can search for ads running on Facebook platforms. Key features:

- **Search by keyword**: Find ads containing specific terms
- **Filter by country**: Target specific geographic regions
- **Sort by impressions**: See most-viewed ads first
- **Account information**: Each ad shows the account that published it

### Scraping Approach

The scraper works by:

1. **Loading the page**: Navigate to the Facebook Ads Library URL
2. **Waiting for content**: Allow ads to load dynamically
3. **Scrolling**: Load more ads by scrolling (Facebook uses infinite scroll)
4. **Extracting data**: Parse HTML to find:
   - Account names
   - Account links
   - Ad content (optional)
5. **Grouping by account**: Count ads per account
6. **Filtering**: Keep only accounts with 50+ ads

### HTML Selectors

Facebook frequently updates their HTML structure. The script includes multiple fallback selectors:

- `[data-testid="AdCard"]` - Common React component pattern
- `[data-pagelet*="AdCard"]` - Pagelet-based structure
- `div[role="article"]` - Semantic HTML role
- `div[class*="ad-card"]` - Class name pattern matching

If selectors stop working, inspect the page HTML and update the selectors in the script.

## Ethical Considerations

### Terms of Service

- Facebook's Terms of Service prohibit automated scraping in most cases
- The Ads Library is public data, but scraping methods may violate ToS
- Consider using Facebook's official Graph API when available

### Rate Limiting

- Don't make too many requests in a short time
- Add delays between actions to avoid detection
- Respect Facebook's infrastructure

### Alternative: Official API

Facebook provides a **Meta Ads Library API** for programmatic access:

- **Documentation**: https://www.facebook.com/ads/library/api/
- **Features**: Search ads, get advertiser info, download reports
- **Requirements**: Facebook account, API access token
- **Benefits**: No scraping, no ToS violations, more reliable

## Troubleshooting

### Error: Playwright is not installed

```bash
npm install playwright
npx playwright install chromium
```

### Error: net::ERR_BLOCKED_BY_CLIENT

Facebook is blocking the request. This can happen due to:
- Ad blockers
- Corporate firewalls
- VPN/proxy issues

**Solution**: Run the script from a different network or use residential proxies.

### No ads found

Facebook may have changed their HTML structure. To debug:

1. Check the screenshot at `/tmp/facebook-ads-library.png`
2. Check the HTML dump at `/tmp/facebook-ads-debug.html`
3. Update the selectors in the script

### Facebook login required

Sometimes Facebook requires login to view ads. To handle this:

1. Modify the script to handle authentication
2. Use Playwright's `storageState` to save login session
3. Or use a service like Browserless.io that handles authentication

## Example Results

### Sample JSON Output

```json
{
  "searchQuery": "emagrecimento",
  "country": "BR",
  "minAds": 50,
  "totalAdsScraped": 245,
  "qualifyingAccounts": [
    {
      "accountName": "Example Weight Loss Company",
      "accountLink": "https://www.facebook.com/ads/library/?id=123456789",
      "accountId": "123456789",
      "adCount": 127
    },
    {
      "accountName": "Another Weight Loss Brand",
      "accountLink": "https://www.facebook.com/ads/library/?id=987654321",
      "accountId": "987654321",
      "adCount": 89
    }
  ],
  "timestamp": "2026-03-09T04:30:00.000Z"
}
```

## License

This code is provided for educational purposes only. Use at your own risk and ensure compliance with Facebook's Terms of Service and applicable laws.

## Contributing

To improve the scraper:

1. Update selectors if Facebook changes their HTML
2. Add error handling for edge cases
3. Implement retry logic for network failures
4. Add support for additional filters (date range, ad type, etc.)

## References

- [Facebook Ads Library](https://www.facebook.com/ads/library/)
- [Meta Ads Library API](https://www.facebook.com/ads/library/api/)
- [Playwright Documentation](https://playwright.dev/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
