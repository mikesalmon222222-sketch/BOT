import { BaseScraper, ScrapingOptions } from './base-scraper';
import { BidData, BidDetails, Credentials, Portal } from '../types';

/**
 * Demo scraper that generates sample bid data for testing
 * This is used when Playwright is not available or for demonstration purposes
 */
export class DemoScraper extends BaseScraper {
  
  async testConnection(): Promise<boolean> {
    // Simulate connection test delay
    await this.delay(1000);
    return true;
  }

  async login(credentials: Credentials): Promise<boolean> {
    // Simulate login process
    console.log(`Demo login for ${this.portal.name} with user: ${credentials.username}`);
    await this.delay(500);
    return true;
  }

  async fetchBids(): Promise<BidData[]> {
    // Generate some sample bid data for demonstration
    const sampleBids: BidData[] = [
      {
        id: this.generateBidId(this.portal.id, 'Metro Rail Expansion Project', new Date()),
        title: 'Metro Rail Expansion Project - Phase 2',
        description: 'Construction and engineering services for metro rail system expansion including track laying, station construction, and electrical systems.',
        amount: 125000000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        portalId: this.portal.id,
        portalName: this.portal.name,
        url: `${this.portal.url}/bid/rail-expansion-2025`,
        sourceUrl: `${this.portal.url}/bid/rail-expansion-2025`,
        dateHunted: new Date(),
        fetchedAt: new Date(),
        status: 'active' as const,
        postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        quantity: '1 Complete System',
        documents: [
          {
            name: 'Technical Specifications.pdf',
            url: `${this.portal.url}/docs/tech-specs.pdf`,
            type: 'pdf'
          },
          {
            name: 'Bid Requirements.pdf',
            url: `${this.portal.url}/docs/requirements.pdf`,
            type: 'pdf'
          }
        ]
      },
      {
        id: this.generateBidId(this.portal.id, 'Bus Fleet Maintenance Services', new Date()),
        title: 'Bus Fleet Maintenance Services',
        description: 'Comprehensive maintenance and repair services for metro bus fleet including preventive maintenance, emergency repairs, and parts procurement.',
        amount: 8500000,
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        portalId: this.portal.id,
        portalName: this.portal.name,
        url: `${this.portal.url}/bid/bus-maintenance-2025`,
        sourceUrl: `${this.portal.url}/bid/bus-maintenance-2025`,
        dateHunted: new Date(),
        fetchedAt: new Date(),
        status: 'active' as const,
        postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        expirationDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        quantity: '500 Buses',
        documents: [
          {
            name: 'Service Agreement Template.pdf',
            url: `${this.portal.url}/docs/service-agreement.pdf`,
            type: 'pdf'
          }
        ]
      },
      {
        id: this.generateBidId(this.portal.id, 'Security Services Contract', new Date()),
        title: 'Security Services Contract - Transit Stations',
        description: 'Professional security services for metro transit stations including patrol services, monitoring, and emergency response.',
        amount: 3200000,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        portalId: this.portal.id,
        portalName: this.portal.name,
        url: `${this.portal.url}/bid/security-services-2025`,
        sourceUrl: `${this.portal.url}/bid/security-services-2025`,
        dateHunted: new Date(),
        fetchedAt: new Date(),
        status: 'active' as const,
        postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        quantity: '12 Stations',
        documents: [
          {
            name: 'Security Requirements.pdf',
            url: `${this.portal.url}/docs/security-reqs.pdf`,
            type: 'pdf'
          },
          {
            name: 'Station Maps.pdf',
            url: `${this.portal.url}/docs/station-maps.pdf`,
            type: 'pdf'
          }
        ]
      }
    ];

    // Simulate scraping delay
    await this.delay(2000);

    console.log(`Demo scraper generated ${sampleBids.length} sample bids for ${this.portal.name}`);
    return sampleBids;
  }

  async extractBidDetails(bidUrl: string): Promise<BidDetails> {
    // Simulate extracting detailed bid information
    await this.delay(1000);

    return {
      id: this.generateBidId(this.portal.id, 'Sample Bid', new Date()),
      title: 'Sample Bid Details',
      description: 'Detailed description of the sample bid for demonstration purposes.',
      quantity: '1 Unit',
      postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      documents: [
        {
          name: 'Sample Document.pdf',
          url: `${this.portal.url}/docs/sample.pdf`,
          type: 'pdf'
        }
      ],
      sourceUrl: bidUrl,
      amount: 1000000,
    };
  }
}