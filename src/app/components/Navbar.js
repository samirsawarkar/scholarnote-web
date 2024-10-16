import Image from 'next/image';
import { Share2, User } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className="relative w-16 h-16 mr-3">
            <Image 
              src="/logo.png" 
              alt="ScholarNote Logo" 
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">ScholarNote</h1>
        </Link>
        <div className="flex items-center space-x-4">
          <Link 
            href="/create-note"
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            <Share2 size={20} />
            <span>Create Note</span>
          </Link>
          
          <Link href="/profile" className="text-gray-600 hover:text-gray-900">
            <User size={24} />
          </Link>
        </div>
      </div>
    </header>
  );
}
