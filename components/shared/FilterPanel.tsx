'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Search } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  [key: string]: FilterOption[];
}

interface FilterPanelProps {
  filters?: FilterConfig;
  onFiltersChange?: (filters: Record<string, string | undefined>) => void;
  searchPlaceholder?: string;
  onSearchChange?: (search: string) => void;
  className?: string;
}

export default function FilterPanel({
  filters = {},
  onFiltersChange = () => {},
  searchPlaceholder = "Search...",
  onSearchChange = () => {},
  className = ""
}: FilterPanelProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (filterKey: string, value: string) => {
    const newFilters = { ...activeFilters };
    
    if (value === 'all' || !value) {
      delete newFilters[filterKey];
    } else {
      newFilters[filterKey] = value;
    }
    
    setActiveFilters(newFilters);
    
    // Convert to the format expected by parent component
    const filtersForParent: Record<string, string | undefined> = {};
    Object.keys(filters).forEach(key => {
      filtersForParent[key] = newFilters[key] || undefined;
    });
    
    onFiltersChange(filtersForParent);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    
    const clearedFilters: Record<string, string | undefined> = {};
    Object.keys(filters).forEach(key => {
      clearedFilters[key] = undefined;
    });
    
    onFiltersChange(clearedFilters);
    onSearchChange('');
  };

  const removeFilter = (filterKey: string) => {
    handleFilterChange(filterKey, 'all');
  };

  const activeFilterCount = Object.keys(activeFilters).length;
  const hasFilters = Object.keys(filters).length > 0;

  if (!hasFilters) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(filters).map(([filterKey, options]) => (
            <div key={filterKey} className="space-y-2">
              <Label htmlFor={filterKey}>
                {filterKey.charAt(0).toUpperCase() + filterKey.slice(1).replace(/([A-Z])/g, ' $1')}
              </Label>
              <Select
                value={activeFilters[filterKey] || 'all'}
                onValueChange={(value) => handleFilterChange(filterKey, value)}
              >
                <SelectTrigger id={filterKey}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {options && options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="space-y-2">
            <Label>Active Filters:</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([key, value]) => {
                const filterConfig = filters[key];
                const option = filterConfig?.find(opt => opt.value === value);
                const label = option?.label || value;
                
                return (
                  <Badge key={key} variant="secondary" className="flex items-center gap-1">
                    <span className="text-xs font-medium">
                      {key}: {label}
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
