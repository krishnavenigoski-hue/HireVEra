import { Camera, Check, RefreshCw, Video, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string, filename: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setCameraError(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setIsLoading(true);
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // preferred for scanning printed papers
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        'Unable to access camera or webcam. Please ensure camera permissions are allowed in your browser, or upload an image file instead.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const acceptPhoto = () => {
    if (!capturedImage) return;
    const filename = `Camera_Scan_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
    onCapture(capturedImage, filename);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#293149] bg-[#171D33] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#293149]">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/20 text-[#8B5CF6]">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">Camera Resume Scanner</h3>
              <p className="text-xs text-[#A7B0C0]">Align printed resume inside the viewfinder frame for OCR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#A7B0C0] hover:bg-[#1E2540] hover:text-[#F8FAFC] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="my-6 relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-[#0B1020] border border-[#293149] aspect-video">
          {cameraError ? (
            <div className="p-6 text-center max-w-md">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-[#F87171]">
                <Video className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-[#F87171] mb-2">Camera Unavailable</p>
              <p className="text-xs text-[#A7B0C0] leading-relaxed mb-4">{cameraError}</p>
              <button
                onClick={startCamera}
                className="inline-flex items-center space-x-2 rounded-lg bg-[#293149] px-4 py-2 text-xs font-semibold text-[#F8FAFC] hover:bg-[#3B4568] transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Permission</span>
              </button>
            </div>
          ) : capturedImage ? (
            <div className="relative h-full w-full">
              <img
                src={capturedImage}
                alt="Captured Resume Snapshot"
                className="h-full w-full object-contain"
              />
              <div className="absolute top-3 left-3 rounded-md bg-[#22C55E]/90 px-2.5 py-1 text-xs font-semibold text-white shadow">
                Snapshot Frozen
              </div>
            </div>
          ) : (
            <div className="relative h-full w-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              {/* Document Alignment Overlay Box */}
              <div className="pointer-events-none absolute inset-6 rounded-lg border-2 border-dashed border-[#8B5CF6]/70 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <div className="absolute top-2 left-2 text-[10px] uppercase font-mono tracking-wider bg-[#0B1020]/80 text-[#8B5CF6] px-2 py-0.5 rounded">
                  Document Viewfinder
                </div>
              </div>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0B1020]/70">
                  <div className="flex items-center space-x-2 text-sm text-[#8B5CF6]">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Initializing camera...</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-[#A7B0C0]">
            Captured document will be processed via Tesseract OCR engine.
          </p>
          <div className="flex items-center space-x-3">
            {capturedImage ? (
              <>
                <button
                  onClick={retake}
                  className="flex items-center space-x-2 rounded-xl border border-[#293149] bg-[#1E2540] px-4 py-2.5 text-xs font-semibold text-[#F8FAFC] hover:bg-[#293149] transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retake Photo</span>
                </button>
                <button
                  onClick={acceptPhoto}
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#8B5CF6]/20 hover:brightness-110 transition-all"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Use Photo for Screening</span>
                </button>
              </>
            ) : (
              <button
                disabled={!stream || !!cameraError}
                onClick={takeSnapshot}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#8B5CF6]/25 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Camera className="h-4 w-4" />
                <span>Capture Snapshot</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
