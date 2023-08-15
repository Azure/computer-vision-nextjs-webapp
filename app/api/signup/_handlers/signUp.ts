import { NextRequest } from 'next/server';
import { z } from 'zod';
import { User } from '@prisma/client';
import prisma from '@/_lib/server/prismadb';
import { generateApiResponse } from '@/api/_lib/generateApiResponse';
import { logErrorMessage } from '@/api/_lib/generateErrorMessage';

const bodySchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
});

export type ApiSignUpBody = z.infer<typeof bodySchema>;

export type ApiSignUpResp = {
  user: User;
};

export const signUp = async (req: NextRequest) => {
  const body = await req.json();

  try {
    const { firstName, lastName, email } = bodySchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return generateApiResponse({
        status: 400,
        error: 'Email already registered. Please sign in.',
      });
    }

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
      },
    });

    return generateApiResponse<ApiSignUpResp>({
      status: 200,
      data: { user },
    });
  } catch (error) {
    const errorMessage = logErrorMessage({
      message: 'Error signing up.',
      error,
    });

    return generateApiResponse({ status: 500, error: errorMessage });
  }
};
