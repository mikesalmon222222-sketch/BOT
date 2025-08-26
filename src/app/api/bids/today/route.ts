import { NextResponse } from 'next/server';
import { TodayCountResponse } from '@/lib/types';
import { bidDataStore } from '@/lib/data-store';

export async function GET() {
  try {
    const todaysBids = bidDataStore.getTodaysBids();
    const portalCounts = bidDataStore.getBidCountByPortal();

    const todayCountData: TodayCountResponse = {
      totalBids: todaysBids.length,
      portalCounts,
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