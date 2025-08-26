import { chromium, Browser, Page } from 'playwright';
import { BaseScraper, ScrapingOptions } from './base-scraper';
import { BidData, BidDetails, Credentials, Portal, Document } from '../types';

// Metro portal specific selectors
const METRO_SELECTORS = {
  // These will need to be updated after analyzing the actual portal
  loginForm: 'form[action*="login"]',
  usernameField: 'input[name="username"], input[type="text"], #username',
  passwordField: 'input[name="password"], input[type="password"], #password',
  loginButton: 'button[type="submit"], input[type="submit"]',
  
  // Bid listing selectors (these are examples and need real analysis)
  bidsList: '.solicitation-item, .bid-row, tr:has(.bid-title)',
  bidTitle: '.bid-title, .solicitation-title, td:first-child a',
  bidDescription: '.bid-description, .solicitation-description, .description',
  postedDate: '.posted-date, .date-posted, .creation-date',
  expirationDate: '.expiration-date, .closing-date, .deadline',
  bidAmount: '.bid-amount, .estimated-value, .amount',
  bidUrl: 'a[href*="solicitation"], a[href*="bid"]',
  documents: '.document-links a, .attachments a, a[href*=".pdf"]',
  
  // Pagination
  nextPage: '.pagination .next, .pager .next, button:contains("Next")',
  pageNumbers: '.pagination a, .pager a',
};

export class MetroScraper extends BaseScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor(portal: Portal, options: ScrapingOptions = {}) {
    super(portal, options);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.initBrowser();
      
      if (!this.page) {
        return false;
      }

