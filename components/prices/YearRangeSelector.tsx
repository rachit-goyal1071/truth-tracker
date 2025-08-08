'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface YearRangeSelectorProps {
  startYear: number;
  endYear: number;
  onRangeChange: (start: number, end: number) => void;
  minYear?: number;
  maxYear?: number;
}

export default function YearRangeSelector({
  startYear,
  endYear,
  onRangeChange,
  minYear = 2000,
  maxYear = new Date().getFullYear()
}: YearRangeSelectorProps) {
  const [tempStart, setTempStart] = useState(startYear);
  const [tempEnd, setTempEnd] = useState(endYear);

  const handleApply = () => {
    if (tempStart <= tempEnd && tempStart >= minYear && tempEnd <= maxYear) {
      onRangeChange(tempStart, tempEnd);
    }
  };

  const handleReset = () => {
    const defaultStart = maxYear - 9; // Last 10 years
    const defaultEnd = maxYear;
    setTempStart(defaultStart);
    setTempEnd(defaultEnd);
    onRangeChange(defaultStart, defaultEnd);
  };

  const presetRanges = [
    { label: 'Last 5 years', start: maxYear - 4, end: maxYear },
    { label: 'Last 10 years', start: maxYear - 9, end: maxYear },
    { label: '2010-2020', start: 2010, end: 2020 },
    { label: '2015-2024', start: 2015, end: 2024 },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>{startYear} - {endYear}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-3">Select Year Range</h4>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <Label htmlFor="start-year" className="text-xs">Start Year</Label>
                <Input
                  id="start-year"
                  type="number"
                  min={minYear}
                  max={maxYear}
                  value={tempStart}
                  onChange={(e) => setTempStart(parseInt(e.target.value) || minYear)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-year" className="text-xs">End Year</Label>
                <Input
                  id="end-year"
                  type="number"
                  min={minYear}
                  max={maxYear}
                  value={tempEnd}
                  onChange={(e) => setTempEnd(parseInt(e.target.value) || maxYear)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <Label className="text-xs">Quick Select</Label>
              <div className="grid grid-cols-2 gap-2">
                {presetRanges.map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setTempStart(range.start);
                      setTempEnd(range.end);
                    }}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleApply} size="sm" className="flex-1">
                Apply
              </Button>
              <Button onClick={handleReset} variant="outline" size="sm">
                Reset
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}