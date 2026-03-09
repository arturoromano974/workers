// Copyright (c) 2022 Cloudflare, Inc.
// Licensed under the APACHE LICENSE, VERSION 2.0 license found in the LICENSE file or at http://www.apache.org/licenses/LICENSE-2.0

/**
 * Facebook Ads Library Integration
 *
 * This module provides integration with Facebook's Ads Library API to search
 * for ads and find Facebook accounts with 50+ active ads.
 *
 * NOTE: This uses Facebook's official Graph API, not web scraping.
 * You need a valid Facebook App Access Token to use this API.
 *
 * Get your access token at: https://developers.facebook.com/tools/accesstoken/
 *
 * API Documentation: https://developers.facebook.com/docs/graph-api/reference/ads_archive/
 */

export interface FacebookAd {
	id: string;
	ad_creation_time: string;
	ad_creative_bodies: string[];
	ad_creative_link_captions: string[];
	ad_creative_link_descriptions: string[];
	ad_creative_link_titles: string[];
	ad_delivery_start_time: string;
	ad_delivery_stop_time?: string;
	ad_snapshot_url: string;
	page_id: string;
	page_name: string;
	impressions?: {
		lower_bound: string;
		upper_bound: string;
	};
}

export interface FacebookAccount {
	page_id: string;
	page_name: string;
	ad_count: number;
	profile_url: string;
	ads: FacebookAd[];
}

export interface SearchAdsParams {
	search_terms: string;
	ad_reached_countries: string;
	ad_active_status?: "ACTIVE" | "INACTIVE" | "ALL";
	ad_type?: "ALL" | "POLITICAL_AND_ISSUE_ADS" | "HOUSING_ADS" | "EMPLOYMENT_ADS" | "CREDIT_ADS";
	media_type?: "ALL" | "IMAGE" | "MEME" | "VIDEO";
	limit?: number;
}

/**
 * Search Facebook Ads Library using the Graph API
 */
export async function searchFacebookAds(
	accessToken: string,
	params: SearchAdsParams
): Promise<FacebookAd[]> {
	const {
		search_terms,
		ad_reached_countries,
		ad_active_status = "ACTIVE",
		ad_type = "ALL",
		media_type = "ALL",
		limit = 100
	} = params;

	const url = new URL("https://graph.facebook.com/v18.0/ads_archive");
	url.searchParams.set("access_token", accessToken);
	url.searchParams.set("search_terms", search_terms);
	url.searchParams.set("ad_reached_countries", ad_reached_countries);
	url.searchParams.set("ad_active_status", ad_active_status);
	url.searchParams.set("ad_type", ad_type);
	url.searchParams.set("media_type", media_type);
	url.searchParams.set("limit", limit.toString());
	url.searchParams.set("fields", "id,ad_creation_time,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_descriptions,ad_creative_link_titles,ad_delivery_start_time,ad_delivery_stop_time,ad_snapshot_url,page_id,page_name,impressions");

	const response = await fetch(url.toString());

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Facebook API error: ${response.status} - ${error}`);
	}

	const data: any = await response.json();
	return data.data || [];
}

/**
 * Group ads by Facebook account/page and filter accounts with 50+ ads
 */
export function groupAdsByAccount(ads: FacebookAd[]): FacebookAccount[] {
	const accountMap = new Map<string, FacebookAccount>();

	for (const ad of ads) {
		const pageId = ad.page_id;

		if (!accountMap.has(pageId)) {
			accountMap.set(pageId, {
				page_id: pageId,
				page_name: ad.page_name,
				ad_count: 0,
				profile_url: `https://www.facebook.com/${pageId}`,
				ads: []
			});
		}

		const account = accountMap.get(pageId)!;
		account.ad_count++;
		account.ads.push(ad);
	}

	// Convert to array and sort by ad count (descending)
	return Array.from(accountMap.values())
		.sort((a, b) => b.ad_count - a.ad_count);
}

/**
 * Find Facebook accounts with at least minAds active ads
 */
export function findAccountsWithMinAds(
	accounts: FacebookAccount[],
	minAds: number = 50
): FacebookAccount[] {
	return accounts.filter(account => account.ad_count >= minAds);
}

/**
 * Main function: Search for Facebook ads and find accounts with 50+ ads
 */
export async function findFacebookAccountsWith50PlusAds(
	accessToken: string,
	searchTerm: string,
	country: string = "BR"
): Promise<{
	total_ads: number;
	total_accounts: number;
	accounts_with_50_plus_ads: FacebookAccount[];
	top_accounts: FacebookAccount[];
}> {
	// Search for ads (fetch more to increase chances of finding accounts with 50+ ads)
	const ads = await searchFacebookAds(accessToken, {
		search_terms: searchTerm,
		ad_reached_countries: country,
		ad_active_status: "ACTIVE",
		ad_type: "ALL",
		media_type: "ALL",
		limit: 1000 // Maximum allowed by API
	});

	// Group ads by account
	const allAccounts = groupAdsByAccount(ads);

	// Filter accounts with 50+ ads
	const accountsWith50Plus = findAccountsWithMinAds(allAccounts, 50);

	return {
		total_ads: ads.length,
		total_accounts: allAccounts.length,
		accounts_with_50_plus_ads: accountsWith50Plus,
		top_accounts: allAccounts.slice(0, 10) // Top 10 accounts by ad count
	};
}
