import { NextRequest, NextResponse } from 'next/server';
import { HuntedDataResponse } from '@/lib/types';
import { bidDataStore } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    // Get bids by date if provided, otherwise get all bids
    let filteredBids = bidDataStore.getBids();
    
    if (date) {
      const targetDate = new Date(date);
      filteredBids = bidDataStore.getBidsByDate(targetDate);
    }

    const huntedData: HuntedDataResponse = {
      bids: filteredBids,
      total: filteredBids.length,
      date: date || new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({
      success: true,
      data: huntedData,
    });
  } catch (error) {
    console.error('Error fetching hunted data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hunted data',
      },
      { status: 500 }
    );
  }
}