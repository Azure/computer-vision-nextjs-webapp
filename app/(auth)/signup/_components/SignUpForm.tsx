"use client";

import { Spinner } from "@/_components/Spinner";
import { ToastType } from "@/_components/Toast";
import { Input } from "@/_components/inputs/Input";
import { useToast } from "@/_hooks/useToast";
import { ApiSignUpBody, ApiSignUpResp } from "@/api/signup/_handlers/signUp";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { InlineLink } from "@/_components/inputs/InlineLink";
import { Image } from "@/_components/Image";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { signIn } from "@/_lib/client/signIn";
import { callBackend } from "@/_lib/server/callBackend";

export function SignupForm() {
  const showToast = useToast();

  // Form data
  const [email, setEmail] = useState<string>();
  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>();

  // Form errors
  const [isErrorEmail, setIsErrorEmail] = useState<boolean>();
  const [isErrorFirstName, setIsErrorFirstName] = useState<boolean>();
  const [isErrorLastName, setIsErrorLastName] = useState<boolean>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSignedUp, setIsSignedUp] = useState<boolean>();

  const onSubmitEmail = async () => {
    try {
      if (isSignedUp || isLoading) {
        return;
      }

      setIsLoading(true);
      const [type, text] = [
        "danger" as ToastType,
        "Please fill in all required fields.",
      ];

      if (!email) {
        setIsErrorEmail(true);
        showToast({ type, text });
      }

      if (!firstName) {
        setIsErrorFirstName(true);
        showToast({ type, text });
      }

      if (!lastName) {
        setIsErrorLastName(true);
        showToast({ type, text });
      }

      if (!email || !firstName || !lastName) {
        return;
      }

      await callBackend<ApiSignUpResp, ApiSignUpBody>({
        url: "/api/signup",
        method: "POST",
        body: {
          email,
          firstName,
          lastName,
        },
      });

      showToast({ type: "success", text: "Success!" });

      await signIn({ email });

      setIsSignedUp(true);
    } catch (error) {
      console.error(error);
      showToast({
        type: "danger",
        text: "Something went wrong: " + error,
      });
    }

    setIsLoading(false);
  };

  const onSubmitSso = async () => {
    try {
      await nextAuthSignIn("azure-ad");
    } catch (error) {
      console.error(error);
      showToast({
        type: "danger",
        text: "Something went wrong: " + error,
      });
    }
  };

  if (isSignedUp) {
    return (
      <div className="mt-3 flex w-full flex-col items-center gap-3 px-5">
        <CheckCircleIcon height={80} className="text-success" />
        <div className="space-y-1">
          <div className="w-full text-xl font-semibold">Check your email</div>
          <div className="text-md">
            Please check your email inbox (make sure to check your junk folder)
            and click on the provided link to sign in. If you don&apos;t recieve
            an email, {/* TODO: Debounce resend */}
            <InlineLink href="#" onClick={() => signIn({ email: email! })}>
              click here to resend.
            </InlineLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-4"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSubmitEmail();
        }
      }}
    >
      <div className="mt-3 mb-7 text-sm">
        Note: Due to safelink protection and tenant restrictions, work emails
        are not guaranteed to work. Please use a personal account to sign in
        with Microsoft or via email.
      </div>
      <div className="space-y-6">
        <Input
          label="First name"
          isError={isErrorFirstName}
          value={firstName}
          onChange={setFirstName}
          required
        />
        <Input
          label="Last name"
          isError={isErrorLastName}
          value={lastName}
          onChange={setLastName}
          required
        />
        <Input
          label="Email"
          isError={isErrorEmail}
          value={email}
          onChange={setEmail}
          required
        />
      </div>

      <div className="space-y-3 pb-2 pt-4">
        <button
          className="btn-neutral btn w-full"
          onClick={() => onSubmitEmail()}
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : "Sign up"}
        </button>
        <button
          className="btn-outline btn w-full"
          onClick={() => onSubmitSso()}
          disabled={isLoading}
        >
          <Image src="/logos/microsoft.png" alt="microsoft logo" />
          Sign in with Microsoft
        </button>
      </div>

      <div className="pt-1 text-sm">
        Already have an account?{" "}
        <InlineLink href="/signin">Sign in.</InlineLink>
      </div>
    </div>
  );
}
