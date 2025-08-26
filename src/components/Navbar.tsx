'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTodayCount } from '@/hooks/useBidData';
import { useAppContext } from '@/contexts/AppContext';

export function Navbar() {
  const pathname = usePathname();
  const { data: todayCountData, isLoading } = useTodayCount();
  const { portals } = useAppContext();

  const navItems = [
    {
      id: 'today-count',
      label: "Today's Count",
      href: '/dashboard/today-count',
      description: 'Total bids hunted today',
      count: todayCountData?.data?.totalBids || 0,
    },
    {
      id: 'hunted-data',
      label: 'Hunted Data',
      href: '/dashboard/hunted-data',
      description: 'All data from portals',
      count: null,
    },
    {
      id: 'credentials',
      label: 'Credentials',
      href: '/dashboard/credentials',
      description: 'Manage portal credentials',
      count: portals.length,
    },
  ];

  return (
    <nav className="w-64 h-screen bg-gray-900 text-white p-4 fixed left-0 top-0">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-blue-400">Bid Hunter</h1>
        <p className="text-sm text-gray-400">Web Application</p>
      </div>

      <div className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`block p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {item.description}
                  </div>
                </div>
                {item.count !== null && (
                  <div className="flex items-center">
                    {isLoading && item.id === 'today-count' ? (
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-xs text-gray-500">
          <div>Active Portals: {portals.filter(p => p.isActive).length}</div>
          <div className="mt-1">
            Last Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </nav>
  );
}