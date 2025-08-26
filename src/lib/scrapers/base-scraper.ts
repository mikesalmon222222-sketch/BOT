import { BidData, BidDetails, Credentials, Portal } from '../types';

export interface ScrapingResult {
  success: boolean;
  bids: BidData[];
  message?: string;
  error?: string;
}

export interface ScrapingOptions {
  maxPages?: number;
  delay?: number;
  retryAttempts?: number;
}

export abstract class BaseScraper {
  protected portal: Portal;
  protected options: ScrapingOptions;

  constructor(portal: Portal, options: ScrapingOptions = {}) {
    this.portal = portal;
    this.options = {
      maxPages: 5,
      delay: 1000,
      retryAttempts: 3,
      ...options,
    };
  }

  /**
   * Login to the portal with provided credentials
   */
  abstract login(credentials: Credentials): Promise<boolean>;

  /**
   * Fetch all available bids from the portal
   */
  abstract fetchBids(): Promise<BidData[]>;

  /**
   * Extract detailed bid information from a specific bid URL
   */
  abstract extractBidDetails(bidUrl: string): Promise<BidDetails>;

  /**
   * Test connection to the portal
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Main scraping method that orchestrates the entire process
   */
  async scrape(credentials: Credentials): Promise<ScrapingResult> {
    try {
      console.log(`Starting scraping for portal: ${this.portal.name}`);

      // Test connection first
      const connectionTest = await this.testConnection();
      if (!connectionTest) {
        return {
          success: false,
          bids: [],
          error: `Cannot connect to portal: ${this.portal.name}`,
        };
      }

      // Login if credentials are provided
      if (credentials.username && credentials.password) {
        const loginSuccess = await this.login(credentials);
        if (!loginSuccess) {
          return {
            success: false,
            bids: [],
            error: `Login failed for portal: ${this.portal.name}`,
          };
        }
      }

      // Fetch bids
      const bids = await this.fetchBids();
      
      console.log(`Successfully scraped ${bids.length} bids from ${this.portal.name}`);
      
      return {
        success: true,
        bids,
        message: `Successfully scraped ${bids.length} bids from ${this.portal.name}`,
      };
    } catch (error) {
      console.error(`Scraping failed for ${this.portal.name}:`, error);
      return {
        success: false,
        bids: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Utility method to generate a unique ID for bids
   */
  protected generateBidId(portalId: string, title: string, postedDate?: Date): string {
    const date = postedDate?.getTime() || Date.now();
    const titleHash = title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `${portalId}-${titleHash}-${date}`;
  }

  /**
   * Utility method to parse dates from various formats
   */
  protected parseDate(dateString: string): Date | null {
    try {
      // Try different date formats
      const formats = [
        /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY or M/D/YYYY
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{1,2}-\d{1,2}-\d{4}$/, // MM-DD-YYYY or M-D-YYYY
      ];

      for (const format of formats) {
        if (format.test(dateString)) {
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }

      // Fallback to Date constructor
      const date = new Date(dateString);
      return !isNaN(date.getTime()) ? date : null;
    } catch {
      return null;
    }
  }

  /**
   * Utility method to extract amount from text
   */
  protected parseAmount(amountText: string): number {
    try {
      // Remove currency symbols and commas, extract numbers
      const cleanText = amountText.replace(/[$,\s]/g, '');
      const match = cleanText.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Add delay between requests to be respectful to the server
   */
  protected async delay(ms: number = this.options.delay || 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}