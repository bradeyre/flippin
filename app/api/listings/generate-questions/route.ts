import { NextRequest, NextResponse } from 'next/server';
import { generateProductQuestions } from '@/lib/ai/questions';

export async function POST(req: NextRequest) {
  try {
    const { visionAnalysis } = await req.json();

    if (!visionAnalysis) {
      return NextResponse.json(
        { error: 'Vision analysis is required' },
        { status: 400 }
      );
    }

    const questionSet = await generateProductQuestions(visionAnalysis);

    return NextResponse.json(questionSet);
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate questions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

