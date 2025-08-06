'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, User } from 'lucide-react';
import { Promise } from '@/lib/types';
import ShareButton from '@/components/shared/ShareButton';

interface PromiseCardProps {
  promise: Promise;
  showFullDescription?: boolean;
}

export default function PromiseCard({ promise, showFullDescription = false }: PromiseCardProps) {
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200" id={`promise-${promise.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 leading-tight">
              {promise.title}
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {promise.party}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {promise.year} • {promise.election_type}
              </div>
            </div>
          </div>
          <Badge className={`ml-3 ${getStatusColor(promise.status)}`}>
            {promise.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-700 mb-4 leading-relaxed">
          {showFullDescription 
            ? promise.description 
            : truncateText(promise.description, 200)
          }
        </p>

        {promise.proof_links && promise.proof_links.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Sources:</h4>
            <div className="space-y-1">
              {promise.proof_links.slice(0, 3).map((link, index) => (
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
              {promise.proof_links.length > 3 && (
                <p className="text-sm text-gray-500">
                  +{promise.proof_links.length - 3} more sources
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <Link href={`/promises/${promise.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
          
          <ShareButton
            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/promises/${promise.id}`}
            title={promise.title}
            description={`${promise.party} ${promise.year}: ${promise.description.substring(0, 100)}...`}
            elementId={`promise-${promise.id}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
