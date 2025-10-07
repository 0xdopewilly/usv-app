import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Flashlight, FlashlightOff, CheckCircle, Camera, QrCode, Coins } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import QrScanner from 'qr-scanner';
import { apiRequest, queryClient } from '@/lib/queryClient';
import NotificationService from '@/lib/notifications';


export default function QRScan() {
  console.log('🚀 QRScan component mounted!');
  const [location, setLocation] = useLocation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [qrDetected, setQrDetected] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [claimResult, setClaimResult] = useState<{ tokens: number; product: string; code: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check for claim code in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const claimCode = urlParams.get('claim');
    if (claimCode) {
      console.log('🎯 Claim code found in URL:', claimCode);
      handleQRDetected(claimCode);
    }
  }, []);

  // Handle REAL QR code detection - AUTOMATIC CLAIM!
  const handleQRDetected = async (qrData: string) => {
    console.log('🎯 QR Code detected:', qrData);
    
    setQrDetected(qrData);
    setScanning(false);
    setProcessing(true);
    
    // Stop scanning temporarily
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
    
    // Extract claim code and metadata from QR data (supports all URI formats)
    let claimCode = qrData;
    let tokensFromURI: number | null = null;
    let productFromURI: string | null = null;
    
    // Try to parse as URL (supports http://, https://, usv://, etc.)
    let isURL = false;
    try {
      const url = new URL(qrData);
      isURL = true;
      
      // Extract claim code and metadata from URL (supports query params and hash fragments)
      let codeParam = url.searchParams.get('code') || url.searchParams.get('claim');
      tokensFromURI = url.searchParams.get('tokens') ? parseFloat(url.searchParams.get('tokens')!) : null;
      productFromURI = url.searchParams.get('product') ? decodeURIComponent(url.searchParams.get('product')!) : null;
      
      // If not in query params, check hash fragment
      if (!codeParam && url.hash) {
        const hash = url.hash.substring(1); // Remove the # symbol
        
        // Check if hash contains query params (e.g., #/claim?code=XYZ)
        if (hash.includes('?')) {
          const hashParams = new URLSearchParams(hash.split('?')[1]);
          codeParam = hashParams.get('code') || hashParams.get('claim');
          if (!tokensFromURI) tokensFromURI = hashParams.get('tokens') ? parseFloat(hashParams.get('tokens')!) : null;
          if (!productFromURI) productFromURI = hashParams.get('product') ? decodeURIComponent(hashParams.get('product')!) : null;
        } 
        // Check if hash is direct code assignment (e.g., #code=XYZ)
        else if (hash.includes('=')) {
          const hashParts = hash.split('=');
          if (hashParts[0] === 'code' || hashParts[0] === 'claim') {
            codeParam = hashParts[1];
          }
        }
        // Check if hash is just the code itself (e.g., #ABC123)
        else if (hash.length > 0) {
          codeParam = hash;
        }
      }
      
      if (codeParam) {
        claimCode = codeParam;
        console.log('📋 Extracted from URI:', { claimCode, tokens: tokensFromURI, product: productFromURI });
      } else {
        // If we can't extract a code from a valid URL, treat the whole thing as invalid
        throw new Error('No claim code found in URL');
      }
    } catch (urlError) {
      // Not a valid URL - treat as direct claim code
      console.log('📋 Not a URL, using as direct claim code:', qrData);
      
      // If it looks like it could be a malformed URL, show error
      if (qrData.includes('://') || qrData.includes('http')) {
        console.error('❌ Invalid URL format:', urlError);
        setProcessing(false);
        toast({
          title: "Invalid QR Code",
          description: "This QR code format is not supported.",
          variant: "destructive",
        });
        
        setTimeout(() => {
          setQrDetected(null);
          setScanning(true);
          if (qrScannerRef.current) {
            qrScannerRef.current.start();
          }
        }, 2000);
        return;
      }
      // Otherwise use as direct claim code
    }
    
    // STEP 1: VERIFY QR CODE - Preview the claim before confirming
    try {
      console.log('🔍 Verifying QR code:', claimCode);
      
      // Call the verify API to get claim details
      const verifyResponse = await apiRequest('GET', `/api/qr/verify/${claimCode}`);
      const verifyData = await verifyResponse.json();
      
      console.log('✅ Verification result:', verifyData);
      
      // Check if QR code is valid and active
      if (!verifyData.isActive || verifyData.claimed) {
        throw new Error('This QR code has already been claimed or is no longer active');
      }
      
      // Use verified backend data first, fallback to URI params only if backend lacks them
      const finalTokens = verifyData.tokens || tokensFromURI || 0;
      const finalProduct = verifyData.product || productFromURI || 'USV Token';
      
      console.log('💰 Verified claim details:', { tokens: finalTokens, product: finalProduct, code: claimCode });
      
      // STEP 2: AUTOMATIC CLAIM - Claim tokens directly in the app!
      console.log('💰 Proceeding with automatic claim...');
      
      const claimResponse = await apiRequest('POST', '/api/qr/claim', {
        code: claimCode,
      });
      
      const claimResult = await claimResponse.json();
      console.log('✅ Claim successful:', claimResult);
      
      // Set claim result for success animation (use actual claimed amount from backend)
      const actualTokens = claimResult.reward || finalTokens || 0;
      
      setClaimResult({
        tokens: actualTokens,
        product: finalProduct,
        code: claimCode,
      });
      
      // Show success toast
      toast({
        title: "🎉 Tokens Claimed!",
        description: `You received ${actualTokens} USV tokens!`,
      });
      
      // Send push notification if enabled
      if (user?.pushNotifications && NotificationService.hasPermission()) {
        await NotificationService.showTransactionNotification('received', actualTokens, 'USV');
      }
      
      // IMPORTANT: Invalidate user query to refresh balance in UI
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
      // Stop processing after 3 seconds and reset
      setTimeout(() => {
        setProcessing(false);
        setQrDetected(null);
        setClaimResult(null);
        setScanning(true);
        if (qrScannerRef.current) {
          qrScannerRef.current.start();
        }
      }, 3000);
      
    } catch (error: any) {
      console.error('❌ Claim failed:', error);
      setProcessing(false);
      
      toast({
        title: "Claim Failed",
        description: error.message || "This QR code may have already been claimed or is invalid.",
        variant: "destructive",
      });
      
      // Resume scanning after error
      setTimeout(() => {
        setQrDetected(null);
        setScanning(true);
        if (qrScannerRef.current) {
          qrScannerRef.current.start();
        }
      }, 2000);
    }
  };

  useEffect(() => {
    console.log('🔥 QRScan useEffect running - checking environment');
    
    // Check if we're in an iframe (Replit preview) or insecure context
    const isIframe = window.top !== window.self;
    const isSecure = window.isSecureContext;
    
    console.log('🌍 Environment check:', { isIframe, isSecure });
    
    if (isIframe) {
      console.log('📱 Running in iframe - camera permissions blocked');
      setHasPermission(false);
    } else if (!isSecure) {
      console.log('🔒 Insecure context - camera requires HTTPS');
      setHasPermission(false);
    }
    
    return () => {
      // Cleanup QR scanner when component unmounts
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      console.log('🎯 Starting camera with user gesture...');
      
      // Set permission to true first so video element renders
      setHasPermission(true);
      
      // Wait a brief moment for video element to render
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (!videoRef.current) {
        throw new Error('Video element not available');
      }
      
      console.log('🎥 Video element ready, creating QR scanner...');
      
      // Create QR scanner with the video element
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('🎯 QR Code detected:', result.data);
          handleQRDetected(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
          maxScansPerSecond: 5
        }
      );
      
      // Start QR scanner
      console.log('🎯 Starting QR scanner...');
      await qrScannerRef.current.start();
      console.log('🎯 QR Scanner started successfully!');
      
      setScanning(true);
      
    } catch (error) {
      console.error('🎯 QR Scanner failed:', error);
      setHasPermission(false);
      toast({
        title: "Camera Access Required",
        description: "Please allow camera access to scan QR codes and earn USV tokens.",
        variant: "destructive",
      });
    }
  };

  const requestCameraPermission = async () => {
    try {
      console.log('🎥 Requesting camera access...');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' }, // Use back camera for scanning
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: false
      });
      
      console.log('🎥 Camera access granted, stream:', stream);
      streamRef.current = stream;
      
      // Set permission first to render the video element
      setHasPermission(true);
      
      // Wait for video element to be rendered, then set up stream
      const setupVideoStream = () => {
        if (videoRef.current) {
          console.log('🎥 Video element found, setting up stream...');
          
          // Clean camera setup with detailed logging
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.autoplay = true;
          
          console.log('🎥 Assigning stream to video element...');
          videoRef.current.srcObject = stream;
          
          // Single event handler for when video is ready
          videoRef.current.onloadedmetadata = async () => {
            console.log('🎥 Video metadata loaded! Dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
            if (videoRef.current && videoRef.current.videoWidth > 0) {
              console.log('🎥 Starting QR scanner...');
              setScanning(true);
              
              // Let QR scanner handle its own camera setup
              try {
                qrScannerRef.current = new QrScanner(
                  videoRef.current,
                  (result) => {
                    console.log('🎯 QR Code detected:', result.data);
                    handleQRDetected(result.data);
                  },
                  {
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    preferredCamera: 'environment',
                    maxScansPerSecond: 5
                  }
                );
                
                // Start the QR scanner 
                await qrScannerRef.current.start();
                console.log('🎯 QR Scanner started successfully!');
              } catch (qrError) {
                console.error('🎯 QR Scanner failed:', qrError);
                toast({
                  title: "QR Scanner Error",
                  description: "Failed to start QR scanner. Please try again.",
                  variant: "destructive",
                });
              }
            } else {
              console.error('🎥 Video dimensions are 0 - video not ready');
            }
          };

          videoRef.current.onerror = (error) => {
            console.error('🎥 Video element error:', error);
          };

          // Try to play the video
          console.log('🎥 Attempting to play video...');
          videoRef.current.play().then(() => {
            console.log('🎥 Video playing successfully!');
          }).catch((playError) => {
            console.error('🎥 Video play failed:', playError);
          });
        } else {
          console.log('🎥 Video element not ready yet, retrying in 100ms...');
          setTimeout(setupVideoStream, 100);
        }
      };
      
      // Start trying to set up video stream
      setTimeout(setupVideoStream, 100);
      
    } catch (error) {
      console.error('🎥 Camera access error:', error);
      setHasPermission(false);
      toast({
        title: "Camera Access Issue",
        description: `Camera access failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check browser permissions.`,
        variant: "destructive",
      });
    }
  };

  const toggleFlash = async () => {
    if (qrScannerRef.current) {
      try {
        if (flashOn) {
          await qrScannerRef.current.turnFlashOff();
          setFlashOn(false);
          console.log('🔦 Flash turned OFF');
        } else {
          await qrScannerRef.current.turnFlashOn();
          setFlashOn(true);
          console.log('🔦 Flash turned ON');
        }
      } catch (error) {
        console.error('🔦 Flash toggle failed:', error);
        toast({
          title: "Flash not available",
          description: "Your device doesn't support camera flash",
          variant: "destructive",
        });
      }
    }
  };

  if (hasPermission === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-sm mx-auto px-6">
          <QrCode className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">Ready to Scan QR Codes</h2>
          <p className="text-gray-300 mb-6">Tap the button below to start your camera and begin scanning for USV tokens!</p>
          
          <motion.button
            onClick={startCamera}
            data-testid="button-start-camera"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 8px 25px rgba(59, 130, 246, 0.4), 0 4px 15px rgba(147, 51, 234, 0.4)"
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Camera className="inline h-5 w-5 mr-2" />
            Start Camera
          </motion.button>
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
            To scan QR codes and earn USV tokens, please allow camera access in your browser settings.
          </p>
          <motion.div
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 8px 25px rgba(236, 72, 153, 0.4), 0 4px 15px rgba(147, 51, 234, 0.4)"
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              onClick={requestCameraPermission}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-2xl px-8 py-4 font-semibold"
            >
              Try Again
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 pt-12">
        <motion.div
          whileHover={{ 
            scale: 1.1,
            rotate: -5,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            boxShadow: "0 8px 25px rgba(255, 255, 255, 0.2)"
          }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="text-white bg-black/50 backdrop-blur-sm rounded-full p-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </motion.div>
        <h1 className="text-white text-lg font-semibold">Scan QR Code</h1>
        <motion.div
          whileHover={{ 
            scale: 1.1,
            backgroundColor: flashOn ? "rgba(255, 255, 0, 0.3)" : "rgba(0, 0, 0, 0.7)",
            boxShadow: flashOn 
              ? "0 8px 25px rgba(255, 255, 0, 0.4)"
              : "0 8px 25px rgba(255, 255, 255, 0.2)"
          }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFlash}
            className={`text-white bg-black/50 backdrop-blur-sm rounded-full p-3 ${flashOn ? 'bg-yellow-500/30' : ''}`}
          >
            {flashOn ? <FlashlightOff className="w-5 h-5" /> : <Flashlight className="w-5 h-5" />}
          </Button>
        </motion.div>
      </div>

      {/* Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          objectPosition: 'center center',
          transform: 'scaleX(-1)',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
        data-testid="camera-video"
      />


      {/* Scanning Overlay */}
      {scanning && !qrDetected && (
        <div className="absolute inset-0 flex items-center justify-center z-10" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="relative flex flex-col items-center justify-center">
            {/* Scanner Frame */}
            <div className="w-64 h-64 border-4 border-pink-500 rounded-2xl bg-transparent relative mx-auto">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-pink-500 rounded-tl-2xl"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-pink-500 rounded-tr-2xl"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-pink-500 rounded-bl-2xl"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-pink-500 rounded-br-2xl"></div>
              
              {/* Scan Line Animation */}
              <motion.div
                className="absolute inset-x-0 h-1 bg-pink-500 rounded"
                animate={{ y: [0, 248] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
            
            {/* Instructions */}
            <p className="text-white text-center mt-6 text-lg max-w-xs mx-auto">
              Point camera at QR code to earn USV tokens
            </p>
          </div>
        </div>
      )}

      {/* QR Detected Success - AUTOMATIC CLAIM ANIMATION! */}
      {qrDetected && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center z-20 bg-black/90 backdrop-blur-md"
        >
          <div className="text-center text-white max-w-sm mx-auto px-6">
            {processing ? (
              // Processing animation
              <div className="flex flex-col items-center justify-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 rounded-full border-4 border-pink-500 border-t-transparent flex items-center justify-center"
                >
                  <Coins className="w-12 h-12 text-pink-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-pink-500">Claiming Tokens...</h2>
                <p className="text-gray-400">Processing your reward</p>
              </div>
            ) : claimResult ? (
              // Success animation
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                {/* Success icon with burst effect */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="relative w-32 h-32 mx-auto mb-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-20 h-20 text-white" />
                  </div>
                  {/* Coin particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                      animate={{ 
                        scale: [0, 1, 0],
                        x: Math.cos(i * 45 * Math.PI / 180) * 80,
                        y: Math.sin(i * 45 * Math.PI / 180) * 80,
                        opacity: [1, 1, 0]
                      }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full"
                    />
                  ))}
                </motion.div>
                
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
                >
                  🎉 SUCCESS!
                </motion.h2>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-2xl p-6 border border-pink-500/30">
                    <p className="text-gray-300 text-sm mb-2">You received</p>
                    <p className="text-5xl font-bold text-green-400">+{claimResult.tokens}</p>
                    <p className="text-2xl font-semibold text-white mt-1">USV Tokens</p>
                    {claimResult.product && claimResult.product !== 'USV Token' && (
                      <p className="text-sm text-gray-400 mt-3">From: {claimResult.product}</p>
                    )}
                  </div>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-sm text-gray-400 mt-4"
                  >
                    Tokens added to your wallet!
                  </motion.p>
                </motion.div>
              </motion.div>
            ) : (
              // QR detected but not claimed yet
              <div>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold">QR Code Detected!</h2>
                <p className="text-gray-400 mt-2">Processing...</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Gradient Overlays for Better UI */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent z-10"></div>
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
    </div>
  );
}