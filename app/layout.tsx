import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RABT | رَبْط — Hifz Early-Warning Retention Engine',
  description: 'A quiet, precise instrument for detecting forgetting and silent erosion in Qur’an memorization (Hifz).',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-ink antialiased selection:bg-teal-light selection:text-teal-forest">
        {children}
      </body>
    </html>
  );
}
