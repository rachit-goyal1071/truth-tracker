'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SearchBar from '@/components/shared/SearchBar';
import FilterPanel from '@/components/shared/FilterPanel';
import PromiseCard from '@/components/dashboard/PromiseCard';
import { getPromises, searchDocuments } from '@/lib/firestore';
import { Promise, FilterOptions } from '@/lib/types';
import { FileText, TrendingUp } from 'lucide-react';

export default function PromisesPage() {
  const [promises, setPromises] = useState<Promise[]>([]);
  const [filteredPromises, setFilteredPromises] = useState<Promise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPromises();
  }, []);

  const fetchPromises = async (filters?: FilterOptions) => {
    try {
      setLoading(true);
      const data = await getPromises(filters);
      setPromises(data as Promise[]);
      setFilteredPromises(data as Promise[]);
    } catch (error) {
      console.error('Error fetching promises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterOptions) => {
    fetchPromises(filters);
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const results = await searchDocuments('promises', term);
        setFilteredPromises(results as Promise[]);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setFilteredPromises(promises);
    }
  };

  const getStatusStats = () => {
    const stats = {
      kept: promises.filter(p => p.status === 'Kept').length,
      broken: promises.filter(p => p.status === 'Broken').length,
      inProgress: promises.filter(p => p.status === 'In Progress').length,
      dropped: promises.filter(p => p.status === 'Dropped').length,
    };
    return stats;
  };

  const stats = getStatusStats();

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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.kept}</div>
              <div className="text-sm text-gray-600">Kept</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.broken}</div>
              <div className="text-sm text-gray-600">Broken</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.dropped}</div>
              <div className="text-sm text-gray-600">Dropped</div>
            </CardContent>
          </Card>
        </div>

        <SearchBar 
          placeholder="Search promises by title, party, or description..." 
          onSearch={handleSearch}
          className="max-w-2xl"
        />
      </div>

      {/* Filters */}
      <FilterPanel
        onFilterChange={handleFilterChange}
        showYearFilter={true}
        showPartyFilter={true}
        showStatusFilter={true}
        showStateFilter={false}
        showCategoryFilter={false}
        showDateRangeFilter={false}
      />

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredPromises.length} of {promises.length} promises
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Promises Grid */}
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
                : 'No promises match your current filters'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
