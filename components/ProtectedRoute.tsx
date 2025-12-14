/* eslint-disable @typescript-eslint/no-explicit-any */

// components/ProtectedRoute.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProtectedRoute({ children }: any) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return children;
}