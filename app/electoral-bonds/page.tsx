'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SearchBar from '@/components/shared/SearchBar';
import FilterPanel from '@/components/shared/FilterPanel';
import { getElectoralBonds, searchDocuments } from '@/lib/firestore';
import { ElectoralBond, FilterOptions } from '@/lib/types';
import { DollarSign, ExternalLink, TrendingUp, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ElectoralBondsPage() {
  const [bonds, setBonds] = useState<ElectoralBond[]>([]);
  const [filteredBonds, setFilteredBonds] = useState<ElectoralBond[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBonds();
  }, []);

  const fetchBonds = async (filters?: FilterOptions) => {
    try {
      setLoading(true);
      const data = await getElectoralBonds(filters);
      setBonds(data as ElectoralBond[]);
      setFilteredBonds(data as ElectoralBond[]);
    } catch (error) {
      console.error('Error fetching electoral bonds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterOptions) => {
    fetchBonds(filters);
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const results = await searchDocuments('electoral_bonds', term);
        setFilteredBonds(results as ElectoralBond[]);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setFilteredBonds(bonds);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPartyStats = () => {
    const partyTotals = filteredBonds.reduce((acc, bond) => {
      acc[bond.party] = (acc[bond.party] || 0) + bond.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(partyTotals)
      .map(([party, total]) => ({ party, total }))
      .sort((a, b) => b.total - a.total);
  };

  const getTotalAmount = () => {
    return filteredBonds.reduce((sum, bond) => sum + bond.amount, 0);
  };

  const partyStats = getPartyStats();
  const totalAmount = getTotalAmount();

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
          <DollarSign className="w-8 h-8 text-green-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Electoral Bonds Tracker</h1>
            <p className="text-gray-600">
              Track corporate donations to political parties through electoral bonds
            </p>
          </div>
        </div>

        {/* Total Amount Card */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {formatCurrency(totalAmount)}
              </div>
              <div className="text-gray-600">Total Electoral Bonds Amount</div>
              <div className="text-sm text-gray-500 mt-1">
                From {filteredBonds.length} transactions
              </div>
            </div>
          </CardContent>
        </Card>

        <SearchBar 
          placeholder="Search by company name or party..." 
          onSearch={handleSearch}
          className="max-w-2xl"
        />
      </div>

      {/* Filters */}
      <FilterPanel
        onFilterChange={handleFilterChange}
        showYearFilter={false}
        showPartyFilter={true}
        showStatusFilter={false}
        showStateFilter={false}
        showCategoryFilter={false}
        showDateRangeFilter={true}
      />

      {/* Party-wise Totals */}
      {partyStats.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Party-wise Totals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partyStats.map(({ party, total }) => (
                <div key={party} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">{party}</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(total)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {((total / totalAmount) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredBonds.length} of {bonds.length} transactions
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Bonds Table */}
      {filteredBonds.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredBonds.map((bond) => (
            <Card key={bond.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Building2 className="w-5 h-5 text-gray-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {bond.company_name}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Party</div>
                        <Badge variant="outline" className="mt-1">
                          {bond.party}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Amount</div>
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(bond.amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Date</div>
                        <div className="font-medium text-gray-900">
                          {formatDate(bond.date)}
                        </div>
                      </div>
                    </div>

                    {bond.source_link && (
                      <a
                        href={bond.source_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Source
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
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No electoral bonds found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No bonds match your search for "${searchTerm}"`
                : 'No bonds match your current filters'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
