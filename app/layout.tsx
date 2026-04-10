import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Birthday QR Game',
  description: 'Mini web app for birthday QR tasks',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv">
      <body>{children}</body>
    </html>
  );
}
