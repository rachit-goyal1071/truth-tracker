'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdminUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  getPendingIncidents, 
  createPoliticalIncident, 
  deletePendingIncident 
} from '@/lib/firestore';
import { PoliticalIncident } from '@/lib/types';
import { 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Eye,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminIncidentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingIncidents, setPendingIncidents] = useState<any[]>([]);
  const [selectedIncidents, setSelectedIncidents] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      
      if (!user || !isAdminUser(user)) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user && isAdminUser(user)) {
      fetchPendingIncidents();
    }
  }, [user]);

  const fetchPendingIncidents = async () => {
    try {
      setLoading(true);
      const data = await getPendingIncidents();
      setPendingIncidents(data);
    } catch (error) {
      console.error('Error fetching pending incidents:', error);
      setMessage({ type: 'error', text: 'Failed to fetch pending incidents' });
    } finally {
      setLoading(false);
    }
  };

  const handleIncidentSelect = (incidentId: string, checked: boolean) => {
    const newSelected = new Set(selectedIncidents);
    if (checked) {
      newSelected.add(incidentId);
    } else {
      newSelected.delete(incidentId);
    }
    setSelectedIncidents(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIncidents(new Set(pendingIncidents.map(i => i.id)));
    } else {
      setSelectedIncidents(new Set());
    }
  };

  const handleApproveSelected = async () => {
    if (selectedIncidents.size === 0) {
      setMessage({ type: 'error', text: 'Please select incidents to approve' });
      return;
    }

    setProcessing(true);
    let approvedCount = 0;
    let errorCount = 0;

    try {
      for (const incidentId of selectedIncidents) {
        const incident = pendingIncidents.find(i => i.id === incidentId);
        if (incident) {
          try {
            // Create verified incident
            await createPoliticalIncident({
              ...incident,
              verified: true,
              addedAt: new Date()
            });

            // Delete from pending
            await deletePendingIncident(incidentId);
            approvedCount++;
          } catch (error) {
            console.error(`Error approving incident ${incidentId}:`, error);
            errorCount++;
          }
        }
      }

      setMessage({ 
        type: 'success', 
        text: `Approved ${approvedCount} incidents${errorCount > 0 ? `, ${errorCount} failed` : ''}` 
      });
      
      setSelectedIncidents(new Set());
      fetchPendingIncidents();
    } catch (error) {
      console.error('Error in bulk approval:', error);
      setMessage({ type: 'error', text: 'Failed to approve incidents' });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSelected = async () => {
    if (selectedIncidents.size === 0) {
      setMessage({ type: 'error', text: 'Please select incidents to reject' });
      return;
    }

    if (!confirm(`Are you sure you want to reject ${selectedIncidents.size} incidents?`)) {
      return;
    }

    setProcessing(true);
    let rejectedCount = 0;

    try {
      for (const incidentId of selectedIncidents) {
        try {
          await deletePendingIncident(incidentId);
          rejectedCount++;
        } catch (error) {
          console.error(`Error rejecting incident ${incidentId}:`, error);
        }
      }

      setMessage({ type: 'success', text: `Rejected ${rejectedCount} incidents` });
      setSelectedIncidents(new Set());
      fetchPendingIncidents();
    } catch (error) {
      console.error('Error in bulk rejection:', error);
      setMessage({ type: 'error', text: 'Failed to reject incidents' });
    } finally {
      setProcessing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'corruption':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'policy-failure':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'protest':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'violence':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legal-case':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
        </div>
      </div>
    );
  }

  if (!user || !isAdminUser(user)) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Incident Approval</h1>
        <p className="text-gray-600">
          Review and approve political incidents before they appear publicly
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedIncidents.size === pendingIncidents.length && pendingIncidents.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select All ({pendingIncidents.length})
            </label>
          </div>
          
          {selectedIncidents.size > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleApproveSelected}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve ({selectedIncidents.size})
              </Button>
              <Button
                onClick={handleRejectSelected}
                disabled={processing}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject ({selectedIncidents.size})
              </Button>
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          {pendingIncidents.length} pending incidents
        </div>
      </div>

      {/* Incidents List */}
      {pendingIncidents.length > 0 ? (
        <div className="space-y-4">
          {pendingIncidents.map((incident) => (
            <Card key={incident.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start space-x-4">
                  <Checkbox
                    checked={selectedIncidents.has(incident.id)}
                    onCheckedChange={(checked) => handleIncidentSelect(incident.id, checked as boolean)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg leading-tight pr-4">
                        {incident.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getCategoryColor(incident.category)} text-xs`}>
                          {incident.category.replace('-', ' ')}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(incident.date)}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      {incident.description.length > 200 
                        ? `${incident.description.substring(0, 200)}...` 
                        : incident.description
                      }
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Source: <span className="font-medium">{incident.source}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl leading-tight">
                                {incident.title}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <Badge className={getCategoryColor(incident.category)}>
                                  {incident.category.replace('-', ' ')}
                                </Badge>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(incident.date)}
                                </div>
                              </div>
                              
                              <p className="text-gray-700 leading-relaxed">
                                {incident.description}
                              </p>
                              
                              <div className="pt-4 border-t">
                                <div className="text-sm text-gray-600 mb-2">
                                  <strong>Source:</strong> {incident.source}
                                </div>
                                {incident.sourceUrl && (
                                  <a
                                    href={incident.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    View Original Source
                                  </a>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {incident.sourceUrl && (
                          <a
                            href={incident.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Source
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending incidents</h3>
            <p className="text-gray-600">
              All incidents have been reviewed. Run a sync to fetch new incidents.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}