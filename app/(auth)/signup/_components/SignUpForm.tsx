'use client';

import { Spinner } from '@/_components/Spinner';
import { Input } from '@/_components/inputs/Input';
import { useToast } from '@/_hooks/useToast';
import { ApiSignUpBody, ApiSignUpResp } from '@/api/signup/_handlers/signUp';
import { useState } from 'react';
import { InlineLink } from '@/_components/inputs/InlineLink';
import { signIn } from '@/_lib/client/signIn';
import { callBackend } from '@/_lib/server/callBackend';
import { useRouter } from 'next/navigation';
import { useRedirectIfSignedIn } from '@/_hooks/useRedirectIfSignedIn';
import { LoadScreen } from '@/_components/LoadScreen';

export function SignupForm() {
  // Hooks
  const showToast = useToast();
  const router = useRouter();
  const isLoadingPage = useRedirectIfSignedIn();

  // Form state
  const [email, setEmail] = useState<string>();
  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form errors
  const [isErrorEmail, setIsErrorEmail] = useState<boolean>();
  const [isErrorFirstName, setIsErrorFirstName] = useState<boolean>();
  const [isErrorLastName, setIsErrorLastName] = useState<boolean>();

  const onSubmitEmail = async () => {
    try {
      setIsLoading(true);

      if (!email) setIsErrorEmail(true);
      if (!firstName) setIsErrorFirstName(true);
      if (!lastName) setIsErrorLastName(true);

      if (!email || !firstName || !lastName) {
        showToast({ type: 'danger', text: 'Please fill in all required fields.' });
        return;
      }

      await callBackend<ApiSignUpResp, ApiSignUpBody>({
        url: '/api/signup',
        method: 'POST',
        body: {
          email,
          firstName,
          lastName,
        },
      });

      const userId = await signIn({ email });

      router.push(`/?uid=${userId}`);
    } catch (error) {
      console.error(error);
      showToast({
        type: 'danger',
        text: 'Something went wrong: ' + error,
      });

      setIsLoading(false);
    }
  };

  if (isLoadingPage) return <LoadScreen />;

  return (
    <div
      className="space-y-4"
      onKeyDown={e => {
        if (e.key === 'Enter') {
          onSubmitEmail();
        }
      }}
    >
      <div className="space-y-6">
        <Input label="First name" isError={isErrorFirstName} value={firstName} onChange={setFirstName} required />
        <Input label="Last name" isError={isErrorLastName} value={lastName} onChange={setLastName} required />
        <Input label="Email" isError={isErrorEmail} value={email} onChange={setEmail} required />
      </div>

      <div className="space-y-3 pb-2 pt-4">
        <button className="btn btn-neutral w-full" onClick={() => onSubmitEmail()} disabled={isLoading}>
          {isLoading ? <Spinner /> : 'Sign up'}
        </button>
      </div>

      <div className="pt-1 text-sm">
        Already have an account? <InlineLink href="/signin">Sign in.</InlineLink>
      </div>
    </div>
  );
}
