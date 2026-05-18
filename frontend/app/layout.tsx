import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI広告分析ダッシュボード',
  description: 'AI-Driven Ads Measurement & Analysis System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ backgroundColor: '#0f172a', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
