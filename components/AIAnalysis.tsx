'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Edit2, TrendingUp, AlertTriangle, Camera, Lightbulb, CheckCircle2, DollarSign, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ListingPreview } from './ListingPreview';
import { generateListingCopy } from '@/lib/ai/listing-generator';

interface AIAnalysisProps {
  analysis: any;
  pricing: any;
  answers?: Record<string, any>;
  productName?: string;
  onConfirm: (details: any) => void;
  onEdit: () => void;
}

export function AIAnalysis({ analysis, pricing, answers, productName, onConfirm, onEdit }: AIAnalysisProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [askingPrice, setAskingPrice] = useState<number | null>(null);
  const [listingCopy, setListingCopy] = useState<{ title: string; description: string; tags: string[] } | null>(null);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  // Set initial price from pricing suggestion or null
  useEffect(() => {
    if (pricing?.recommended && !askingPrice) {
      setAskingPrice(Math.round(pricing.recommended));
    }
  }, [pricing, askingPrice]);

  // Generate listing copy when component mounts
  useEffect(() => {
    async function generateCopy() {
      if (!analysis || listingCopy) return;
      
      setIsGeneratingCopy(true);
      try {
        const copy = await generateListingCopy(analysis, JSON.stringify(answers || {}));
        setListingCopy(copy);
      } catch (error) {
        console.error('Error generating listing copy:', error);
      } finally {
        setIsGeneratingCopy(false);
      }
    }

    generateCopy();
  }, [analysis, answers, listingCopy]);

  function handleConfirm() {
    if (!askingPrice || askingPrice <= 0) {
      return;
    }

    onConfirm({
      brand: analysis.brand,
      model: analysis.model,
      variant: analysis.variant,
      condition: analysis.condition,
      category: analysis.category,
      specs: answers,
      askingPrice: askingPrice,
      listingCopy: listingCopy || { title: '', description: '', tags: [] },
    });
  }

  const priceSuggestion = pricing?.recommended || null;
  const priceRange = pricing?.range;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm the details</h2>
          <p className="text-gray-600">Review and finalize your listing</p>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg font-medium transition-colors"
        >
          <Edit2 className="w-5 h-5" />
          Edit Details
        </button>
      </div>

      {/* Item Details Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {analysis.brand} {analysis.model}
            </h3>
            {analysis.variant && (
              <p className="text-gray-600 font-medium">{analysis.variant}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</p>
            <p className="text-lg font-semibold text-gray-900">{analysis.category}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Condition</p>
            <p className="text-lg font-semibold text-gray-900">{analysis.condition.replace(/_/g, ' ')}</p>
          </div>
        </div>

        {analysis.detectedIssues && analysis.detectedIssues.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Detected Issues
            </p>
            <ul className="space-y-2">
              {analysis.detectedIssues.map((issue: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {answers && Object.keys(answers).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Additional Details</p>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(answers).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price Input */}
      <div className="bg-gradient-to-br from-orange-50 via-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-orange-600 p-3 rounded-xl">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Set Your Price</h3>
            <p className="text-sm text-gray-600">How much do you want to sell this for?</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
              Asking Price (R)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R</span>
              <input
                id="price"
                type="number"
                value={askingPrice || ''}
                onChange={(e) => setAskingPrice(e.target.value ? Number(e.target.value) : null)}
                min="0"
                step="10"
                className="w-full pl-10 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-2xl font-bold text-gray-900"
                placeholder="0"
                required
              />
            </div>
          </div>

          {priceSuggestion && (
            <div className="bg-white/80 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  AI Suggested Price
                </p>
                <button
                  onClick={() => setAskingPrice(Math.round(priceSuggestion))}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  Use This
                </button>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(priceSuggestion)}
              </p>
                {priceRange && (
                  <p className="text-xs text-gray-600 mt-1">
                    Range: {formatCurrency(priceRange.min)} - {formatCurrency(priceRange.max)}
                  </p>
                )}
              {pricing?.reasoning && (
                <p className="text-xs text-gray-600 mt-2 italic">{pricing.reasoning}</p>
              )}
            </div>
          )}

          {!priceSuggestion && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>No AI price suggestion available.</strong> Research similar items on Gumtree or Facebook Marketplace to set a competitive price.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Listing Copy Preview */}
      {isGeneratingCopy ? (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
            <h3 className="text-xl font-bold text-gray-900">Generating your listing...</h3>
          </div>
          <p className="text-gray-600">Our AI is crafting the perfect title and description for your {productName || 'item'}</p>
        </div>
      ) : listingCopy ? (
        <ListingPreview
          listingCopy={listingCopy}
          onCopyUpdated={(copy) => setListingCopy(copy)}
        />
      ) : null}

      {/* Photo Quality Feedback - Simplified */}
      {analysis.photoQuality && analysis.photoQuality.overallScore < 80 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Camera className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">Photo Quality: {analysis.photoQuality.overallScore}/100</p>
              {analysis.photoQuality.suggestions && analysis.photoQuality.suggestions.length > 0 && (
                <ul className="text-sm text-gray-700 space-y-1 mt-2">
                  {analysis.photoQuality.suggestions.slice(0, 2).map((suggestion: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 w-6 h-6 text-orange-600 rounded-lg focus:ring-2 focus:ring-orange-500 border-2 border-gray-300"
          />
          <div className="flex-1">
            <p className="font-bold text-gray-900 mb-1 text-lg">
              I confirm these details are accurate
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              By confirming, you agree that the information above is correct to the best of your knowledge. This helps ensure fair pricing and builds trust with buyers.
            </p>
          </div>
        </label>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!confirmed || !askingPrice || askingPrice <= 0}
        className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
      >
        <CheckCircle className="w-6 h-6" />
        Confirm & Continue
      </button>
    </div>
  );
}
