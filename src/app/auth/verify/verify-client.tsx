"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { attemptEmailVerification, isLoggedIn } from '@/lib/auth/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const isAuthed = await isLoggedIn();
      if (!isAuthed) {
        router.push("/auth/login");
        return;
      }
      setIsAuthenticated(true);
    }
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    async function verifyEmail() {
      if (isAuthenticated !== true) return; 
      
      if (!code) {
        console.error("Verification code missing from URL.");
        setVerificationStatus('error');
        return;
      }

      try {
        setVerificationStatus('loading');
        const result = await attemptEmailVerification(code);
        setVerificationStatus(result ? 'success' : 'error');
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
      }
    }

    if (isAuthenticated === true) {
      verifyEmail();
    }
  }, [isAuthenticated, code]);

  if (isAuthenticated === null) {
    return (
      <div className="w-full flex justify-center mt-14">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Checking Authentication</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
             <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="w-full flex justify-center mt-14">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {verificationStatus === 'loading' && 'Verifying your email address...'}
            {verificationStatus === 'success' && 'Your email has been verified!'}
            {verificationStatus === 'error' && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {verificationStatus === 'loading' && (
            <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          )}
          
          {verificationStatus === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500" />
              <p className="text-center">Thank you for verifying your email address. You can now access all features of ToolShare.</p>
              <Button asChild className="mt-4">
                <Link href="/auth/account">Go to Account</Link>
              </Button>
            </>
          )}
          
          {verificationStatus === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500" />
              <p className="text-center">We couldn&apos;t verify your email address. The verification link may have expired or is invalid.</p>
              <Button asChild className="mt-4">
                <Link href="/auth/account">Return to Account</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


// It's important to wrap the component that uses `useSearchParams`
// in Suspense at the point of usage, not within the component itself usually.
// However, since this entire component relies on it, we export it directly.
// The Suspense boundary will be added in the `page.tsx`.
export default function VerifyClient() {
  // We need a Suspense boundary *around* the component using useSearchParams.
  // So we'll wrap VerifyContent in page.tsx, not here.
  return <VerifyContent />;
} 