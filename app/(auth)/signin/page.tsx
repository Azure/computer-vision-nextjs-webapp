import { Card } from '@/_components/Card';
import { SignInForm } from './_components/SignInForm';

export default async function SignInPage() {
  return (
    <Card className="w-full space-y-2 rounded-md p-6 lg:max-w-lg">
      <h1 className="text-center text-3xl">Sign in</h1>
      <SignInForm />
    </Card>
  );
}
