import { callBackend } from '../server/callBackend';
import { ApiSignInBody, ApiSignInResp } from '@/api/signin/_handlers/signIn';

export const signIn = async ({ email }: { email: string }): Promise<string> => {
  // Make sure the user has an voting account
  const { user } = await callBackend<ApiSignInResp, ApiSignInBody>({
    method: 'POST',
    url: '/api/signin',
    body: {
      email,
    },
  });

  // Save voting email in local storage
  window?.localStorage.setItem('cn-scenario-uid', user.id);

  return user.id;
};
