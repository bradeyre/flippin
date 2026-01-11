'use client';

import { useState } from 'react';
import { Store, Users, Globe } from 'lucide-react';

interface DistributionOptionsProps {
  selectedOffer: any | null;
  onComplete: (options: { marketplace: boolean; buyerNetwork: boolean }) => void;
  onError?: (title: string, message: string) => void;
}

export function DistributionOptions({ selectedOffer, onComplete, onError }: DistributionOptionsProps) {
  const [marketplace, setMarketplace] = useState(!selectedOffer);
  const [buyerNetwork, setBuyerNetwork] = useState(false);

  function handleSubmit() {
    if (!marketplace && !buyerNetwork && !selectedOffer) {
      if (onError) {
        onError('Distribution Required', 'Please select at least one distribution option');
      } else {
        alert('Please select at least one distribution option');
      }
      return;
    }

    onComplete({ marketplace, buyerNetwork });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">How do you want to sell?</h2>
      <p className="text-gray-600 mb-8">
        Choose where to list your item. You can select multiple options.
      </p>

      {selectedOffer && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800 font-medium mb-1">
            ✓ Instant offer accepted
          </p>
          <p className="text-sm text-green-700">
            Your item is sold to {selectedOffer.buyer.user.companyName} for{' '}
            <span className="font-bold">R{selectedOffer.sellerReceives}</span>
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Marketplace */}
        <label
          className={`block border-2 rounded-lg p-6 cursor-pointer transition-all ${
            marketplace
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              checked={marketplace}
              onChange={(e) => setMarketplace(e.target.checked)}
              disabled={!!selectedOffer}
              className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-lg">Public Marketplace</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Your listing will be visible to all buyers browsing Flippin. Great for maximum exposure.
              </p>
              <div className="bg-white rounded-lg p-3 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Visibility</span>
                  <span className="font-semibold">High</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time to sell</span>
                  <span className="font-semibold">2-7 days</span>
                </div>
              </div>
            </div>
          </div>
        </label>

        {/* Buyer Network */}
        <label
          className={`block border-2 rounded-lg p-6 cursor-pointer transition-all ${
            buyerNetwork
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              checked={buyerNetwork}
              onChange={(e) => setBuyerNetwork(e.target.checked)}
              disabled={!!selectedOffer}
              className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-lg">Buyer Network</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                  EXCLUSIVE
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Send to our network of verified instant buyers. They'll contact you if interested.
              </p>
              <div className="bg-white rounded-lg p-3 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Response time</span>
                  <span className="font-semibold">24-48 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Typical offers</span>
                  <span className="font-semibold">60-70% of market</span>
                </div>
              </div>
            </div>
          </div>
        </label>

        {/* Both */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">
              💡 Pro tip: Select both!
            </p>
            <p className="text-blue-700">
              Maximize your chances by listing on the marketplace AND sending to the buyer network. First to buy wins.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full mt-8 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors"
      >
        {selectedOffer ? 'Complete Sale' : 'Publish Listing'}
      </button>
    </div>
  );
}
