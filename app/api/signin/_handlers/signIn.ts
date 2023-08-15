import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import prisma from '@/_lib/server/prismadb';
import { generateApiResponse } from '@/api/_lib/generateApiResponse';
import { logErrorMessage } from '@/api/_lib/generateErrorMessage';
import { User } from '@prisma/client';

const bodySchema = z.object({
  email: z.string(),
});

export type ApiSignInBody = z.infer<typeof bodySchema>;

export type ApiSignInResp = {
  user: User;
};

export const signIn = async (req: NextRequest) => {
  const body = await req.json();

  try {
    const { email } = bodySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return generateApiResponse({
        status: 404,
        error: 'Email not registered.',
      });
    }

    return generateApiResponse<ApiSignInResp>({
      status: 200,
      data: { user },
    });
  } catch (error) {
    const errorMessage = logErrorMessage({
      message: 'Error signing in.',
      error,
    });

    return generateApiResponse({ status: 500, error: errorMessage });
  }
};
