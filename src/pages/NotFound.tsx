import { Link } from "react-router-dom";
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui/button';
import { Home, Search, Activity, BookOpen, Users } from 'lucide-react';
import { useState } from 'react';

const popularPages = [
  { label: 'Dashboard', path: '/dashboard', icon: Activity },
  { label: 'Research Insights', path: '/research-insights', icon: BookOpen },
  { label: 'Community', path: '/community-solutions', icon: Users },
  { label: 'Devices', path: '/device-analytics', icon: Search },
];

const NotFound = () => {
  usePageMeta('Page Not Found', 'The page you requested could not be found.');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md w-full space-y-6">
        <div>
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          <p className="text-xl text-foreground font-medium mb-1">Page not found</p>
          <p className="text-muted-foreground text-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search GlucoForge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button type="submit" size="sm">Search</Button>
        </form>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Popular pages</p>
          <div className="grid grid-cols-2 gap-2">
            {popularPages.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm text-foreground"
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <Button variant="outline" asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
