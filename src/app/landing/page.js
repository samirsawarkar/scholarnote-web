'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/index.html');
  }, [router]);

  return <div>Redirecting to landing page...</div>;
}