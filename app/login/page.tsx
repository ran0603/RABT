'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeAuthScreen } from '../../components/WelcomeAuthScreen';

export default function LoginPage() {
  const router = useRouter();
  return <WelcomeAuthScreen onAuthenticated={() => router.push('/')} />;
}
