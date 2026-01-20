import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, GitCompare } from 'lucide-react';

interface MedicationCompareBarProps {
  selectedMedications: Array<{ id: string; name: string }>;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export function MedicationCompareBar({ 
  selectedMedications, 
  onRemove, 
  onClearAll 
}: MedicationCompareBarProps) {
  if (selectedMedications.length === 0) {
    return null;
  }

  const compareUrl = `/medicines/compare?ids=${selectedMedications.map(m => m.id).join(',')}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <span className="text-sm font-medium text-muted-foreground">
              Compare ({selectedMedications.length}/4):
            </span>
            {selectedMedications.map((med) => (
              <div
                key={med.id}
                className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
              >
                <span className="truncate max-w-[120px]">{med.name}</span>
                <button
                  onClick={() => onRemove(med.id)}
                  className="hover:bg-primary/20 rounded p-0.5"
                  aria-label={`Remove ${med.name} from comparison`}
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
            <Button asChild size="sm" disabled={selectedMedications.length < 2}>
              <Link to={compareUrl}>
                <GitCompare className="h-4 w-4 mr-2" />
                Compare
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
