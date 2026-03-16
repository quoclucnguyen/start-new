import { useState, useCallback, useRef, useEffect } from 'react';
import Quagga from '@ericblade/quagga2';
import { isInTelegramWebView } from '@/lib/tma';

export interface BarcodeScannerResult {
  code: string;
  format: string;
}

export interface UseBarcodeScannerOptions {
  /**
   * Force specific scanner mode
   * - 'tma': Use Telegram's native QR scanner
   * - 'camera': Use camera + quagga2
   * - 'auto': Detect automatically (TMA first, fallback to camera)
   */
  mode?: 'tma' | 'camera' | 'auto';
  
  /**
   * Callback when barcode is detected
   */
  onDetected?: (result: BarcodeScannerResult) => void;
  
  /**
   * Target element for camera viewfinder (camera mode only)
   */
  targetRef?: React.RefObject<HTMLElement>;
}

export interface UseBarcodeScannerReturn {
  /** Start scanning */
  startScan: () => Promise<void>;
  /** Stop scanning */
  stopScan: () => void;
  /** Current scanner mode being used */
  activeMode: 'tma' | 'camera' | null;
  /** Whether scanner is currently active */
  isScanning: boolean;
  /** Last detected barcode */
  result: BarcodeScannerResult | null;
  /** Error if any */
  error: Error | null;
  /** Whether camera is supported (for camera mode) */
  cameraSupported: boolean;
}

/**
 * Check if Telegram Mini App QR scanner is available
 */
function isTmaQrScannerAvailable(): boolean {
  if (!isInTelegramWebView()) return false;
  
  try {
    const w = globalThis as unknown as {
      Telegram?: {
        WebApp?: {
          showScanQrPopup?: (params: unknown, callback?: (text: string) => boolean | void) => void;
          closeScanQrPopup?: () => void;
          version?: string;
        };
      };
    };
    
    // Bot API 6.4+ required for QR scanner
    const version = w?.Telegram?.WebApp?.version;
    if (version) {
      const [major, minor] = version.split('.').map(Number);
      if (major > 6 || (major === 6 && minor >= 4)) {
        return typeof w?.Telegram?.WebApp?.showScanQrPopup === 'function';
      }
    }
    
    return typeof w?.Telegram?.WebApp?.showScanQrPopup === 'function';
  } catch {
    return false;
  }
}

/**
 * Check if camera is supported in browser
 */
function isCameraSupported(): boolean {
  return !!navigator.mediaDevices?.getUserMedia;
}

/**
 * Hook for barcode scanning with TMA native scanner + quagga2 fallback
 */
