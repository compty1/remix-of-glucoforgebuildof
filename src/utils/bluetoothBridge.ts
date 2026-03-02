/**
 * Domain 3.1: Web Bluetooth API module for glucose meter pairing.
 * Reads from Bluetooth Glucose Profile (UUID 0x1808).
 */

export interface BluetoothGlucoseReading {
  value: number;       // mg/dL
  timestamp: Date;
  sequenceNumber: number;
  type: 'capillary' | 'venous' | 'interstitial' | 'unknown';
}

export interface BluetoothDeviceInfo {
  name: string;
  id: string;
  connected: boolean;
}

const GLUCOSE_SERVICE_UUID = 0x1808;
const GLUCOSE_MEASUREMENT_UUID = 0x2A18;
const GLUCOSE_MEASUREMENT_CONTEXT_UUID = 0x2A34;
const RECORD_ACCESS_CONTROL_POINT_UUID = 0x2A52;

/**
 * Check if Web Bluetooth is available.
 */
export function isBluetoothAvailable(): boolean {
  return 'bluetooth' in navigator;
}

// Extend Navigator for Web Bluetooth
declare global {
  interface Navigator {
    bluetooth: any;
  }
}

/**
 * Request a Bluetooth glucose meter and connect.
 */
export async function requestGlucoseMeter(): Promise<BluetoothDeviceInfo | null> {
  if (!isBluetoothAvailable()) return null;

  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [GLUCOSE_SERVICE_UUID] }],
      optionalServices: [GLUCOSE_SERVICE_UUID],
    });

    if (!device.gatt) return null;

    const server = await device.gatt.connect();
    return {
      name: device.name || 'Unknown Glucose Meter',
      id: device.id,
      connected: server.connected,
    };
  } catch (error) {
    console.error('Bluetooth pairing failed:', error);
    return null;
  }
}

/**
 * Read glucose measurements from a connected device.
 * Parses the Bluetooth Glucose Measurement characteristic format.
 */
export async function readGlucoseMeasurements(
  deviceId: string
): Promise<BluetoothGlucoseReading[]> {
  const readings: BluetoothGlucoseReading[] = [];

  try {
    const devices = await navigator.bluetooth.getDevices?.();
    const device = devices?.find((d) => d.id === deviceId);
    if (!device?.gatt) return readings;

    const server = device.gatt.connected
      ? device.gatt
      : await device.gatt.connect();

    const service = await server.getPrimaryService(GLUCOSE_SERVICE_UUID);
    const characteristic = await service.getCharacteristic(GLUCOSE_MEASUREMENT_UUID);

    // Listen for notifications
    await characteristic.startNotifications();

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        characteristic.stopNotifications();
        resolve(readings);
      }, 10000); // 10s timeout

      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const dataView = event.target.value as DataView;
        const reading = parseGlucoseMeasurement(dataView);
        if (reading) readings.push(reading);
      });

      // Request all stored records
      service.getCharacteristic(RECORD_ACCESS_CONTROL_POINT_UUID).then((racp) => {
        // Op code 0x01 = Report all stored records
        const command = new Uint8Array([0x01, 0x01]);
        racp.writeValue(command).catch(() => {
          clearTimeout(timeout);
          resolve(readings);
        });
      }).catch(() => {
        clearTimeout(timeout);
        resolve(readings);
      });
    });
  } catch (error) {
    console.error('Failed to read glucose data:', error);
    return readings;
  }
}

/**
 * Parse a Bluetooth Glucose Measurement characteristic value.
 */
function parseGlucoseMeasurement(data: DataView): BluetoothGlucoseReading | null {
  try {
    const flags = data.getUint8(0);
    let offset = 1;

    const sequenceNumber = data.getUint16(offset, true);
    offset += 2;

    // Base time
    const year = data.getUint16(offset, true); offset += 2;
    const month = data.getUint8(offset); offset += 1;
    const day = data.getUint8(offset); offset += 1;
    const hours = data.getUint8(offset); offset += 1;
    const minutes = data.getUint8(offset); offset += 1;
    const seconds = data.getUint8(offset); offset += 1;

    const timestamp = new Date(year, month - 1, day, hours, minutes, seconds);

    // Time offset (if present)
    if (flags & 0x01) offset += 2;

    // Glucose concentration
    let value = 0;
    if (flags & 0x02) {
      // kg/L units — convert to mg/dL
      const raw = data.getInt16(offset, true);
      const mantissa = raw & 0x0FFF;
      const exponent = (raw >> 12) & 0x0F;
      value = mantissa * Math.pow(10, exponent - 3) * 100000; // kg/L to mg/dL
    } else {
      // mol/L units — convert to mg/dL
      const raw = data.getInt16(offset, true);
      const mantissa = raw & 0x0FFF;
      const exponent = (raw >> 12) & 0x0F;
      value = mantissa * Math.pow(10, exponent) * 18.0156; // mmol/L to mg/dL
    }
    offset += 2;

    // Type and sample location
    const typeSample = data.getUint8(offset);
    const sampleType = typeSample & 0x0F;
    const typeMap: Record<number, BluetoothGlucoseReading['type']> = {
      1: 'capillary', 2: 'capillary', 3: 'venous', 4: 'venous',
      5: 'interstitial', 6: 'interstitial',
    };

    return {
      value: Math.round(value),
      timestamp,
      sequenceNumber,
      type: typeMap[sampleType] || 'unknown',
    };
  } catch {
    return null;
  }
}
