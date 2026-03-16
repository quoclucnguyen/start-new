import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { Toast, SpinLoading } from 'antd-mobile';
import { CameraViewfinder } from '@/components/scanner/camera-viewfinder';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { useProductByBarcode, type ScannedProductData } from '@/api';

interface ScanState {
  status: 'idle' | 'scanning' | 'detected' | 'loading' | 'error';
  barcode: string | null;
}

export const BarcodeScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const scannerTargetRef = useRef<HTMLDivElement>(null);
  const [scanState, setScanState] = useState<ScanState>({ status: 'idle', barcode: null });
  
  // Navigate to add page with scanned data
  const navigateToAdd = useCallback((product: ScannedProductData | null, barcode?: string) => {
    if (product) {
      navigate('/add', {
        state: {
          prefill: {
            name: product.name,
            imageUrl: product.imageUrl,
            category: product.suggestedCategory,
          },
          scannedBarcode: product.barcode,
        },
      });
    } else {
      // Manual input - no product data
      navigate('/add', {
        state: {
          scannedBarcode: barcode,
        },
      });
    }
  }, [navigate]);
  
  // Barcode scanner hook
  const {
    startScan,
    stopScan,
    activeMode,
    isScanning,
    error: scannerError,
    cameraSupported,
  } = useBarcodeScanner({
    mode: 'auto',
    targetRef: scannerTargetRef as React.RefObject<HTMLElement>,
    onDetected: (detected) => {
      setScanState({ status: 'detected', barcode: detected.code });
    },
  });
  
  // Fetch product data when barcode is detected
  const {
    data: productData,
    isLoading: isLoadingProduct,
    error: productError,
    isSuccess,
  } = useProductByBarcode(scanState.barcode, {
    enabled: !!scanState.barcode && scanState.status === 'detected',
  });
  
  // Handle product lookup result
  useEffect(() => {
    if (!scanState.barcode || scanState.status !== 'detected') return;
    
    if (isLoadingProduct) {
      setScanState((prev) => ({ ...prev, status: 'loading' }));
      return;
    }
    
    if (isSuccess) {
      if (productData) {
        // Product found - navigate to add page with prefill
        Toast.show({
          content: `Đã tìm thấy: ${productData.name}`,
          icon: 'success',
        });
        navigateToAdd(productData);
      } else {
        // Product not found - manual input
        Toast.show({
          content: 'Không tìm thấy sản phẩm. Vui lòng nhập thông tin thủ công.',
          icon: 'fail',
        });
        navigateToAdd(null, scanState.barcode);
      }
    }

    if (productError) {
      Toast.show({
        content: 'Lỗi khi tìm sản phẩm. Vui lòng thử lại.',
        icon: 'fail',
      });
      setScanState({ status: 'idle', barcode: null });
    }
  }, [scanState.barcode, scanState.status, isLoadingProduct, isSuccess, productData, productError, navigateToAdd]);
  
  // Start scanning on mount
  useEffect(() => {
    const initScanner = async () => {
      try {
        await startScan();
        setScanState({ status: 'scanning', barcode: null });
      } catch (err) {
        console.error('Failed to start scanner:', err);
        Toast.show({
          content: 'Không thể truy cập camera',
          icon: 'fail',
        });
      }
    };
    
    // Small delay to ensure component is mounted
    const timer = setTimeout(initScanner, 100);
    
    return () => {
      clearTimeout(timer);
      stopScan();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle close
  const handleClose = useCallback(() => {
    stopScan();
    navigate(-1);
  }, [stopScan, navigate]);
  
  // Handle capture (manual trigger)
  const handleCapture = useCallback(async () => {
    // In camera mode, this is handled automatically by quagga2
    // In TMA mode, the native scanner handles it
    if (!isScanning) {
      try {
        await startScan();
        setScanState({ status: 'scanning', barcode: null });
      } catch (err) {
        console.error('Failed to restart scanner:', err);
      }
    }
  }, [isScanning, startScan]);
  
  // Determine status text
  const getStatusText = () => {
    switch (scanState.status) {
      case 'scanning':
        return 'Đang quét...';
      case 'detected':
        return 'Đã phát hiện mã vạch!';
      case 'loading':
        return 'Đang tìm sản phẩm...';
      case 'error':
        return 'Quét thất bại';
      default:
        return 'Đặt mã vạch trong khung hình';
    }
  };
  
  // If using TMA native scanner, show minimal UI
  if (activeMode === 'tma') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <SpinLoading color="primary" style={{ '--size': '48px' }} />
          <p className="mt-4 text-lg">Trình quét Telegram đang hoạt động</p>
          <p className="mt-2 text-sm text-gray-400">Quét mã vạch để tiếp tục</p>
          <button
            onClick={handleClose}
            className="mt-6 px-6 py-2 rounded-xl bg-white/10 text-white"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }
  
  // Camera mode UI
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <CameraViewfinder
        status={scanState.status === 'detected' || scanState.status === 'loading' ? 'detected' : isScanning ? 'scanning' : 'idle'}
        statusText={getStatusText()}
        helpText={
          scanState.status === 'loading'
            ? 'Vui lòng đợi...'
            : 'Hướng camera vào mã vạch sản phẩm'
        }
        onClose={handleClose}
        onCapture={handleCapture}
        aspectRatio="barcode"
      >
        {/* Camera feed target */}
        <div
          ref={scannerTargetRef}
          id="barcode-scanner-target"
          className="absolute inset-0 w-full h-full"
        >
          {/* quagga2 will inject video element here */}
        </div>
        
        {/* Loading overlay */}
        {scanState.status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30">
            <div className="text-center">
              <SpinLoading color="primary" style={{ '--size': '48px' }} />
              <p className="mt-4 text-white text-lg">Đang tìm sản phẩm...</p>
            </div>
          </div>
        )}
      </CameraViewfinder>
      
      {/* Error state */}
      {scannerError && !isScanning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
          <div className="text-center px-8">
            <p className="text-red-400 text-lg mb-4">
              {cameraSupported
                ? 'Không thể truy cập camera hoặc camera không khả dụng'
                : 'Thiết bị này không hỗ trợ camera'}
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-3 rounded-xl bg-white/10 text-white mr-3"
            >
              Quay lại
            </button>
            {cameraSupported && (
              <button
                onClick={handleCapture}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground"
              >
                Thử lại
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
