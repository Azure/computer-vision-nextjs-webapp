import { Card } from '@/_components/Card';
import { SignupForm } from './_components/SignUpForm';

export default async function SignupPage() {
  return (
    <Card className="w-full space-y-2 rounded-md p-6 lg:max-w-lg">
      <h1 className="text-center text-3xl">Sign up to vote</h1>
      <SignupForm />
    </Card>
  );
}
