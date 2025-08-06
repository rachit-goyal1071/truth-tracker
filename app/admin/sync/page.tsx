'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdminUser } from '@/lib/auth';
import { PromiseSyncService, SyncResult, SyncLog } from '@/lib/promise-sync';
import { AUTHORIZED_SOURCES } from '@/lib/data-fetcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Square, RefreshCw, CheckCircle, XCircle, Clock, Database, Zap, AlertTriangle } from 'lucide-react';

export default function SyncPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncLog[]>([]);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const syncService = new PromiseSyncService();

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
      loadSyncHistory();
    }
  }, [user]);

  const loadSyncHistory = async () => {
    try {
      const history = await syncService.getSyncHistory();
      setSyncHistory(history);
    } catch (error) {
      console.error('Error loading sync history:', error);
    }
  };

  const startSync = async () => {
    setSyncing(true);
    setProgress(0);
    setSyncResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 10, 90));
      }, 1000);

      const result = await syncService.syncPromises();
      
      clearInterval(progressInterval);
      setProgress(100);
      setSyncResult(result);
      
      // Reload history
      await loadSyncHistory();
      
    } catch (error) {
      console.error('Sync error:', error);
      setSyncResult({
        success: false,
        totalFetched: 0,
        totalExtracted: 0,
        totalSaved: 0,
        duplicatesSkipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: 0
      });
    } finally {
      setSyncing(false);
      setProgress(0);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Promise Sync</h1>
        <p className="text-gray-600">
          Automatically fetch and extract political promises from authorized sources using AI
        </p>
      </div>

      {/* Sync Control */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            AI-Powered Promise Extraction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Sync from {AUTHORIZED_SOURCES.filter(s => s.active).length} authorized sources
              </p>
              {syncing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-64" />
                  <p className="text-xs text-gray-500">Processing sources and extracting promises...</p>
                </div>
              )}
            </div>
            <Button 
              onClick={startSync} 
              disabled={syncing}
              size="lg"
            >
              {syncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start AI Sync
                </>
              )}
            </Button>
          </div>

          {/* Sync Result */}
          {syncResult && (
            <Alert className={syncResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center">
                {syncResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                )}
                <AlertDescription>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong>Fetched:</strong> {syncResult.totalFetched}
                    </div>
                    <div>
                      <strong>Extracted:</strong> {syncResult.totalExtracted}
                    </div>
                    <div>
                      <strong>Saved:</strong> {syncResult.totalSaved}
                    </div>
                    <div>
                      <strong>Duration:</strong> {Math.round(syncResult.duration / 1000)}s
                    </div>
                  </div>
                  {syncResult.errors.length > 0 && (
                    <div className="mt-2">
                      <strong>Errors:</strong>
                      <ul className="list-disc list-inside text-xs mt-1">
                        {syncResult.errors.slice(0, 3).map((error, index) => (
                          <li key={index}>{error}</li>
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
            <Database className="w-5 h-5 mr-2 text-green-600" />
            Authorized Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AUTHORIZED_SOURCES.map((source, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{source.name}</h4>
                  <Badge variant={source.active ? "default" : "secondary"}>
                    {source.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mb-2">Type: {source.type.toUpperCase()}</p>
                <p className="text-xs text-gray-400 truncate">{source.url}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            Sync History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {syncHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sync history available</p>
          ) : (
            <div className="space-y-4">
              {syncHistory.map((log) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {log.result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      )}
                      <span className="font-medium">
                        {log.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <Badge variant={log.result.success ? "default" : "destructive"}>
                      {log.result.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>Fetched: {log.result.totalFetched}</div>
                    <div>Extracted: {log.result.totalExtracted}</div>
                    <div>Saved: {log.result.totalSaved}</div>
                    <div>Duration: {Math.round(log.result.duration / 1000)}s</div>
                  </div>
                  {log.result.errors.length > 0 && (
                    <div className="mt-2 text-xs text-red-600">
                      {log.result.errors.length} error(s) occurred
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
