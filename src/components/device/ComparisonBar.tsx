import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight } from 'lucide-react';

interface ComparisonBarProps {
  selectedDevices: { id: string; name: string }[];
  onRemove: (deviceId: string) => void;
  onClear: () => void;
  maxDevices: number;
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({
  selectedDevices,
  onRemove,
  onClear,
  maxDevices
}) => {
  const navigate = useNavigate();

  if (selectedDevices.length === 0) return null;

  const handleCompare = () => {
    const ids = selectedDevices.map(d => d.id).join(',');
    navigate(`/devices/compare?ids=${ids}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 animate-in slide-in-from-bottom-5">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium whitespace-nowrap">
              Compare ({selectedDevices.length}/{maxDevices}):
            </span>
            {selectedDevices.map(device => (
              <Badge key={device.id} variant="secondary" className="text-sm py-1 px-2">
                {device.name}
                <button 
                  onClick={() => onRemove(device.id)}
                  className="ml-1.5 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
            <Button 
              size="sm" 
              onClick={handleCompare}
              disabled={selectedDevices.length < 2}
            >
              Compare
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};