import prisma from '@/_lib/server/prismadb';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { Session, User } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import AzureADB2CProvider from 'next-auth/providers/azure-ad-b2c';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.SENDGRID_SMTP_HOST,
        port: process.env.SENDGRID_SMTP_PORT,
        auth: {
          user: process.env.SENDGRID_SMTP_USER,
          pass: process.env.SENDGRID_SMTP_KEY,
        },
      },
      from: process.env.SENDGRID_FROM_EMAIL,
    }),
    AzureADB2CProvider({
      tenantId: process.env.AZURE_AD_B2C_TENANT_NAME,
      clientId: process.env.AZURE_AD_B2C_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET,
      primaryUserFlow: process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW,
      authorization: { params: { scope: 'offline_access openid' } },
    }),
  ],
  callbacks: {
    session: async ({ session, user }: { session: Session; user: User }) => {
      return {
        ...session,
        user,
      };
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
