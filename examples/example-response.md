# Example API Response

This document shows an example response from the `/facebook-ads/search` endpoint.

## Request

```bash
GET /facebook-ads/search?search=emagrecimento&country=BR
```

## Response (Success)

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
      "page_id": "123456789012345",
      "page_name": "Clínica de Emagrecimento Saudável",
      "ad_count": 87,
      "profile_url": "https://www.facebook.com/123456789012345",
      "sample_ad_urls": [
        "https://www.facebook.com/ads/library/?id=6543210987654321",
        "https://www.facebook.com/ads/library/?id=6543210987654322",
        "https://www.facebook.com/ads/library/?id=6543210987654323",
        "https://www.facebook.com/ads/library/?id=6543210987654324",
        "https://www.facebook.com/ads/library/?id=6543210987654325"
      ]
    },
    {
      "page_id": "987654321098765",
      "page_name": "Centro de Nutrição e Bem-Estar",
      "ad_count": 62,
      "profile_url": "https://www.facebook.com/987654321098765",
      "sample_ad_urls": [
        "https://www.facebook.com/ads/library/?id=1234567890123456",
        "https://www.facebook.com/ads/library/?id=1234567890123457",
        "https://www.facebook.com/ads/library/?id=1234567890123458",
        "https://www.facebook.com/ads/library/?id=1234567890123459",
        "https://www.facebook.com/ads/library/?id=1234567890123460"
      ]
    },
    {
      "page_id": "555666777888999",
      "page_name": "Programa de Emagrecimento Natural",
      "ad_count": 51,
      "profile_url": "https://www.facebook.com/555666777888999",
      "sample_ad_urls": [
        "https://www.facebook.com/ads/library/?id=9876543210987654",
        "https://www.facebook.com/ads/library/?id=9876543210987655",
        "https://www.facebook.com/ads/library/?id=9876543210987656",
        "https://www.facebook.com/ads/library/?id=9876543210987657",
        "https://www.facebook.com/ads/library/?id=9876543210987658"
      ]
    }
  ],
  "top_accounts": [
    {
      "page_id": "123456789012345",
      "page_name": "Clínica de Emagrecimento Saudável",
      "ad_count": 87,
      "profile_url": "https://www.facebook.com/123456789012345"
    },
    {
      "page_id": "987654321098765",
      "page_name": "Centro de Nutrição e Bem-Estar",
      "ad_count": 62,
      "profile_url": "https://www.facebook.com/987654321098765"
    },
    {
      "page_id": "555666777888999",
      "page_name": "Programa de Emagrecimento Natural",
      "ad_count": 51,
      "profile_url": "https://www.facebook.com/555666777888999"
    },
    {
      "page_id": "111222333444555",
      "page_name": "Fitness Brasil",
      "ad_count": 45,
      "profile_url": "https://www.facebook.com/111222333444555"
    },
    {
      "page_id": "666777888999000",
      "page_name": "Saúde e Beleza Plus",
      "ad_count": 38,
      "profile_url": "https://www.facebook.com/666777888999000"
    },
    {
      "page_id": "222333444555666",
      "page_name": "Dieta Natural",
      "ad_count": 27,
      "profile_url": "https://www.facebook.com/222333444555666"
    },
    {
      "page_id": "333444555666777",
      "page_name": "Academia Virtual",
      "ad_count": 19,
      "profile_url": "https://www.facebook.com/333444555666777"
    },
    {
      "page_id": "444555666777888",
      "page_name": "Corpo Saudável",
      "ad_count": 15,
      "profile_url": "https://www.facebook.com/444555666777888"
    },
    {
      "page_id": "777888999000111",
      "page_name": "Nutricionista Online",
      "ad_count": 12,
      "profile_url": "https://www.facebook.com/777888999000111"
    },
    {
      "page_id": "888999000111222",
      "page_name": "Vida Fit Brasil",
      "ad_count": 8,
      "profile_url": "https://www.facebook.com/888999000111222"
    }
  ]
}
```

## Response Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether the request succeeded |
| `search_term` | string | The search term that was used |
| `country` | string | The country code that was used |
| `total_ads_found` | number | Total number of ads found matching the search |
| `total_accounts` | number | Total number of unique Facebook accounts/pages |
| `accounts_with_50_plus_ads` | number | Count of accounts that have 50 or more ads |
| `accounts` | array | Array of accounts with 50+ ads (includes sample ad URLs) |
| `accounts[].page_id` | string | Facebook page ID |
| `accounts[].page_name` | string | Facebook page name |
| `accounts[].ad_count` | number | Number of ads from this account |
| `accounts[].profile_url` | string | Direct link to the Facebook page |
| `accounts[].sample_ad_urls` | array | Up to 5 sample ad URLs from this account |
| `top_accounts` | array | Top 10 accounts by ad count (regardless of whether they have 50+) |

## Response (No Accounts with 50+ Ads)

If no accounts have 50+ ads, the response will still show the top accounts:

```json
{
  "success": true,
  "search_term": "rare-niche-topic",
  "country": "BR",
  "total_ads_found": 42,
  "total_accounts": 15,
  "accounts_with_50_plus_ads": 0,
  "accounts": [],
  "top_accounts": [
    {
      "page_id": "123456789",
      "page_name": "Top Advertiser",
      "ad_count": 12,
      "profile_url": "https://www.facebook.com/123456789"
    }
  ]
}
```

## Error Responses

### Missing Facebook Token

```json
{
  "error": "Facebook API not configured",
  "message": "Please set FACEBOOK_ACCESS_TOKEN environment variable. Get your token at: https://developers.facebook.com/tools/accesstoken/"
}
```
**Status Code:** 500

### Missing Search Parameter

```json
{
  "error": "Missing required parameter",
  "message": "Please provide a 'search' query parameter"
}
```
**Status Code:** 400

### Facebook API Error

```json
{
  "error": "Failed to search Facebook ads",
  "message": "Facebook API error: 403 - Invalid OAuth access token"
}
```
**Status Code:** 500

## Using the Response

### Finding Accounts with 50+ Ads

```javascript
const response = await fetch('/facebook-ads/search?search=emagrecimento&country=BR');
const data = await response.json();

if (data.accounts_with_50_plus_ads > 0) {
  console.log(`Found ${data.accounts_with_50_plus_ads} accounts with 50+ ads:`);

  data.accounts.forEach(account => {
    console.log(`- ${account.page_name} (${account.ad_count} ads)`);
    console.log(`  Profile: ${account.profile_url}`);
    console.log(`  Sample ads: ${account.sample_ad_urls.length}`);
  });
} else {
  console.log('No accounts found with 50+ ads');
  console.log('Top accounts:', data.top_accounts);
}
```

### Getting Profile URLs

```javascript
const profileUrls = data.accounts.map(account => account.profile_url);
console.log('Profile URLs:', profileUrls);
// Output: ['https://www.facebook.com/123456789012345', ...]
```

### Getting Ad Count Statistics

```javascript
const totalAds = data.total_ads_found;
const avgAdsPerAccount = totalAds / data.total_accounts;
const maxAds = data.top_accounts[0]?.ad_count || 0;

console.log(`Statistics:
  Total Ads: ${totalAds}
  Total Accounts: ${data.total_accounts}
  Avg Ads/Account: ${avgAdsPerAccount.toFixed(2)}
  Highest Ad Count: ${maxAds}
  Accounts with 50+: ${data.accounts_with_50_plus_ads}
`);
```
