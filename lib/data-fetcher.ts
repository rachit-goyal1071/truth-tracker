export interface DataSource {
  name: string;
  type: 'rss' | 'api' | 'scrape';
  url: string;
  selector?: string;
  headers?: Record<string, string>;
  active: boolean;
}

export const AUTHORIZED_SOURCES: DataSource[] = [
  // {
  //   name: 'Election Commission of India',
  //   type: 'api',
  //   url: 'https://eci.gov.in/api/candidate-affidavits',
  //   active: true
  // },
  // {
  //   name: 'PRS Legislative Research',
  //   type: 'rss',
  //   url: 'https://prsindia.org/rss/policy-updates',
  //   active: true
  // },
  // {
  //   name: 'MyNeta.info',
  //   type: 'api',
  //   url: 'https://myneta.info/api/candidates',
  //   active: true
  // },
  // {
  //   name: 'Factly.in Political Promises',
  //   type: 'rss',
  //   url: 'https://factly.in/category/politics/feed/',
  //   active: true
  // },
  {
    name: 'The Wire Politics',
    type: 'rss',
    url: 'https://thewire.in/politics/feed',
    active: true
  },
  // {
  //   name: 'Indian Express Politics',
  //   type: 'rss',
  //   url: 'https://indianexpress.com/section/india/politics/feed/',
  //   active: true
  // },
  // {
  //   name: 'Scroll.in Politics',
  //   type: 'rss',
  //   url: 'https://scroll.in/politics/feed',
  //   active: true
  // }
];

export class DataFetcher {
  async fetchFromSource(source: DataSource): Promise<string[]> {
    try {
      switch (source.type) {
        case 'rss':
          return await this.fetchRSS(source);
        case 'api':
          return await this.fetchAPI(source);
        case 'scrape':
          return await this.scrapeWebsite(source);
        default:
          throw new Error(`Unsupported source type: ${source.type}`);
      }
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
      return [];
    }
  }

  private async fetchRSS(source: DataSource): Promise<string[]> {
    try {
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Political Truth Tracker Bot 1.0',
          ...source.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      
      // Simple RSS parsing - extract content between <description> tags
      const descriptionRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>/;
      const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/;
      
      const descriptions: string[] = [];
      const titles: string[] = [];
      
      let match;
      while ((match = descriptionRegex.exec(xmlText)) !== null) {
        descriptions.push(match[1]);
      }
      
      while ((match = titleRegex.exec(xmlText)) !== null) {
        titles.push(match[1]);
      }

      // Combine titles and descriptions
      const content = [...titles, ...descriptions].filter(item => 
        item && 
        item.length > 50 && 
        this.isRelevantPoliticalContent(item)
      );

      return content;
    } catch (error) {
      console.error(`RSS fetch error for ${source.name}:`, error);
      return [];
    }
  }

  private async fetchAPI(source: DataSource): Promise<string[]> {
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
      
      // Extract text content from API response
      const content: string[] = [];
      
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (typeof item === 'object') {
            // Extract text from common fields
            const text = [
              item.title,
              item.description,
              item.content,
              item.summary,
              item.text
            ].filter(Boolean).join(' ');
            
            if (text && this.isRelevantPoliticalContent(text)) {
              content.push(text);
            }
          }
        });
      }

      return content;
    } catch (error) {
      console.error(`API fetch error for ${source.name}:`, error);
      return [];
    }
  }

  private async scrapeWebsite(source: DataSource): Promise<string[]> {
    // Note: Web scraping should be done server-side with proper tools
    // This is a simplified version for demonstration
    try {
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Political Truth Tracker Bot 1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Simple text extraction (in production, use proper HTML parsing)
      const textContent = html
        .replace(/<script[^>]*>.*?<\/script>/, '')
        .replace(/<style[^>]*>.*?<\/style>/, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const paragraphs = textContent
        .split(/[.!?]+/)
        .filter(p => p.length > 100 && this.isRelevantPoliticalContent(p));

      return paragraphs;
    } catch (error) {
      console.error(`Scraping error for ${source.name}:`, error);
      return [];
    }
  }

  private isRelevantPoliticalContent(text: string): boolean {
    const politicalKeywords = [
      'promise', 'pledge', 'commit', 'manifesto', 'policy', 'reform',
      'election', 'campaign', 'party', 'government', 'minister',
      'parliament', 'assembly', 'constituency', 'voter', 'citizen',
      'development', 'infrastructure', 'healthcare', 'education',
      'employment', 'economy', 'budget', 'scheme', 'program'
    ];

    const lowerText = text.toLowerCase();
    return politicalKeywords.some(keyword => lowerText.includes(keyword));
  }

  async getAllContent(): Promise<Array<{source: DataSource, content: string[]}>> {
    const results = [];
    
    for (const source of AUTHORIZED_SOURCES.filter(s => s.active)) {
      console.log(`Fetching from ${source.name}...`);
      
      const content = await this.fetchFromSource(source);
      results.push({ source, content });
      
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }
}
