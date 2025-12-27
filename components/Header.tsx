import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            Flippin
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/browse" className="text-gray-700 hover:text-orange-600 font-medium">
              Browse
            </Link>
            <Link href="/sell" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Sell
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
