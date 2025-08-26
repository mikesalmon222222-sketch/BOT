'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { TodayCountSection } from '@/components/sections/TodayCountSection';
import { HuntedDataSection } from '@/components/sections/HuntedDataSection';
import { CredentialsSection } from '@/components/sections/CredentialsSection';

export function MainContent() {
  const { state } = useAppContext();

  const renderSection = () => {
    switch (state.activeSection) {
      case 'today-count':
        return <TodayCountSection />;
      case 'hunted-data':
        return <HuntedDataSection />;
      case 'credentials':
        return <CredentialsSection />;
      default:
        return <TodayCountSection />;
    }
  };

  return (
    <div className="flex-1 h-screen overflow-hidden">
      <div className="h-full overflow-y-auto scrollbar-thin">
        {renderSection()}
      </div>
    </div>
  );
}