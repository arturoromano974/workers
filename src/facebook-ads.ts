export interface FacebookAdsAccount {
	name: string;
	href: string;
	adCount: number;
}

const DEFAULT_MIN_ADS = 50;
const MAX_MIN_ADS = 100000;
const MAX_HTML_LENGTH = 2_000_000;
const JSON_FIELD_WINDOW = 300;
const ANCHOR_FORWARD_WINDOW = 300;
const ANCHOR_BACKWARD_WINDOW = 80;

const COUNT_PATTERN =
	/(\d{1,3}(?:[.,]\d{3})*|\d+)\s*\+?\s*(?:active\s+)?(?:ads?|anúncios?)/gi;
const FACEBOOK_ADS_LIBRARY_PATH = "/ads/library";
const FACEBOOK_HOSTS = new Set([
	"facebook.com",
	"www.facebook.com",
	"web.facebook.com",
	"m.facebook.com",
	"mbasic.facebook.com",
]);

export function sanitizeMinAds(value: unknown): number {
	const parsed = Number.parseInt(String(value ?? DEFAULT_MIN_ADS), 10);
	if (!Number.isFinite(parsed) || parsed < 1) {
		return DEFAULT_MIN_ADS;
	}

	return Math.min(parsed, MAX_MIN_ADS);
}

export function validateLookupHtml(html: string): void {
	if (!html || !html.trim()) {
		throw new Error("Provide an Ads Library URL or paste page HTML to search.");
	}

	if (html.length > MAX_HTML_LENGTH) {
		throw new Error("Provided HTML is too large to process safely.");
	}
}

export function isSupportedFacebookAdsLibraryUrl(value: string): boolean {
	try {
		const url = new URL(value);
		if (url.protocol !== "https:") {
			return false;
		}

		const host = url.hostname.toLowerCase();
		if (!FACEBOOK_HOSTS.has(host) && !host.endsWith(".facebook.com")) {
			return false;
		}

		return url.pathname.toLowerCase().includes(FACEBOOK_ADS_LIBRARY_PATH);
	} catch {
		return false;
	}
}

export async function resolveFacebookAdsLibraryHtml(
	sourceUrl: string,
	fetchFn: typeof fetch = fetch,
): Promise<string> {
	if (!isSupportedFacebookAdsLibraryUrl(sourceUrl)) {
		throw new Error(
			"Use a valid Facebook Ads Library HTTPS URL from a facebook.com domain.",
		);
	}

	const response = await fetchFn(sourceUrl, {
		method: "GET",
		redirect: "follow",
		headers: {
			accept: "text/html,application/xhtml+xml",
		},
	});

	if (!response.ok) {
		throw new Error(`Facebook Ads Library request failed with ${response.status}.`);
	}

	const html = await response.text();
	validateLookupHtml(html);
	return html;
}

