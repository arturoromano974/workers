#!/bin/bash
#
# Example: Run Facebook Ads Scraper
#
# This script demonstrates how to use the Facebook Ads Library scraper
# to find accounts with 50+ ads about "emagrecimento" (weight loss) in Brazil

echo "================================================"
echo "Facebook Ads Library Scraper - Example Usage"
echo "================================================"
echo ""
echo "This example will scrape Facebook Ads Library to find"
echo "accounts with 50+ ads about 'emagrecimento' in Brazil"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "Node.js version: $(node --version)"
echo ""

# Check if Playwright is installed
if ! node -e "require('playwright')" 2>/dev/null; then
    echo "Playwright is not installed. Installing now..."
    echo ""
    npm install playwright
    echo ""
    echo "Installing browser binaries..."
    npx playwright install chromium
    echo ""
fi

# Run the scraper with default settings
echo "Running scraper with default settings:"
echo "  Query: emagrecimento"
echo "  Country: BR"
echo "  Minimum Ads: 50"
echo "  Max Scrolls: 10"
echo ""

node scripts/scrape-facebook-ads.js

echo ""
echo "================================================"
echo "Example completed!"
echo ""
echo "Results saved to:"
echo "  - /tmp/facebook-ads-results.json (JSON data)"
echo "  - /tmp/facebook-ads-library.png (screenshot)"
echo ""
echo "To run with custom parameters:"
echo "  node scripts/scrape-facebook-ads.js --query='diet' --country='US' --minAds=100"
echo ""
