import { BidData, Portal } from './types';

// Simple in-memory storage for scraped data
// In a production app, this would use a proper database
class BidDataStore {
  private bids: BidData[] = [];
  private portals: Portal[] = [];

  // Bid data methods
  addBids(newBids: BidData[]): void {
    // Remove duplicates and add new bids
    const existingIds = new Set(this.bids.map(bid => bid.id));
    const uniqueNewBids = newBids.filter(bid => !existingIds.has(bid.id));
    
    this.bids.push(...uniqueNewBids);
    
    // Keep only recent bids (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    this.bids = this.bids.filter(bid => 
      bid.fetchedAt >= thirtyDaysAgo || bid.status === 'active'
    );
  }

  getBids(): BidData[] {
    return [...this.bids];
  }

  getBidsByDate(date: Date): BidData[] {
    const targetDate = date.toDateString();
    return this.bids.filter(bid => 
      bid.fetchedAt.toDateString() === targetDate
    );
  }

  getBidsByPortal(portalId: string): BidData[] {
    return this.bids.filter(bid => bid.portalId === portalId);
  }

  getTodaysBids(): BidData[] {
    return this.getBidsByDate(new Date());
  }

  getActiveBids(): BidData[] {
    return this.bids.filter(bid => bid.status === 'active');
  }

  // Portal methods
  addPortal(portal: Portal): void {
    const existingIndex = this.portals.findIndex(p => p.id === portal.id);
    if (existingIndex >= 0) {
      this.portals[existingIndex] = portal;
    } else {
      this.portals.push(portal);
    }
  }

  getPortals(): Portal[] {
    return [...this.portals];
  }

  getPortal(id: string): Portal | undefined {
    return this.portals.find(p => p.id === id);
  }

  updatePortal(id: string, updates: Partial<Portal>): Portal | null {
    const index = this.portals.findIndex(p => p.id === id);
    if (index >= 0) {
      this.portals[index] = { ...this.portals[index], ...updates };
      return this.portals[index];
    }
    return null;
  }

  deletePortal(id: string): boolean {
    const index = this.portals.findIndex(p => p.id === id);
    if (index >= 0) {
      this.portals.splice(index, 1);
      // Also remove bids from this portal
      this.bids = this.bids.filter(bid => bid.portalId !== id);
      return true;
    }
    return false;
  }

  // Statistics methods
  getBidCountByPortal(): { portalId: string; portalName: string; count: number }[] {
    const counts = new Map<string, { portalName: string; count: number }>();
    
    this.bids.forEach(bid => {
      const existing = counts.get(bid.portalId);
      if (existing) {
        existing.count++;
      } else {
        counts.set(bid.portalId, {
          portalName: bid.portalName,
          count: 1,
        });
      }
    });

    return Array.from(counts.entries()).map(([portalId, data]) => ({
      portalId,
      portalName: data.portalName,
      count: data.count,
    }));
  }

  getTodaysBidCount(): number {
    return this.getTodaysBids().length;
  }

  clear(): void {
    this.bids = [];
    this.portals = [];
  }
}

// Create singleton instance
export const bidDataStore = new BidDataStore();

// Initialize with some default Metro portal configuration
bidDataStore.addPortal({
  id: '1',
  name: 'Metro',
  url: 'https://business.metro.net/webcenter/portal/VendorPortal/pages_home/solicitations/openSolicitations',
  baseUrl: 'https://business.metro.net',
  bidsUrl: 'https://business.metro.net/webcenter/portal/VendorPortal/pages_home/solicitations/openSolicitations',
  username: '',
  password: '',
  isActive: true,
  scraperType: 'playwright',
  lastSync: new Date(),
  bidCount: 0,
});