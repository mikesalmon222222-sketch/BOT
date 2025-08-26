import { NextRequest, NextResponse } from 'next/server';
import { Portal } from '@/lib/types';
import { bidDataStore } from '@/lib/data-store';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updatedPortal = bidDataStore.updatePortal(id, {
      ...body,
      lastSync: new Date(),
    });

    if (!updatedPortal) {
      return NextResponse.json(
        {
          success: false,
          error: 'Portal not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedPortal,
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
    
    const deleted = bidDataStore.deletePortal(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Portal not found',
        },
        { status: 404 }
      );
    }

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