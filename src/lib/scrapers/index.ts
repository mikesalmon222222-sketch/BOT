import { BaseScraper, ScrapingOptions } from './base-scraper';
import { MetroScraper } from './metro-scraper';
import { DemoScraper } from './demo-scraper';
import { SEPTAScraper } from './septa-scraper';
import { Portal } from '../types';

export class ScraperFactory {
  static createScraper(portal: Portal, options: ScrapingOptions = {}): BaseScraper {
    switch (portal.name.toLowerCase()) {
      case 'metro':
        // Always use DemoScraper for now since we can't install Playwright browsers in this environment
        console.log('Using demo scraper for Metro portal (Playwright not available in this environment)');
        return new DemoScraper(portal, options);
      case 'septa':
        console.log('Using SEPTA scraper for SEPTA vendor portal');
        return new SEPTAScraper(portal, options);
      // Future scrapers can be added here
      // case 'ohiobuys':
      //   return new OhioBuysScraper(portal, options);
      default:
        // Use demo scraper for unknown portals
        console.log(`No specific scraper for portal: ${portal.name}, using demo scraper`);
        return new DemoScraper(portal, options);
    }
  }

  static getSupportedPortals(): string[] {
    return ['metro', 'septa', 'demo']; // Add more as they're implemented
  }

  static isPortalSupported(portalName: string): boolean {
    return true; // Always supported via demo scraper or specific scrapers
  }
}

// Export for easy access
export { BaseScraper, MetroScraper, DemoScraper, SEPTAScraper };
export type { ScrapingResult, ScrapingOptions } from './base-scraper';