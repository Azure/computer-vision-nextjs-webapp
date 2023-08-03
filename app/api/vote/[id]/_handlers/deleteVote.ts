import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import prisma from '@/_lib/server/prismadb';
import { generateApiResponse } from '@/api/_lib/generateApiResponse';
import { logErrorMessage } from '@/api/_lib/generateErrorMessage';
import { authOptions } from '@/api/auth/[...nextauth]/route';

export const deleteVote = async (_: NextRequest, { params: { id } }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return generateApiResponse({
        status: 401,
        error: 'Unauthenticated.',
      });
    }

    await prisma.vote.delete({
      where: {
        id,
      },
    });

    return generateApiResponse({
      status: 200,
      data: {},
    });
  } catch (error) {
    const errorMessage = logErrorMessage({
      message: 'Error signing up.',
      error,
    });

    return generateApiResponse({ status: 500, error: errorMessage });
  }
};
