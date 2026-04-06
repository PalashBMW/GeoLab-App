/**
 * apiService.ts
 * Common service for making API / RSS calls throughout the app.
 * All fetch wrappers live here so components stay clean.
 */

import { NewsArticle } from '../types';

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

/**
 * Fetch a URL and return the parsed JSON response.
 * Throws an Error with a descriptive message on failure.
 */
export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText} — ${url}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Fetch a URL and return the raw text response (useful for XML / RSS).
 * Throws an Error with a descriptive message on failure.
 */
export async function fetchText(url: string, options?: RequestInit): Promise<string> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText} — ${url}`);
  }
  return response.text();
}

// ---------------------------------------------------------------------------
// Guardian RSS
// ---------------------------------------------------------------------------

/**
 * Available Guardian RSS category slugs.
 * Full list: https://www.theguardian.com/help/feeds
 */
export type GuardianCategory =
  | 'environment'
  | 'science'
  | 'technology'
  | 'business'
  | 'world'
  | 'uk/environment';

/**
 * In development the Vite dev server proxies /guardian-rss → https://www.theguardian.com
 * so we can fetch Guardian RSS feeds as plain XML with no CORS issues and no rate limits.
 * See vite.config.ts for the proxy configuration.
 */
const GUARDIAN_PROXY_BASE = '/guardian-rss';

/** Parse an RSS XML string and return an array of NewsArticle */
function parseGuardianRSS(xmlText: string, category: string): NewsArticle[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');

  // Check for parser errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Failed to parse Guardian RSS XML');
  }

  const items = Array.from(doc.querySelectorAll('item'));
  return items.map((item) => {
    const getText = (tag: string) => item.querySelector(tag)?.textContent?.trim() ?? '';

    // Strip HTML tags from description
    const rawDesc = getText('description');
    const descText = rawDesc.replace(/<[^>]+>/g, '').trim();

    // Try enclosure for image thumbnail
    const thumbnail =
      item.querySelector('enclosure')?.getAttribute('url') ||
      undefined;

    return {
      title: getText('title'),
      pubDate: getText('pubDate') || new Date().toISOString(),
      language: 'English',
      source_id: 'The Guardian',
      link: getText('link') || getText('guid'),
      description: descText ? descText.slice(0, 350) + '…' : undefined,
      category: item.querySelector('category')?.textContent?.trim() ?? category,
      thumbnail,
    } satisfies NewsArticle;
  });
}

/**
 * Fetch articles from the Guardian for a given category and optional country.
 * The Vite dev server proxies /guardian-rss → https://www.theguardian.com
 *
 * @param category - Guardian category slug (default: 'environment')
 * @param count    - How many articles to return (default: 12)
 * @param country  - Optional ISO country code for regional feeds (e.g. 'us', 'gb', 'au')
 */
export async function fetchGuardianNews(
  category: GuardianCategory | string = 'environment',
  count = 12,
  country = ''
): Promise<NewsArticle[]> {
  // Map 'gb' to 'uk' as that's what Guardian uses.
  const prefix = country === 'gb' ? 'uk' : country;
  
  // Example: if category already has a prefix (like 'uk/environment'), don't double it.
  const path = (prefix && !category.includes('/')) 
    ? `${prefix}/${category}` 
    : category;

  // /guardian-rss/<path>/rss is proxied to https://www.theguardian.com/<path>/rss
  const proxyUrl = `${GUARDIAN_PROXY_BASE}/${path}/rss`;

  try {
    const xmlText = await fetchText(proxyUrl);
    const articles = parseGuardianRSS(xmlText, category);
    return articles.slice(0, count);
  } catch (err) {
    // If the regional RSS feed doesn't exist, fallback to the global one
    if (prefix) {
      console.warn(`Regional feed failed: ${path}/rss. Falling back to global ${category} feed.`);
      const fallbackUrl = `${GUARDIAN_PROXY_BASE}/${category}/rss`;
      const fallbackXml = await fetchText(fallbackUrl);
      const fallbackArticles = parseGuardianRSS(fallbackXml, category);
      return fallbackArticles.slice(0, count);
    }
    throw err;
  }
}
