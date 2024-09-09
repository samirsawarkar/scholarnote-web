import Image from 'next/image';
import { Search, Share2, Menu, User } from 'lucide-react';
import Link from 'next/link';

export default function Navbar({ onCreateNote }) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/api/placeholder/40/40" alt="ScholarNote Logo" width={40} height={40} className="mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">ScholarNote</h1>
        </Link>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="bg-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <button 
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
            onClick={onCreateNote}
          >
            <Share2 size={20} />
            <span>Create Note</span>
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            <Menu size={24} />
          </button>
          <Link href="/profile" className="text-gray-600 hover:text-gray-900">
            <User size={24} />
          </Link>
        </div>
      </div>
    </header>
  );
}
