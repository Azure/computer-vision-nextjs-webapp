'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Props = {
  intervalSeconds: number;
};

export function DataRefresher({ intervalSeconds }: Props) {
  const router = useRouter();
  useEffect(() => {
    router.refresh();

    const intervalId = setInterval(router.refresh, intervalSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [intervalSeconds, router]);

  return <></>;
}
