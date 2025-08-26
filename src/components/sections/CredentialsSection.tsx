'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAppContext } from '@/contexts/AppContext';
import { useCreatePortal, useUpdatePortal, useDeletePortal, useTestPortalConnection } from '@/hooks/usePortals';
import { Portal } from '@/types';
import { formatRelativeTime, getStatusColor } from '@/lib/utils';

interface PortalFormData {
  name: string;
  url: string;
  username: string;
  password: string;
  type: 'government' | 'private' | 'nonprofit';
}

export function CredentialsSection() {
  const { state, addPortal, updatePortal, deletePortal } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingPortal, setEditingPortal] = useState<Portal | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState<PortalFormData>({
    name: '',
    url: '',
    username: '',
    password: '',
    type: 'government',
  });

  const createMutation = useCreatePortal();
  const updateMutation = useUpdatePortal();
  const deleteMutation = useDeletePortal();
  const testConnectionMutation = useTestPortalConnection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPortal) {
        const updatedPortal = {
          ...editingPortal,
          ...formData,
        };
        await updateMutation.mutateAsync(updatedPortal);
        updatePortal(updatedPortal);
      } else {
        const portalToCreate = {
          ...formData,
          status: 'inactive' as const,
          lastChecked: new Date().toISOString(),
          bidCount: 0,
        };
        const result = await createMutation.mutateAsync(portalToCreate);
        addPortal(result.data);
      }
      
      resetForm();
    } catch (error) {
      console.error('Failed to save portal:', error);
    }
  };

  const handleEdit = (portal: Portal) => {
    setEditingPortal(portal);
    setFormData({
      name: portal.name,
      url: portal.url,
      username: portal.username,
      password: portal.password,
      type: portal.type,
    });
    setShowForm(true);
  };

  const handleDelete = async (portalId: string) => {
    if (window.confirm('Are you sure you want to delete this portal?')) {
      try {
        await deleteMutation.mutateAsync(portalId);
        deletePortal(portalId);
      } catch (error) {
        console.error('Failed to delete portal:', error);
      }
    }
  };

  const handleTestConnection = async (portal: Portal) => {
    try {
      const result = await testConnectionMutation.mutateAsync({
        url: portal.url,
        username: portal.username,
        password: portal.password,
      });
      
      // Update portal status based on test result
      const updatedPortal = {
        ...portal,
        status: result.data.connected ? 'active' as const : 'error' as const,
        lastChecked: new Date().toISOString(),
      };
      updatePortal(updatedPortal);
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      username: '',
      password: '',
      type: 'government',
    });
    setEditingPortal(null);
    setShowForm(false);
  };

  const togglePasswordVisibility = (portalId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [portalId]: !prev[portalId]
    }));
  };

  const getStatusIcon = (status: Portal['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portal Credentials</h1>
          <p className="text-muted-foreground mt-1">
            Manage portal access credentials and connection settings
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Portal</span>
        </Button>
      </div>

      {/* Add/Edit Portal Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPortal ? 'Edit Portal' : 'Add New Portal'}
            </CardTitle>
            <CardDescription>
              Configure portal connection details and authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Portal Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Metro Government Portal"
                  required
                />
                <div>
                  <label className="text-sm font-medium leading-none">Portal Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                  >
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                    <option value="nonprofit">Non-profit</option>
                  </select>
                </div>
              </div>

              <Input
                label="Portal URL"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://portal.example.gov"
                type="url"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="your_username"
                  required
                />
                <Input
                  label="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="your_password"
                  type="password"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Button
                  type="submit"
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingPortal ? 'Update Portal' : 'Add Portal'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Portal List */}
      <div className="grid gap-6">
        {state.portals.map((portal) => (
          <Card key={portal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>{portal.name}</span>
                    {getStatusIcon(portal.status)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {portal.url}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(portal.status)}>
                  {portal.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Portal Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-medium">Type</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {portal.type}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Bids Found</div>
                    <div className="text-sm text-muted-foreground">
                      {portal.bidCount} opportunities
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Last Checked</div>
                    <div className="text-sm text-muted-foreground">
                      {formatRelativeTime(portal.lastChecked)}
                    </div>
                  </div>
                </div>

                {/* Credentials */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-3">Login Credentials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Username</div>
                      <div className="text-sm font-mono">{portal.username}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Password</div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-mono">
                          {showPasswords[portal.id] ? portal.password : '••••••••••'}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(portal.id)}
                          className="h-6 w-6 p-0"
                        >
                          {showPasswords[portal.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(portal)}
                      disabled={testConnectionMutation.isPending}
                      loading={testConnectionMutation.isPending}
                    >
                      {portal.status === 'active' ? (
                        <Wifi className="h-4 w-4 mr-2" />
                      ) : (
                        <WifiOff className="h-4 w-4 mr-2" />
                      )}
                      Test Connection
                    </Button>
                    {testConnectionMutation.data && (
                      <span className="text-xs text-muted-foreground">
                        {testConnectionMutation.data.message}
                        {testConnectionMutation.data.data.responseTime && (
                          <span className="ml-1">
                            ({testConnectionMutation.data.data.responseTime}ms)
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(portal)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(portal.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {state.portals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No portals configured</h3>
            <p className="text-muted-foreground mb-4">
              Add your first portal to start hunting for government bids
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Portal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}