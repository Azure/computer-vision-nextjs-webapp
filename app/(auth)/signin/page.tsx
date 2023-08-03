import { Card } from '@/_components/Card';
import { SignInForm } from './_components/SignInForm';
import { redirect } from 'next/navigation';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect('/');
  }

  return (
    <Card className="w-full space-y-2 rounded-md p-6 lg:max-w-lg">
      <h1 className="text-center text-3xl">Sign in</h1>
      <SignInForm />
    </Card>
  );
}
