import { NextResponse } from 'next/server';
import { HuntedDataResponse } from '@/lib/types';
import { bidDataStore } from '@/lib/data-store';
import { ScraperFactory } from '@/lib/scrapers';

export async function POST() {
  try {
    console.log('Refreshing bid data from all active portals...');
    
    // Get all active portals
    const portals = bidDataStore.getPortals().filter(portal => portal.isActive);
    
    if (portals.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          bids: [],
          total: 0,
          date: new Date().toISOString().split('T')[0],
        },
        message: 'No active portals configured',
      });
    }

    let allNewBids = [];
    let scrapingResults = [];

    // Scrape each active portal
    for (const portal of portals) {
      try {
        if (!ScraperFactory.isPortalSupported(portal.name)) {
          console.warn(`Skipping unsupported portal: ${portal.name}`);
          continue;
        }

        console.log(`Scraping portal: ${portal.name}`);
        
        const scraper = ScraperFactory.createScraper(portal);
        const result = await scraper.scrape({
          username: portal.username,
          password: portal.password,
        });

        if (result.success) {
          allNewBids.push(...result.bids);
          
          // Update portal stats
          bidDataStore.updatePortal(portal.id, {
            lastSync: new Date(),
            lastScraped: new Date(),
            bidCount: result.bids.length,
          });

          scrapingResults.push({
            portal: portal.name,
            success: true,
            count: result.bids.length,
          });
        } else {
          console.error(`Scraping failed for ${portal.name}:`, result.error);
          scrapingResults.push({
            portal: portal.name,
            success: false,
            error: result.error,
          });
        }
      } catch (error) {
        console.error(`Error scraping portal ${portal.name}:`, error);
        scrapingResults.push({
          portal: portal.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Store all new bids
    if (allNewBids.length > 0) {
      bidDataStore.addBids(allNewBids);
    }

    // Get all current bids to return
    const allBids = bidDataStore.getBids();

    const huntedData: HuntedDataResponse = {
      bids: allBids,
      total: allBids.length,
      date: new Date().toISOString().split('T')[0],
    };

    const successfulScrapes = scrapingResults.filter(r => r.success).length;
    const totalNewBids = allNewBids.length;

    return NextResponse.json({
      success: true,
      data: huntedData,
      message: `Data refreshed successfully. ${successfulScrapes}/${portals.length} portals scraped, ${totalNewBids} new bids found.`,
      scrapingResults,
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh data',
      },
      { status: 500 }
    );
  }
}