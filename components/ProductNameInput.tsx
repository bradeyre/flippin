'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ProductNameInputProps {
  onComplete: (productName: string) => void;
}

export function ProductNameInput({ onComplete }: ProductNameInputProps) {
  const [productName, setProductName] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (productName.trim()) {
      onComplete(productName.trim());
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">What are you selling? 🎯</h2>
        <p className="text-gray-600">
          Tell us what it is - this helps our AI understand your photos better
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="productName" className="block text-sm font-semibold text-gray-900 mb-2">
            Product name
          </label>
          <input
            id="productName"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder:text-gray-400 text-lg"
            placeholder="e.g., Cobb cooker, iPhone 13, Xbox Series X..."
            autoFocus
          />
          <p className="mt-2 text-sm text-gray-600">
            💡 Be specific if you can - brand and model help, but just "Cobb cooker" works too!
          </p>
        </div>

        <button
          type="submit"
          disabled={!productName.trim()}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Continue →
        </button>
      </form>
    </div>
  );
}
