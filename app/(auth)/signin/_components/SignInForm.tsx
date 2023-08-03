'use client';

import { Spinner } from '@/_components/Spinner';
import { Input } from '@/_components/inputs/Input';
import { InlineLink } from '@/_components/inputs/InlineLink';
import { useToast } from '@/_hooks/useToast';
import { signIn } from '@/_lib/client/signIn';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import { useState } from 'react';
import { Image } from '@/_components/Image';
import { signIn as nextAuthSignIn } from 'next-auth/react';

export function SignInForm() {
  const showToast = useToast();

  const [email, setEmail] = useState<string>();

  const [isErrorEmail, setIsErrorEmail] = useState<boolean>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false);

  const onSubmitEmail = async () => {
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

      await signIn({ email });

      setIsEmailSent(true);
    } catch (error) {
      console.error(error);
      showToast({
        type: 'danger',
        text: String(error),
      });
    }

    setIsLoading(false);
  };

  const onSubmitSso = async () => {
    try {
      await nextAuthSignIn('google');
    } catch (error) {
      console.error(error);
      showToast({
        type: 'danger',
        text: String(error),
      });
    }
  };

  return isEmailSent ? (
    <div className="mt-3 flex w-full flex-col items-center gap-3 px-5">
      <CheckCircleIcon height={80} className="text-success" />
      <div className="space-y-1">
        <div className="w-full text-xl font-semibold">Check your email</div>
        <div className="text-md">
          Please check your email inbox (make sure to check your junk folder) and click on the provided link to sign in.
          If you don&apos;t recieve an email, {/* TODO: Debounce signin */}
          <InlineLink href="#" onClick={() => signIn({ email: email! })}>
            click here to resend.
          </InlineLink>
        </div>
      </div>
    </div>
  ) : (
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
          onEnterKey={() => onSubmitEmail()}
        />
      </div>

      <div className="space-y-3 pb-2 pt-4">
        <button className="btn-neutral btn w-full" onClick={() => onSubmitEmail()} disabled={isLoading}>
          {isLoading ? <Spinner /> : 'Sign in'}
        </button>
        <button className="btn-outline btn w-full space-x-1" onClick={() => onSubmitSso()}>
          <Image src="/google-logo.png" alt="google logo" />
          <div>Sign in with Google</div>
        </button>
      </div>

      <div className="pt-1 text-sm">
        Don&apos;t have an account? <InlineLink href="/signup">Sign up.</InlineLink>
      </div>
    </div>
  );
}
