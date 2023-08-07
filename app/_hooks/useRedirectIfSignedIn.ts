import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useRedirectIfSignedIn = () => {
  const router = useRouter();
  const hasComponentMounted = typeof localStorage !== 'undefined';

  // Redirect if already signed in
  useEffect(() => {
    if (hasComponentMounted) {
      const userId = localStorage.getItem('cn-scenario-uid');
      if (userId) {
        router.push(`/?uid=${userId}`);
        return;
      }
    }
  }, [hasComponentMounted, router]);
};
