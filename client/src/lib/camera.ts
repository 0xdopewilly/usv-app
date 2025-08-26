export interface CameraResult {
  success: boolean;
  data?: string;
  error?: string;
}

export class CameraManager {
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;

  async startCamera(videoElement: HTMLVideoElement): Promise<CameraResult> {
    try {
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          success: false,
          error: 'Camera not supported on this device'
        };
      }

      // Request camera permission
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera for QR scanning
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      this.video = videoElement;
      this.video.srcObject = this.stream;
      await this.video.play();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to access camera'
      };
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }
  }

  async captureFrame(): Promise<string | null> {
    if (!this.video) return null;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    canvas.width = this.video.videoWidth;
    canvas.height = this.video.videoHeight;
    context.drawImage(this.video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
  }

  async toggleFlash(): Promise<void> {
    if (!this.stream) return;

    const track = this.stream.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = track.getCapabilities();
      if (capabilities.torch) {
        const settings = track.getSettings();
        await track.applyConstraints({
          advanced: [{ torch: !settings.torch }]
        });
      }
    } catch (error) {
      console.warn('Flash not supported on this device');
    }
  }
}

// QR Code detection using a simple pattern matching
// In production, you'd use a proper QR code library like jsQR
export function detectQRCode(imageData: string): string | null {
  // Simplified QR code detection
  // This would normally use a proper QR code detection library
  
  // For demo purposes, we'll simulate QR code detection
  // by checking if the image contains certain patterns
  
  // In a real app, you'd use libraries like:
  // - jsQR
  // - qr-scanner
  // - ZXing-js
  
  return null; // Placeholder for actual QR detection
}

export const cameraManager = new CameraManager();
