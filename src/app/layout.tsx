import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ToolShare',
  description: 'A platform to facilitate users Lending and Borrowing tools',
};

export default function RootLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className="antialiased">
    {children}
    </body>
    </html>
  );
}
