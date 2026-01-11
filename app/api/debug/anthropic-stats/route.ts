import { NextRequest, NextResponse } from 'next/server';
import { getApiCallStats } from '@/lib/ai/client';

/**
 * Debug endpoint to view Anthropic API call statistics
 * Useful for diagnosing rate limit issues
 */
export async function GET(req: NextRequest) {
  try {
    const stats = getApiCallStats();
    
    return NextResponse.json({
      stats,
      message: 'Anthropic API call statistics',
      note: 'Check Vercel function logs for detailed request IDs and error information',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get stats',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
