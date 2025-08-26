import { NextRequest, NextResponse } from 'next/server';
import { Portal } from '@/lib/types';
import { mockData } from '@/lib/api';

// Mock in-memory storage (in real app, this would be a database)
let portals: Portal[] = [...mockData.portals];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: portals,
    });
  } catch (error) {
    console.error('Error fetching portals:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch portals',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newPortal: Portal = {
      ...body,
      id: Date.now().toString(),
      lastSync: new Date(),
      bidCount: 0,
    };

    portals.push(newPortal);

    return NextResponse.json({
      success: true,
      data: newPortal,
    });
  } catch (error) {
    console.error('Error creating portal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create portal',
      },
      { status: 500 }
    );
  }
}