import Link from 'next/link';
import { Zap, TrendingUp, Shield, DollarSign } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Turn Your Clutter
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">Into Cash</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto font-medium">
            AI-powered marketplace where serious buyers meet smart sellers.
            Get instant offers or list publicly. Your stuff, your choice.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/sell"
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl"
            >
              Sell Something
            </Link>
            <Link
              href="/browse"
              className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl text-lg font-bold border-2 border-gray-300 hover:border-gray-400 transition-all shadow-sm hover:shadow-md"
            >
              Browse Deals
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">48hrs</div>
            <div className="text-gray-600">Average time to sell</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">FREE</div>
            <div className="text-gray-600">Under R1,000 transactions</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">5.5%</div>
            <div className="text-gray-600">Commission over R1,000</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why sellers love Flippin
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="bg-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Instant Offers
              </h3>
              <p className="text-gray-600">
                Verified buyers compete for your stuff. Get cash offers in minutes, not weeks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="bg-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                AI Pricing
              </h3>
              <p className="text-gray-600">
                Upload photos, get instant market pricing. No guessing, no lowballers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="bg-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Safe Payments
              </h3>
              <p className="text-gray-600">
                Escrow protection. Money held until buyer confirms. No more ghosts or scams.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="bg-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Lowest Fees
              </h3>
              <p className="text-gray-600">
                Free under R1k. 5.5% over R1k. That's it. No hidden costs or surprises.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How it works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Upload Photos</h3>
              <p className="text-gray-600 text-sm">
                Snap a few pics. Our AI identifies your item and suggests pricing.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Get Offers</h3>
              <p className="text-gray-600 text-sm">
                Instant buyers compete with cash offers. Or list on the marketplace.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Ship It</h3>
              <p className="text-gray-600 text-sm">
                Choose Paxi or door-to-door. We handle the logistics.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-bold text-lg mb-2">Get Paid</h3>
              <p className="text-gray-600 text-sm">
                Money released after 48-hour inspection. Direct to your bank.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-orange-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Stop scrolling. Start selling.
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            That iPhone gathering dust? Those sneakers you never wear? Turn them into cash today.
          </p>
          <Link
            href="/sell"
            className="inline-block bg-white hover:bg-gray-100 text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            List Your First Item
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Flippin</h3>
              <p className="text-sm">
                The marketplace that doesn't mess around.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Sell</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/sell" className="hover:text-white">List an item</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">How it works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Buy</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/browse" className="hover:text-white">Browse</Link></li>
                <li><Link href="/buy-orders" className="hover:text-white">Buy orders</Link></li>
                <li><Link href="/safety" className="hover:text-white">Buyer protection</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>&copy; 2025 Flippin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
