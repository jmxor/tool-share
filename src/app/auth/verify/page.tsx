import { Suspense } from 'react';
import VerifyClient from './verify-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function LoadingFallback() {
  return (
    <div className="w-full flex justify-center mt-14">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Loading Verification</CardTitle>
          <CardDescription>Please wait...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
           <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  // Wrap the client component that uses useSearchParams in Suspense, was giving an error when building
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyClient />
    </Suspense>
  );
}
