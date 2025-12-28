'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  askingPrice: number;
  images: string[];
  seller: {
    firstName: string | null;
    lastName: string | null;
    rating: number | null;
  };
}

export default function MakeOfferPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  async function fetchListing() {
    try {
      setLoading(true);
      // Using admin API for now - TODO: Create public listing API
      const response = await fetch(`/api/admin/listings/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch listing');
      
      const data = await response.json();
      setListing(data);
      setOfferAmount(data.askingPrice.toString());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const amount = parseFloat(offerAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid offer amount');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/offers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: params.id,
          amount,
          message: message.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit offer');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href={`/listing/${params.id}`}
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Listing
          </Link>
        </div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Offer Submitted! 🎉</h1>
          <p className="text-gray-600 mb-6">
            Your offer of <strong>R{parseFloat(offerAmount).toLocaleString()}</strong> has been sent to the seller.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            They'll be notified and can accept, reject, or make a counter-offer. You'll hear back soon!
          </p>
          <div className="space-y-3">
            <Link
              href={`/listing/${params.id}`}
              className="block w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Back to Listing
            </Link>
            <Link
              href="/buyer/dashboard"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const offerAmountNum = parseFloat(offerAmount) || 0;
  const minOffer = listing.askingPrice * 0.5;
  const isValidOffer = offerAmountNum >= minOffer && offerAmountNum <= listing.askingPrice * 1.1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/listing/${params.id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Make an Offer</h1>
              <p className="mt-1 text-sm text-gray-500">{listing.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Listing Preview */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
            {listing.images.length > 0 && (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{listing.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Seller: {listing.seller.firstName} {listing.seller.lastName}
                {listing.seller.rating && (
                  <span className="ml-2">⭐ {listing.seller.rating.toFixed(1)}</span>
                )}
              </p>
              <p className="text-lg font-bold text-gray-900 mt-2">
                Asking Price: R{listing.askingPrice.toLocaleString()}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Offer Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Your Offer Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="amount"
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  min={minOffer}
                  max={listing.askingPrice * 1.1}
                  step="1"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-semibold"
                  placeholder={listing.askingPrice.toString()}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>Minimum offer: R{minOffer.toLocaleString()} (50% of asking price)</p>
                <p>Maximum offer: R{Math.round(listing.askingPrice * 1.1).toLocaleString()} (110% of asking price)</p>
              </div>
              {offerAmountNum > 0 && !isValidOffer && (
                <p className="mt-2 text-sm text-red-600">
                  {offerAmountNum < minOffer
                    ? `Offer must be at least R${minOffer.toLocaleString()}`
                    : `Offer cannot exceed R${Math.round(listing.askingPrice * 1.1).toLocaleString()}`}
                </p>
              )}
            </div>

            {/* Message (Optional) */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message to Seller <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Add a friendly message to increase your chances of acceptance..."
              />
              <p className="mt-1 text-xs text-gray-500">{message.length}/500 characters</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Offer Summary */}
            {isValidOffer && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-900 mb-2">Your Offer Summary:</p>
                <div className="space-y-1 text-sm text-orange-800">
                  <div className="flex justify-between">
                    <span>Offer Amount:</span>
                    <span className="font-semibold">R{offerAmountNum.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difference from asking:</span>
                    <span className={offerAmountNum < listing.askingPrice ? 'text-red-600' : 'text-green-600'}>
                      {offerAmountNum < listing.askingPrice
                        ? `-R${(listing.askingPrice - offerAmountNum).toLocaleString()}`
                        : `+R${(offerAmountNum - listing.askingPrice).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <Link
                href={`/listing/${params.id}`}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!isValidOffer || submitting}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    Submit Offer
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Your offer will expire in 48 hours if not responded to. The seller will be notified immediately.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

