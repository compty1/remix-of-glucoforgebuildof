import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Nfc, Loader2, Package } from 'lucide-react';
import { scanNFCTag, isNFCAvailable, type NFCSupplyData } from '@/utils/nfcScanner';

export default function NFCSupplyScanner() {
  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<NFCSupplyData[]>([]);

  const isSupported = isNFCAvailable();

  const handleScan = async () => {
    setScanning(true);
    try {
      const data = await scanNFCTag();
      if (data) {
        setScannedItems(prev => [data, ...prev]);
        toast.success(`Scanned: ${data.productName || 'Supply item'}`);
      }
    } catch (e: any) {
      toast.error(e.message || 'NFC scan failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Nfc className="h-5 w-5" />
          NFC Supply Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupported ? (
          <p className="text-sm text-muted-foreground">
            NFC scanning requires an Android device with Chrome.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Tap your phone to an insulin vial or sensor box to auto-log supplies.
            </p>
            <Button onClick={handleScan} disabled={scanning}>
              {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Nfc className="h-4 w-4 mr-2" />}
              {scanning ? 'Waiting for tap...' : 'Start Scan'}
            </Button>
          </>
        )}

        {scannedItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Scanned Supplies</h4>
            {scannedItems.map((item, i) => (
              <div key={i} className="p-3 border rounded-lg flex items-start gap-3">
                <Package className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.productName || 'Unknown Item'}</p>
                  {item.lotNumber && <p className="text-xs text-muted-foreground">Lot: {item.lotNumber}</p>}
                  {item.expiryDate && (
                    <Badge variant="outline" className="text-xs mt-1">
                      Exp: {item.expiryDate.toLocaleDateString()}
                    </Badge>
                  )}
                  {item.ndcCode && <p className="text-xs text-muted-foreground">NDC: {item.ndcCode}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
