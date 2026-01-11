import { anthropic, CLAUDE_MODEL } from './client';
import { VisionAnalysisResult } from './vision';
import { retryWithBackoff } from '@/lib/utils/retry';

export interface GeneratedListing {
  title: string;
  description: string;
  suggestedTags: string[];
}

export async function generateListingCopy(
  visionAnalysis: VisionAnalysisResult,
  userNotes?: string
): Promise<GeneratedListing> {

  const prompt = `Write a comprehensive marketplace listing for South Africa's marketplace "Flippin":

ITEM DETAILS:
- Brand: ${visionAnalysis.brand}
- Model: ${visionAnalysis.model}
- Variant: ${visionAnalysis.variant || 'N/A'}
- Category: ${visionAnalysis.category}
- Condition: ${visionAnalysis.condition}
- Issues: ${visionAnalysis.detectedIssues.join(', ') || 'None'}
- Authenticity: ${visionAnalysis.authenticity}
- Confidence: ${visionAnalysis.confidence}

${userNotes ? `SELLER NOTES: ${userNotes}` : ''}

${visionAnalysis.photoQuality ? `PHOTO QUALITY: Score ${visionAnalysis.photoQuality.overallScore}/100. Issues: ${visionAnalysis.photoQuality.issues.join(', ')}` : ''}

${visionAnalysis.photoCompleteness ? `PHOTO COMPLETENESS: Missing angles: ${visionAnalysis.photoCompleteness.missingAngles.join(', ')}` : ''}

Write a COMPREHENSIVE listing that does 95% of the work for the seller:

1. **Title** (max 80 chars): 
   - Brand, model, key specs (storage, color, size), condition
   - Be specific and searchable
   - Include important details buyers care about

2. **Description** (8-12 sentences, detailed):
   - Opening: Engaging hook about the product
   - Condition: Honest, detailed condition assessment
   - Features: Key features and specifications
   - What's included: List all accessories, box, cables, etc.
   - What's NOT included: Be clear about missing items
   - Usage: How well it works, any quirks
   - History: If known, mention age/usage
   - Why selling: Brief, professional reason (if appropriate)
   - Call to action: Encourage questions, mention fast shipping
   - Be honest about condition - don't oversell but highlight positives

3. **Tags** (8-12 keywords): 
   - Include brand, model, category, key specs, condition keywords
   - Think like a buyer searching for this item

Tone: 
- Friendly but professional
- South African audience (use local terms naturally)
- Honest and trustworthy
- Highlight value and condition accurately
- Make it easy for buyers to make a decision

IMPORTANT: 
- If condition is GOOD or better, emphasize the value
- If condition is FAIR or POOR, be honest but highlight what still works well
- Mention authenticity status if relevant
- Include specific details that help buyers (storage, color, size, etc.)

Return ONLY JSON:
{
  "title": "Apple iPhone 13 Pro 256GB Space Gray - Excellent Condition",
  "description": "Selling my well-maintained iPhone 13 Pro in Space Gray with 256GB storage. This phone has been my daily driver for the past year and has been treated with care.\n\n**Condition:** The phone is in excellent working condition with all features functioning perfectly. There are minor scratches on the corners from normal use, but the screen is pristine with no cracks or scratches. The back glass is in great condition. Battery health is at 87% which is excellent for a phone of this age.\n\n**What's Included:** Phone only - no box, charger, or accessories included. I can include a basic charging cable if needed.\n\n**Specs:** 256GB storage, A15 Bionic chip, Triple camera system (12MP), Face ID, 5G capable, unlocked and ready to use on any network.\n\n**Why Selling:** Upgrading to a newer model. This phone has served me well and I'm confident it will do the same for the next owner.\n\nFeel free to ask any questions! Fast shipping available.",
  "suggestedTags": ["iphone", "apple", "smartphone", "iphone 13 pro", "256gb", "unlocked", "space gray", "ios", "excellent condition", "5g", "triple camera"]
}`;

  const response = await retryWithBackoff(
    async () => {
      return await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1500, // Increased for more detailed descriptions
        messages: [{ role: 'user', content: prompt }],
      });
    },
    {
      maxRetries: 3,
      initialDelayMs: 2000,
      maxDelayMs: 30000,
      backoffMultiplier: 2,
      retryableErrors: (error: any) => {
        const status = error?.status || error?.statusCode;
        // Only retry on server errors (5xx), NOT on rate limits (429)
        return status >= 500 && status < 600;
      },
    }
  );

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
