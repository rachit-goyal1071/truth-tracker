'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdminUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Database, 
  Users, 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Zap,
  Calendar
} from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    promises: 0,
    bonds: 0,
    incidents: 0,
    facts: 0,
    lastSync: null as Date | null
  });
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
      // Load dashboard stats
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      // Mock stats - in real app, fetch from Firestore
      setStats({
        promises: 156,
        bonds: 89,
        incidents: 23,
        facts: 67,
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
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

  const adminCards = [
    {
      title: 'AI Promise Sync',
      description: 'Automatically sync political promises using AI',
      icon: Zap,
      href: '/admin/sync',
      color: 'blue',
      badge: 'AI Powered'
    },
    {
      title: 'Data Management',
      description: 'Manage promises, bonds, and incidents',
      icon: Database,
      href: '/admin/promises',
      color: 'green',
      badge: 'CRUD'
    },
    {
      title: 'User Management',
      description: 'Manage admin users and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'purple',
      badge: 'Security'
    },
    {
      title: 'System Settings',
      description: 'Configure application settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'gray',
      badge: 'Config'
    }
  ];

  const statsCards = [
    {
      title: 'Total Promises',
      value: stats.promises,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Electoral Bonds',
      value: stats.bonds,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Incidents Tracked',
      value: stats.incidents,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Facts Verified',
      value: stats.facts,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user.displayName || user.email}. Manage your Political Truth Tracker.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Last Sync Info */}
      {stats.lastSync && (
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-semibold text-gray-900">Last AI Sync</div>
                  <div className="text-sm text-gray-600">
                    {stats.lastSync.toLocaleString()}
                  </div>
                </div>
              </div>
              <Link href="/admin/sync">
                <Button>
                  <Zap className="w-4 h-4 mr-2" />
                  Run Sync Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={index} href={card.href}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg bg-${card.color}-50`}>
                      <Icon className={`w-6 h-6 text-${card.color}-600`} />
                    </div>
                    <Badge variant="secondary">{card.badge}</Badge>
                  </div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/sync">
              <Button>
                <Zap className="w-4 h-4 mr-2" />
                AI Sync
              </Button>
            </Link>
            <Link href="/promises">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                View Promises
              </Button>
            </Link>
            <Link href="/electoral-bonds">
              <Button variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                View Bonds
              </Button>
            </Link>
            <Link href="/incidents">
              <Button variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                View Incidents
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}