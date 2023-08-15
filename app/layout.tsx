import { NextAuthProvider, ThemeProvider, ToastProvider } from './providers';
import '@/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <head></head>
      <body className="h-screen">
        <ToastProvider>
          <main className="h-screen">{children}</main>
        </ToastProvider>
      </body>
    </ThemeProvider>
  );
  ``;
}
