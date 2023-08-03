'use client';

import { Spinner } from '@/_components/Spinner';
import { Input } from '@/_components/inputs/Input';
import { InlineLink } from '@/_components/inputs/InlineLink';
import { useToast } from '@/_hooks/useToast';
import { signIn } from '@/_lib/client/signIn';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import { useEffect, useState } from 'react';
import { Image } from '@/_components/Image';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export function SignInForm() {
  const showToast = useToast();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState<string>();
  const [isErrorEmail, setIsErrorEmail] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false);

  useEffect(() => {
    const error = searchParams?.get('error');
    if (error === 'OAuthAccountNotLinked') {
      showToast({ type: 'danger', text: 'Email account already exists, please sign in with your email.' });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
      await nextAuthSignIn('azure-ad-b2c');
    } catch (error) {
      console.error(error);
      showToast({
        type: 'danger',
        text: 'Something went wrong: ' + error,
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
        <button className="btn-outline btn w-full" onClick={() => onSubmitSso()} disabled={isLoading}>
          <Image src="/logos/microsoft.png" alt="microsoft logo" />
          Sign in with Microsoft
        </button>
      </div>

      <div className="pt-1 text-sm">
        Don&apos;t have an account? <InlineLink href="/signup">Sign up.</InlineLink>
      </div>
    </div>
  );
}
