#!/usr/bin/env bash

# Example script showing how to use the Facebook Ads Library integration
#
# Usage:
#   ./examples/facebook-ads-search.sh "emagrecimento" "BR"
#
# Requirements:
#   - jq (for JSON formatting)
#   - Your worker must be deployed with FACEBOOK_ACCESS_TOKEN configured

SEARCH_TERM="${1:-emagrecimento}"
COUNTRY="${2:-BR}"
WORKER_URL="${WORKER_URL:-http://localhost:8787}"

echo "🔍 Searching Facebook Ads Library..."
echo "   Search term: $SEARCH_TERM"
echo "   Country: $COUNTRY"
echo "   Worker URL: $WORKER_URL"
echo ""

# Make the request
response=$(curl -s "${WORKER_URL}/facebook-ads/search?search=${SEARCH_TERM}&country=${COUNTRY}")

# Check if jq is available for pretty printing
if command -v jq &> /dev/null; then
    echo "$response" | jq '.'
    echo ""

    # Extract key information
    total_ads=$(echo "$response" | jq -r '.total_ads_found // 0')
    accounts_50_plus=$(echo "$response" | jq -r '.accounts_with_50_plus_ads // 0')

    echo "📊 Results Summary:"
    echo "   Total ads found: $total_ads"
    echo "   Accounts with 50+ ads: $accounts_50_plus"

    if [ "$accounts_50_plus" -gt 0 ]; then
        echo ""
        echo "🎯 Accounts with 50+ ads:"
        echo "$response" | jq -r '.accounts[] | "   - \(.page_name) (\(.ad_count) ads): \(.profile_url)"'
    else
        echo ""
        echo "❌ No accounts found with 50+ ads"
        echo ""
        echo "💡 Tips to find more results:"
        echo "   - Try different search terms"
        echo "   - Try different countries"
        echo "   - Use more specific keywords"
    fi
else
    echo "$response"
fi