      // Navigate to the Metro portal
      const response = await this.page.goto(this.portal.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      if (!response || response.status() !== 200) {
        return false;
      }

      // Check if the page loaded correctly
      const title = await this.page.title();
      return title.toLowerCase().includes('metro') || 
             title.toLowerCase().includes('vendor') ||
             title.toLowerCase().includes('solicitation');
    } catch (error) {
      console.error('Metro portal connection test failed:', error);
      // If Playwright fails, try falling back to demo scraper
      throw new Error('Playwright not available - use demo scraper');
    } finally {
      await this.cleanup();
    }
  }

  async login(credentials: Credentials): Promise<boolean> {
    try {
      if (!this.page) {
        await this.initBrowser();
      }

      if (!this.page) {
        throw new Error('Failed to initialize browser');
      }

      // Navigate to login page or portal
      await this.page.goto(this.portal.url, { waitUntil: 'networkidle' });

      // Look for login form
      const loginForm = await this.page.locator(METRO_SELECTORS.loginForm).first();
      if (await loginForm.count() === 0) {
        console.log('No login form found, assuming public access');
        return true;
      }

      // Fill credentials
      await this.page.fill(METRO_SELECTORS.usernameField, credentials.username);
      await this.page.fill(METRO_SELECTORS.passwordField, credentials.password);
      
      // Submit login
      await this.page.click(METRO_SELECTORS.loginButton);
      await this.page.waitForLoadState('networkidle');

      // Check if login was successful (look for error messages or dashboard)
      const url = this.page.url();
      const content = await this.page.content();
      
      // Simple check: if URL changed or we don't see login form anymore
      return !content.toLowerCase().includes('login failed') && 
             !content.toLowerCase().includes('invalid credentials');
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  async fetchBids(): Promise<BidData[]> {
    const bids: BidData[] = [];

    try {
      if (!this.page) {
        await this.initBrowser();
      }

      if (!this.page) {
        throw new Error('Failed to initialize browser');
      }

      // Navigate to solicitations page
      await this.page.goto(this.portal.url, { waitUntil: 'networkidle' });

      let currentPage = 1;
      const maxPages = this.options.maxPages || 5;

      while (currentPage <= maxPages) {
        console.log(`Scraping page ${currentPage} for Metro portal`);

        // Wait for bid listings to load
        await this.page.waitForSelector(METRO_SELECTORS.bidsList, { timeout: 10000 });

        // Extract bids from current page
        const pageBids = await this.extractBidsFromPage();
        bids.push(...pageBids);

        // Check for next page
        const nextPageButton = this.page.locator(METRO_SELECTORS.nextPage);
        if (await nextPageButton.count() === 0 || currentPage >= maxPages) {
          break;
        }

        // Go to next page
        await nextPageButton.click();
        await this.page.waitForLoadState('networkidle');
        await this.delay();

        currentPage++;
      }

      console.log(`Extracted ${bids.length} bids from Metro portal`);
      return bids;
    } catch (error) {
      console.error('Error fetching bids from Metro portal:', error);
      return bids; // Return whatever we managed to get
    }
  }

  async extractBidDetails(bidUrl: string): Promise<BidDetails> {
    try {
      if (!this.page) {
        await this.initBrowser();
      }

      if (!this.page) {
        throw new Error('Failed to initialize browser');
      }

      await this.page.goto(bidUrl, { waitUntil: 'networkidle' });

      // Extract detailed information
      const title = await this.extractText('.solicitation-title, .bid-title, h1, h2');
      const description = await this.extractText('.description, .solicitation-description, .bid-description');
      const quantity = await this.extractText('.quantity, .bid-quantity, .estimated-quantity');
      
      const postedDateText = await this.extractText(METRO_SELECTORS.postedDate);
      const expirationDateText = await this.extractText(METRO_SELECTORS.expirationDate);
      
      const postedDate = postedDateText ? this.parseDate(postedDateText) : undefined;
      const expirationDate = expirationDateText ? this.parseDate(expirationDateText) : new Date();

      // Extract documents
      const documents = await this.extractDocuments();

      // Extract amount if available
      const amountText = await this.extractText(METRO_SELECTORS.bidAmount);
      const amount = amountText ? this.parseAmount(amountText) : undefined;

      return {
        id: this.generateBidId(this.portal.id, title || 'Untitled', postedDate || undefined),
        title: title || 'Untitled Bid',
        description: description || 'No description available',
        quantity: quantity || undefined,
        postedDate: postedDate || undefined,
        expirationDate: expirationDate || new Date(),
        documents,
        sourceUrl: bidUrl,
        amount,
      };
    } catch (error) {
      console.error('Error extracting bid details:', error);
      throw error;
    }
  }

  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      });
    }

    if (!this.page) {
      this.page = await this.browser.newPage({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      });
    }
  }

  private async extractBidsFromPage(): Promise<BidData[]> {
    if (!this.page) return [];

    const bids: BidData[] = [];

    try {
      // Get all bid elements
      const bidElements = await this.page.locator(METRO_SELECTORS.bidsList).all();

      for (const bidElement of bidElements) {
        try {
          // Extract basic information
          const title = await bidElement.locator(METRO_SELECTORS.bidTitle).textContent() || 'Untitled';
          const description = await bidElement.locator(METRO_SELECTORS.bidDescription).textContent() || '';
          
          // Extract URL
          const linkElement = bidElement.locator(METRO_SELECTORS.bidUrl);
          const href = await linkElement.getAttribute('href') || '';
          const bidUrl = href.startsWith('http') ? href : `${this.portal.baseUrl || this.portal.url}${href}`;

          // Extract dates
          const postedDateText = await bidElement.locator(METRO_SELECTORS.postedDate).textContent() || '';
          const expirationDateText = await bidElement.locator(METRO_SELECTORS.expirationDate).textContent() || '';
          
          const postedDate = this.parseDate(postedDateText);
          const expirationDate = this.parseDate(expirationDateText) || new Date();

          // Extract amount
          const amountText = await bidElement.locator(METRO_SELECTORS.bidAmount).textContent() || '';
          const amount = this.parseAmount(amountText);

          // Create bid object
          const bid: BidData = {
            id: this.generateBidId(this.portal.id, title, postedDate || undefined),
            title: title.trim(),
            description: description.trim(),
            amount,
            deadline: expirationDate,
            portalId: this.portal.id,
            portalName: this.portal.name,
            url: bidUrl,
            sourceUrl: bidUrl,
            dateHunted: new Date(),
            fetchedAt: new Date(),
            status: expirationDate > new Date() ? 'active' : 'expired',
            postedDate: postedDate || undefined,
            expirationDate,
          };

          bids.push(bid);
        } catch (error) {
          console.warn('Error extracting individual bid:', error);
          // Continue with next bid
        }
      }
    } catch (error) {
      console.error('Error extracting bids from page:', error);
    }

    return bids;
  }

  private async extractText(selector: string): Promise<string | null> {
    if (!this.page) return null;

    try {
      const element = this.page.locator(selector).first();
      return await element.textContent();
    } catch {
      return null;
    }
  }

  private async extractDocuments(): Promise<Document[]> {
    if (!this.page) return [];

    const documents: Document[] = [];

    try {
      const docElements = await this.page.locator(METRO_SELECTORS.documents).all();

      for (const docElement of docElements) {
        try {
          const name = await docElement.textContent() || 'Document';
          const href = await docElement.getAttribute('href') || '';
          const url = href.startsWith('http') ? href : `${this.portal.baseUrl || this.portal.url}${href}`;

          documents.push({
            name: name.trim(),
            url,
            type: url.includes('.pdf') ? 'pdf' : 'document',
          });
        } catch (error) {
          console.warn('Error extracting document:', error);
        }
      }
    } catch (error) {
      console.warn('Error extracting documents:', error);
    }

    return documents;
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Ensure cleanup on process exit
  async destroy(): Promise<void> {
    await this.cleanup();
  }
}