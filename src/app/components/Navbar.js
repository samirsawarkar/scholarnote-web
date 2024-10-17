'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Share2 } from 'lucide-react';
import Link from 'next/link';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const getAvatarUrl = (user) => {
    if (user?.photoURL) {
      return user.photoURL;
    }
    // Fallback to DiceBear API if no photoURL is available
    const seed = user?.email || 'default';
    return `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(seed)}`;
  };

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
            {user ? (
              <Image
                src={getAvatarUrl(user)}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-xs">?</span>
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
