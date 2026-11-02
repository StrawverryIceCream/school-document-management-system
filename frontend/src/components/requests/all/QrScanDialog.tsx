import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CameraOff, QrCode, Search, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function parseScannedReference(input: string): string {
  const trimmed = input.trim();
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const url = new URL(trimmed);
      const ref = url.searchParams.get("ref");
      if (ref) return ref.trim();
      const id = url.searchParams.get("id");
      if (id) return id.trim();
    }
  } catch {
    // not a valid URL
  }

  const match = trimmed.match(/REQ-\d{4}-\d+/i);
  if (match) return match[0].toUpperCase();

  return trimmed;
}

interface QrScanDialogProps {
  trigger?: React.ReactNode;
}

export function QrScanDialog({ trigger }: QrScanDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera access is not supported on this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError(
        err instanceof Error
          ? err.message
          : "Unable to access camera. Please enter reference manually.",
      );
      setCameraActive(false);
    }
  };

  useEffect(() => {
    let animId: number;

    // Barcode detection loop if supported
    if (cameraActive && videoRef.current && "BarcodeDetector" in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detector = new (window as any).BarcodeDetector({
          formats: ["qr_code", "code_128", "code_39"],
        });

        const scanFrame = async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const rawVal = barcodes[0].rawValue;
                if (rawVal) {
                  const resolved = parseScannedReference(rawVal);
                  stopCamera();
                  setOpen(false);
                  navigate(`/requests/claim?ref=${encodeURIComponent(resolved)}`);
                  return;
                }
              }
            } catch {
              // frame detection error, ignore and continue
            }
          }
          animId = requestAnimationFrame(scanFrame);
        };

        animId = requestAnimationFrame(scanFrame);
      } catch {
        // BarcodeDetector initialization error
      }
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [cameraActive, navigate]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      stopCamera();
      setInputVal("");
      setCameraError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const resolved = parseScannedReference(inputVal);
    stopCamera();
    setInputVal("");
    setCameraError(null);
    setOpen(false);
    navigate(`/requests/claim?ref=${encodeURIComponent(resolved)}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <QrCode className="size-4" />
            Scan QR Slip
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-5 text-primary" />
            Scan Claim Slip
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Scan via camera, USB barcode reader, or type the reference number.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Camera toggle & preview */}
          {cameraActive ? (
            <div className="relative overflow-hidden rounded-xl border bg-black aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-dashed border-primary/60 m-8 rounded-lg pointer-events-none animate-pulse" />
              <Button
                size="sm"
                variant="secondary"
                onClick={stopCamera}
                className="absolute bottom-2 right-2 gap-1.5 opacity-90 text-xs"
              >
                <CameraOff className="size-3.5" /> Stop Camera
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center space-y-2 bg-muted/20">
              <QrCode className="size-10 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground">
                Point a USB barcode reader or turn on the camera to scan.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startCamera}
                className="gap-1.5"
              >
                <Camera className="size-3.5" /> Start Camera Scanner
              </Button>
            </div>
          )}

          {cameraError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Manual / USB Scanner Input */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Paste URL or enter REQ reference..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                autoFocus
                className="text-sm"
              />
              <Button type="submit" size="sm" className="gap-1.5">
                <Search className="size-4" /> Verify
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default QrScanDialog;
