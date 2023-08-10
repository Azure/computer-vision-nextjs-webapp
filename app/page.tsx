import prisma from '@/_lib/server/prismadb';
import { VoteUploader } from './_components/VoteUploader';
import { RescindVoteBtn } from './_components/RescindVoteBtn';
import { SignOutButton } from './_components/SignOutButton';
import { ThemeSelector } from './_components/ThemeSelector';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: { uid?: string };
};

export default async function Home({ searchParams: { uid } }: Props) {
  if (!uid) {
    redirect('/signup');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: uid,
    },
  });

  if (!user) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 text-lg">
        <div>No user found.</div> <SignOutButton />
      </div>
    );
  }

  // Get user vote
  const vote = await prisma.vote.findUnique({
    where: {
      userId: uid,
    },
  });

  // Count vote distribution
  const votes = await prisma.vote.findMany();
  let numCatVotes = 0,
    numDogVotes = 0,
    percentCatVotes = 50,
    percentDogVotes = 50;

  for (const { animal } of votes) {
    if (animal === 'cat') numCatVotes++;
    if (animal === 'dog') numDogVotes++;
  }

  percentCatVotes = Math.round((numCatVotes / (numCatVotes + numDogVotes)) * 100);
  percentDogVotes = 100 - percentCatVotes;

  return (
    <div className="flex min-h-screen flex-col items-center justify-start overflow-y-auto p-8 ">
      <div className="mx-0 my-auto flex w-full justify-center lg:w-1/2">
        <div className="space-y-6">
          {/* Voting area */}
          <div className="flex w-full flex-col space-y-3">
            <div className="text-4xl font-light">Hi {user.firstName}.</div>
            <div className="text-xl">Vote for Cat (or Dog).</div>
            <div className="text-xl">Vote by uploading an image of a cat or dog.</div>
            <VoteUploader imageUrl={vote?.blobImageUrl} userId={user.id} />
            {vote && <div className="text-xl">You have voted for &quot;{vote.animal}&quot;.</div>}
            {vote && <RescindVoteBtn voteId={vote.id} />}
          </div>

          {/* Vote distribution */}

          <div className="space-y-3">
            <div className="text-xl font-semibold">Vote distribution:</div>
            <div>
              Number of dog votes: {numDogVotes} ({percentDogVotes}%)
            </div>
            <div>
              Number of cat votes: {numCatVotes} ({percentCatVotes}%)
            </div>
            <div className="!mt-5 flex w-full overflow-hidden rounded-3xl">
              <div
                className="flex h-10 items-center justify-center overflow-hidden bg-blue-400"
                style={{ width: `${percentCatVotes}%` }}
              >
                Cat: {percentCatVotes}%
              </div>
              <div
                className="flex h-10 items-center justify-center overflow-hidden bg-orange-400"
                style={{ width: `${percentDogVotes}%` }}
              >
                Dog: {percentDogVotes}%
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 left-4 hidden items-center gap-2 sm:flex">
        <SignOutButton />
        <ThemeSelector />
      </div>
    </div>
  );
}
