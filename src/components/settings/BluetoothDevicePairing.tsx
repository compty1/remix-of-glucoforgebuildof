import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bluetooth, Loader2, Unplug } from 'lucide-react';
import { requestGlucoseMeter, readGlucoseMeasurements, isBluetoothAvailable, type BluetoothGlucoseReading } from '@/utils/bluetoothBridge';

export default function BluetoothDevicePairing() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [readings, setReadings] = useState<BluetoothGlucoseReading[]>([]);

  const isSupported = isBluetoothAvailable();

  const handlePair = async () => {
    if (!isSupported) {
      toast.error('Web Bluetooth is not supported in this browser');
      return;
    }
    setConnecting(true);
    try {
      const device = await requestGlucoseMeter();
      if (device) {
        setConnected(true);
        setDeviceName(device.name);
        setDeviceId(device.id);
        toast.success(`Connected to ${device.name}`);
        // Auto-read measurements
        const data = await readGlucoseMeasurements(device.id);
        setReadings(data);
      } else {
        toast.error('No device selected');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to connect');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bluetooth className="h-5 w-5" />
          Bluetooth Glucose Meter
          {connected && <Badge>Connected</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupported ? (
          <p className="text-sm text-muted-foreground">
            Web Bluetooth is not available. Use Chrome or Edge on desktop/Android.
          </p>
        ) : !connected ? (
          <>
            <p className="text-sm text-muted-foreground">
              Pair with a Bluetooth-enabled glucose meter to read data directly.
            </p>
            <Button onClick={handlePair} disabled={connecting}>
              {connecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bluetooth className="h-4 w-4 mr-2" />}
              Scan & Pair
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{deviceName}</p>
                <p className="text-xs text-muted-foreground">{readings.length} readings received</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setConnected(false); setReadings([]); }}>
                <Unplug className="h-4 w-4 mr-1" /> Disconnect
              </Button>
            </div>
            {readings.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {readings.slice(0, 10).map((r, i) => (
                  <div key={i} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                    <span>{r.value} mg/dL</span>
                    <span className="text-muted-foreground">{r.timestamp.toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
