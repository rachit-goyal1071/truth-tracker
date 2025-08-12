import { PoliticalIncident } from './types';

export interface IncidentSource {
  name: string;
  type: 'rss' | 'api' | 'json';
  url: string;
  selector?: string;
  headers?: Record<string, string>;
  active: boolean;
  category: string;
}

export const INCIDENT_SOURCES: IncidentSource[] = [
  {
    name: 'Press Information Bureau',
    type: 'rss',
    url: 'https://pib.gov.in/rss/leng.xml',
    active: true,
    category: 'government'
  },
  {
    name: 'The Hindu - Politics',
    type: 'rss',
    url: 'https://www.thehindu.com/news/national/feeder/default.rss',
    active: true,
    category: 'news'
  },
  {
    name: 'The Wire - Politics',
    type: 'rss',
    url: 'https://thewire.in/politics/feed',
    active: true,
    category: 'news'
  },
  {
    name: 'Scroll.in - Politics',
    type: 'rss',
    url: 'https://scroll.in/politics/feed',
    active: true,
    category: 'news'
  },
  {
    name: 'Factly',
    type: 'rss',
    url: 'https://factly.in/feed/',
    active: true,
    category: 'fact-check'
  }
];

export interface RawIncidentData {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  content?: string;
}

export class IncidentDataFetcher {
  /**
   * Returns per-source raw items. This function does NOT save to Firestore —
   * saving happens in page.tsx (where createPendingIncident is called).
   */
  async fetchFromAllSources(): Promise<Array<{ source: IncidentSource; incidents: RawIncidentData[] }>> {
    const results: Array<{ source: IncidentSource; incidents: RawIncidentData[] }> = [];

    const activeSources = INCIDENT_SOURCES.filter(s => s.active);
    for (const source of activeSources) {
      console.log(`Fetching incidents from ${source.name}...`);

      try {
        const incidents = await this.fetchFromSource(source);
        results.push({ source, incidents });

        console.log(`[${source.name}] found ${incidents.length} incident(s)`);

        // Rate limiting - wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
        results.push({ source, incidents: [] });
      }
    }

    return results;
  }

