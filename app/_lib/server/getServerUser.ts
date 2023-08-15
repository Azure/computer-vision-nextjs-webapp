import { User } from '@prisma/client';
import prisma from '@/_lib/server/prismadb';

export const getServerUser = async (): Promise<User | null> => {
  const email = window?.localStorage.getItem('cn-scenario-email');

  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
};
