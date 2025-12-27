import { NextRequest, NextResponse } from 'next/server';
import { analyzeProductImages } from '@/lib/ai/vision';
import { generatePricing } from '@/lib/ai/pricing';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // TODO: Re-enable auth once we have login
    // const supabase = await createClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body', details: 'Could not parse JSON' },
        { status: 400 }
      );
    }

    const { imageUrls, userTitle, userDescription } = body;

    console.log('Analyze request received:', {
      imageCount: imageUrls?.length,
      hasTitle: !!userTitle,
      hasDescription: !!userDescription,
      imageType: imageUrls?.[0]?.substring(0, 30) + '...',
    });

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // AI vision analysis
    console.log('Starting AI vision analysis...');
    const visionAnalysis = await analyzeProductImages(
      imageUrls,
      userTitle,
      userDescription
    );
    console.log('Vision analysis complete:', visionAnalysis);

    // Get pricing if we have enough info
    let pricing = null;
    if (!visionAnalysis.needsMoreInfo) {
      pricing = await generatePricing(
        visionAnalysis.brand,
        visionAnalysis.model,
        visionAnalysis.variant || null,
        visionAnalysis.condition,
        visionAnalysis.category
      );
    }

    return NextResponse.json({
      visionAnalysis,
      pricing,
    });
  } catch (error) {
    // Log full error details for debugging
    console.error('Error analyzing listing:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    
    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    // Check for common issues
    if (errorMessage.includes('ANTHROPIC_API_KEY') || errorName === 'Error' && errorMessage.includes('environment variable')) {
      return NextResponse.json(
        {
          error: 'AI service configuration error',
          details: 'Anthropic API key is missing or invalid. Please check your environment variables in Vercel.',
          hint: 'Go to Vercel Dashboard → Your Project → Settings → Environment Variables and add ANTHROPIC_API_KEY',
        },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes('Invalid JSON') || errorMessage.includes('No text response')) {
      return NextResponse.json(
        {
          error: 'AI analysis error',
          details: 'The AI service returned an unexpected response. Please try again with clearer images.',
        },
        { status: 500 }
      );
    }
    
    // Check for API authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
      return NextResponse.json(
        {
          error: 'AI service authentication failed',
          details: 'The Anthropic API key is invalid or expired. Please check your API key.',
        },
        { status: 500 }
      );
    }
    
    // Check for API rate limit errors
    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'AI service rate limit exceeded',
          details: 'Too many requests to the AI service. Please try again in a moment.',
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'Failed to analyze listing',
        details: errorMessage,
        hint: 'Check server logs for more details. Common issues: missing ANTHROPIC_API_KEY or invalid image URLs.',
      },
      { status: 500 }
    );
  }
}
