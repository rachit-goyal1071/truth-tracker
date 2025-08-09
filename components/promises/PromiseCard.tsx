'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ExternalLink, Calendar, User, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { Promise } from '@/lib/types';
import ShareButton from '@/components/shared/ShareButton';

interface PromiseCardProps {
  promise: Promise;
}

export default function PromiseCard({ promise }: PromiseCardProps) {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Kept':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Broken':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Dropped':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPartyColor = (party: string) => {
    const colors = {
      'BJP': 'bg-orange-100 text-orange-800',
      'Congress': 'bg-blue-100 text-blue-800',
      'AAP': 'bg-purple-100 text-purple-800',
      'TMC': 'bg-green-100 text-green-800',
      'DMK': 'bg-red-100 text-red-800',
    };
    return colors[party as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]" id={`promise-${promise.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge className={`text-xs ${getPartyColor(promise.party)}`}>
              {promise.party}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {promise.electionYear}
            </Badge>
          </div>
          <Badge className={`${getStatusColor(promise.status)}`}>
            {promise.status}
          </Badge>
        </div>
        
        <CardTitle className="text-lg leading-tight mb-2">
          {promise.title}
        </CardTitle>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
            {promise.category}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-700 mb-4 leading-relaxed text-sm">
          {truncateText(promise.description, 150)}
        </p>

        {/* Evidence Sources */}
        {promise.evidence && promise.evidence.length > 0 && (
          <Collapsible open={isSourcesOpen} onOpenChange={setIsSourcesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between p-2 h-auto">
                <span className="text-sm font-medium">View Sources ({promise.evidence.length})</span>
                {isSourcesOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                {promise.evidence.slice(0, 3).map((evidence, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        evidence.status === 'Kept' ? 'bg-green-500' :
                        evidence.status === 'Broken' ? 'bg-red-500' :
                        evidence.status === 'In Progress' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-gray-600">{formatDate(evidence.date)}</span>
                    </div>
                    <a
                      href={evidence.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Source
                    </a>
                  </div>
                ))}
                {promise.evidence.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{promise.evidence.length - 3} more sources
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Manifesto Source */}
        {promise.sourceManifestoUrl && (
          <div className="mt-3 pt-3 border-t">
            <a
              href={promise.sourceManifestoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Original Manifesto
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <div className="text-xs text-gray-500">
            Last verified: {formatDate(promise.lastVerified)}
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href={`/promises/${promise.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                Details
              </Button>
            </Link>
            
            <ShareButton
              url={`${typeof window !== 'undefined' ? window.location.origin : ''}/promises/${promise.id}`}
              title={promise.title}
              description={`${promise.party} ${promise.electionYear}: ${promise.description.substring(0, 100)}...`}
              elementId={`promise-${promise.id}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}