export function extractFacebookAdsAccounts(
	html: string,
	minAds = DEFAULT_MIN_ADS,
): FacebookAdsAccount[] {
	validateLookupHtml(html);

	const normalizedHtml = normalizeSearchSource(html);
	const accounts = new Map<string, FacebookAdsAccount>();

	const addAccount = (candidate: FacebookAdsAccount | null) => {
		if (!candidate || candidate.adCount < minAds) {
			return;
		}

		const key = `${candidate.href}::${candidate.name.toLowerCase()}`;
		const existing = accounts.get(key);
		if (!existing || candidate.adCount > existing.adCount) {
			accounts.set(key, candidate);
		}
	};

	for (const match of normalizedHtml.matchAll(
		/<a[^>]+href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi,
	)) {
		const rawHref = match[2];
		const href = normalizeFacebookAccountLink(rawHref);
		if (!href) {
			continue;
		}

		const name = normalizeName(match[3]);
		if (!name) {
			continue;
		}

		const matchIndex = match.index ?? 0;
		const forwardWindowEnd = Math.min(
			normalizedHtml.length,
			matchIndex + match[0].length + ANCHOR_FORWARD_WINDOW,
		);
		const forwardText = stripTags(
			normalizedHtml.slice(matchIndex, forwardWindowEnd),
		);
		const backwardText = stripTags(
			normalizedHtml.slice(
				Math.max(0, matchIndex - ANCHOR_BACKWARD_WINDOW),
				matchIndex + match[0].length,
			),
		);
		const adCount =
			extractHighestAdCount(forwardText) ?? extractHighestAdCount(backwardText);

		addAccount(adCount ? { name, href, adCount } : null);
	}

	const jsonFieldPatterns = [
		new RegExp(
			`"(?:page_name|pageName|advertiser_name|advertiserName)"\\s*:\\s*"([^"]+)"[\\s\\S]{0,${JSON_FIELD_WINDOW}}?"(?:page_id|pageID|advertiser_id|advertiserID)"\\s*:\\s*"?(\\d+)"?[\\s\\S]{0,${JSON_FIELD_WINDOW}}?"(?:ad_count|adCount|active_ads_count|activeAdsCount|page_ads_count|pageAdsCount|total_count|totalCount)"\\s*:\\s*"?(\\d+)"?`,
			"gi",
		),
		new RegExp(
			`"(?:page_id|pageID|advertiser_id|advertiserID)"\\s*:\\s*"?(\\d+)"?[\\s\\S]{0,${JSON_FIELD_WINDOW}}?"(?:page_name|pageName|advertiser_name|advertiserName)"\\s*:\\s*"([^"]+)"[\\s\\S]{0,${JSON_FIELD_WINDOW}}?"(?:ad_count|adCount|active_ads_count|activeAdsCount|page_ads_count|pageAdsCount|total_count|totalCount)"\\s*:\\s*"?(\\d+)"?`,
			"gi",
		),
	];

	for (const pattern of jsonFieldPatterns) {
		for (const match of normalizedHtml.matchAll(pattern)) {
			const groups = match.slice(1);
			const [first, second, third] = groups;
			const id = /^\d+$/.test(first) ? first : second;
			const name = normalizeName(/^\d+$/.test(first) ? second : first);
			const adCount = Number.parseInt(third, 10);

			if (!id || !name || !Number.isFinite(adCount)) {
				continue;
			}

			addAccount({
				name,
				href: `https://www.facebook.com/profile.php?id=${id}`,
				adCount,
			});
		}
	}

	return [...accounts.values()].sort((a, b) => b.adCount - a.adCount);
}

function normalizeSearchSource(html: string): string {
	return decodeHtmlEntities(html).replace(/\\\//g, "/");
}

function extractHighestAdCount(text: string): number | null {
	let highestCount: number | null = null;

	for (const match of text.matchAll(COUNT_PATTERN)) {
		const count = parseCountValue(match[1]);
		if (count == null) {
			continue;
		}

		if (highestCount == null || count > highestCount) {
			highestCount = count;
		}
	}

	return highestCount;
}

function parseCountValue(value: string): number | null {
	const normalized = value.replace(/[.,](?=\d{3}\b)/g, "");
	const parsed = Number.parseInt(normalized, 10);
	return Number.isFinite(parsed) ? parsed : null;
}

function normalizeFacebookAccountLink(rawHref: string): string | null {
	if (!rawHref) {
		return null;
	}

	const decodedHref = decodeHtmlEntities(rawHref).trim();
	if (!decodedHref || decodedHref.startsWith("#")) {
		return null;
	}

	const absoluteHref = decodedHref.startsWith("http")
		? decodedHref
		: decodedHref.startsWith("//")
			? `https:${decodedHref}`
			: `https://www.facebook.com${decodedHref.startsWith("/") ? "" : "/"}${decodedHref}`;

	try {
		const url = new URL(absoluteHref);
		const host = url.hostname.toLowerCase();
		if (!FACEBOOK_HOSTS.has(host) && !host.endsWith(".facebook.com")) {
			return null;
		}

		const path = url.pathname.toLowerCase();
		if (
			path.includes(FACEBOOK_ADS_LIBRARY_PATH) ||
			path.includes("/ads/archive")
		) {
			return null;
		}

		url.hash = "";
		return url.toString();
	} catch {
		return null;
	}
}

function normalizeName(value: string): string | null {
	const clean = stripTags(decodeHtmlEntities(value))
		.replace(/\s+/g, " ")
		.trim();

	if (!clean || clean.length < 2 || clean.length > 120) {
		return null;
	}

	if (/^(see more|learn more|sponsored|facebook)$/i.test(clean)) {
		return null;
	}

	return clean;
}

function stripTags(value: string): string {
	return value.replace(/<[^>]+>/g, " ");
}

function decodeHtmlEntities(value: string): string {
	return value
		.replace(/&quot;/g, '"')
		.replace(/&#34;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&#(\d+);/g, (_, code) =>
			String.fromCodePoint(Number.parseInt(code, 10)),
		)
		.replace(/&amp;/g, "&");
}
