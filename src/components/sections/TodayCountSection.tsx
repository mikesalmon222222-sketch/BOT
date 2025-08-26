'use client';

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  RefreshCw,
  Calendar,
  Target,
  Globe,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTodayStats } from '@/hooks/useTodayStats';
import { formatCurrency, formatRelativeTime, calculatePercentage } from '@/lib/utils';

export function TodayCountSection() {
  const { data: todayStats, isLoading, refetch, isFetching } = useTodayStats();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = todayStats?.data;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Today's Hunt Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time bid tracking and portal statistics
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids Hunted</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBids || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newBids || 0} from last update
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Bids Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.newBids || 0}</div>
            <p className="text-xs text-muted-foreground">
              Fresh opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Portals</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.activePortals || 0}/{stats?.totalPortals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculatePercentage(stats?.activePortals || 0, stats?.totalPortals || 1)}% operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sm">
              {stats?.lastUpdate ? formatRelativeTime(stats.lastUpdate) : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-refresh enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portals Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Bids by Portal</span>
            </CardTitle>
            <CardDescription>Distribution of bids across connected portals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.bidsByPortal && Object.entries(stats.bidsByPortal).map(([portalId, portalData]) => (
                <div key={portalId} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{portalData.name}</span>
                      <span className="text-sm text-muted-foreground">{portalData.count} bids</span>
                    </div>
                    <div className="mt-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${portalData.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Bid Categories</span>
            </CardTitle>
            <CardDescription>Categories with the most opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.bidsByCategory && Object.entries(stats.bidsByCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Bid Status Overview</span>
          </CardTitle>
          <CardDescription>Current status distribution of all tracked bids</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats?.bidsByStatus.open || 0}</div>
              <div className="text-sm text-muted-foreground">Open</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats?.bidsByStatus.awarded || 0}</div>
              <div className="text-sm text-muted-foreground">Awarded</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats?.bidsByStatus.closed || 0}</div>
              <div className="text-sm text-muted-foreground">Closed</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats?.bidsByStatus.cancelled || 0}</div>
              <div className="text-sm text-muted-foreground">Cancelled</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}