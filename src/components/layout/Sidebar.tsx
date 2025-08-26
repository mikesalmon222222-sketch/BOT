'use client';

import React from 'react';
import { 
  BarChart3, 
  Database, 
  Settings, 
  RefreshCw,
  Activity,
  Users,
  Globe
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useTodayStats } from '@/hooks/useTodayStats';

const sidebarItems = [
  {
    id: 'today-count' as const,
    label: "Today's Count",
    icon: BarChart3,
    description: 'View daily statistics',
  },
  {
    id: 'hunted-data' as const,
    label: 'Hunted Data',
    icon: Database,
    description: 'Browse all bid data',
  },
  {
    id: 'credentials' as const,
    label: 'Credentials',
    icon: Settings,
    description: 'Manage portal access',
  },
];

export function Sidebar() {
  const { state, setActiveSection } = useAppContext();
  const { data: todayStats } = useTodayStats();

  return (
    <div className="w-80 bg-card border-r border-border h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Bid Hunter</h1>
            <p className="text-sm text-muted-foreground">Government Contract Portal</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 border-b border-border">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {todayStats?.data.totalBids || 0}
            </div>
            <div className="text-xs text-muted-foreground">Total Bids</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {todayStats?.data.newBids || 0}
            </div>
            <div className="text-xs text-muted-foreground">New Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {todayStats?.data.activePortals || 0}
            </div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {todayStats?.data.totalPortals || 0}
            </div>
            <div className="text-xs text-muted-foreground">Portals</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = state.activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs opacity-80 truncate">{item.description}</div>
              </div>
              {item.id === 'hunted-data' && todayStats?.data.newBids && (
                <Badge variant="success" className="text-xs">
                  {todayStats.data.newBids}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Portal Status */}
      <div className="p-4 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Portal Status</h3>
        <div className="space-y-2">
          {state.portals.slice(0, 3).map((portal) => (
            <div key={portal.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  portal.status === 'active' ? 'bg-green-500' :
                  portal.status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'
                )} />
                <span className="text-muted-foreground truncate max-w-[120px]">
                  {portal.name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {portal.bidCount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <RefreshCw className="h-3 w-3" />
            <span>Auto-refresh</span>
          </div>
          <div className="flex items-center space-x-1">
            <Globe className="h-3 w-3" />
            <span>Live</span>
          </div>
        </div>
        {todayStats?.data.lastUpdate && (
          <div className="text-xs text-muted-foreground mt-2">
            Last updated: {new Date(todayStats.data.lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}