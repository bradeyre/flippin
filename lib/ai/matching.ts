import { anthropic, CLAUDE_MODEL } from './client';
import { retryWithBackoff } from '@/lib/utils/retry';

export async function matchBuyOrderToListing(
  buyOrder: {
    title: string;
    description: string;
    category: { name: string };
    conditions: string[];
    offerPrice: number;
  },
  listing: {
    title: string;
    description: string;
    category: { name: string };
    condition: string;
    askingPrice: number;
    brand?: string;
    model?: string;
  }
): Promise<number> {

  const prompt = `Does this listing match the buy order?

BUYER WANTS:
Title: ${buyOrder.title}
Description: ${buyOrder.description}
Category: ${buyOrder.category.name}
Acceptable conditions: ${buyOrder.conditions.join(', ')}
Budget: R${buyOrder.offerPrice}

SELLER OFFERS:
Title: ${listing.title}
Description: ${listing.description}
Category: ${listing.category.name}
Condition: ${listing.condition}
Price: R${listing.askingPrice}
${listing.brand ? `Brand: ${listing.brand}` : ''}
${listing.model ? `Model: ${listing.model}` : ''}

Return match score 0.0-1.0:
- 1.0 = Perfect match (exact item, condition acceptable, price within budget)
- 0.8-0.99 = Strong match (very similar, minor differences)
- 0.6-0.79 = Possible match (similar category, but not exact)
- <0.6 = No match

Consider:
1. Is it the same item/type?
2. Is condition acceptable?
3. Is price reasonable vs budget?

Return ONLY the number (e.g., 0.95)`;

  const response = await retryWithBackoff(
    async () => {
      return await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 10,
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

  const score = parseFloat(textContent.text.trim());
  if (isNaN(score)) {
    throw new Error('Invalid match score from AI');
  }

  return Math.max(0, Math.min(1, score));
}
