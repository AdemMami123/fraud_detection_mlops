import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fraud Detection System | MLOps Pipeline',
  description: 'Real-time credit card fraud detection using machine learning. Analyze transactions and identify potential fraud with our advanced ML model.',
  keywords: ['fraud detection', 'machine learning', 'MLOps', 'credit card', 'security'],
  authors: [{ name: 'Fraud Detection MLOps Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
