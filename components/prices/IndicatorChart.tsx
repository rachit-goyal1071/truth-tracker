'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface IndicatorChartProps {
  data: Record<string, number>;
  title: string;
  unit?: string;
  type?: 'line' | 'bar';
}

export default function IndicatorChart({ data, title, unit, type = 'line' }: IndicatorChartProps) {
  const chartData = Object.entries(data)
    .map(([year, value]) => ({
      year: parseInt(year),
      value: value,
      formattedValue: unit ? `${value.toFixed(2)} ${unit}` : value.toFixed(2)
    }))
    .sort((a, b) => a.year - b.year);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Year: ${label}`}</p>
          <p className="text-purple-600">
            {`${title}: ${payload[0].payload.formattedValue}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available for the selected year range
      </div>
    );
  }

  const minValue = Math.min(...chartData.map(d => d.value));
  const maxValue = Math.max(...chartData.map(d => d.value));
  const valueRange = maxValue - minValue;
  const yAxisMin = Math.max(0, minValue - valueRange * 0.1);
  const yAxisMax = maxValue + valueRange * 0.1;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              domain={[yAxisMin, yAxisMax]}
              tickFormatter={(value) => unit ? `${value.toFixed(0)} ${unit}` : value.toFixed(0)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#7c3aed"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              domain={[yAxisMin, yAxisMax]}
              tickFormatter={(value) => unit ? `${value.toFixed(0)} ${unit}` : value.toFixed(0)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#7c3aed" 
              strokeWidth={2}
              dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#7c3aed', strokeWidth: 2 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}