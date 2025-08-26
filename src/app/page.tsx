'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { MainContent } from '@/components/layout/MainContent';

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MainContent />
    </div>
  );
}