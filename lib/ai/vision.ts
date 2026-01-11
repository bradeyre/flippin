import { anthropic, CLAUDE_MODEL } from './client';
import { retryWithBackoff } from '@/lib/utils/retry';

export interface PhotoQuality {
  overallScore: number; // 0-100
  issues: string[];
  suggestions: string[];
}

export interface PhotoCompleteness {
  hasFront: boolean;
  hasBack: boolean;
  hasSides: boolean;
  hasTop: boolean;
  hasBottom: boolean;
  hasScreen: boolean;
  hasAccessories: boolean;
  missingAngles: string[];
  recommendedAdditionalPhotos: string[];
}

export interface VisionAnalysisResult {
  prohibited?: boolean;
  prohibitionReason?: string;
  brand: string;
  model: string;
  variant?: string;
  category: string;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  detectedIssues: string[];
  authenticity: 'LIKELY_GENUINE' | 'QUESTIONABLE' | 'LIKELY_FAKE';
  confidence: number;
  needsMoreInfo: boolean;
  suggestedQuestions?: string[];
  photoQuality?: PhotoQuality;
  photoCompleteness?: PhotoCompleteness;
}

export async function analyzeProductImages(
  imageUrls: string[],
  userTitle?: string,
  userDescription?: string
): Promise<VisionAnalysisResult> {

  const prompt = `You are analyzing product images for a South African marketplace that ships via courier.

${userTitle ? `User title: "${userTitle}"` : ''}
${userDescription ? `User description: "${userDescription}"` : ''}

You have ${imageUrls.length} photo(s) to analyze.

CRITICAL SAFETY & POLICY CHECKS FIRST:

1. **Prohibited Items** (MUST set prohibited: true):
   - Weapons, firearms, ammunition, explosives
   - Drugs, narcotics, prescription medication
   - Alcohol, tobacco, vaping products
   - Animals, pets, livestock
   - Stolen goods, counterfeits, fakes
   - Adult/inappropriate content
   - Hazardous materials, chemicals

2. **Oversized Items** (MUST set prohibited: true with reason "too large for courier"):
   - Vehicles (cars, motorcycles, boats)
   - Large furniture (couches, beds, desks, tables)
   - Large appliances (refrigerators, washing machines, stoves)

If item is prohibited or oversized, return:
{
  "prohibited": true,
  "prohibitionReason": "clear reason why",
  ... (fill in other fields with best guess)
}

Otherwise, analyze and extract:

1. **Brand**: Manufacturer (e.g., "Apple", "Samsung", "Leatherman")
2. **Model**: Specific model (e.g., "iPhone 13 Pro", "Charge TTI")
3. **Variant**: Storage/color if visible (e.g., "256GB Space Gray")
4. **Category**: Product category (e.g., "Smartphones", "Multi-tools", "Laptops")
5. **Condition**: NEW, LIKE_NEW, GOOD, FAIR, or POOR based on visible wear
6. **Detected Issues**: List visible damage/wear
7. **Authenticity**: LIKELY_GENUINE, QUESTIONABLE, or LIKELY_FAKE
8. **Confidence**: 0.0 to 1.0 (how certain you are)
9. **NeedsMoreInfo**: true if you need more photos/details to be certain
10. **SuggestedQuestions**: Questions to ask seller for clarity (if needsMoreInfo is true)

11. **Photo Quality Analysis**:
    - Assess overall photo quality (0-100 score)
    - Check: lighting (too dark/bright?), focus (blurry?), background (cluttered?), angle (distorted?)
    - List specific issues found
    - Provide actionable suggestions to improve photos

12. **Photo Completeness Analysis**:
    - For the product category, determine what angles/photos are essential
    - Check which angles are present: front, back, sides, top, bottom, screen (if applicable), accessories
    - List missing angles that would help buyers
    - Recommend specific additional photos needed (e.g., "Close-up of screen", "Photo of all sides", "Photo with accessories")

PHOTO QUALITY GUIDELINES:
- Good lighting: Clear, even lighting without harsh shadows
- Focus: Sharp, not blurry
- Background: Clean, uncluttered (white/neutral preferred)
- Angle: Straight, not distorted
- Coverage: Product fills frame appropriately

PHOTO COMPLETENESS BY CATEGORY:
- Smartphones: Front, back, all 4 sides, screen on, accessories (charger, box if available)
- Laptops: Top (keyboard), bottom, screen open, ports/sides, accessories
- Cameras: Front, back, top, bottom, lens close-up, accessories
- Gaming Consoles: Front, back, all sides, ports, accessories (controllers, cables)
- General: Front, back, sides, any unique features, accessories

Return ONLY valid JSON:
{
  "brand": "Apple",
  "model": "iPhone 13 Pro",
  "variant": "256GB Space Gray",
  "category": "Smartphones",
  "condition": "GOOD",
  "detectedIssues": ["Minor scratches on corners"],
  "authenticity": "LIKELY_GENUINE",
  "confidence": 0.9,
  "needsMoreInfo": false,
  "suggestedQuestions": [],
  "photoQuality": {
    "overallScore": 85,
    "issues": ["Slight overexposure in one photo", "Background could be cleaner"],
    "suggestions": ["Use natural lighting or soft indoor light", "Use a plain white or neutral background", "Ensure product is in focus"]
  },
  "photoCompleteness": {
    "hasFront": true,
    "hasBack": true,
    "hasSides": false,
    "hasTop": false,
    "hasBottom": false,
    "hasScreen": true,
    "hasAccessories": false,
    "missingAngles": ["Left side", "Right side", "Top view", "Bottom view"],
    "recommendedAdditionalPhotos": [
      "Photo of left side showing ports",
      "Photo of right side showing buttons",
      "Photo of top showing camera array",
      "Photo of bottom showing charging port",
      "Photo with accessories (charger, box) if available"
    ]
  }
}

If you can't determine model/storage from photos:
{
  "brand": "Apple",
  "model": "iPhone (model unclear)",
  "category": "Smartphones",
  "condition": "GOOD",
  "detectedIssues": [],
  "authenticity": "LIKELY_GENUINE",
  "confidence": 0.5,
  "needsMoreInfo": true,
  "suggestedQuestions": [
    "What iPhone model is this? (iPhone 13 Pro, iPhone 14, etc.)",
    "What storage capacity? (128GB, 256GB, 512GB, 1TB)",
    "What is the battery health percentage? (Go to Settings > Battery > Battery Health)",
    "Can you upload a photo of Settings > General > About (shows IMEI & storage)?"
  ],
  "photoQuality": {
    "overallScore": 70,
    "issues": ["Could use better lighting", "Some photos are slightly blurry"],
    "suggestions": ["Use better lighting", "Ensure camera is in focus", "Take photos in a well-lit area"]
  },
  "photoCompleteness": {
    "hasFront": true,
    "hasBack": false,
    "hasSides": false,
    "hasTop": false,
    "hasBottom": false,
    "hasScreen": true,
    "hasAccessories": false,
    "missingAngles": ["Back", "All sides", "Top", "Bottom"],
    "recommendedAdditionalPhotos": [
      "Photo of back of phone",
      "Photo showing all sides",
      "Photo of Settings > General > About screen (shows model and storage)"
    ]
  }
}`;

  // Convert image URLs to appropriate format for Claude
  const imageContent = imageUrls.map((url, index) => {
    // Check if it's a data URL (base64)
    if (url.startsWith('data:image/')) {
      const [header, base64Data] = url.split(',');
      
      if (!base64Data) {
        throw new Error(`Image ${index + 1}: Invalid base64 data URL format`);
      }
      
      const mediaType = header.match(/data:(.*?);/)?.[1] || 'image/jpeg';

      console.log('Processing base64 image:', {
        mediaType,
        dataLength: base64Data.length,
        headerSample: header.substring(0, 50),
      });

      return {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: base64Data,
        },
      };
    } else {
      // It's a regular URL
      if (!url || url.trim() === '') {
        throw new Error(`Image ${index + 1}: Empty or invalid URL`);
      }
      
      console.log('Processing URL image:', url.substring(0, 100));
      return {
        type: 'image' as const,
        source: { type: 'url' as const, url },
      };
    }
  });

  console.log('Calling Anthropic API with', imageContent.length, 'images');

  let response;
  try {
    // Use retry logic with exponential backoff for rate limits and transient errors
    response = await retryWithBackoff(
      async () => {
        return await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 2048, // Increased for more detailed analysis
          messages: [
            {
              role: 'user',
              content: [
                ...imageContent,
                { type: 'text' as const, text: prompt },
              ],
            },
          ],
        });
      },
      {
        maxRetries: 3,
        initialDelayMs: 2000, // Start with 2 second delay
        maxDelayMs: 30000, // Max 30 second delay
        backoffMultiplier: 2,
        retryableErrors: (error: any) => {
          const status = error?.status || error?.statusCode;
          // Retry on rate limits (429) and server errors (5xx)
          return status === 429 || (status >= 500 && status < 600);
        },
      }
    );

    console.log('Anthropic API response received');
  } catch (apiError: any) {
    console.error('Anthropic API error (after retries):', {
      error: apiError,
      message: apiError?.message,
      status: apiError?.status,
      statusCode: apiError?.statusCode,
      type: apiError?.type,
    });
    
    // Provide more helpful error messages
    if (apiError?.status === 401 || apiError?.statusCode === 401) {
      throw new Error('ANTHROPIC_API_KEY is invalid or missing. Please check your environment variables.');
    }
    
    if (apiError?.status === 429 || apiError?.statusCode === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    
    if (apiError?.message) {
      throw new Error(`Anthropic API error: ${apiError.message}`);
    }
    
    throw apiError;
  }

  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from AI');
  }

  return JSON.parse(jsonMatch[0]);
}

export async function analyzeAdditionalPhotos(
  existingAnalysis: VisionAnalysisResult,
  additionalImageUrls: string[],
  userAnswers?: Record<string, string>
): Promise<VisionAnalysisResult> {

  const prompt = `Previous analysis of this item:
${JSON.stringify(existingAnalysis, null, 2)}

${userAnswers ? `User provided answers:\n${JSON.stringify(userAnswers, null, 2)}` : ''}

Now analyzing additional photos provided by the seller.

Update the analysis with any new information. Return complete updated JSON in same format.`;

  // Use retry logic with exponential backoff for rate limits
  const response = await retryWithBackoff(
    async () => {
      return await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              ...additionalImageUrls.map(url => ({
                type: 'image' as const,
                source: { type: 'url' as const, url },
              })),
              { type: 'text' as const, text: prompt },
            ],
          },
        ],
      });
    },
    {
      maxRetries: 3,
      initialDelayMs: 2000,
      maxDelayMs: 30000,
      backoffMultiplier: 2,
      retryableErrors: (error: any) => {
        const status = error?.status || error?.statusCode;
        return status === 429 || (status >= 500 && status < 600);
      },
    }
  );

  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from AI');
  }

  return JSON.parse(jsonMatch[0]);
}
