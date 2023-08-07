import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Vote } from '@prisma/client';
import prisma from '@/_lib/server/prismadb';
import { generateApiResponse } from '@/api/_lib/generateApiResponse';
import { logErrorMessage } from '@/api/_lib/generateErrorMessage';
import { dogOrCat } from '../_lib/dogOrCat';

const bodySchema = z.object({
  userId: z.string(),
  blobUrl: z.string(),
});

export type ApiPostVoteBody = z.infer<typeof bodySchema>;

export type ApiPostVoteResp = {
  vote: Vote;
};

export const postVote = async (req: NextRequest) => {
  const body = await req.json();

  try {
    const { blobUrl, userId } = bodySchema.parse(body);

    const animal = await dogOrCat(blobUrl);

    if (!animal) {
      return generateApiResponse({
        status: 500,
        error: 'Could not identify a cat or dog in the provided image.',
      });
    }

    const vote = await prisma.vote.create({
      data: {
        userId,
        animal,
        blobImageUrl: blobUrl,
      },
    });

    return generateApiResponse<ApiPostVoteResp>({
      status: 200,
      data: { vote },
    });
  } catch (error) {
    const errorMessage = logErrorMessage({
      message: 'Error signing up.',
      error,
    });

    return generateApiResponse({ status: 500, error: errorMessage });
  }
};
