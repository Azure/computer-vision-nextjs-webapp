import { SignOutButton } from './_components/SignOutButton';
import { ThemeSelector } from './_components/ThemeSelector';
import { NextAuthProvider, ThemeProvider, ToastProvider } from './providers';
import '@/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <head></head>
      <body className="h-screen">
        <ToastProvider>
          <main className="h-screen">
            <NextAuthProvider>{children}</NextAuthProvider>
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <SignOutButton />
              <ThemeSelector />
            </div>
          </main>
        </ToastProvider>
      </body>
    </ThemeProvider>
  );
  ``;
}
