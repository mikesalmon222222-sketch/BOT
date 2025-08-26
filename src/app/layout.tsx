import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bid Hunter - Government Contract Portal',
  description: 'Comprehensive bid tracking and management system for government contracts',
  keywords: 'government bids, contracts, procurement, bid hunting, tender management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}