import { anthropic, CLAUDE_MODEL } from './client';
import { VisionAnalysisResult } from './vision';
import { retryWithBackoff } from '@/lib/utils/retry';

export interface DynamicQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'multiselect';
  options?: string[];
  required: boolean;
  helpText?: string;
  category: string; // e.g., 'accessories', 'condition', 'specs', 'history'
}

export interface QuestionSet {
  questions: DynamicQuestion[];
  reasoning: string; // Why these questions are important
}

/**
 * Generate dynamic, product-specific questions using AI
 * This ensures we get all relevant info for any product type
 */
export async function generateProductQuestions(
  visionAnalysis: VisionAnalysisResult,
  existingAnswers?: Record<string, any>
): Promise<QuestionSet> {
  const prompt = `You are helping a seller list their item on a South African marketplace.

PRODUCT DETAILS:
- Brand: ${visionAnalysis.brand}
- Model: ${visionAnalysis.model}
- Variant: ${visionAnalysis.variant || 'N/A'}
- Category: ${visionAnalysis.category}
- Condition: ${visionAnalysis.condition}
- Detected Issues: ${visionAnalysis.detectedIssues.join(', ') || 'None'}

${existingAnswers ? `ALREADY ANSWERED:\n${JSON.stringify(existingAnswers, null, 2)}` : ''}

Generate 5-10 SPECIFIC, PRODUCT-RELEVANT questions that buyers would want to know.

EXAMPLES:
- For Xbox/PlayStation: "How many controllers included?", "What games are included?", "Original box?", "Online account included?"
- For Laptops: "Battery health?", "Charger included?", "Original box?", "Any software pre-installed?"
- For Phones: "Battery health percentage?", "Screen protector?", "Original box and charger?", "Unlocked or network-locked?"
- For Cameras: "Lens included?", "Memory card included?", "Original box?", "How many photos taken (shutter count)?"
- For Headphones: "Original box?", "Cable included?", "Carrying case?", "Any wear on ear pads?"

RULES:
1. Ask SPECIFIC questions buyers care about for THIS product type
2. Mix question types: some yes/no, some text, some numbers, some multi-select
3. Don't ask obvious things already visible in photos
4. Focus on: accessories, specs not visible, usage history, what's included
5. Make questions friendly and conversational
6. Include helpful hints where relevant (e.g., "Check Settings > Battery > Battery Health")

Return ONLY valid JSON:
{
  "questions": [
    {
      "id": "controllers_count",
      "question": "How many controllers are included?",
      "type": "number",
      "required": true,
      "helpText": "Include all controllers that come with the console",
      "category": "accessories"
    },
    {
      "id": "games_included",
      "question": "What games are included? (if any)",
      "type": "multiselect",
      "options": ["None", "Physical discs", "Digital games", "Game pass subscription"],
      "required": false,
      "category": "accessories"
    },
    {
      "id": "original_box",
      "question": "Do you have the original box?",
      "type": "boolean",
      "required": false,
      "category": "accessories"
    },
    {
      "id": "battery_health",
      "question": "What is the battery health percentage?",
      "type": "number",
      "required": false,
      "helpText": "For iPhones: Settings > Battery > Battery Health. For laptops: Check system settings",
      "category": "condition"
    }
  ],
  "reasoning": "These questions help buyers understand exactly what they're getting and the item's condition, leading to faster sales and fewer returns."
}`;

  const response = await retryWithBackoff(
    async () => {
      return await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1500,
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
    throw new Error('No text response from AI');
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from AI');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Generate follow-up questions based on previous answers
 */
export async function generateFollowUpQuestions(
  visionAnalysis: VisionAnalysisResult,
  previousAnswers: Record<string, any>,
  previousQuestions: DynamicQuestion[]
): Promise<QuestionSet> {
  const prompt = `Based on the seller's answers, generate 2-5 follow-up questions to clarify or get missing important info.

PRODUCT: ${visionAnalysis.brand} ${visionAnalysis.model} (${visionAnalysis.category})
PREVIOUS ANSWERS:
${JSON.stringify(previousAnswers, null, 2)}

PREVIOUS QUESTIONS:
${previousQuestions.map(q => q.question).join('\n')}

Generate follow-up questions that:
1. Clarify ambiguous answers
2. Fill in gaps for important buyer concerns
3. Are specific to this product type
4. Help complete the listing

Return ONLY valid JSON in the same format as before.`;

  const response = await retryWithBackoff(
    async () => {
      return await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
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
    throw new Error('No text response from AI');
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from AI');
  }

  return JSON.parse(jsonMatch[0]);
}

