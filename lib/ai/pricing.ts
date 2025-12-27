import { anthropic, CLAUDE_MODEL } from './client';

export interface PricingResult {
  recommended: number;
  range: { min: number; max: number };
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoning: string;
  marketInsights: {
    avgDaysToSell: number;
    recentSales: number;
    demandLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    competingListings: number;
  };
  sources: {
    searchResults: string[];
  };
}

export async function generatePricing(
  brand: string,
  model: string,
  variant: string | null,
  condition: string,
  category: string
): Promise<PricingResult> {

  // Search query for live market data
  const searchQuery = `${brand} ${model} ${variant || ''} price South Africa ${new Date().getFullYear()}`.trim();

  const prompt = `You are a pricing expert for South African second-hand goods.

Search the web for current market prices of this item in South Africa:
- Brand: ${brand}
- Model: ${model}
- Variant: ${variant || 'N/A'}
- Category: ${category}
- Condition: ${condition}

Search query to use: "${searchQuery}"

Find prices from:
1. Gumtree South Africa
2. Facebook Marketplace SA
3. Takealot (for reference on new prices)
4. Other SA marketplaces

Analyze the current market and provide a pricing recommendation optimized for selling within 2-4 days.

Consider:
- Current asking prices (people often list high)
- New retail price (if available)
- Condition depreciation
- Market demand
- Time of year

Return ONLY valid JSON:
{
  "recommended": 8799,
  "range": {"min": 8200, "max": 9500},
  "confidence": "HIGH",
  "reasoning": "Based on 12 active listings averaging R9,200, and considering the good condition with minor wear. Priced 5% below average for quick sale.",
  "marketInsights": {
    "avgDaysToSell": 4,
    "recentSales": 12,
    "demandLevel": "HIGH",
    "competingListings": 15
  },
  "sources": ["gumtree.co.za", "facebook.com/marketplace", "takealot.com"]
}

For the condition ${condition}:
- NEW: 85-95% of retail
- LIKE_NEW: 70-85% of retail
- GOOD: 55-70% of retail
- FAIR: 35-55% of retail
- POOR: 20-35% of retail`;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
    tools: [
      {
        type: 'web_search_20250514' as any,
        name: 'web_search',
        display_name: 'Web Search',
        display_number: 1,
      }
    ] as any,
  });

  // Extract text content from response
  const textBlocks = response.content.filter(c => c.type === 'text');
  const fullText = textBlocks.map(b => b.type === 'text' ? b.text : '').join('\n');

  const jsonMatch = fullText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from pricing AI');
  }

  return JSON.parse(jsonMatch[0]);
}

export function calculateInstantOffer(
  marketPrice: number,
  condition: string,
  baseOffer: number, // e.g., 0.60 for 60%
  conditionRules?: Record<string, number> // e.g., { GOOD: 1.0, FAIR: 0.85 }
): { sellerReceives: number; buyerPays: number; platformFee: number } {

  // Default condition multipliers if not provided
  const defaultMultipliers: Record<string, number> = {
    NEW: 1.10,
    LIKE_NEW: 1.05,
    GOOD: 1.0,
    FAIR: 0.85,
    POOR: 0.70,
  };

  const multipliers = conditionRules || defaultMultipliers;
  const conditionMultiplier = multipliers[condition] || 1.0;

  // Calculate seller receives
  const sellerReceives = Math.round(marketPrice * baseOffer * conditionMultiplier / 50) * 50; // Round to nearest R50

  // Platform takes 5% from buyer
  const platformFee = Math.round(sellerReceives * 0.05);

  // Buyer pays seller amount + platform fee
  const buyerPays = sellerReceives + platformFee;

  return {
    sellerReceives,
    buyerPays,
    platformFee,
  };
}
