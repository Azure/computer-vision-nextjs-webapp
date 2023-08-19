import prisma from '@/_lib/server/prismadb';
import { VoteUploader } from './_components/VoteUploader';
import { RescindVoteBtn } from './_components/RescindVoteBtn';
import { SignOutButton } from './_components/SignOutButton';
import { ThemeSelector } from './_components/ThemeSelector';
import { redirect } from 'next/navigation';
import { Image } from './_components/Image';

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

  let vote;

  const votes = await prisma.vote.findMany();
  let numCatVotes = 0;
  let numDogVotes = 0;

  // Count vote distribution & find user's vote
  for (let i = 0; i < votes.length; i++) {
    const { animal, userId } = votes[i];
    if (userId === uid) vote = votes[i];
    if (animal === 'cat') numCatVotes++;
    if (animal === 'dog') numDogVotes++;
  }

  const percentCatVotes = Math.round((numCatVotes / (numCatVotes + numDogVotes)) * 100) || 0;
  const percentDogVotes = 100 - percentCatVotes || 0;
  const defaultWidth = !percentCatVotes && !percentDogVotes ? 50 : 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-start overflow-y-auto p-8 ">
      <div className="mx-0 my-auto flex w-full justify-center lg:w-1/2">
        <div className="space-y-6">
          {/* Voting area */}
          <div className="flex w-full flex-col space-y-3">
            <div className="text-4xl font-light">Hi {user.firstName}.</div>
            <div className="text-xl">Vote for Cat (or Dog).</div>
            <div className="text-xl">Vote by uploading an image of a cat or dog.</div>
            {vote?.blobImageUrl && (
              <Image src={vote?.blobImageUrl} alt="Voting image" className="sm:max-h-md h-auto w-auto max-w-xs" />
            )}
            {!vote && <VoteUploader userId={user.id} />}
            {vote && <div className="text-xl">You have voted for &quot;{vote.animal}&quot;.</div>}
            {vote && <RescindVoteBtn voteId={vote.id} />}
          </div>

          {/* Vote distribution */}

          <div className="space-y-3">
            <div className="text-xl font-semibold">Vote distribution:</div>
            <div>
              Number of cat votes: {numCatVotes} ({percentCatVotes}%)
            </div>
            <div>
              Number of dog votes: {numDogVotes} ({percentDogVotes}%)
            </div>
            <div className="!mt-5 flex w-full overflow-hidden rounded-3xl">
              <div
                className="flex h-10 items-center justify-center overflow-hidden bg-blue-400 text-sm"
                style={{ width: `${percentCatVotes || defaultWidth}%` }}
              >
                {percentCatVotes}%
              </div>
              <div
                className="flex h-10 items-center justify-center overflow-hidden bg-orange-400 text-sm"
                style={{ width: `${percentDogVotes || defaultWidth}%` }}
              >
                {percentDogVotes}%
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
