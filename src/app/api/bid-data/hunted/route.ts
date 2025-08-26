import { NextRequest, NextResponse } from 'next/server';
import { HuntedDataResponse } from '@/lib/types';
import { mockData } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    // Filter mock data by date if provided
    let filteredBids = mockData.bidData;
    
    if (date) {
      const targetDate = new Date(date);
      filteredBids = mockData.bidData.filter(bid => {
        const bidDate = new Date(bid.dateHunted);
        return bidDate.toDateString() === targetDate.toDateString();
      });
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