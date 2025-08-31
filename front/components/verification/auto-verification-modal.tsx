"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAutoMint } from "@/hooks/useAutoMint";
import {
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  Trophy,
  Mountain,
  MapPin,
  Clock,
  X,
  Loader2,
  Sparkles
} from "lucide-react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'campaign' | 'summit';
  
  // For campaigns
  reservationId?: string;
  campaignTitle?: string;
  
  // For summits
  mountainId?: number;
  mountainName?: string;
}

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

export function AutoVerificationModal({
  isOpen,
  onClose,
  type,
  reservationId,
  campaignTitle,
  mountainId,
  mountainName
}: VerificationModalProps) {
  const {
    processCampaignVerification,
    processSummitVerification,
    isProcessing,
    verificationProgress,
    currentStep
  } = useAutoMint();

  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    tokenId?: string;
    error?: string;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: UploadedPhoto = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview: e.target?.result as string
          };
          
          setUploadedPhotos(prev => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Clear input for re-upload
    if (event.target) {
      event.target.value = '';
    }
  };

  const removePhoto = (id: string) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const handleVerification = async () => {
    if (uploadedPhotos.length === 0) return;

    const photos = uploadedPhotos.map(p => p.file);
    const verificationData = {
      photos,
      description,
      gpsCoords: { lat: 0, lng: 0 } // Mock GPS for demo
    };

    try {
      let result;
      
      if (type === 'campaign' && reservationId) {
        result = await processCampaignVerification(reservationId, verificationData);
      } else if (type === 'summit' && mountainId !== undefined && mountainName) {
        result = await processSummitVerification(mountainId, mountainName, verificationData);
      } else {
        throw new Error("Invalid verification parameters");
      }

      setResult(result);

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
          resetModal();
        }, 3000);
      }

    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Verification failed"
      });
    }
  };

  const resetModal = () => {
    setUploadedPhotos([]);
    setDescription("");
    setResult(null);
    setShowSuccess(false);
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      resetModal();
    }
  };

  if (showSuccess && result?.success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md mx-auto">
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="relative mx-auto w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/30"></div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-2">¡Felicidades! 🎉</h3>
            <p className="text-muted-foreground mb-4">
              Tu verificación fue aprobada automáticamente
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">NFT Minteado Exitosamente</span>
              </div>
              
              {result.tokenId && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Token ID:</p>
                  <p className="text-sm font-mono text-primary">{result.tokenId}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-secondary" />
                <span className="text-secondary font-medium">Recompensas Enviadas</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Cerrando automáticamente...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {type === 'campaign' ? 'Verificar Participación' : 'Verificar Cumbre'}
          </DialogTitle>
          <DialogDescription>
            {type === 'campaign' 
              ? 'Sube fotos y descripción para verificar tu participación en la campaña y recibir tu NFT de recompensa.'
              : 'Sube fotos de la cumbre alcanzada para verificar tu logro y recibir tu NFT conmemorativo.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign/Summit Info */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {type === 'campaign' ? (
                <Trophy className="w-4 h-4 text-primary" />
              ) : (
                <Mountain className="w-4 h-4 text-primary" />
              )}
              <h4 className="font-semibold text-primary">
                {type === 'campaign' ? campaignTitle : mountainName}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {type === 'campaign' 
                ? 'Sube fotos que demuestren tu participación en el evento'
                : 'Sube fotos que demuestren que alcanzaste la cumbre'
              }
            </p>
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Fotos de Verificación</h5>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Fotos
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Photo Preview Grid */}
            {uploadedPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.preview}
                      alt="Verification photo"
                      className="w-full h-32 object-cover rounded-lg border border-white/20"
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isProcessing}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted/30 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  No hay fotos seleccionadas
                </p>
                <p className="text-sm text-muted-foreground">
                  Haz clic en "Subir Fotos" para agregar evidencia
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Descripción (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu experiencia..."
              className="w-full p-3 bg-background border border-white/20 rounded-lg resize-none"
              rows={3}
              disabled={isProcessing}
            />
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">Procesando Verificación</span>
              </div>
              
              <Progress value={verificationProgress} className="w-full" />
              
              {currentStep && (
                <p className="text-sm text-muted-foreground text-center">
                  {currentStep}
                </p>
              )}
            </div>
          )}

          {/* Error Display */}
          {result?.success === false && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error en la Verificación</span>
              </div>
              <p className="text-sm text-red-300 mt-1">
                {result.error || "Error desconocido"}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleVerification}
              disabled={uploadedPhotos.length === 0 || isProcessing}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verificar y Mintear NFT
                </>
              )}
            </Button>
          </div>

          {/* Info Message */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-400 font-medium mb-1">Verificación Automática</p>
                <p className="text-blue-300">
                  Tu verificación será procesada automáticamente y el NFT se minteará 
                  inmediatamente después de la aprobación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}