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

    console.log(`Testing connection for portal: ${portal.name}`);

    // Create scraper and test connection
    const scraper = ScraperFactory.createScraper(portal);
    const connectionTest = await scraper.testConnection();

    if (connectionTest) {
      return NextResponse.json({
        success: true,
        data: {
          portal: portal.name,
          status: 'Connected successfully',
          message: `Successfully connected to ${portal.name} portal`,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to connect to ${portal.name} portal`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error testing portal connection:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test connection',
      },
      { status: 500 }
    );
  }
}