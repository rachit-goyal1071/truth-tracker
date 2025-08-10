'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, RefreshCw, CheckCircle, XCircle, Clock, Database, Zap, AlertTriangle } from 'lucide-react';

// ✅ MOCK: Admin check
const isAdminUser = (user: User | null) => {
  // Replace this with your real admin logic
  return user?.email === 'rg410345@gmail.com';
};

// ✅ MOCK: Authorized sources
const AUTHORIZED_SOURCES = [
  { name: 'Gov News Portal', type: 'rss', url: 'https://gov.example.com/rss', active: true },
  { name: 'Parliament API', type: 'api', url: 'https://parliament.example.com/api', active: true },
  { name: 'Party Manifesto Site', type: 'html', url: 'https://party.example.com/promises', active: false }
];

// ✅ MOCK: Sync service
class PromiseSyncService {
  async getSyncHistory() {
    return [
      {
        id: '1',
        timestamp: new Date(),
        result: {
          success: true,
          totalFetched: 50,
          totalExtracted: 45,
          totalSaved: 40,
          duplicatesSkipped: 5,
          errors: [],
          duration: 3000
        }
      }
    ];
  }

  async syncPromises() {
    await new Promise((res) => setTimeout(res, 2000));
    return {
      success: true,
      totalFetched: 60,
      totalExtracted: 50,
      totalSaved: 48,
      duplicatesSkipped: 2,
      errors: [],
      duration: 2000
    };
  }
}

export default function SyncPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any | null>(null);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const syncService = new PromiseSyncService();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 10, 90));
      }, 500);

      const result = await syncService.syncPromises();

      clearInterval(progressInterval);
      setProgress(100);
      setSyncResult(result);

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
    return <div className="p-8">Loading...</div>;
  }

  if (!user || !isAdminUser(user)) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2">AI Promise Sync</h1>
      <p className="text-gray-600 mb-6">
        Automatically fetch and extract political promises from authorized sources using AI
      </p>

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
                Sync from {AUTHORIZED_SOURCES.filter((s) => s.active).length} authorized sources
              </p>
              {syncing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-64" />
                  <p className="text-xs text-gray-500">Processing sources...</p>
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
                  Start AI Sync
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><strong>Fetched:</strong> {syncResult.totalFetched}</div>
                    <div><strong>Extracted:</strong> {syncResult.totalExtracted}</div>
                    <div><strong>Saved:</strong> {syncResult.totalSaved}</div>
                    <div><strong>Duration:</strong> {Math.round(syncResult.duration / 1000)}s</div>
                  </div>
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
          <div className="grid md:grid-cols-3 gap-4">
            {AUTHORIZED_SOURCES.map((source, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{source.name}</h4>
                  <Badge variant={source.active ? 'default' : 'secondary'}>
                    {source.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">Type: {source.type.toUpperCase()}</p>
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
            syncHistory.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {log.result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                    )}
                    <span className="font-medium">{log.timestamp.toLocaleString()}</span>
                  </div>
                  <Badge variant={log.result.success ? 'default' : 'destructive'}>
                    {log.result.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
