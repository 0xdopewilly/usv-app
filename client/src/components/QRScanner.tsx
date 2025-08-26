import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Zap } from 'lucide-react';
import { cameraManager, detectQRCode } from '@/lib/camera';
import { motion } from 'framer-motion';

interface QRScannerProps {
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function QRScanner({ onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    startScanning();
    return () => {
      cameraManager.stopCamera();
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) return;

    setIsScanning(true);
    setError(null);

    const result = await cameraManager.startCamera(videoRef.current);
    
    if (!result.success) {
      setError(result.error || 'Failed to access camera');
      setIsScanning(false);
      return;
    }

    // Start scanning for QR codes
    const scanInterval = setInterval(async () => {
      const frame = await cameraManager.captureFrame();
      if (frame) {
        const qrData = detectQRCode(frame);
        if (qrData) {
          clearInterval(scanInterval);
          onScan(qrData);
        }
      }
    }, 500);

    return () => clearInterval(scanInterval);
  };

  const toggleFlash = async () => {
    await cameraManager.toggleFlash();
    setFlashEnabled(!flashEnabled);
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Camera View */}
      <div className="relative w-full h-full">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <p className="text-lg mb-4">{error}</p>
              <Button onClick={startScanning} data-testid="retry-camera">
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Camera overlay for no camera access */}
            {!isScanning && (
              <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <QrCode className="w-16 h-16 mx-auto mb-4" />
                  <p>Camera feed would appear here</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Scanner Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-64">
            {/* Scanner Frame */}
            <div className="w-full h-full border-2 border-electric-blue rounded-xl relative overflow-hidden">
              {/* Scanning Line Animation */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-electric-blue"
                animate={{ y: [0, 256] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white" />
            </div>
            
            {/* Instructions */}
            <p className="text-white text-center mt-6">
              Position QR code within the frame
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-12 left-6 right-6 flex justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-10 h-10 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
            data-testid="close-scanner"
          >
            <X className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFlash}
            className={`w-10 h-10 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 ${
              flashEnabled ? 'bg-electric-blue bg-opacity-70' : ''
            }`}
            data-testid="toggle-flash"
          >
            <Zap className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
