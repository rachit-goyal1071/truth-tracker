'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdminUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IncidentDataFetcher, INCIDENT_SOURCES } from '@/lib/incident-fetcher';
import { createPendingIncident } from '@/lib/firestore';
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Database, 
  AlertTriangle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface SyncResult {
  success: boolean;
  totalFetched: number;
  totalSaved: number;
  errors: string[];
  duration: number;
  sourceResults: Array<{
    source: string;
    fetched: number;
    saved: number;
    error?: string;
  }>;
}

export default function SyncIncidentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentSource, setCurrentSource] = useState<string>('');
  const router = useRouter();

  const fetcher = new IncidentDataFetcher();

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

  const startSync = async () => {
    setSyncing(true);
    setProgress(0);
    setSyncResult(null);
    setCurrentSource('');

    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      totalFetched: 0,
      totalSaved: 0,
      errors: [],
      duration: 0,
      sourceResults: []
    };

    try {
      const activeSources = INCIDENT_SOURCES.filter(s => s.active);
      const totalSources = activeSources.length;
      
      console.log(`Starting sync from ${totalSources} sources...`);

      const sourceData = await fetcher.fetchFromAllSources();
      
      for (let i = 0; i < sourceData.length; i++) {
        const { source, incidents } = sourceData[i];
        setCurrentSource(source.name);
        setProgress(((i + 1) / totalSources) * 100);

        const sourceResult = {
          source: source.name,
          fetched: incidents.length,
          saved: 0,
          error: undefined as string | undefined
        };

        try {
          console.log(`Processing ${incidents.length} incidents from ${source.name}`);
          
          for (const rawIncident of incidents) {
            try {
              const normalizedIncident = fetcher.normalizeToIncident(rawIncident);
              
              await createPendingIncident({
                ...normalizedIncident,
                verified: false,
                addedAt: new Date()
              });
              
              sourceResult.saved++;
              result.totalSaved++;
            } catch (error) {
              console.error(`Error saving incident from ${source.name}:`, error);
            }
          }
          
          result.totalFetched += incidents.length;
        } catch (error) {
          const errorMsg = `Error processing ${source.name}: ${error}`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
          sourceResult.error = errorMsg;
        }

        result.sourceResults.push(sourceResult);
      }

      result.success = result.totalSaved > 0;
      result.duration = Date.now() - startTime;

      console.log('Sync completed:', result);
      setSyncResult(result);

    } catch (error) {
      const errorMsg = `Sync failed: ${error}`;
      console.error(errorMsg);
      result.errors.push(errorMsg);
      result.duration = Date.now() - startTime;
      setSyncResult(result);
    } finally {
      setSyncing(false);
      setProgress(100);
      setCurrentSource('');
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sync Political Incidents</h1>
        <p className="text-gray-600">
          Fetch political incidents from authorized news sources and government portals
        </p>
      </div>

      {/* Sync Control */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-600" />
            Incident Data Sync
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Sync from {INCIDENT_SOURCES.filter(s => s.active).length} authorized sources
              </p>
              {syncing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-64" />
                  <p className="text-xs text-gray-500">
                    {currentSource ? `Processing: ${currentSource}` : 'Initializing...'}
                  </p>
                </div>
              )}
            </div>
            <Button onClick={startSync} disabled={syncing} size="lg">
              {syncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Sync
                </>
              )}
            </Button>
          </div>

          {syncResult && (
            <Alert className={syncResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center">
                {syncResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                )}
                <AlertDescription>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div><strong>Fetched:</strong> {syncResult.totalFetched}</div>
                    <div><strong>Saved:</strong> {syncResult.totalSaved}</div>
                    <div><strong>Duration:</strong> {Math.round(syncResult.duration / 1000)}s</div>
                  </div>
                  {syncResult.errors.length > 0 && (
                    <div className="mt-2">
                      <strong>Errors:</strong>
                      <ul className="list-disc list-inside text-xs mt-1">
                        {syncResult.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="w-5 h-5 mr-2 text-green-600" />
            Authorized Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INCIDENT_SOURCES.map((source, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{source.name}</h4>
                  <Badge variant={source.active ? 'default' : 'secondary'}>
                    {source.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mb-1">Type: {source.type.toUpperCase()}</p>
                <p className="text-xs text-gray-500 mb-2">Category: {source.category}</p>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 truncate block"
                >
                  {source.url}
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Source Results */}
      {syncResult && syncResult.sourceResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Sync Results by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {syncResult.sourceResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{result.source}</h4>
                    <div className="flex items-center space-x-2">
                      {result.error ? (
                        <Badge variant="destructive">Error</Badge>
                      ) : (
                        <Badge variant="default">Success</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                    <div>Fetched: <span className="font-medium">{result.fetched}</span></div>
                    <div>Saved: <span className="font-medium">{result.saved}</span></div>
                  </div>
                  
                  {result.error && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {syncResult && syncResult.totalSaved > 0 && (
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <div className="font-semibold text-blue-900">Next Steps</div>
                <div className="text-sm text-blue-800">
                  {syncResult.totalSaved} incidents have been saved as pending. 
                  Go to the <a href="/admin/incidents" className="underline font-medium">Incident Approval</a> page to review and approve them for public display.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}