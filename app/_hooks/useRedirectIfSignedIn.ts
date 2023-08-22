import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const useRedirectIfSignedIn = () => {
  const router = useRouter();
  const hasComponentMounted = typeof localStorage !== 'undefined';
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if already signed in
  useEffect(() => {
    if (hasComponentMounted) {
      const userId = localStorage.getItem('cn-scenario-uid');

      if (userId) {
        router.push(`/?uid=${userId}`);
      }

      setIsLoading(false);
    }
  }, [hasComponentMounted, router]);

  return isLoading;
};
