import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'minijam3',
  description: 'Created with minijam3',
  generator: 'minijam3.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
