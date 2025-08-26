'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  ExternalLink,
  Calendar,
  DollarSign,
  Building,
  MapPin,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useBidData, useRefreshBidData, useExportBidData } from '@/hooks/useBidData';
import { FilterOptions, SortOptions } from '@/types';
import { formatCurrency, formatDate, formatRelativeTime, getStatusColor, debounce } from '@/lib/utils';

export function HuntedDataSection() {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOptions>({ field: 'publishedDate', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');

  const { data: bidData, isLoading, refetch, isFetching } = useBidData(
    { ...filters, search: searchTerm },
    sort
  );
  const refreshMutation = useRefreshBidData();
  const exportMutation = useExportBidData();

  // Debounced search handler
  const debouncedSearch = debounce((term: string) => {
    setFilters(prev => ({ ...prev, search: term }));
  }, 300);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const handleExport = () => {
    if (bidData?.data) {
      exportMutation.mutate(bidData.data);
    }
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status?.includes(status) 
        ? prev.status.filter(s => s !== status)
        : [...(prev.status || []), status]
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const bids = bidData?.data || [];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hunted Bid Data</h1>
          <p className="text-muted-foreground mt-1">
            Browse and analyze all tracked government bids
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending || bids.length === 0}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshMutation.isPending || isFetching}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(refreshMutation.isPending || isFetching) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bids, agencies, or descriptions..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Status:</span>
              {['open', 'closed', 'awarded', 'cancelled'].map(status => (
                <Button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  variant={filters.status?.includes(status) ? 'default' : 'outline'}
                  size="sm"
                  className="h-8"
                >
                  {status}
                </Button>
              ))}
              {(filters.status?.length || searchTerm) && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="h-8"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Showing {bids.length} results
              {refreshMutation.isSuccess && (
                <span className="text-green-600 ml-2">
                  • {refreshMutation.data?.message}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bid Cards */}
      <div className="grid gap-6">
        {bids.map((bid) => (
          <Card key={bid.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{bid.title}</CardTitle>
                  <CardDescription className="text-base">
                    {bid.description}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(bid.status)}>
                  {bid.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Building className="h-4 w-4" />
                  <span>{bid.agency}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{bid.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatCurrency(bid.amount)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {formatDate(bid.deadline)}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Bid Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Bid Number</div>
                    <div className="text-muted-foreground">{bid.bidNumber}</div>
                  </div>
                  <div>
                    <div className="font-medium">Portal</div>
                    <div className="text-muted-foreground">{bid.portalName}</div>
                  </div>
                  <div>
                    <div className="font-medium">Category</div>
                    <div className="text-muted-foreground">{bid.category}</div>
                  </div>
                  <div>
                    <div className="font-medium">Published</div>
                    <div className="text-muted-foreground">
                      {formatRelativeTime(bid.publishedDate)}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {bid.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {bid.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Contact and Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm">
                    <div className="font-medium">{bid.contactInfo.name}</div>
                    <div className="text-muted-foreground">{bid.contactInfo.email}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {bid.documents.length > 0 && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Documents ({bid.documents.length})
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {bids.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bids found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or refresh the data
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}