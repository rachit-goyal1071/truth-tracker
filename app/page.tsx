'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchBar from '@/components/shared/SearchBar';
import PromiseCard from '@/components/dashboard/PromiseCard';
import { getPromises, getElectoralBonds, getIncidents, getFactChecks } from '@/lib/firestore';
import { Promise, ElectoralBond, Incident, FactCheck } from '@/lib/types';
import { TrendingUp, DollarSign, AlertTriangle, CheckCircle, ArrowRight, Users, MapPin, FileText } from 'lucide-react';

export default function Home() {
  const [recentPromises, setRecentPromises] = useState<Promise[]>([]);
  const [totalBonds, setTotalBonds] = useState(0);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [recentFacts, setRecentFacts] = useState<FactCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent promises
        const promises = await getPromises();
        setRecentPromises(promises.slice(0, 6) as Promise[]);

        // Fetch electoral bonds total
        const bonds = await getElectoralBonds();
        const total = bonds.reduce((sum, bond: any) => sum + bond.amount, 0);
        setTotalBonds(total);

        // Fetch recent incidents
        const incidents = await getIncidents();
        setRecentIncidents(incidents.slice(0, 3) as Incident[]);

        // Fetch recent fact checks
        const facts = await getFactChecks();
        setRecentFacts(facts.slice(0, 3) as FactCheck[]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const handleSearch = async (term: string) => {
    if (term.trim()) {
      // Redirect to a search results page or implement search logic
      window.location.href = `/search?q=${encodeURIComponent(term)}`;
    }
  };

  const statsCards = [
    {
      title: 'Total Promises Tracked',
      value: recentPromises.length.toString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/promises',
    },
    {
      title: 'Electoral Bonds Total',
      value: formatCurrency(totalBonds),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/electoral-bonds',
    },
    {
      title: 'Incidents Mapped',
      value: recentIncidents.length.toString(),
      icon: MapPin,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '/incidents',
    },
    {
      title: 'Facts Verified',
      value: recentFacts.length.toString(),
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/fact-checks',
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Political Truth Tracker
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          A neutral, fact-based platform tracking Indian political promises, electoral bonds, 
          price changes, incidents, and fact checks with verified data sources.
        </p>
        <SearchBar 
          placeholder="Search promises, facts, incidents..." 
          onSearch={handleSearch}
          className="max-w-2xl mx-auto mb-8"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} href={stat.link}>
              <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
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
            </Link>
          );
        })}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Promises Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Recent Promises
              </CardTitle>
              <Link href="/promises">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPromises.slice(0, 3).map((promise) => (
                <div key={promise.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm leading-tight">
                      {promise.title.length > 60 
                        ? `${promise.title.substring(0, 60)}...` 
                        : promise.title
                      }
                    </h3>
                    <Badge 
                      className={`ml-2 text-xs ${
                        promise.status === 'Kept' ? 'bg-green-100 text-green-800' :
                        promise.status === 'Broken' ? 'bg-red-100 text-red-800' :
                        promise.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {promise.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    {promise.party} • {promise.year}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fact Checks Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
                Recent Fact Checks
              </CardTitle>
              <Link href="/fact-checks">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFacts.map((fact) => (
                <div key={fact.id} className="border rounded-lg p-4">
                  <div className="mb-2">
                    <div className="text-sm text-red-600 font-medium mb-1">
                      ❌ Myth: {fact.myth.length > 50 ? `${fact.myth.substring(0, 50)}...` : fact.myth}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      ✅ Truth: {fact.truth.length > 50 ? `${fact.truth.substring(0, 50)}...` : fact.truth}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {fact.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { name: 'Political Promises', href: '/promises', icon: FileText, color: 'blue' },
          { name: 'Electoral Bonds', href: '/electoral-bonds', icon: DollarSign, color: 'green' },
          { name: 'Price Tracker', href: '/prices', icon: TrendingUp, color: 'orange' },
          { name: 'Incident Timeline', href: '/incidents', icon: AlertTriangle, color: 'red' },
          { name: 'Fact Checks', href: '/fact-checks', icon: CheckCircle, color: 'purple' },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <Link key={index} href={item.href}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-lg bg-${item.color}-50 flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-6 h-6 text-${item.color}-600`} />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
