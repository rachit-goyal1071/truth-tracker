'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Calendar, User, FileText, Clock } from 'lucide-react';
import { getPromiseById } from '@/lib/firestore';
import { Promise } from '@/lib/types';
import ShareButton from '@/components/shared/ShareButton';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function PromiseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [promise, setPromise] = useState<Promise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchPromise(params.id as string);
    }
  }, [params.id]);

  const fetchPromise = async (id: string) => {
    try {
      setLoading(true);
      const data = await getPromiseById(id);
      if (data) {
        setPromise(data as Promise);
      } else {
        setError('Promise not found');
      }
    } catch (error) {
      console.error('Error fetching promise:', error);
      setError('Failed to load promise');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Kept':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Broken':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Dropped':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPartyColor = (party: string) => {
    const colors = {
      'BJP': 'bg-orange-100 text-orange-800',
      'Congress': 'bg-blue-100 text-blue-800',
      'AAP': 'bg-purple-100 text-purple-800',
      'TMC': 'bg-green-100 text-green-800',
      'DMK': 'bg-red-100 text-red-800',
    };
    return colors[party as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="lg" text="Loading promise details..." />
      </div>
    );
  }

  if (error || !promise) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Promise not found'}
            </h3>
            <p className="text-gray-600 mb-4">
              The promise you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/promises')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Promises
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/promises')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Promises
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <Badge className={`${getPartyColor(promise.party)}`}>
                {promise.party}
              </Badge>
              <Badge variant="outline">
                {promise.electionYear}
              </Badge>
              <Badge variant="outline">
                {promise.category}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {promise.title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={`text-lg px-4 py-2 ${getStatusColor(promise.status)}`}>
              {promise.status}
            </Badge>
            <ShareButton
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={promise.title}
              description={promise.description}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Promise Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Promise Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {promise.description}
              </p>
            </CardContent>
          </Card>

          {/* Evidence Timeline */}
          {promise.evidence && promise.evidence.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Evidence Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {promise.evidence
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((evidence, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                          evidence.status === 'Kept' ? 'bg-green-500' :
                          evidence.status === 'Broken' ? 'bg-red-500' :
                          evidence.status === 'In Progress' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={`text-xs ${getStatusColor(evidence.status)}`}>
                              {evidence.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(evidence.date)}
                            </span>
                          </div>
                          <a
                            href={evidence.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Evidence Source
                          </a>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Promise Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Promise Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Party</label>
                <p className="text-gray-900">{promise.party}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Election Year</label>
                <p className="text-gray-900">{promise.electionYear}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="text-gray-900">{promise.category}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Current Status</label>
                <Badge className={`${getStatusColor(promise.status)} mt-1`}>
                  {promise.status}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Last Verified</label>
                <p className="text-gray-900">{formatDate(promise.lastVerified)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {promise.sourceManifestoUrl && (
                <a
                  href={promise.sourceManifestoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 p-3 border rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Original Manifesto
                </a>
              )}
              
              {promise.evidence && promise.evidence.length > 0 && (
                <div className="text-sm text-gray-600">
                  <strong>{promise.evidence.length}</strong> evidence source{promise.evidence.length !== 1 ? 's' : ''} available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}