'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Facebook, Twitter, MessageCircle, Link, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ShareButtonProps {
  url?: string;
  title?: string;
  description?: string;
  elementId?: string; // For generating image
  className?: string;
}

export default function ShareButton({
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = 'Political Truth Tracker',
  description = 'Fact-based political accountability platform',
  elementId,
  className = ''
}: ShareButtonProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const shareData = {
    title,
    text: description,
    url,
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(description)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareOnWhatsApp = () => {
    const whatsappText = `${title}\n\n${description}\n\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const generateImage = async () => {
    if (!elementId) return;
    
    setIsGeneratingImage(true);
    try {
      const element = document.getElementById(elementId);
      if (element) {
        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
        });
        
        // Download the image
        const link = document.createElement('a');
        link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleWebShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareOnWhatsApp}>
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareOnTwitter}>
          <Twitter className="w-4 h-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareOnFacebook}>
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={copyLink}>
          <Link className="w-4 h-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        
        {elementId && (
          <DropdownMenuItem onClick={generateImage} disabled={isGeneratingImage}>
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingImage ? 'Generating...' : 'Download Image'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
