import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNutritionLookup, type NutritionResult } from '@/hooks/useNutritionLookup';
import { Search, ScanBarcode, Loader2, Apple } from 'lucide-react';

interface FoodLookupProps {
  onSelect?: (result: NutritionResult) => void;
}

export default function FoodLookup({ onSelect }: FoodLookupProps) {
  const [query, setQuery] = useState('');
  const { lookup, results, loading, error } = useNutritionLookup();
  const [scanning, setScanning] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      const isBarcode = /^\d{8,14}$/.test(query.trim());
      lookup(query.trim(), isBarcode);
    }
  };

  const handleBarcodeScan = async () => {
    if (!('BarcodeDetector' in window)) {
      // Fallback: prompt manual entry
      setQuery('');
      document.getElementById('food-search-input')?.focus();
      return;
    }
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      const detector = new (window as any).BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
      const detect = async (): Promise<string | null> => {
        const barcodes = await detector.detect(video);
        if (barcodes.length > 0) return barcodes[0].rawValue;
        return new Promise((resolve) => setTimeout(async () => resolve(await detect()), 300));
      };
      const timeoutId = setTimeout(() => {
        stream.getTracks().forEach(t => t.stop());
        setScanning(false);
      }, 15000);
      const barcode = await detect();
      clearTimeout(timeoutId);
      stream.getTracks().forEach(t => t.stop());
      if (barcode) {
        setQuery(barcode);
        lookup(barcode, true);
      }
    } catch {
      // Camera denied or unavailable
    } finally {
      setScanning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Apple className="h-5 w-5" />
          Food Lookup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            id="food-search-input"
            placeholder="Search food or enter barcode..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button size="icon" variant="outline" onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="outline" onClick={handleBarcodeScan} disabled={scanning}>
            <ScanBarcode className="h-4 w-4" />
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {results.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {results.map((r, i) => (
              <div
                key={i}
                className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onSelect?.(r)}
              >
                <p className="font-medium text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.servingSize}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">Carbs: {r.carbs}g</Badge>
                  <Badge variant="outline" className="text-xs">Fat: {r.fat}g</Badge>
                  <Badge variant="outline" className="text-xs">Protein: {r.protein}g</Badge>
                  <Badge variant="outline" className="text-xs">{r.calories} kcal</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
