import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — Marudam',
  description: 'Your field, today. Powered by Marudam.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #0e1e12 0%, #152b1b 40%, #10241b 100%)',
        color: '#e5e7eb',
        fontFamily: 'inherit',
      }}
    >
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
