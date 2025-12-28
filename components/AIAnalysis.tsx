'use client';

import { useState } from 'react';
import { CheckCircle, Edit2, TrendingUp, AlertTriangle, Camera, Lightbulb, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AIAnalysisProps {
  analysis: any;
  pricing: any;
  answers?: Record<string, any>;
  onConfirm: (details: any) => void;
  onEdit: () => void;
}

export function AIAnalysis({ analysis, pricing, answers, onConfirm, onEdit }: AIAnalysisProps) {
  const [confirmed, setConfirmed] = useState(false);

  function handleConfirm() {
    onConfirm({
      brand: analysis.brand,
      model: analysis.model,
      variant: analysis.variant,
      condition: analysis.condition,
      category: analysis.category,
      specs: answers,
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Confirm the details</h2>

      {/* Item Details */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {analysis.brand} {analysis.model}
            </h3>
            {analysis.variant && (
              <p className="text-gray-600">{analysis.variant}</p>
            )}
          </div>
          <button
            onClick={onEdit}
            className="text-orange-600 hover:text-orange-700 flex items-center gap-1 text-sm font-medium"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Category</p>
            <p className="font-medium">{analysis.category}</p>
          </div>
          <div>
            <p className="text-gray-500">Condition</p>
            <p className="font-medium">{analysis.condition.replace(/_/g, ' ')}</p>
          </div>
        </div>

        {analysis.detectedIssues && analysis.detectedIssues.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Detected Issues:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {analysis.detectedIssues.map((issue: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {answers && Object.keys(answers).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Additional Details:</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(answers).map(([key, value]) => (
                <div key={key}>
                  <p className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="font-medium">{value as string}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Photo Quality Feedback */}
      {analysis.photoQuality && (
        <div className={`rounded-lg p-6 mb-6 ${
          analysis.photoQuality.overallScore >= 80
            ? 'bg-green-50 border border-green-200'
            : analysis.photoQuality.overallScore >= 60
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start gap-3 mb-4">
            <Camera className={`w-5 h-5 ${
              analysis.photoQuality.overallScore >= 80
                ? 'text-green-600'
                : analysis.photoQuality.overallScore >= 60
                ? 'text-yellow-600'
                : 'text-red-600'
            }`} />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Photo Quality</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {analysis.photoQuality.overallScore}/100
                </span>
                {analysis.photoQuality.overallScore >= 80 && (
                  <span className="text-sm text-green-700 font-medium">Great!</span>
                )}
                {analysis.photoQuality.overallScore >= 60 && analysis.photoQuality.overallScore < 80 && (
                  <span className="text-sm text-yellow-700 font-medium">Good, but could improve</span>
                )}
                {analysis.photoQuality.overallScore < 60 && (
                  <span className="text-sm text-red-700 font-medium">Needs improvement</span>
                )}
              </div>
            </div>
          </div>

          {analysis.photoQuality.issues && analysis.photoQuality.issues.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Issues Found:</p>
              <ul className="space-y-1">
                {analysis.photoQuality.issues.map((issue: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.photoQuality.suggestions && analysis.photoQuality.suggestions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-orange-600" />
                Suggestions to Improve:
              </p>
              <ul className="space-y-1">
                {analysis.photoQuality.suggestions.map((suggestion: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Photo Completeness Feedback */}
      {analysis.photoCompleteness && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <Camera className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Photo Completeness</h3>
              <p className="text-sm text-gray-600">
                We've analyzed your photos to see if all important angles are covered
              </p>
            </div>
          </div>

          {analysis.photoCompleteness.missingAngles && analysis.photoCompleteness.missingAngles.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Missing Angles:</p>
              <div className="flex flex-wrap gap-2">
                {analysis.photoCompleteness.missingAngles.map((angle: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full"
                  >
                    {angle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.photoCompleteness.recommendedAdditionalPhotos && 
           analysis.photoCompleteness.recommendedAdditionalPhotos.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                Recommended Additional Photos:
              </p>
              <ul className="space-y-2">
                {analysis.photoCompleteness.recommendedAdditionalPhotos.map((photo: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>{photo}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-600 mt-3 italic">
                💡 Tip: More complete photos = faster sales and better prices!
              </p>
            </div>
          )}

          {(!analysis.photoCompleteness.missingAngles || analysis.photoCompleteness.missingAngles.length === 0) &&
           (!analysis.photoCompleteness.recommendedAdditionalPhotos || 
            analysis.photoCompleteness.recommendedAdditionalPhotos.length === 0) && (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <p className="font-medium">All essential angles are covered! Great job!</p>
            </div>
          )}
        </div>
      )}

      {/* Pricing */}
      {pricing && (
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-orange-800 font-medium mb-1">
                AI Suggested Price
              </p>
              <p className="text-4xl font-bold text-orange-600">
                {formatCurrency(pricing.recommended)}
              </p>
              <p className="text-sm text-orange-700 mt-1">
                Range: {formatCurrency(pricing.range.min)} - {formatCurrency(pricing.range.max)}
              </p>
            </div>
            <div className="bg-orange-200 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-700" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-700 font-medium mb-2">
              Confidence: {pricing.confidence}
            </p>
            <p className="text-sm text-gray-600">{pricing.reasoning}</p>
          </div>

          {pricing.marketInsights && (
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-orange-800 font-medium">Avg Days to Sell</p>
                <p className="text-2xl font-bold text-orange-600">
                  {pricing.marketInsights.avgDaysToSell}
                </p>
              </div>
              <div>
                <p className="text-orange-800 font-medium">Demand Level</p>
                <p className="text-2xl font-bold text-orange-600">
                  {pricing.marketInsights.demandLevel}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
          />
          <div className="text-sm">
            <p className="font-medium text-gray-900 mb-1">
              I confirm these details are accurate
            </p>
            <p className="text-gray-600">
              By confirming, you agree that the information above is correct to the best of your knowledge. This helps ensure fair pricing and builds trust with buyers.
            </p>
          </div>
        </label>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!confirmed}
        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-5 h-5" />
        Confirm & Continue
      </button>
    </div>
  );
}
