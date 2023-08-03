import { NextRequest } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { Account, User } from "@prisma/client";
import prisma from "@/_lib/server/prismadb";
import { generateApiResponse } from "@/api/_lib/generateApiResponse";
import { logErrorMessage } from "@/api/_lib/generateErrorMessage";
import { authOptions } from "@/api/auth/[...nextauth]/route";

const bodySchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
});

export type ApiSignUpBody = z.infer<typeof bodySchema>;

export type ApiSignUpResp = {
  user: User;
  account: Account;
};

export const signUp = async (req: NextRequest) => {
  const body = await req.json();

  try {
    const session = await getServerSession(authOptions);

    if (session?.user) {
      return generateApiResponse({
        status: 500,
        error: "Already signed in.",
      });
    }

    const { firstName, lastName, email } = bodySchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return generateApiResponse({
        status: 400,
        error: "Email already registered. Please sign in.",
      });
    }

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
      },
    });

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        provider: "email",
        type: "email",
        providerAccountId: email,
      },
    });

    return generateApiResponse<ApiSignUpResp>({
      status: 200,
      data: { user, account },
    });
  } catch (error) {
    const errorMessage = logErrorMessage({
      message: "Error signing up.",
      error,
    });

    return generateApiResponse({ status: 500, error: errorMessage });
  }
};