export function useBarcodeScanner(options: UseBarcodeScannerOptions = {}): UseBarcodeScannerReturn {
  const { mode = 'auto', onDetected, targetRef } = options;
  
  const [activeMode, setActiveMode] = useState<'tma' | 'camera' | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<BarcodeScannerResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const quaggaInitialized = useRef(false);
  const tmaCallbackRef = useRef<((text: string) => boolean | void) | null>(null);
  
  const cameraSupported = isCameraSupported();
  const tmaAvailable = isTmaQrScannerAvailable();
  
  // Determine which mode to use
  const resolvedMode = useCallback((): 'tma' | 'camera' => {
    if (mode === 'tma') return 'tma';
    if (mode === 'camera') return 'camera';
    // Auto mode: prefer TMA if available
    return tmaAvailable ? 'tma' : 'camera';
  }, [mode, tmaAvailable]);
  
  // Handle barcode detection
  const handleDetected = useCallback((code: string, format: string) => {
    const scanResult: BarcodeScannerResult = { code, format };
    setResult(scanResult);
    onDetected?.(scanResult);
  }, [onDetected]);
  
  // Start TMA scanner
  const startTmaScanner = useCallback(() => {
    const w = globalThis as unknown as {
      Telegram?: {
        WebApp?: {
          showScanQrPopup: (
            params: { text?: string },
            callback?: (text: string) => boolean | void
          ) => void;
        };
      };
    };
    
    const callback = (text: string): boolean => {
      // Return true to close the popup after detection
      handleDetected(text, 'qr');
      setIsScanning(false);
      setActiveMode(null);
      return true;
    };
    
    tmaCallbackRef.current = callback;
    
    w?.Telegram?.WebApp?.showScanQrPopup(
      { text: 'Scan product barcode' },
      callback
    );
    
    setActiveMode('tma');
    setIsScanning(true);
  }, [handleDetected]);
  
  // Stop TMA scanner
  const stopTmaScanner = useCallback(() => {
    const w = globalThis as unknown as {
      Telegram?: {
        WebApp?: {
          closeScanQrPopup: () => void;
        };
      };
    };
    
    try {
      w?.Telegram?.WebApp?.closeScanQrPopup();
    } catch {
      // Ignore errors when closing
    }
    
    tmaCallbackRef.current = null;
  }, []);
  
  // Start camera scanner with quagga2
  const startCameraScanner = useCallback(async () => {
    if (!cameraSupported) {
      throw new Error('Camera not supported');
    }
    
    const target = targetRef?.current || document.getElementById('barcode-scanner-target');
    if (!target) {
      throw new Error('Scanner target element not found');
    }
    
    // Stop any existing scanner
    if (quaggaInitialized.current) {
      Quagga.stop();
      quaggaInitialized.current = false;
    }
    
    await new Promise<void>((resolve, reject) => {
      Quagga.init(
        {
          inputStream: {
            type: 'LiveStream',
            target,
            constraints: {
              facingMode: 'environment',
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
            },
          },
          decoder: {
            readers: [
              'ean_reader',           // EAN-13
              'ean_8_reader',         // EAN-8
              'upc_reader',           // UPC-A
              'upc_e_reader',         // UPC-E
              'code_128_reader',      // Code 128
              'code_39_reader',       // Code 39
            ],
            multiple: false,
          },
          locate: true,
          locator: {
            patchSize: 'medium',
            halfSample: true,
          },
        },
        (err) => {
          if (err) {
            reject(new Error(`Failed to initialize camera: ${err.message || err}`));
            return;
          }
          resolve();
        }
      );
    });
    
    quaggaInitialized.current = true;
    
    // Register detection handler
    Quagga.onDetected((data) => {
      const code = data.codeResult?.code;
      const format = data.codeResult?.format || 'unknown';
      
      if (code) {
        // Stop scanner after detection
        Quagga.stop();
        quaggaInitialized.current = false;
        setIsScanning(false);
        setActiveMode(null);
        handleDetected(code, format);
      }
    });
    
    Quagga.start();
    setActiveMode('camera');
    setIsScanning(true);
  }, [cameraSupported, targetRef, handleDetected]);
  
  // Stop camera scanner
  const stopCameraScanner = useCallback(() => {
    if (quaggaInitialized.current) {
      Quagga.stop();
      quaggaInitialized.current = false;
    }
  }, []);
  
  // Main start function
  const startScan = useCallback(async () => {
    setError(null);
    setResult(null);
    
    const selectedMode = resolvedMode();
    
    try {
      if (selectedMode === 'tma' && tmaAvailable) {
        startTmaScanner();
      } else {
        await startCameraScanner();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsScanning(false);
      setActiveMode(null);
      throw error;
    }
  }, [resolvedMode, tmaAvailable, startTmaScanner, startCameraScanner]);
  
  // Main stop function
  const stopScan = useCallback(() => {
    if (activeMode === 'tma') {
      stopTmaScanner();
    } else if (activeMode === 'camera') {
      stopCameraScanner();
    }
    
    setIsScanning(false);
    setActiveMode(null);
  }, [activeMode, stopTmaScanner, stopCameraScanner]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (quaggaInitialized.current) {
        Quagga.stop();
        quaggaInitialized.current = false;
      }
      if (tmaCallbackRef.current) {
        try {
          const w = globalThis as unknown as {
            Telegram?: { WebApp?: { closeScanQrPopup: () => void } };
          };
          w?.Telegram?.WebApp?.closeScanQrPopup();
        } catch {
          // Ignore
        }
      }
    };
  }, []);
  
  return {
    startScan,
    stopScan,
    activeMode,
    isScanning,
    result,
    error,
    cameraSupported,
  };
}
