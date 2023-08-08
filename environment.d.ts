import { Pathname } from '@app/lib/types/api';
import { User } from '@prisma/client';
import { type DefaultSession } from 'next-auth';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AZURE_DATABASE_URL: string;
      AZURE_COMPUTER_VISION_KEY: string;
      AZURE_COMPUTER_VISION_ENDPOINT: string;
      AZURE_STORAGE_ACCOUNT_NAME: string;
      AZURE_STORAGE_ACCOUNT_KEY: string;
    }
  }
}

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   * Defaults to default prisma schema, needs to be updated on User table schema changes
   */
  export interface Session {
    user: User | null;
  }
}

declare module 'daisyui/src/theming/themes' {
  const themes: any; // replace 'any' with actual type
  export default themes;
}

export {};
