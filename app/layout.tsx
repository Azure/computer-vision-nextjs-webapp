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
          </main>
        </ToastProvider>
      </body>
    </ThemeProvider>
  );
  ``;
}
