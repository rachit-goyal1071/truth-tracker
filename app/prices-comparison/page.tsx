'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchBar from '@/components/shared/SearchBar';
import { getCommodityPrices, getNationalIndicators, searchDocuments } from '@/lib/firestore';
import { CommodityPrice, NationalIndicator } from '@/lib/types';
import { TrendingUp, BarChart3, Search, Calendar, Filter } from 'lucide-react';
import PriceChart from '@/components/prices/PriceChart';
import IndicatorChart from '@/components/prices/IndicatorChart';
import YearRangeSelector from '@/components/prices/YearRangeSelector';

export default function PricesComparisonPage() {
  const [commodities, setCommodities] = useState<CommodityPrice[]>([]);
  const [indicators, setIndicators] = useState<NationalIndicator[]>([]);
  const [filteredCommodities, setFilteredCommodities] = useState<CommodityPrice[]>([]);
  const [filteredIndicators, setFilteredIndicators] = useState<NationalIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearRange, setYearRange] = useState({ start: 2015, end: 2024 });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('chart');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [commodities, indicators, searchTerm, selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [commodityData, indicatorData] = await Promise.all([
        getCommodityPrices(),
        getNationalIndicators()
      ]);
      
      setCommodities(commodityData as CommodityPrice[]);
      setIndicators(indicatorData as NationalIndicator[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filteredComm = commodities;
    let filteredInd = indicators;

    // Apply search filter
    if (searchTerm) {
      filteredComm = commodities.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      filteredInd = indicators.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filteredComm = filteredComm.filter(item => item.category === selectedCategory);
      filteredInd = filteredInd.filter(item => item.category === selectedCategory);
    }

    setFilteredCommodities(filteredComm);
    setFilteredIndicators(filteredInd);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleYearRangeChange = (start: number, end: number) => {
    setYearRange({ start, end });
  };

  const getFilteredYearlyData = (yearlyData: Record<string, number>) => {
    const filtered: Record<string, number> = {};
    Object.keys(yearlyData).forEach(year => {
      const yearNum = parseInt(year);
      if (yearNum >= yearRange.start && yearNum <= yearRange.end) {
        filtered[year] = yearlyData[year];
      }
    });
    return filtered;
  };

  const formatLastUpdated = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Prices & National Indicators</h1>
        <p className="text-gray-600">
          Track commodity prices and national development indicators over time
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <SearchBar 
            placeholder="Search commodities or indicators..." 
            onSearch={handleSearch}
            className="flex-1 max-w-md"
          />
          
          <YearRangeSelector
            startYear={yearRange.start}
            endYear={yearRange.end}
            onRangeChange={handleYearRangeChange}
          />
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="prices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prices" className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Commodity Prices
          </TabsTrigger>
          <TabsTrigger value="indicators" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            National Indicators
          </TabsTrigger>
        </TabsList>

        {/* Commodity Prices Tab */}
        <TabsContent value="prices" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="Fuel">Fuel</option>
                <option value="Food">Food</option>
                <option value="Utilities">Utilities</option>
                <option value="Transport">Transport</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'chart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('chart')}
              >
                Chart View
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table View
              </Button>
            </div>
          </div>

          {filteredCommodities.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCommodities.map((commodity) => (
                <Card key={commodity.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{commodity.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{commodity.category}</Badge>
                          <span className="text-sm text-gray-500">per {commodity.unit}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Last Updated</div>
                        <div className="text-sm font-medium">
                          {formatLastUpdated(commodity.lastUpdated)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {viewMode === 'chart' ? (
                      <PriceChart
                        data={getFilteredYearlyData(commodity.yearlyData)}
                        title={commodity.name}
                        unit={commodity.unit}
                      />
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(getFilteredYearlyData(commodity.yearlyData))
                          .sort(([a], [b]) => parseInt(b) - parseInt(a))
                          .slice(0, 5)
                          .map(([year, price]) => (
                            <div key={year} className="flex justify-between items-center py-1">
                              <span className="text-sm font-medium">{year}</span>
                              <span className="text-sm">₹{price.toFixed(2)}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No commodities found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No commodities match your search for "${searchTerm}"`
                    : 'No commodity data available'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* National Indicators Tab */}
        <TabsContent value="indicators" className="space-y-6">
          <div className="flex items-center justify-between">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              <option value="Economic">Economic</option>
              <option value="Social">Social</option>
              <option value="Development">Development</option>
              <option value="Governance">Governance</option>
            </select>
          </div>

          {filteredIndicators.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredIndicators.map((indicator) => (
                <Card key={indicator.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{indicator.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{indicator.category}</Badge>
                          {indicator.unit && (
                            <span className="text-sm text-gray-500">{indicator.unit}</span>
                          )}
                        </div>
                        {indicator.description && (
                          <p className="text-sm text-gray-600 mt-2">{indicator.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Last Updated</div>
                        <div className="text-sm font-medium">
                          {formatLastUpdated(indicator.lastUpdated)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <IndicatorChart
                      data={getFilteredYearlyData(indicator.yearlyData)}
                      title={indicator.name}
                      unit={indicator.unit}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No indicators found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No indicators match your search for "${searchTerm}"`
                    : 'No indicator data available'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}