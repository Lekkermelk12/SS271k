import { NextResponse } from 'next/server';
import { fetchScreenerData } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tokens = await fetchScreenerData();
    return NextResponse.json({ pairs: tokens, timestamp: Date.now() });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token data', pairs: [] },
      { status: 500 }
    );
  }
}
