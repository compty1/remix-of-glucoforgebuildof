import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookmarks } from '@/hooks/useBookmarks';
import { 
  Bookmark, 
  ExternalLink, 
  Trash2, 
  BookOpen,
  Pill,
  Building2,
  FileText,
  Beaker
} from 'lucide-react';

const typeIcons: Record<string, React.ReactNode> = {
  'page': <FileText className="h-4 w-4" />,
  'medication': <Pill className="h-4 w-4" />,
  'company': <Building2 className="h-4 w-4" />,
  'research': <Beaker className="h-4 w-4" />,
  'article': <BookOpen className="h-4 w-4" />
};

export function BookmarkedItemsWidget() {
  const navigate = useNavigate();
  const { bookmarks, loading, removeBookmark } = useBookmarks();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" />
            My Bookmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" />
            My Bookmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Bookmark className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No bookmarks yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click the bookmark icon on any page to save it here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-primary" />
          My Bookmarks
          <Badge variant="secondary" className="ml-auto">{bookmarks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {bookmarks.slice(0, 5).map((bookmark) => (
            <div 
              key={bookmark.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {typeIcons[bookmark.bookmark_type] || <Bookmark className="h-4 w-4 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{bookmark.resource_title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {bookmark.resource_description || bookmark.bookmark_type}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => navigate(bookmark.resource_url)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => removeBookmark(bookmark.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {bookmarks.length > 5 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-3"
            onClick={() => navigate('/profile?tab=bookmarks')}
          >
            View All ({bookmarks.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
