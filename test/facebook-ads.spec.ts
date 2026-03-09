// Facebook Ads Library Integration - Test Suite
// Tests the Facebook Ads API integration

import { describe, it, expect } from "vitest";
import {
	groupAdsByAccount,
	findAccountsWithMinAds,
	type FacebookAd,
} from "../src/facebook-ads";

describe("Facebook Ads Integration", () => {
	describe("groupAdsByAccount", () => {
		it("should group ads by page_id", () => {
			const ads: FacebookAd[] = [
				{
					id: "1",
					ad_creation_time: "2024-01-01",
					ad_creative_bodies: ["Body 1"],
					ad_creative_link_captions: [],
					ad_creative_link_descriptions: [],
					ad_creative_link_titles: [],
					ad_delivery_start_time: "2024-01-01",
					ad_snapshot_url: "https://facebook.com/ads/1",
					page_id: "123",
					page_name: "Test Page 1",
				},
				{
					id: "2",
					ad_creation_time: "2024-01-02",
					ad_creative_bodies: ["Body 2"],
					ad_creative_link_captions: [],
					ad_creative_link_descriptions: [],
					ad_creative_link_titles: [],
					ad_delivery_start_time: "2024-01-02",
					ad_snapshot_url: "https://facebook.com/ads/2",
					page_id: "123",
					page_name: "Test Page 1",
				},
				{
					id: "3",
					ad_creation_time: "2024-01-03",
					ad_creative_bodies: ["Body 3"],
					ad_creative_link_captions: [],
					ad_creative_link_descriptions: [],
					ad_creative_link_titles: [],
					ad_delivery_start_time: "2024-01-03",
					ad_snapshot_url: "https://facebook.com/ads/3",
					page_id: "456",
					page_name: "Test Page 2",
				},
			];

			const accounts = groupAdsByAccount(ads);

			expect(accounts).toHaveLength(2);
			expect(accounts[0].page_id).toBe("123");
			expect(accounts[0].ad_count).toBe(2);
			expect(accounts[1].page_id).toBe("456");
			expect(accounts[1].ad_count).toBe(1);
		});

		it("should sort accounts by ad count in descending order", () => {
			const ads: FacebookAd[] = [];

			// Create 10 ads for page 123
			for (let i = 0; i < 10; i++) {
				ads.push({
					id: `page123-${i}`,
					ad_creation_time: "2024-01-01",
					ad_creative_bodies: [],
					ad_creative_link_captions: [],
					ad_creative_link_descriptions: [],
					ad_creative_link_titles: [],
					ad_delivery_start_time: "2024-01-01",
					ad_snapshot_url: `https://facebook.com/ads/${i}`,
					page_id: "123",
					page_name: "Page with 10 ads",
				});
			}

			// Create 50 ads for page 456
			for (let i = 0; i < 50; i++) {
				ads.push({
					id: `page456-${i}`,
					ad_creation_time: "2024-01-01",
					ad_creative_bodies: [],
					ad_creative_link_captions: [],
					ad_creative_link_descriptions: [],
					ad_creative_link_titles: [],
					ad_delivery_start_time: "2024-01-01",
					ad_snapshot_url: `https://facebook.com/ads/${i}`,
					page_id: "456",
					page_name: "Page with 50 ads",
				});
			}

			const accounts = groupAdsByAccount(ads);

			expect(accounts[0].page_id).toBe("456");
			expect(accounts[0].ad_count).toBe(50);
			expect(accounts[1].page_id).toBe("123");
			expect(accounts[1].ad_count).toBe(10);
		});

		it("should generate correct profile URLs", () => {
			const ads: FacebookAd[] = [
				{
					id: "1",
					ad_creation_time: "2024-01-01",
					ad_creative_bodies: [],
					ad_creative_link_captions: [],
					ad_creative_link_descriptions: [],
					ad_creative_link_titles: [],
					ad_delivery_start_time: "2024-01-01",
					ad_snapshot_url: "https://facebook.com/ads/1",
					page_id: "123456789",
					page_name: "Test Page",
				},
			];

			const accounts = groupAdsByAccount(ads);

			expect(accounts[0].profile_url).toBe("https://www.facebook.com/123456789");
		});
	});

	describe("findAccountsWithMinAds", () => {
		it("should filter accounts with at least 50 ads", () => {
			const accounts = [
				{
					page_id: "1",
					page_name: "Page 1",
					ad_count: 100,
					profile_url: "https://facebook.com/1",
					ads: [],
				},
				{
					page_id: "2",
					page_name: "Page 2",
					ad_count: 50,
					profile_url: "https://facebook.com/2",
					ads: [],
				},
				{
					page_id: "3",
					page_name: "Page 3",
					ad_count: 49,
					profile_url: "https://facebook.com/3",
					ads: [],
				},
				{
					page_id: "4",
					page_name: "Page 4",
					ad_count: 10,
					profile_url: "https://facebook.com/4",
					ads: [],
				},
			];

			const filtered = findAccountsWithMinAds(accounts, 50);

			expect(filtered).toHaveLength(2);
			expect(filtered[0].ad_count).toBe(100);
			expect(filtered[1].ad_count).toBe(50);
		});

		it("should accept custom minimum ad count", () => {
			const accounts = [
				{
					page_id: "1",
					page_name: "Page 1",
					ad_count: 20,
					profile_url: "https://facebook.com/1",
					ads: [],
				},
				{
					page_id: "2",
					page_name: "Page 2",
					ad_count: 10,
					profile_url: "https://facebook.com/2",
					ads: [],
				},
				{
					page_id: "3",
					page_name: "Page 3",
					ad_count: 5,
					profile_url: "https://facebook.com/3",
					ads: [],
				},
			];

			const filtered = findAccountsWithMinAds(accounts, 10);

			expect(filtered).toHaveLength(2);
			expect(filtered[0].ad_count).toBe(20);
			expect(filtered[1].ad_count).toBe(10);
		});

		it("should return empty array if no accounts meet minimum", () => {
			const accounts = [
				{
					page_id: "1",
					page_name: "Page 1",
					ad_count: 10,
					profile_url: "https://facebook.com/1",
					ads: [],
				},
			];

			const filtered = findAccountsWithMinAds(accounts, 50);

			expect(filtered).toHaveLength(0);
		});
	});
});
