'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SearchBar from '@/components/shared/SearchBar';
import FilterPanel from '@/components/shared/FilterPanel';
import { getPriceData, searchDocuments } from '@/lib/firestore';
import { PriceData, FilterOptions } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PricesPage() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async (filters?: FilterOptions) => {
    try {
      setLoading(true);
      const data = await getPriceData(filters);
      setPrices(data as PriceData[]);
      setFilteredPrices(data as PriceData[]);
    } catch (error) {
      console.error('Error fetching price data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterOptions) => {
    fetchPrices(filters);
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const results = await searchDocuments('price_data', term);
        setFilteredPrices(results as PriceData[]);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setFilteredPrices(prices);
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriceChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-red-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-green-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getStateStats = () => {
    const stateGroups = filteredPrices.reduce((acc, price) => {
      if (!acc[price.state]) {
        acc[price.state] = [];
      }
      acc[price.state].push(price);
      return acc;
    }, {} as Record<string, PriceData[]>);

    return Object.entries(stateGroups).map(([state, statePrices]) => ({
      state,
      avgPrice: statePrices.reduce((sum, p) => sum + p.price_per_litre, 0) / statePrices.length,
      count: statePrices.length
    })).sort((a, b) => b.avgPrice - a.avgPrice);
  };

  const stateStats = getStateStats();

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
          <IndianRupee className="w-8 h-8 text-orange-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Price Tracker</h1>
            <p className="text-gray-600">
              Track essential commodity prices across Indian states
            </p>
          </div>
        </div>

        {/* State-wise Average Prices */}
        {stateStats.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                State-wise Average Prices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stateStats.slice(0, 6).map(({ state, avgPrice, count }) => (
                  <div key={state} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">{state}</div>
                      <div className="text-sm text-gray-500">{count} items</div>
                    </div>
                    <div className="text-lg font-bold text-orange-600">
                      {formatPrice(avgPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <SearchBar 
          placeholder="Search by item name or state..." 
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
        showStateFilter={true}
        showCategoryFilter={false}
        showDateRangeFilter={true}
      />

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredPrices.length} of {prices.length} price records
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Price Cards */}
      {filteredPrices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrices.map((price) => (
            <Card key={price.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{price.item}</CardTitle>
                  <Badge variant="outline">{price.state}</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price per Litre</span>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatPrice(price.price_per_litre)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">{formatDate(price.date)}</span>
                  </div>

                  {/* Mock price change - in real app, calculate from historical data */}
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="text-gray-600">Change</span>
                    <div className="flex items-center">
                      {getPriceChangeIcon(Math.random() * 10 - 5)}
                      <span className="ml-1 font-medium">
                        {(Math.random() * 10 - 5).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <IndianRupee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No price data found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No prices match your search for "${searchTerm}"`
                : 'No prices match your current filters'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}