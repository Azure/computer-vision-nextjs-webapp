import { Card } from '@/_components/Card';
import { SignupForm } from './_components/SignUpForm';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';

export default async function SignupPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect('/');
  }

  return (
    <Card className="w-full space-y-2 rounded-md p-6 lg:max-w-lg">
      <h1 className="text-center text-3xl">Sign up</h1>
      <SignupForm />
    </Card>
  );
}
