import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, GitCompare } from 'lucide-react';

interface CompanyComparisonBarProps {
  selectedCompanies: { id: string; name: string }[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const CompanyComparisonBar = ({ 
  selectedCompanies, 
  onRemove, 
  onClearAll 
}: CompanyComparisonBarProps) => {
  if (selectedCompanies.length === 0) return null;

  const comparisonUrl = `/companies/compare?ids=${selectedCompanies.map(c => c.id).join(',')}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 p-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground font-medium">
            Compare ({selectedCompanies.length}/4):
          </span>
          {selectedCompanies.map((company) => (
            <div
              key={company.id}
              className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
            >
              <span className="truncate max-w-[120px]">{company.name}</span>
              <button
                onClick={() => onRemove(company.id)}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear All
          </Button>
          <Link to={comparisonUrl}>
            <Button size="sm" disabled={selectedCompanies.length < 2}>
              <GitCompare className="h-4 w-4 mr-2" />
              Compare {selectedCompanies.length >= 2 ? `(${selectedCompanies.length})` : ''}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompanyComparisonBar;
