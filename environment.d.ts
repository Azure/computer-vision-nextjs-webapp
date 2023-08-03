import { Pathname } from "@app/lib/types/api";
import { User } from "@prisma/client";
import { type DefaultSession } from "next-auth";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENVIRONMENT: string;
      BASE_URL: string;
      DATABASE_URL: string;
      NEXTAUTH_SECRET: string;
      SENDGRID_FROM_EMAIL: string;
      SENDGRID_SMTP_USER: string;
      SENDGRID_SMTP_KEY: string;
      SENDGRID_SMTP_HOST: string;
      SENDGRID_SMTP_PORT: string;
      AZURE_COMPUTER_VISION_KEY: string;
      AZURE_COMPUTER_VISION_ENDPOINT: string;
      AZURE_STORAGE_ACCOUNT_NAME: string;
      AZURE_STORAGE_ACCOUNT_KEY: string;
      AZURE_STORAGE_SAS_TOKEN: string;
    }
  }
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   * Defaults to default prisma schema, needs to be updated on User table schema changes
   */
  export interface Session {
    user: User | null;
  }
}

declare module "daisyui/src/theming/themes" {
  const themes: any; // replace 'any' with actual type
  export default themes;
}

export {};
