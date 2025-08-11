'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/shared/SearchBar';
import FilterPanel from '@/components/shared/FilterPanel';
import ShareButton from '@/components/shared/ShareButton';
import { getPoliticalIncidents, searchDocuments } from '@/lib/firestore';
import { PoliticalIncident, FilterOptions } from '@/lib/types';
import { AlertTriangle, ExternalLink, Calendar, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<PoliticalIncident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<PoliticalIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async (filters?: FilterOptions) => {
    try {
      setLoading(true);
      const data = await getPoliticalIncidents(filters);
      setIncidents(data as PoliticalIncident[]);
      setFilteredIncidents(data as PoliticalIncident[]);
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
        const results = await searchDocuments('political_incidents', term);
        // Only show verified incidents
        const verifiedResults = results.filter((incident: any) => incident.verified);
        setFilteredIncidents(verifiedResults as PoliticalIncident[]);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setFilteredIncidents(incidents);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'violence':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'corruption':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'policy-failure':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'protest':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'legal-case':
        return 'bg-green-100 text-green-800 border-green-200';
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
      violence: incidents.filter(i => i.category === 'violence').length,
      corruption: incidents.filter(i => i.category === 'corruption').length,
      policyFailure: incidents.filter(i => i.category === 'policy-failure').length,
      protest: incidents.filter(i => i.category === 'protest').length,
      legalCase: incidents.filter(i => i.category === 'legal-case').length,
      other: incidents.filter(i => i.category === 'other').length,
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-red-600">{stats.violence}</div>
              <div className="text-sm text-gray-600">Violence</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-orange-600">{stats.corruption}</div>
              <div className="text-sm text-gray-600">Corruption</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-yellow-600">{stats.policyFailure}</div>
              <div className="text-sm text-gray-600">Policy Failures</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-blue-600">{stats.protest}</div>
              <div className="text-sm text-gray-600">Protests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-green-600">{stats.legalCase}</div>
              <div className="text-sm text-gray-600">Legal Cases</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-gray-600">{stats.other}</div>
              <div className="text-sm text-gray-600">Other</div>
            </CardContent>
          </Card>
        </div>

        <SearchBar 
          placeholder="Search incidents by title or description..." 
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
        availableCategories={['violence', 'corruption', 'policy-failure', 'protest', 'legal-case', 'other']}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredIncidents.map((incident) => (
            <Card key={incident.id} className="hover:shadow-lg transition-shadow duration-200" id={`incident-${incident.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Badge className={`${getCategoryColor(incident.category)} mr-3 text-xs`}>
                        {incident.category.replace('-', ' ')}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(incident.date)}
                      </div>
                    </div>
                    <CardTitle className="text-lg mb-2 leading-tight">{incident.title}</CardTitle>
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
                <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                  {incident.description.length > 150 
                    ? `${incident.description.substring(0, 150)}...` 
                    : incident.description
                  }
                </p>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-sm text-gray-600">
                    Source: <span className="font-medium">{incident.source}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Read More
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl leading-tight">
                            {incident.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <Badge className={getCategoryColor(incident.category)}>
                              {incident.category.replace('-', ' ')}
                            </Badge>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(incident.date)}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 leading-relaxed">
                            {incident.description}
                          </p>
                          
                          <div className="pt-4 border-t">
                            <div className="text-sm text-gray-600 mb-2">
                              <strong>Source:</strong> {incident.source}
                            </div>
                            {incident.sourceUrl && (
                              <a
                                href={incident.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View Original Source
                              </a>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {incident.sourceUrl && (
                      <a
                        href={incident.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Source
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
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
}</CardContent>
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