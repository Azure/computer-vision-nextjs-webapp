'use client';

import ArrowLeftOnRectangleIcon from '@heroicons/react/24/outline/ArrowLeftOnRectangleIcon';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  const signOut = async () => {
    localStorage.removeItem('cn-scenario-uid');
    router.push('/signin');
  };

  return (
    <button className="btn btn-outline" onClick={() => signOut()}>
      <ArrowLeftOnRectangleIcon height={24} width={24} />
    </button>
  );
}