  private async fetchFromSource(source: IncidentSource): Promise<RawIncidentData[]> {
    switch (source.type) {
      case 'rss':
        return await this.fetchRSS(source);
      case 'api':
        return await this.fetchAPI(source);
      case 'json':
        return await this.fetchJSON(source);
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  /**
   * IMPORTANT: this calls your internal API route /api/fetch-rss to avoid CORS.
   * That endpoint should fetch the remote RSS server-side and return the XML.
   */
  private async fetchRSS(source: IncidentSource): Promise<RawIncidentData[]> {
    try {
      const apiUrl = `/api/fetch-rss?url=${encodeURIComponent(source.url)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.error(`[${source.name}] /api/fetch-rss returned HTTP ${response.status}`);
        return [];
      }

      const xmlText = await response.text();
      console.log(`Fetched XML from ${source.name} (via /api/fetch-rss), length: ${xmlText.length}`);
      return this.parseRSSContent(xmlText, source.name);
    } catch (error) {
      console.error(`RSS fetch error for ${source.name}:`, error);
      return [];
    }
  }

  private async fetchAPI(source: IncidentSource): Promise<RawIncidentData[]> {
    try {
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Political Truth Tracker Bot 1.0',
          'Accept': 'application/json',
          ...source.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return this.normalizeAPIData(data, source.name);
    } catch (error) {
      console.error(`API fetch error for ${source.name}:`, error);
      return [];
    }
  }

  private async fetchJSON(source: IncidentSource): Promise<RawIncidentData[]> {
    try {
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Political Truth Tracker Bot 1.0',
          'Accept': 'application/json',
          ...source.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return this.normalizeJSONData(data, source.name);
    } catch (error) {
      console.error(`JSON fetch error for ${source.name}:`, error);
      return [];
    }
  }

  private parseRSSContent(xmlText: string, sourceName: string): RawIncidentData[] {
    const incidents: RawIncidentData[] = [];

    try {
      // Simple RSS parsing - extract items
      const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
      const items = xmlText.match(itemRegex) || [];

      for (const item of items) {
        const title = this.extractXMLContent(item, 'title');
        const description = this.extractXMLContent(item, 'description');
        const link = this.extractXMLContent(item, 'link');
        const pubDate = this.extractXMLContent(item, 'pubDate');

        if (title && this.isPoliticalIncident(title, description)) {
          incidents.push({
            title: this.cleanText(title),
            description: this.cleanText(description),
            link: link || '',
            pubDate: pubDate || new Date().toISOString(),
            source: sourceName,
            content: this.cleanText(description)
          });
        }
      }
    } catch (error) {
      console.error(`Error parsing RSS from ${sourceName}:`, error);
    }

    return incidents.slice(0, 20); // Limit to 20 items per source
  }

  private extractXMLContent(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    if (match && match[1]) {
      // Handle CDATA
      const cdataMatch = match[1].match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
      return cdataMatch ? cdataMatch[1] : match[1];
    }
    return '';
  }

  private normalizeAPIData(data: any, sourceName: string): RawIncidentData[] {
    const incidents: RawIncidentData[] = [];
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (typeof item === 'object' && item.title) {
          const title = item.title || '';
          const description = item.description || item.summary || item.content || '';

          if (this.isPoliticalIncident(title, description)) {
            incidents.push({
              title: this.cleanText(title),
              description: this.cleanText(description),
              link: item.url || item.link || '',
              pubDate: item.publishedAt || item.date || new Date().toISOString(),
              source: sourceName,
              content: this.cleanText(description)
            });
          }
        }
      });
    }
    return incidents.slice(0, 20);
  }

  private normalizeJSONData(data: any, sourceName: string): RawIncidentData[] {
    return this.normalizeAPIData(data, sourceName);
  }

  private isPoliticalIncident(title: string, description: string): boolean {
    const incidentKeywords = [
      'policy', 'scheme', 'implementation', 'failure', 'delayed', 'cancelled',
      'corruption', 'scam', 'bribe', 'embezzlement', 'fraud', 'misuse',
      'protest', 'demonstration', 'rally', 'violence', 'clash', 'arrest',
      'court', 'case', 'judgment', 'verdict', 'investigation', 'inquiry',
      'minister', 'government', 'parliament', 'assembly', 'election',
      'constituency', 'mla', 'mp', 'chief minister', 'prime minister',
      'controversy', 'allegation', 'accused', 'charged', 'suspended'
    ];

    const combinedText = `${title} ${description}`.toLowerCase();
    return incidentKeywords.some(keyword => combinedText.includes(keyword));
  }

  private cleanText(text: string): string {
    return (text || '')
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  normalizeToIncident(rawData: RawIncidentData): Omit<PoliticalIncident, 'id' | 'verified' | 'addedAt'> {
    return {
      title: rawData.title,
      description: rawData.description,
      category: this.categorizeIncident(rawData.title, rawData.description),
      date: this.normalizeDate(rawData.pubDate),
      source: rawData.source,
      sourceUrl: rawData.link,
    };
  }

  private categorizeIncident(title: string, description: string): PoliticalIncident['category'] {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('corruption') || text.includes('scam') || text.includes('bribe')) {
      return 'corruption';
    }
    if (text.includes('protest') || text.includes('demonstration') || text.includes('rally')) {
      return 'protest';
    }
    if (text.includes('violence') || text.includes('clash') || text.includes('attack')) {
      return 'violence';
    }
    if (text.includes('court') || text.includes('case') || text.includes('judgment')) {
      return 'legal-case';
    }
    if (text.includes('policy') || text.includes('scheme') || text.includes('implementation')) {
      return 'policy-failure';
    }
    return 'other';
  }

  private normalizeDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}