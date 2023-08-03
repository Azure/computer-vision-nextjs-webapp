import { getServerUrl } from '@/_lib/server/getServerUrl';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export const GET = (req: NextRequest) => {
  const searchParams = new URL(req.url).searchParams;
  redirect(`/signin?${searchParams}`);
};
