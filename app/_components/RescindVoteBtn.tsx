'use client';

import { useToast } from '@/_hooks/useToast';
import { callBackend } from '@/_lib/server/callBackend';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Spinner } from './Spinner';

type Props = {
  voteId: string;
};

export function RescindVoteBtn({ voteId }: Props) {
  const showToast = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onRescindVote = async () => {
    setIsLoading(true);

    try {
      await callBackend({
        method: 'DELETE',
        url: `/api/vote/${voteId}`,
      });

      router.refresh();
    } catch (e) {
      console.error(e);
      showToast({ type: 'danger', text: 'Error rescinding vote.' });
    }

    router.refresh();
  };

  return (
    <button onClick={onRescindVote} className="btn btn-primary w-36">
      {isLoading ? <Spinner size="sm" /> : <>Rescind vote</>}
    </button>
  );
}
