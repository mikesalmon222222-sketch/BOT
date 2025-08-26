'use client';

import { useState } from 'react';
import { usePortals } from '@/hooks/usePortals';
import { Portal, PortalFormData } from '@/lib/types';
import { portalsApi, bidsApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export function Credentials() {
  const {
    portals,
    createPortal,
    updatePortal,
    deletePortal,
    isCreating,
    isUpdating,
    isDeleting,
  } = usePortals();

  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPortal, setEditingPortal] = useState<Portal | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [scrapingPortal, setScrapingPortal] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: { success: boolean; message: string } }>({});
  const [scrapingResults, setScrapingResults] = useState<{ [key: string]: { success: boolean; message: string; count?: number } }>({});
  
  const [formData, setFormData] = useState<PortalFormData>({
    name: '',
    url: '',
    username: '',
    password: '',
    isActive: true,
  });

  const handleTestConnection = async (portal: Portal) => {
    setTestingConnection(portal.id);
    setTestResults(prev => ({ ...prev, [portal.id]: { success: false, message: 'Testing...' } }));

    try {
      const response = await portalsApi.testConnection(portal.id, {
        username: portal.username,
        password: portal.password,
      });

      if (response.success) {
        setTestResults(prev => ({
          ...prev,
          [portal.id]: { success: true, message: response.data?.message || 'Connection successful' }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          [portal.id]: { success: false, message: response.error || 'Connection failed' }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [portal.id]: { success: false, message: 'Connection test failed' }
      }));
    } finally {
      setTestingConnection(null);
    }
  };

  const handleScrapePortal = async (portal: Portal) => {
    setScrapingPortal(portal.id);
    setScrapingResults(prev => ({ ...prev, [portal.id]: { success: false, message: 'Scraping...' } }));

    try {
      const response = await bidsApi.fetchFromPortal(portal.id, {
        username: portal.username,
        password: portal.password,
      });

      if (response.success) {
        setScrapingResults(prev => ({
          ...prev,
          [portal.id]: { 
            success: true, 
            message: response.data?.message || 'Scraping successful',
            count: response.data?.total || 0
          }
        }));
        
        // Critical: Invalidate all relevant caches after successful scraping
        queryClient.invalidateQueries({ queryKey: ['huntedData'] });
        queryClient.invalidateQueries({ queryKey: ['todayCount'] });
        queryClient.invalidateQueries({ queryKey: ['portals'] });
        queryClient.invalidateQueries({ queryKey: ['bids'] });
      } else {
        setScrapingResults(prev => ({
          ...prev,
          [portal.id]: { success: false, message: response.error || 'Scraping failed' }
        }));
      }
    } catch (error) {
      setScrapingResults(prev => ({
        ...prev,
        [portal.id]: { success: false, message: 'Scraping failed' }
      }));
    } finally {
      setScrapingPortal(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      username: '',
      password: '',
      isActive: true,
    });
    setEditingPortal(null);
    setIsFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPortal) {
      updatePortal({
        id: editingPortal.id,
        portal: {
          ...formData,
          lastSync: new Date(),
        },
      });
    } else {
      createPortal({
        ...formData,
        lastSync: new Date(),
        bidCount: 0,
      });
    }
    
    resetForm();
  };

  const handleEdit = (portal: Portal) => {
    setEditingPortal(portal);
    setFormData({
      name: portal.name,
      url: portal.url,
      username: portal.username,
      password: portal.password,
      isActive: portal.isActive,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this portal?')) {
      deletePortal(id);
    }
  };

  const handleToggleActive = (portal: Portal) => {
    updatePortal({
      id: portal.id,
      portal: { isActive: !portal.isActive },
    });
  };

  const handleQuickMetroSetup = () => {
    setFormData({
      name: 'Metro',
      url: 'https://business.metro.net/webcenter/portal/VendorPortal/pages_home/solicitations/openSolicitations',
      username: '',
      password: '',
      isActive: true,
    });
    setIsFormOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Portal Credentials</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={handleQuickMetroSetup}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Quick Metro Setup
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add New Portal
          </button>
        </div>
      </div>

      {/* Portal Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingPortal ? 'Edit Portal' : 'Add New Portal'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portal Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Metro, OhioBuys"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portal URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.gov/bids"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bot username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bot password"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active portal
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isCreating || isUpdating ? 'Saving...' : editingPortal ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Portals List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {portals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-lg font-medium mb-2">No portals configured</h3>
            <p>Add your first portal to start hunting for bids</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Portal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sync
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bid Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Connection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portals.map((portal) => (
                  <tr key={portal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{portal.name}</div>
                        <div className="text-sm text-gray-500">{portal.url}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          User: {portal.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(portal)}
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          portal.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          portal.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        {portal.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {portal.lastSync ? new Date(portal.lastSync).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{portal.bidCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleTestConnection(portal)}
                          disabled={testingConnection === portal.id}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
                        >
                          {testingConnection === portal.id ? 'Testing...' : 'Test'}
                        </button>
                        {testResults[portal.id] && (
                          <div className={`text-xs ${testResults[portal.id].success ? 'text-green-600' : 'text-red-600'}`}>
                            {testResults[portal.id].message}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(portal)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(portal.id)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                        <button
                          onClick={() => handleScrapePortal(portal)}
                          disabled={scrapingPortal === portal.id || !portal.isActive}
                          className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
                        >
                          {scrapingPortal === portal.id ? 'Scraping...' : 'Scrape Now'}
                        </button>
                        {scrapingResults[portal.id] && (
                          <div className={`text-xs ${scrapingResults[portal.id].success ? 'text-green-600' : 'text-red-600'}`}>
                            {scrapingResults[portal.id].message}
                            {scrapingResults[portal.id].count !== undefined && ` (${scrapingResults[portal.id].count} bids)`}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Portal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Total Portals</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{portals.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Active Portals</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {portals.filter(p => p.isActive).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Total Bids</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {portals.reduce((sum, portal) => sum + (portal.bidCount || 0), 0)}
          </div>
        </div>
      </div>
    </div>
  );
}