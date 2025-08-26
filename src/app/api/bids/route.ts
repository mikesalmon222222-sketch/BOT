import { NextResponse } from 'next/server';
import { HuntedDataResponse } from '@/lib/types';
import { bidDataStore } from '@/lib/data-store';

export async function GET() {
  try {
    const bids = bidDataStore.getBids();

    const huntedData: HuntedDataResponse = {
      bids,
      total: bids.length,
      date: new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({
      success: true,
      data: huntedData,
    });
  } catch (error) {
    console.error('Error fetching bids:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch bids',
      },
      { status: 500 }
    );
  }
}