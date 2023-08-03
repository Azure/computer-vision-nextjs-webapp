import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { User } from '@prisma/client';
import { VoteUploader } from './_components/VoteUploader';
import prisma from '@/_lib/server/prismadb';
import { RescindVoteBtn } from './_components/RescindVoteBtn';
import { SignOutButton } from './_components/SignOutButton';
import { ThemeSelector } from './_components/ThemeSelector';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user as User;

  if (!user) {
    redirect('/signup');
  }

  const vote = await prisma.vote.findUnique({
    where: {
      userId: user.id,
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-start overflow-y-auto p-8 ">
      <div className="mx-0 my-auto flex w-full justify-center lg:w-1/2">
        <div className="flex flex-col space-y-3">
          <div className="text-4xl font-light">Hi {user.firstName}.</div>
          <div className="text-xl">Vote for Cat (or Dog).</div>
          <div className="text-xl">Vote by uploading an image of a cat or dog.</div>
          <VoteUploader imageUrl={vote?.blobImageUrl} />
          {vote && <div className="text-xl">You have voted for &quot;{vote.animal}&quot;</div>}
          {vote && <RescindVoteBtn voteId={vote.id} />}
        </div>
      </div>
      <div className="absolute bottom-4 left-4 hidden items-center gap-2 sm:flex">
        <SignOutButton />
        <ThemeSelector />
      </div>
    </div>
  );
}
