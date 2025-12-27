import { anthropic, CLAUDE_MODEL } from './client';
import { VisionAnalysisResult } from './vision';

export interface GeneratedListing {
  title: string;
  description: string;
  suggestedTags: string[];
}

export async function generateListingCopy(
  visionAnalysis: VisionAnalysisResult,
  userNotes?: string
): Promise<GeneratedListing> {

  const prompt = `Write a marketplace listing for South Africa's marketplace "Flippin":

ITEM:
- Brand: ${visionAnalysis.brand}
- Model: ${visionAnalysis.model}
- Variant: ${visionAnalysis.variant || 'N/A'}
- Condition: ${visionAnalysis.condition}
- Issues: ${visionAnalysis.detectedIssues.join(', ') || 'None'}

${userNotes ? `SELLER NOTES: ${userNotes}` : ''}

Write:
1. **Title** (max 80 chars): Brand, model, key specs, condition. Be specific and searchable.
2. **Description** (3-5 sentences): Professional, honest about condition. Highlight key features and any issues. Be upfront and trustworthy.
3. **Tags** (5-8 keywords): For search optimization

Tone: Friendly but professional. South African audience. Be honest about condition - don't oversell.

Return ONLY JSON:
{
  "title": "Apple iPhone 13 Pro 256GB Space Gray - Excellent Condition",
  "description": "Well-maintained iPhone 13 Pro in Space Gray with 256GB storage. The phone is in great working condition with all features functioning perfectly. Shows minor wear on the corners but screen is pristine. Battery health at 87%. Comes unlocked and ready to use on any network. No box or accessories included.",
  "suggestedTags": ["iphone", "apple", "smartphone", "iphone 13 pro", "256gb", "unlocked", "space gray", "ios"]
}`;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });

  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response');
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response');
  }

  return JSON.parse(jsonMatch[0]);
}
