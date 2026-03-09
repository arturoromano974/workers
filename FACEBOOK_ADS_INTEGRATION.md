# Facebook Ads Library Integration

## Overview

This integration allows you to search the Facebook Ads Library and find Facebook accounts with 50+ active ads using the official Facebook Graph API.

**IMPORTANT:** This implementation uses Facebook's **official Graph API**, not web scraping with Playwright. Playwright cannot run in Cloudflare Workers because Workers run in V8 isolates without Node.js or browser automation capabilities.

## Features

- Search Facebook Ads Library by keyword
- Filter by country
- Find accounts with 50+ ads
- Get profile URLs for high-volume advertisers
- View sample ad URLs

## Setup

### 1. Get a Facebook Access Token

1. Go to [Facebook Developer Tools - Access Token](https://developers.facebook.com/tools/accesstoken/)
2. Log in with your Facebook account
3. Get an **App Access Token** or **User Access Token**
4. Copy the token

### 2. Configure Environment Variable

Add your Facebook access token to your Cloudflare Worker environment:

**In wrangler.jsonc:**
```jsonc
{
  "vars": {
    "FACEBOOK_ACCESS_TOKEN": "your-access-token-here"
  }
}
```

**Or in .dev.vars for local development:**
```
FACEBOOK_ACCESS_TOKEN=your-access-token-here
```

**Or via Cloudflare Dashboard:**
1. Go to Workers & Pages
2. Select your worker
3. Go to Settings → Variables
4. Add environment variable `FACEBOOK_ACCESS_TOKEN`

## API Usage

### Endpoint

```
GET /facebook-ads/search
```

### Query Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `search` | Yes | - | Search term (e.g., "emagrecimento") |
| `country` | No | BR | Country code (ISO 3166-1 alpha-2, e.g., BR, US, UK) |

### Example Request

```bash
# Search for "emagrecimento" ads in Brazil
curl "https://your-worker.workers.dev/facebook-ads/search?search=emagrecimento&country=BR"

# Search for "fitness" ads in USA
curl "https://your-worker.workers.dev/facebook-ads/search?search=fitness&country=US"
```

### Example Response

```json
{
  "success": true,
  "search_term": "emagrecimento",
  "country": "BR",
  "total_ads_found": 842,
  "total_accounts": 156,
  "accounts_with_50_plus_ads": 3,
  "accounts": [
    {
      "page_id": "123456789",
      "page_name": "Example Health Brand",
      "ad_count": 87,
      "profile_url": "https://www.facebook.com/123456789",
      "sample_ad_urls": [
        "https://www.facebook.com/ads/library/?id=xxx1",
        "https://www.facebook.com/ads/library/?id=xxx2",
        "https://www.facebook.com/ads/library/?id=xxx3",
        "https://www.facebook.com/ads/library/?id=xxx4",
        "https://www.facebook.com/ads/library/?id=xxx5"
      ]
    },
    {
      "page_id": "987654321",
      "page_name": "Another Brand",
      "ad_count": 62,
      "profile_url": "https://www.facebook.com/987654321",
      "sample_ad_urls": [...]
    }
  ],
  "top_accounts": [
    {
      "page_id": "123456789",
      "page_name": "Example Health Brand",
      "ad_count": 87,
      "profile_url": "https://www.facebook.com/123456789"
    },
    ...
  ]
}
```

### Response Fields

- `success`: Whether the request was successful
- `search_term`: The search term used
- `country`: The country code used
- `total_ads_found`: Total number of ads found
- `total_accounts`: Total number of unique accounts found
- `accounts_with_50_plus_ads`: Count of accounts with 50+ ads
- `accounts`: Array of accounts with 50+ ads (includes sample ad URLs)
- `top_accounts`: Top 10 accounts by ad count

## Error Responses

### Missing Facebook Token

```json
{
  "error": "Facebook API not configured",
  "message": "Please set FACEBOOK_ACCESS_TOKEN environment variable. Get your token at: https://developers.facebook.com/tools/accesstoken/"
}
```

### Missing Search Parameter

```json
{
  "error": "Missing required parameter",
  "message": "Please provide a 'search' query parameter"
}
```

### Facebook API Error

```json
{
  "error": "Failed to search Facebook ads",
  "message": "Facebook API error: 403 - Invalid OAuth access token"
}
```

## Limitations

1. **API Rate Limits**: Facebook Graph API has rate limits. For production use, consider implementing caching.

2. **Access Token Expiration**: User access tokens expire. Use App access tokens or implement token refresh logic.

3. **Maximum Results**: The API returns up to 1000 ads per request. To find more accounts with 50+ ads, you may need to:
   - Use more specific search terms
   - Make multiple requests with different parameters
   - Implement pagination

4. **Cloudflare Workers Constraints**: This runs in Cloudflare Workers, so:
   - No Playwright/Puppeteer support
   - No browser automation
   - Must use HTTP APIs only

## Facebook Ads Library API Documentation

- [Ads Archive API Reference](https://developers.facebook.com/docs/graph-api/reference/ads_archive/)
- [Access Tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

## Testing

You can test the endpoint locally:

```bash
# Start local development server
npm run dev

# In another terminal, test the endpoint
curl "http://localhost:8787/facebook-ads/search?search=test&country=BR"
```

## Production Deployment

1. Set the `FACEBOOK_ACCESS_TOKEN` in your Cloudflare dashboard
2. Deploy your worker:
   ```bash
   npm run deploy
   ```
3. Test the endpoint:
   ```bash
   curl "https://your-worker.workers.dev/facebook-ads/search?search=emagrecimento&country=BR"
   ```

## Legal and Ethical Considerations

- This uses Facebook's **official Graph API**, which is the legitimate and authorized way to access Ads Library data
- Always comply with Facebook's Platform Terms and Developer Policies
- Do not scrape Facebook or violate their Terms of Service
- The Ads Library is public data that Facebook makes available for transparency
- Use this data responsibly and ethically

## Why Not Playwright?

The problem statement mentioned using Playwright, but this is not possible because:

1. **Cloudflare Workers use V8 isolates**, not Node.js
2. **No browser automation** support in Workers runtime
3. **Playwright requires Node.js native modules** (not available in Workers)
4. **Web scraping violates Facebook's Terms of Service**

Instead, this implementation uses the **official Facebook Graph API**, which is:
- ✅ Legitimate and authorized
- ✅ Compliant with Facebook's terms
- ✅ Compatible with Cloudflare Workers
- ✅ More reliable than scraping
- ✅ Better performance

## Support

For issues related to:
- **Facebook API**: Check [Facebook Developer Docs](https://developers.facebook.com/)
- **Cloudflare Workers**: Check [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- **This integration**: Open an issue in the repository
