'use client';

import { Spinner } from '@/_components/Spinner';
import { Input } from '@/_components/inputs/Input';
import { InlineLink } from '@/_components/inputs/InlineLink';
import { useToast } from '@/_hooks/useToast';
import { signIn } from '@/_lib/client/signIn';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRedirectIfSignedIn } from '@/_hooks/useRedirectIfSignedIn';
import { LoadScreen } from '@/_components/LoadScreen';

export function SignInForm() {
  // Hooks
  const showToast = useToast();
  const router = useRouter();
  const isLoadingPage = useRedirectIfSignedIn();

  // Form state
  const [email, setEmail] = useState<string>();
  const [isErrorEmail, setIsErrorEmail] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSignIn = async () => {
    if (!email) {
      setIsErrorEmail(true);
      showToast({
        type: 'danger',
        text: 'Please fill in all required fields.',
      });
      return;
    }

    try {
      setIsLoading(true);

      const userId = await signIn({ email });

      router.push(`/?uid=${userId}`);
    } catch (error) {
      console.error(error);
      showToast({
        type: 'danger',
        text: String(error),
      });
      setIsLoading(false);
    }
  };

  if (isLoadingPage) return <LoadScreen />;

  return (
    <div className="space-y-2">
      <div>
        <label className="label">
          <span className="label-text text-base">Email</span>
        </label>
        <Input
          placeholder="Email address"
          isError={isErrorEmail}
          value={email}
          onChange={setEmail}
          onEnterKey={() => onSignIn()}
        />
      </div>

      <div className="space-y-3 pb-2 pt-4">
        <button className="btn btn-neutral w-full" onClick={() => onSignIn()} disabled={isLoading}>
          {isLoading ? <Spinner /> : 'Sign in'}
        </button>
      </div>

      <div className="pt-1 text-sm">
        Don&apos;t have an account? <InlineLink href="/signup">Sign up.</InlineLink>
      </div>
    </div>
  );
}
