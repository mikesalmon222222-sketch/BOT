import { NextRequest, NextResponse } from 'next/server';
import { Portal } from '@/lib/types';
import { mockData } from '@/lib/api';

// Mock in-memory storage (in real app, this would be a database)
let portals: Portal[] = [...mockData.portals];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const portalIndex = portals.findIndex(p => p.id === id);
    if (portalIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Portal not found',
        },
        { status: 404 }
      );
    }

    portals[portalIndex] = {
      ...portals[portalIndex],
      ...body,
      lastSync: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: portals[portalIndex],
    });
  } catch (error) {
    console.error('Error updating portal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update portal',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const portalIndex = portals.findIndex(p => p.id === id);
    if (portalIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Portal not found',
        },
        { status: 404 }
      );
    }

    portals.splice(portalIndex, 1);

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Error deleting portal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete portal',
      },
      { status: 500 }
    );
  }
}