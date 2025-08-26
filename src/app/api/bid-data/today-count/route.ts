import { NextResponse } from 'next/server';
import { TodayCountResponse } from '@/lib/types';
import { mockData } from '@/lib/api';

export async function GET() {
  try {
    // Mock data for today's count
    const todayCountData: TodayCountResponse = {
      totalBids: mockData.bidData.length,
      portalCounts: [
        {
          portalId: '1',
          portalName: 'Metro',
          count: mockData.bidData.filter(bid => bid.portalId === '1').length,
        },
        {
          portalId: '2',
          portalName: 'OhioBuys',
          count: mockData.bidData.filter(bid => bid.portalId === '2').length,
        },
      ],
      lastUpdated: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: todayCountData,
    });
  } catch (error) {
    console.error('Error fetching today count:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch today count',
      },
      { status: 500 }
    );
  }
}