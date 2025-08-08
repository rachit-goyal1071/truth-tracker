'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

import { FilterOptions } from '@/lib/types';

interface FilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void;
  showYearFilter?: boolean;
  showPartyFilter?: boolean;
  showStatusFilter?: boolean;
  showStateFilter?: boolean;
  showCategoryFilter?: boolean;
  showDateRangeFilter?: boolean;
  availableCategories?: string[];
  className?: string;
}

export default function FilterPanel({
  onFilterChange,
  showYearFilter = false,
  showPartyFilter = false,
  showStatusFilter = false,
  showStateFilter = false,
  showCategoryFilter = false,
  showDateRangeFilter = false,
  availableCategories = [],
  className = ""
}: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters };
    
    if (value === '' || value === 'all') {
      delete newFilters[key as keyof FilterOptions];
    } else {
      (newFilters as any)[key] = value;
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const removeFilter = (key: string) => {
    handleFilterChange(key, '');
  };

  const activeFilterCount = Object.keys(filters).length;
  const hasAnyFilter = showYearFilter || showPartyFilter || showStatusFilter || showStateFilter || showCategoryFilter;

  if (!hasAnyFilter) return null;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden"
            >
              {isExpanded ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`space-y-4 ${!isExpanded ? 'hidden md:block' : ''}`}>
        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {showPartyFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Party</label>
              <Select
                value={filters.party || ''}
                onValueChange={(value) => handleFilterChange('party', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Parties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parties</SelectItem>
                  <SelectItem value="BJP">BJP</SelectItem>
                  <SelectItem value="Congress">Congress</SelectItem>
                  <SelectItem value="AAP">AAP</SelectItem>
                  <SelectItem value="TMC">TMC</SelectItem>
                  <SelectItem value="DMK">DMK</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showYearFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select
                value={filters.year?.toString() || ''}
                onValueChange={(value) => handleFilterChange('year', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showStatusFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Kept">Kept</SelectItem>
                  <SelectItem value="Broken">Broken</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showStateFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Select
                value={filters.state || ''}
                onValueChange={(value) => handleFilterChange('state', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="Karnataka">Karnataka</SelectItem>
                  <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                  <SelectItem value="West Bengal">West Bengal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showCategoryFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category || ''}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {availableCategories
                    .filter((category) => typeof category === 'string' && category.trim() !== '')
                    .map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Active Filters:</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                return (
                  <Badge key={key} variant="secondary" className="flex items-center gap-1">
                    <span className="text-xs font-medium">
                      {key}: {value}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => removeFilter(key)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
