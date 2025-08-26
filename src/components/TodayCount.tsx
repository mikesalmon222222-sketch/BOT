'use client';

import { useTodayCount } from '@/hooks/useBidData';
import { useAppContext } from '@/contexts/AppContext';

export function TodayCount() {
  const { data, isLoading, error } = useTodayCount();
  const { portals } = useAppContext();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
          <div className="h-32 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading today's count: {error.message}
        </div>
      </div>
    );
  }

  const todayData = data?.data;
  const totalBids = todayData?.totalBids || 0;
  const portalCounts = todayData?.portalCounts || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Today's Count</h1>
      
      {/* Total Count Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
          <div className="text-sm font-medium text-gray-500">Total Bids Hunted</div>
            <p className="text-3xl font-bold mt-2">{totalBids}</p>
          </div>
          <div className="text-4xl opacity-75">
            🎯
          </div>
        </div>
        <div className="mt-4 text-sm opacity-90">
          Last updated: {todayData?.lastUpdated ? new Date(todayData.lastUpdated).toLocaleTimeString() : 'Never'}
        </div>
      </div>

      {/* Portal Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Portal Breakdown</h3>
        
        {portalCounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No data available for today</p>
            <p className="text-sm mt-1">Check back later or refresh the page</p>
          </div>
        ) : (
          <div className="space-y-3">
            {portalCounts.map((portalCount) => {
              const portal = portals.find(p => p.id === portalCount.portalId);
              const percentage = totalBids > 0 ? (portalCount.count / totalBids) * 100 : 0;
              
              return (
                <div key={portalCount.portalId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${portal?.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{portalCount.portalName}</div>
                      <div className="text-sm text-gray-500">
                        {percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{portalCount.count}</div>
                    <div className="text-xs text-gray-500">bids</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Active Portals</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {portals.filter(p => p.isActive).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Total Portals</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {portals.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Avg per Portal</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {portalCounts.length > 0 ? Math.round(totalBids / portalCounts.length) : 0}
          </div>
        </div>
      </div>
    </div>
  );
}