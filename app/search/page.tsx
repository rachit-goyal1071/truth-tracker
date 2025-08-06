'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, DollarSign, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// Mock data for search results
const mockSearchResults = {
  promises: [
    {
      id: '1',
      title: 'Build 100 new hospitals',
      description: 'Promise to construct 100 new hospitals across the country within 5 years',
      status: 'In Progress',
      party: 'Party A',
      date: '2023-01-15'
    },
    {
      id: '2',
      title: 'Create 10 million jobs',
      description: 'Generate 10 million new employment opportunities in various sectors',
      status: 'Broken',
      party: 'Party B',
      date: '2023-02-20'
    }
  ],
  bonds: [
    {
      id: '1',
      company: 'Tech Corp Ltd',
      amount: 50000000,
      party: 'Party A',
      date: '2023-03-10'
    }
  ],
  facts: [
    {
      id: '1',
      claim: 'Unemployment rate decreased by 50%',
      verdict: 'False',
      category: 'Economy',
      date: '2023-04-05'
    }
  ],
  incidents: [
    {
      id: '1',
      title: 'Policy Implementation Failure',
      description: 'Failed to implement promised education reform',
      severity: 'High',
      date: '2023-05-12'
    }
  ],
  prices: [
    {
      id: '1',
      commodity: 'Rice',
      currentPrice: 45,
      previousPrice: 40,
      change: 12.5,
      date: '2023-06-01'
    }
  ]
};

function SearchContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter mock data based on search query
    const filteredResults = {
      promises: mockSearchResults.promises.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      ),
      bonds: mockSearchResults.bonds.filter(item =>
        item.company.toLowerCase().includes(query.toLowerCase()) ||
        item.party.toLowerCase().includes(query.toLowerCase())
      ),
      facts: mockSearchResults.facts.filter(item =>
        item.claim.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      ),
      incidents: mockSearchResults.incidents.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      ),
      prices: mockSearchResults.prices.filter(item =>
        item.commodity.toLowerCase().includes(query.toLowerCase())
      )
    };
    
    setResults(filteredResults);
    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    }
  };

  const getTotalResults = () => {
    return Object.values(results).reduce((total: number, items: any) => total + (items?.length || 0), 0);
  };

  const getResultsByType = (type: string) => {
    return results[type] || [];
  };

  const tabs = [
    { id: 'all', label: 'All Results', icon: Search },
    { id: 'promises', label: 'Promises', icon: FileText },
    { id: 'bonds', label: 'Electoral Bonds', icon: DollarSign },
    { id: 'facts', label: 'Fact Checks', icon: CheckCircle },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'prices', label: 'Prices', icon: TrendingUp }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search promises, facts, bonds, incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-20 h-12 text-lg"
            />
            <Button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </form>

        {/* Results Summary */}
        {Object.keys(results).length > 0 && (
          <div className="text-gray-600">
            Found {getTotalResults()} results for "{searchParams.get('q')}"
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Results */}
      {!isLoading && Object.keys(results).length > 0 && (
        <>
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const count = tab.id === 'all' ? getTotalResults() : getResultsByType(tab.id).length;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                      {count > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Results Content */}
          <div className="space-y-6">
            {(activeTab === 'all' || activeTab === 'promises') && getResultsByType('promises').length > 0 && (
              <div>
                {activeTab === 'all' && <h2 className="text-xl font-semibold mb-4">Promises</h2>}
                <div className="grid gap-4">
                  {getResultsByType('promises').map((promise: any) => (
                    <Card key={promise.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{promise.title}</CardTitle>
                          <Badge variant={promise.status === 'Fulfilled' ? 'default' : promise.status === 'In Progress' ? 'secondary' : 'destructive'}>
                            {promise.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-2">{promise.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{promise.party}</span>
                          <span className="mx-2">•</span>
                          <span>{promise.date}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'bonds') && getResultsByType('bonds').length > 0 && (
              <div>
                {activeTab === 'all' && <h2 className="text-xl font-semibold mb-4">Electoral Bonds</h2>}
                <div className="grid gap-4">
                  {getResultsByType('bonds').map((bond: any) => (
                    <Card key={bond.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{bond.company}</h3>
                            <p className="text-sm text-gray-600">Donated to {bond.party}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              ₹{(bond.amount / 10000000).toFixed(1)}Cr
                            </p>
                            <p className="text-sm text-gray-500">{bond.date}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'facts') && getResultsByType('facts').length > 0 && (
              <div>
                {activeTab === 'all' && <h2 className="text-xl font-semibold mb-4">Fact Checks</h2>}
                <div className="grid gap-4">
                  {getResultsByType('facts').map((fact: any) => (
                    <Card key={fact.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{fact.claim}</CardTitle>
                          <Badge variant={fact.verdict === 'True' ? 'default' : 'destructive'}>
                            {fact.verdict}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{fact.category}</span>
                          <span className="mx-2">•</span>
                          <span>{fact.date}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'incidents') && getResultsByType('incidents').length > 0 && (
              <div>
                {activeTab === 'all' && <h2 className="text-xl font-semibold mb-4">Incidents</h2>}
                <div className="grid gap-4">
                  {getResultsByType('incidents').map((incident: any) => (
                    <Card key={incident.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{incident.title}</CardTitle>
                          <Badge variant={incident.severity === 'High' ? 'destructive' : 'secondary'}>
                            {incident.severity} Severity
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-2">{incident.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{incident.date}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'prices') && getResultsByType('prices').length > 0 && (
              <div>
                {activeTab === 'all' && <h2 className="text-xl font-semibold mb-4">Prices</h2>}
                <div className="grid gap-4">
                  {getResultsByType('prices').map((price: any) => (
                    <Card key={price.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{price.commodity}</CardTitle>
                          <Badge variant={price.change > 0 ? 'destructive' : 'default'}>
                            {price.change > 0 ? '+' : ''}{price.change}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-2">
                          Current: ₹{price.currentPrice} (was ₹{price.previousPrice})
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{price.date}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* No Results */}
      {!isLoading && Object.keys(results).length > 0 && getTotalResults() === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">Try adjusting your search terms or browse our categories.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <SearchContent />
    </Suspense>
  );
}
