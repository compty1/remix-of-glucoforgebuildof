import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  bookmark_type: string;
  resource_id?: string;
  resource_url: string;
  resource_title: string;
  resource_description?: string;
  resource_icon?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function BookmarkButton({
  bookmark_type,
  resource_id,
  resource_url,
  resource_title,
  resource_description,
  resource_icon,
  variant = 'ghost',
  size = 'icon',
  className,
  showLabel = false
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, loading } = useBookmarks();
  
  const bookmarked = isBookmarked(resource_url);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleBookmark({
      bookmark_type,
      resource_id,
      resource_url,
      resource_title,
      resource_description,
      resource_icon
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      className={cn(
        bookmarked && 'text-primary',
        className
      )}
      title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="ml-2">{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
      )}
    </Button>
  );
}
