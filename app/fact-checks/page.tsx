'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SearchBar from '@/components/shared/SearchBar';
import FilterPanel from '@/components/shared/FilterPanel';
import ShareButton from '@/components/shared/ShareButton';
import { getFactChecks, searchDocuments } from '@/lib/firestore';
import { FactCheck, FilterOptions } from '@/lib/types';
import { CheckCircle, X, ExternalLink, AlertTriangle } from 'lucide-react';

export default function FactChecksPage() {
  const [facts, setFacts] = useState<FactCheck[]>([]);
  const [filteredFacts, setFilteredFacts] = useState<FactCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFacts();
  }, []);

  const fetchFacts = async (filters?: FilterOptions) => {
    try {
      setLoading(true);
      const data = await getFactChecks(filters);
      setFacts(data as FactCheck[]);
      setFilteredFacts(data as FactCheck[]);
    } catch (error) {
      console.error('Error fetching fact checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterOptions) => {
    fetchFacts(filters);
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const results = await searchDocuments('fact_checks', term);
        setFilteredFacts(results as FactCheck[]);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setFilteredFacts(facts);
    }
  };

  const getCategoryStats = () => {
    const stats = {
      economy: facts.filter(f => f.category === 'Economy').length,
      jobs: facts.filter(f => f.category === 'Jobs').length,
      security: facts.filter(f => f.category === 'Security').length,
      social: facts.filter(f => f.category === 'Social Policy').length,
    };
    return stats;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Economy':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Jobs':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Security':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Social Policy':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = getCategoryStats();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
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
          <CheckCircle className="w-8 h-8 text-purple-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fact Checks</h1>
            <p className="text-gray-600">
              Verified fact checks debunking myths and misinformation with credible sources
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.economy}</div>
              <div className="text-sm text-gray-600">Economy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.jobs}</div>
              <div className="text-sm text-gray-600">Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.security}</div>
              <div className="text-sm text-gray-600">Security</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.social}</div>
              <div className="text-sm text-gray-600">Social Policy</div>
            </CardContent>
          </Card>
        </div>

        <SearchBar 
          placeholder="Search fact checks by myth, truth, or category..." 
          onSearch={handleSearch}
          className="max-w-2xl"
        />
      </div>

      {/* Filters */}
      <FilterPanel
        onFilterChange={handleFilterChange}
        showYearFilter={false}
        showPartyFilter={false}
        showStatusFilter={false}
        showStateFilter={false}
        showCategoryFilter={true}
        showDateRangeFilter={false}
        availableCategories={['Economy', 'Jobs', 'Security', 'Social Policy']}
      />

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredFacts.length} of {facts.length} fact checks
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Fact Checks Grid */}
      {filteredFacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFacts.map((fact) => (
            <Card key={fact.id} className="hover:shadow-lg transition-shadow duration-200" id={`fact-${fact.id}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <Badge className={`${getCategoryColor(fact.category)} text-xs`}>
                    {fact.category}
                  </Badge>
                  <ShareButton
                    url={`${typeof window !== 'undefined' ? window.location.origin : ''}/fact-checks#fact-${fact.id}`}
                    title={`Fact Check: ${fact.myth}`}
                    description={`Truth: ${fact.truth}`}
                    elementId={`fact-${fact.id}`}
                  />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Myth Section */}
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <X className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-red-800 mb-1">MYTH</div>
                      <p className="text-red-900 leading-relaxed">{fact.myth}</p>
                    </div>
                  </div>
                </div>

                {/* Truth Section */}
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-green-800 mb-1">TRUTH</div>
                      <p className="text-green-900 leading-relaxed">{fact.truth}</p>
                    </div>
                  </div>
                </div>

                {/* Source */}
                {fact.proof_link && (
                  <div className="pt-3 border-t">
                    <a
                      href={fact.proof_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Source & Evidence
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fact checks found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No fact checks match your search for "${searchTerm}"`
                : 'No fact checks match your current filters'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
