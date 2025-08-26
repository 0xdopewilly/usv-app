import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Flashlight, FlashlightOff } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

export default function QRScan() {
  const [, setLocation] = useLocation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    requestCameraPermission();
    return () => {
      // Cleanup camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' }, // Use back camera if available
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: false
      });
      
      setHasPermission(true);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setScanning(true);
    } catch (error) {
      setHasPermission(false);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan QR codes",
        variant: "destructive",
      });
    }
  };

  const toggleFlash = async () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack && 'getCapabilities' in videoTrack) {
        const capabilities = videoTrack.getCapabilities();
        if ((capabilities as any).torch) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ torch: !flashOn } as any]
            });
            setFlashOn(!flashOn);
          } catch (error) {
            toast({
              title: "Flash not available",
              description: "Your device doesn't support camera flash",
              variant: "destructive",
            });
          }
        }
      }
    }
  };

  const simulateScan = () => {
    // Simulate QR code detection for demo
    setTimeout(() => {
      toast({
        title: "QR Code Detected!",
        description: "USV Vape Pod authenticated successfully",
      });
      setLocation('/');
    }, 1000);
  };

  if (hasPermission === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Requesting camera permission...</p>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="text-white text-center mb-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-red-500 text-3xl">!</div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Camera Access Required</h2>
          <p className="text-gray-400 mb-6">
            To scan QR codes, please allow camera access in your browser settings.
          </p>
          <Button
            onClick={requestCameraPermission}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl px-8 py-4 font-semibold"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      <BottomNavigation />
      

      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-16 left-0 right-0 z-20 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => setLocation('/')}
            className="w-12 h-12 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur border border-white/20"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-lg font-medium">Scan QR Code</h1>
          <button
            onClick={toggleFlash}
            className="w-12 h-12 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur border border-white/20"
          >
            {flashOn ? (
              <FlashlightOff className="w-5 h-5 text-yellow-400" />
            ) : (
              <Flashlight className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Camera View */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Scan Overlay */}
      <div className="absolute inset-0 z-10">
        {/* Dark overlay with cutout */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Scanning frame */}
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-64 h-64 relative">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
            
            {/* Scanning line animation */}
            <motion.div
              animate={{ y: [0, 256, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-80"
            />
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-32 left-0 right-0 text-center z-20"
        >
          <p className="text-white text-lg mb-2">Position QR code within the frame</p>
          <p className="text-gray-300 text-sm mb-6">
            Scan authentic USV vape products to earn rewards
          </p>
          
          {/* Demo scan button */}
          <Button
            onClick={simulateScan}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 py-3"
          >
            Demo Scan
          </Button>
        </motion.div>
      </div>

      {/* Scanning animation overlay when active */}
      {scanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 bg-purple-500/10 z-5 pointer-events-none"
        />
      )}
    </div>
  );
}