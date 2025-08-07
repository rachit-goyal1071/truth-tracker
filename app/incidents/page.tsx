'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SearchBar from '@/components/shared/SearchBar';
import FilterPanel from '@/components/shared/FilterPanel';
import ShareButton from '@/components/shared/ShareButton';
import { getIncidents, searchDocuments } from '@/lib/firestore';
import { Incident, FilterOptions } from '@/lib/types';
import { AlertTriangle, MapPin, ExternalLink, Calendar } from 'lucide-react';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async (filters?: FilterOptions) => {
    try {
      setLoading(true);
      const data = await getIncidents(filters);
      setIncidents(data as Incident[]);
      setFilteredIncidents(data as Incident[]);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterOptions) => {
    fetchIncidents(filters);
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const results = await searchDocuments('incidents', term);
        setFilteredIncidents(results as Incident[]);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setFilteredIncidents(incidents);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Violence':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Corruption':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Policy Failure':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryStats = () => {
    const stats = {
      violence: incidents.filter(i => i.category === 'Violence').length,
      corruption: incidents.filter(i => i.category === 'Corruption').length,
      policyFailure: incidents.filter(i => i.category === 'Policy Failure').length,
    };
    return stats;
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
          <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Incident Timeline</h1>
            <p className="text-gray-600">
              Track political incidents, policy failures, and accountability issues
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.violence}</div>
              <div className="text-sm text-gray-600">Violence</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.corruption}</div>
              <div className="text-sm text-gray-600">Corruption</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.policyFailure}</div>
              <div className="text-sm text-gray-600">Policy Failures</div>
            </CardContent>
          </Card>
        </div>

        <SearchBar 
          placeholder="Search incidents by title, location, or description..." 
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
        showDateRangeFilter={true}
        availableCategories={['Violence', 'Corruption', 'Policy Failure']}
      />

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredIncidents.length} of {incidents.length} incidents
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Incidents Timeline */}
      {filteredIncidents.length > 0 ? (
        <div className="space-y-6">
          {filteredIncidents.map((incident) => (
            <Card key={incident.id} className="hover:shadow-lg transition-shadow duration-200" id={`incident-${incident.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Badge className={`${getCategoryColor(incident.category)} mr-3`}>
                        {incident.category}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(incident.date)}
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2">{incident.title}</CardTitle>
                  </div>
                  <ShareButton
                    url={`${typeof window !== 'undefined' ? window.location.origin : ''}/incidents#incident-${incident.id}`}
                    title={`Incident: ${incident.title}`}
                    description={incident.summary}
                    elementId={`incident-${incident.id}`}
                  />
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {incident.summary}
                </p>

                {incident.location && (
                  <div className="flex items-center mb-4 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>
                      Location: {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                    </span>
                  </div>
                )}

                {incident.proof_links && incident.proof_links.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Sources:</h4>
                    <div className="space-y-1">
                      {incident.proof_links.slice(0, 3).map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Source {index + 1}
                        </a>
                      ))}
                      {incident.proof_links.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{incident.proof_links.length - 3} more sources
                        </p>
                      )}
                    </div>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No incidents match your search for "${searchTerm}"`
                : 'No incidents match your current filters'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}