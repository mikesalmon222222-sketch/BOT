import { NextRequest, NextResponse } from 'next/server';
import { ScraperFactory } from '@/lib/scrapers';
import { bidDataStore } from '@/lib/data-store';

export async function POST(request: NextRequest) {
  try {
    const { portalId, credentials } = await request.json();

    if (!portalId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Portal ID is required',
        },
        { status: 400 }
      );
    }

    // Get portal configuration
    const portal = bidDataStore.getPortal(portalId);
    if (!portal) {
      return NextResponse.json(
        {
          success: false,
          error: `Portal with ID ${portalId} not found`,
        },
        { status: 404 }
      );
    }

    // Check if scraper is supported
    if (!ScraperFactory.isPortalSupported(portal.name)) {
      return NextResponse.json(
        {
          success: false,
          error: `No scraper available for portal: ${portal.name}`,
        },
        { status: 400 }
      );
    }

    console.log(`Starting scraping for portal: ${portal.name}`);

    // Create and run scraper
    const scraper = ScraperFactory.createScraper(portal);
    const result = await scraper.scrape(credentials || {
      username: portal.username,
      password: portal.password,
    });

    if (result.success) {
      // Store the scraped bids
      bidDataStore.addBids(result.bids);
      
      // Update portal stats
      bidDataStore.updatePortal(portalId, {
        lastSync: new Date(),
        lastScraped: new Date(),
        bidCount: result.bids.length,
      });

      return NextResponse.json({
        success: true,
        data: {
          bids: result.bids,
          total: result.bids.length,
          portal: portal.name,
          message: result.message,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Scraping failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in portal scraping:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape portal',
      },
      { status: 500 }
    );
  }
}