import { Navbar } from '@/components/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Navbar />
      <main className="flex-1 ml-64 overflow-auto">
        {children}
      </main>
    </div>
  );
}