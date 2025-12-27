'use client';

import { useState } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { AIAnalysis } from '@/components/AIAnalysis';
import { QualifyingQuestions } from '@/components/QualifyingQuestions';
import { InstantOffers } from '@/components/InstantOffers';
import { DistributionOptions } from '@/components/DistributionOptions';

type Step = 'upload' | 'analyzing' | 'questions' | 'confirm' | 'delivery' | 'offers' | 'distribution' | 'complete';

export default function SellPage() {
  const [step, setStep] = useState<Step>('upload');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [confirmedDetails, setConfirmedDetails] = useState<any>(null);
  const [instantOffers, setInstantOffers] = useState<any[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [distribution, setDistribution] = useState<{
    marketplace: boolean;
    buyerNetwork: boolean;
  }>({ marketplace: true, buyerNetwork: false });
  const [deliveryMethods, setDeliveryMethods] = useState<string[]>([]);

  async function handleImagesUploaded(urls: string[]) {
    setImageUrls(urls);
    setStep('analyzing');

    try {
      const response = await fetch('/api/listings/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls: urls }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle prohibited items
        if (errorData.error === 'prohibited') {
          alert(`❌ ${errorData.message}\n\n${errorData.details}`);
          setStep('upload');
          return;
        }

        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();

      // Double-check for prohibition (in case API didn't catch it)
      if (data.visionAnalysis?.prohibited) {
        alert(`❌ This item cannot be sold on Flippin\n\n${data.visionAnalysis.prohibitionReason}`);
        setStep('upload');
        return;
      }

      setAnalysis(data.visionAnalysis);
      setPricing(data.pricing);

      if (data.visionAnalysis?.needsMoreInfo) {
        setStep('questions');
      } else {
        setStep('confirm');
      }
    } catch (error) {
      console.error('Error analyzing images:', error);
      alert('Failed to analyze images. Please try again.');
      setStep('upload');
    }
  }

  async function handleQuestionsAnswered(answersData: Record<string, any>) {
    setAnswers(answersData);
    setStep('confirm');
  }

  async function handleConfirmed(details: any) {
    setConfirmedDetails(details);
    
    // If no delivery methods selected yet, show delivery selection
    if (deliveryMethods.length === 0) {
      setStep('delivery');
      return;
    }
    
    setStep('analyzing');

    try {
      // Create listing and get instant offers
      const response = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrls,
          confirmedDetails: details,
          analysis, // Pass full analysis
          pricing, // Pass pricing data
          province: 'GAUTENG', // TODO: Get from user
          city: 'Johannesburg', // TODO: Get from user
          deliveryMethods, // Pass selected delivery methods
          onMarketplace: false, // Don't list yet
          sentToBuyerNetwork: false,
        }),
      });

      const data = await response.json();
      setInstantOffers(data.instantOffers || []);
      setStep('offers');
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
    }
  }

  async function handleOfferSelected(offer: any) {
    setSelectedOffer(offer);
    setStep('distribution');
  }

  async function handleDistributionSelected(options: typeof distribution) {
    setDistribution(options);
    // TODO: Finalize listing with selected distribution
    setStep('complete');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {['Upload', 'Analyze', 'Confirm', 'Offers', 'List'].map((label, idx) => (
              <div key={label} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    idx <= ['upload', 'analyzing', 'questions', 'confirm', 'offers', 'distribution', 'complete'].indexOf(step)
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden md:inline">
                  {label}
                </span>
                {idx < 4 && <div className="w-12 h-0.5 bg-gray-300 mx-4 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {step === 'upload' && (
            <div>
              <h1 className="text-3xl font-bold mb-4">Sell Your Stuff</h1>
              <p className="text-gray-600 mb-8">
                Upload 3-5 clear photos and our AI will do the rest. Seriously, it's that easy.
              </p>
              <ImageUpload onComplete={handleImagesUploaded} />
            </div>
          )}

          {step === 'analyzing' && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 animate-spin text-orange-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">AI is analyzing your item...</h2>
              <p className="text-gray-600">
                Identifying product, checking condition, and finding the best price
              </p>
            </div>
          )}

          {step === 'questions' && analysis && (
            <QualifyingQuestions
              analysis={analysis}
              onComplete={handleQuestionsAnswered}
            />
          )}

          {step === 'confirm' && analysis && (
            <AIAnalysis
              analysis={analysis}
              pricing={pricing}
              answers={answers}
              onConfirm={handleConfirmed}
              onEdit={() => setStep('questions')}
            />
          )}

          {step === 'delivery' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Choose Shipping Options</h2>
              <p className="text-gray-600 mb-6">
                Select how buyers can receive this item. You can choose multiple options.
              </p>
              
              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={deliveryMethods.includes('PAXI')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDeliveryMethods([...deliveryMethods, 'PAXI']);
                      } else {
                        setDeliveryMethods(deliveryMethods.filter(m => m !== 'PAXI'));
                      }
                    }}
                    className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Paxi</div>
                    <div className="text-sm text-gray-600">
                      Locker-to-locker courier service. Buyers collect from Paxi lockers.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={deliveryMethods.includes('LOCKER_TO_LOCKER')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDeliveryMethods([...deliveryMethods, 'LOCKER_TO_LOCKER']);
                      } else {
                        setDeliveryMethods(deliveryMethods.filter(m => m !== 'LOCKER_TO_LOCKER'));
                      }
                    }}
                    className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Locker to Locker</div>
                    <div className="text-sm text-gray-600">
                      Alternative locker-to-locker service.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={deliveryMethods.includes('DOOR_TO_DOOR')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDeliveryMethods([...deliveryMethods, 'DOOR_TO_DOOR']);
                      } else {
                        setDeliveryMethods(deliveryMethods.filter(m => m !== 'DOOR_TO_DOOR'));
                      }
                    }}
                    className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Door to Door</div>
                    <div className="text-sm text-gray-600">
                      Direct courier delivery to buyer's address.
                    </div>
                  </div>
                </label>
              </div>

              <button
                onClick={() => {
                  if (deliveryMethods.length === 0) {
                    alert('Please select at least one delivery method');
                    return;
                  }
                  handleConfirmed(confirmedDetails);
                }}
                disabled={deliveryMethods.length === 0}
                className="w-full mt-6 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'offers' && (
            <InstantOffers
              offers={instantOffers}
              pricing={pricing}
              onSelectOffer={handleOfferSelected}
              onListMarketplace={() => setStep('distribution')}
            />
          )}

          {step === 'distribution' && (
            <DistributionOptions
              selectedOffer={selectedOffer}
              onComplete={handleDistributionSelected}
            />
          )}

          {step === 'complete' && (
            <div className="text-center py-12">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">You're all set!</h2>
              {selectedOffer ? (
                <div>
                  <p className="text-xl text-gray-700 mb-4">
                    Your item is sold to {selectedOffer.buyer.companyName}
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
                    <p className="text-3xl font-bold text-green-600 mb-2">
                      R{selectedOffer.sellerReceives}
                    </p>
                    <p className="text-gray-600">You'll receive this after shipping</p>
                  </div>
                  <div className="space-y-3 text-left max-w-md mx-auto">
                    <h3 className="font-bold text-lg mb-3">Next steps:</h3>
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                        <span className="text-orange-600 font-bold">1</span>
                      </div>
                      <p className="text-gray-700">
                        We'll send you payment confirmation within 24 hours
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                        <span className="text-orange-600 font-bold">2</span>
                      </div>
                      <p className="text-gray-700">
                        Ship your item within 48 hours (we'll send shipping instructions)
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                        <span className="text-orange-600 font-bold">3</span>
                      </div>
                      <p className="text-gray-700">
                        Get paid once the buyer confirms delivery
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xl text-gray-700 mb-6">
                    Your listing is now live!
                  </p>
                  <a
                    href="/dashboard"
                    className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    View Your Listings
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
