// pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/scorecard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-gray-200">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Loading Scorecard...</h1>
        <p className="text-gray-500">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}