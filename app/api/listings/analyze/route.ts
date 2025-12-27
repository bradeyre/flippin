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

    const { imageUrls, userTitle, userDescription } = await req.json();

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
    console.error('Error analyzing listing:', error);
    return NextResponse.json(
      { error: 'Failed to analyze listing', details: (error as Error).message },
      { status: 500 }
    );
  }
}
