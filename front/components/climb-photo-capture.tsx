"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Camera,
  Upload,
  X,
  CheckCircle,
  Mountain,
  MapPin,
  Timer,
  TrendingUp,
  Trash2
} from "lucide-react";

interface ClimbPhotoCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotosConfirmed: (photos: File[]) => void;
  climbData: {
    altitude: number;
    distance: number;
    duration: number;
    currentLocation: { lat: number; lng: number };
  };
}

interface CapturedPhoto {
  id: string;
  file: File;
  preview: string;
}

export function ClimbPhotoCapture({
  isOpen,
  onClose,
  onPhotosConfirmed,
  climbData
}: ClimbPhotoCaptureProps) {
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: CapturedPhoto = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview: e.target?.result as string
          };
          
          setCapturedPhotos(prev => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Clear input for re-upload
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleCameraCapture = () => {
    setIsCapturing(true);
    cameraInputRef.current?.click();
  };

  const handleCameraSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCapturing(false);
    handleFileSelect(event);
  };

  const removePhoto = (id: string) => {
    setCapturedPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const handleConfirm = () => {
    if (capturedPhotos.length === 0) return;
    
    const photos = capturedPhotos.map(p => p.file);
    onPhotosConfirmed(photos);
  };

  const handleClose = () => {
    setCapturedPhotos([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Capturar Evidencia de Cumbre
          </DialogTitle>
          <DialogDescription>
            Toma fotos que demuestren que alcanzaste la cumbre de esta montaña. 
            Las fotos se usarán para verificar tu logro y mintear tu NFT.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Climb Summary */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Mountain className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-primary">Resumen del Recorrido</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mountain className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Altitud:</span>
                <span className="font-semibold">{climbData.altitude.toFixed(0)}m</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Distancia:</span>
                <span className="font-semibold">{(climbData.distance / 1000).toFixed(1)}km</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Tiempo:</span>
                <span className="font-semibold">{formatDuration(climbData.duration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">GPS:</span>
                <span className="font-semibold text-xs">
                  {climbData.currentLocation.lat.toFixed(4)}, {climbData.currentLocation.lng.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Photo Capture Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Fotos de Evidencia</h5>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCameraCapture}
                  disabled={isCapturing}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {isCapturing ? "Abriendo cámara..." : "Tomar Foto"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Foto
                </Button>
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraSelect}
              className="hidden"
            />

            {/* Photo Preview Grid */}
            {capturedPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {capturedPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.preview}
                      alt="Summit evidence"
                      className="w-full h-32 object-cover rounded-lg border border-white/20"
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2">
                      <span className="text-xs bg-black/50 text-white px-1 py-0.5 rounded">
                        {photo.file.size < 1024 * 1024 
                          ? `${(photo.file.size / 1024).toFixed(0)}KB` 
                          : `${(photo.file.size / (1024 * 1024)).toFixed(1)}MB`
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted/30 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  No hay fotos capturadas
                </p>
                <p className="text-sm text-muted-foreground">
                  Toma fotos de la cumbre, vista panorámica, o algún hito reconocible
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-400 font-medium mb-1">Consejos para mejores fotos:</p>
                <ul className="text-blue-300 space-y-1">
                  <li>• Incluye elementos reconocibles del paisaje</li>
                  <li>• Asegúrate de que la foto muestre claramente la altitud</li>
                  <li>• Toma varias fotos desde diferentes ángulos</li>
                  <li>• Incluye cualquier señalización o marca de cumbre</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={capturedPhotos.length === 0}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar Fotos ({capturedPhotos.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}