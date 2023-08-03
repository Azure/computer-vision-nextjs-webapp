import {
  getSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";
import { callBackend } from "../server/callBackend";
import { ApiSignInBody } from "@/api/signin/_handlers/signIn";

export const signIn = async ({ email }: { email: string }) => {
  const session = await getSession();

  if (session?.user) {
    await nextAuthSignOut({ redirect: false });
  }

  await callBackend<{}, ApiSignInBody>({
    method: "POST",
    url: "/api/signin",
    body: {
      email,
    },
  });

  return await nextAuthSignIn("email", {
    email,
    redirect: false,
  });
};
