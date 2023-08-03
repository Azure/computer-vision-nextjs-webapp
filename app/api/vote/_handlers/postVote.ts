import { NextRequest } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { Account, User } from "@prisma/client";
import prisma from "@/_lib/server/prismadb";
import { generateApiResponse } from "@/api/_lib/generateApiResponse";
import { logErrorMessage } from "@/api/_lib/generateErrorMessage";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { dogOrCat } from "../_lib/dogOrCat";

const bodySchema = z.object({
  blobUrl: z.string(),
});

export type ApiPostVoteBody = z.infer<typeof bodySchema>;

export type ApiPostVoteResp = {
  animal: "dog" | "cat" | null;
};

export const postVote = async (req: NextRequest) => {
  const body = await req.json();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return generateApiResponse({
        status: 401,
        error: "Unauthenticated.",
      });
    }

    const { blobUrl } = bodySchema.parse(body);

    const animal = await dogOrCat(blobUrl);

    return generateApiResponse<ApiPostVoteResp>({
      status: 200,
      data: { animal },
    });
  } catch (error) {
    const errorMessage = logErrorMessage({
      message: "Error signing up.",
      error,
    });

    return generateApiResponse({ status: 500, error: errorMessage });
  }
};
