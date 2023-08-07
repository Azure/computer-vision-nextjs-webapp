import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export const GET = (req: NextRequest) => {
  const searchParams = new URL(req.url).searchParams;
  redirect(`/signin?${searchParams}`);
};
