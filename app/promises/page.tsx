'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/shared/SearchBar';
import PromiseFilters from '@/components/promises/PromiseFilters';
import PromiseCard from '@/components/promises/PromiseCard';
import { getPromises, searchDocuments } from '@/lib/firestore';
import { Promise, FilterOptions } from '@/lib/types';
import { FileText, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';

export default function PromisesPage() {
  const [promises, setPromises] = useState<Promise[]>([]);
  const [filteredPromises, setFilteredPromises] = useState<Promise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<FilterOptions>({});

  useEffect(() => {
    fetchPromises();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [promises, searchTerm, activeTab, filters]);

  const fetchPromises = async () => {
    try {
      setLoading(true);
      const data = await getPromises();
      setPromises(data as Promise[]);
    } catch (error) {
      console.error('Error fetching promises:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...promises];

    // Apply tab filter
    if (activeTab !== 'all') {
      const statusMap = {
        kept: 'Kept',
        broken: 'Broken',
        progress: 'In Progress',
        dropped: 'Dropped'
      };
      filtered = filtered.filter(p => p.status === statusMap[activeTab as keyof typeof statusMap]);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.party.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }

    // Apply other filters
    if (filters.party) {
      filtered = filtered.filter(p => p.party === filters.party);
    }
    if (filters.year) {
      filtered = filtered.filter(p => p.electionYear === filters.year);
    }
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    setFilteredPromises(filtered);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const getStatusStats = () => {
    return {
      all: promises.length,
      kept: promises.filter(p => p.status === 'Kept').length,
      broken: promises.filter(p => p.status === 'Broken').length,
      progress: promises.filter(p => p.status === 'In Progress').length,
      dropped: promises.filter(p => p.status === 'Dropped').length,
    };
  };

  const stats = getStatusStats();

  const tabConfig = [
    { id: 'all', label: 'All Promises', count: stats.all, icon: FileText },
    { id: 'kept', label: 'Kept', count: stats.kept, icon: CheckCircle, color: 'text-green-600' },
    { id: 'broken', label: 'Broken', count: stats.broken, icon: XCircle, color: 'text-red-600' },
    { id: 'progress', label: 'In Progress', count: stats.progress, icon: Clock, color: 'text-yellow-600' },
    { id: 'dropped', label: 'Dropped', count: stats.dropped, icon: Trash2, color: 'text-gray-600' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FileText className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Political Promises</h1>
            <p className="text-gray-600">
              Track the status of political promises made by major parties across elections
            </p>
          </div>
        </div>

        <SearchBar 
          placeholder="Search promises by title, party, or description..." 
          onSearch={handleSearch}
          className="max-w-2xl mb-6"
        />

        <PromiseFilters onFilterChange={handleFilterChange} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${tab.color || 'text-gray-600'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <Badge variant="secondary" className="ml-1">
                  {tab.count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredPromises.length} of {promises.length} promises
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Tab Content */}
        {tabConfig.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {filteredPromises.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPromises.map((promise) => (
                  <PromiseCard key={promise.id} promise={promise} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No promises found</h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? `No promises match your search for "${searchTerm}"`
                      : `No ${tab.label.toLowerCase()} promises match your current filters`
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}