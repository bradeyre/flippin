'use client';

import { Zap, Store, Send } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface InstantOffersProps {
  offers: any[];
  pricing: any;
  onSelectOffer: (offer: any) => void;
  onListMarketplace: () => void;
}

export function InstantOffers({ offers, pricing, onSelectOffer, onListMarketplace }: InstantOffersProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">You've got offers! 🎉</h2>
      <p className="text-gray-600 mb-8">
        Choose an instant cash offer, or list on the marketplace for potentially more
      </p>

      {/* Instant Offers */}
      {offers.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Instant Cash Offers
          </h3>

          {offers.map((offer, idx) => (
            <div
              key={offer.id}
              className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-lg text-gray-900">
                    {offer.buyer.user.companyName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Verified instant buyer
                  </p>
                </div>
                {idx === 0 && (
                  <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    BEST OFFER
                  </span>
                )}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">You receive</p>
                  <p className="text-4xl font-bold text-green-600">
                    {formatCurrency(offer.sellerReceives)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Paid within 48 hours of delivery
                  </p>
                </div>

                <button
                  onClick={() => onSelectOffer(offer)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Accept Offer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Marketplace Option */}
      <div className="border-2 border-gray-300 rounded-lg p-6 bg-white hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-orange-600" />
              List on Marketplace
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Potentially get more from individual buyers
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-sm text-gray-600">Suggested price</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(pricing?.recommended || 0)}
            </p>
          </div>
          <div className="flex items-baseline justify-between text-sm">
            <p className="text-gray-600">You receive (after 5.5% fee)</p>
            <p className="font-semibold text-gray-700">
              {formatCurrency((pricing?.recommended || 0) * 0.945)}
            </p>
          </div>
          {(pricing?.recommended || 0) < 1000 && (
            <p className="text-xs text-green-600 font-medium mt-2">
              💸 FREE - No fees under R1,000!
            </p>
          )}
        </div>

        <button
          onClick={onListMarketplace}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          List on Marketplace
        </button>
      </div>

      {/* No Offers - Alternative */}
      {offers.length === 0 && (
        <div className="mt-8 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Send className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            No instant offers yet
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            We can send your listing to our buyer network and notify you if anyone makes an offer
          </p>
          <button
            onClick={onListMarketplace}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Send to Buyer Network
          </button>
        </div>
      )}
    </div>
  );
}
