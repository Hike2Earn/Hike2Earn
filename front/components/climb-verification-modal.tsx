"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAutoMint } from "@/hooks/useAutoMint";
import { useWallet } from "./wallet-provider";
import {
  Mountain,
  MapPin,
  Timer,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Trophy,
  Sparkles,
  Loader2,
  X,
  Camera,
} from "lucide-react";
import type { ClimbData } from "./climb-tracker";

interface ClimbVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  climbData: ClimbData;
  onVerificationComplete: (success: boolean, tokenId?: string) => void;
}

export function ClimbVerificationModal({
  isOpen,
  onClose,
  climbData,
  onVerificationComplete,
}: ClimbVerificationModalProps) {
  const { address } = useWallet();
  const {
    processSummitVerification,
    isProcessing,
    verificationProgress,
    currentStep,
  } = useAutoMint();

  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    tokenId?: string;
    error?: string;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [description, setDescription] = useState("");

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    if (isOpen && climbData.photos.length > 0) {
      // Auto-generate description based on climb data
      const autoDescription =
        `🏔️ Summit completed!\n\n` +
        `📍 Maximum altitude: ${climbData.altitude.toFixed(0)}m\n` +
        `📏 Total distance: ${(climbData.distance / 1000).toFixed(1)}km\n` +
        `⏱️ Total time: ${formatDuration(climbData.duration)}\n` +
        `⬆️ Elevation gain: ${climbData.elevationGain.toFixed(0)}m\n` +
        `📱 GPS: ${climbData.currentLocation.lat.toFixed(
          6
        )}, ${climbData.currentLocation.lng.toFixed(6)}\n\n` +
        `Route completed successfully. Evidence photos attached.`;

      setDescription(autoDescription);
    }
  }, [isOpen, climbData]);

  const handleVerification = async () => {
    if (climbData.photos.length === 0) {
      console.error("No photos available for verification");
      return;
    }

    try {
      const verificationData = {
        photos: climbData.photos,
        description,
        gpsCoords: climbData.currentLocation,
      };

      const result = await processSummitVerification(
        1, // Mock mountain ID
        "Montaña de Prueba", // Mock mountain name
        verificationData
      );

      setVerificationResult(result);

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onVerificationComplete(true, result.tokenId);
          handleClose();
        }, 3000);
      } else {
        onVerificationComplete(false);
      }
    } catch (error: any) {
      console.error("Verification failed:", error);
      setVerificationResult({
        success: false,
        error: error.message || "Verification failed",
      });
      onVerificationComplete(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setVerificationResult(null);
      setShowSuccess(false);
      setDescription("");
      onClose();
    }
  };

  if (showSuccess && verificationResult?.success) {
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

            <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
            <p className="text-muted-foreground mb-4">
              Your climb has been verified and your NFT has been minted
              successfully
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">
                  NFT Minted Successfully
                </span>
              </div>

              {verificationResult.tokenId && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Token ID:
                  </p>
                  <p className="text-sm font-mono text-primary">
                    {verificationResult.tokenId}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-secondary" />
                <span className="text-secondary font-medium">Rewards Sent</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Closing automatically...
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
            <Mountain className="w-5 h-5" />
            Verify Completed Climb
          </DialogTitle>
          <DialogDescription>
            Review your climb data and proceed with verification to receive your
            achievement NFT.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Climb Summary */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Mountain className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-primary">Climb Summary</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                <Mountain className="w-4 h-4 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">
                  Max Altitude
                </span>
                <span className="font-semibold">
                  {climbData.altitude.toFixed(0)}m
                </span>
              </div>
              <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                <TrendingUp className="w-4 h-4 text-secondary mb-1" />
                <span className="text-xs text-muted-foreground">Distance</span>
                <span className="font-semibold">
                  {(climbData.distance / 1000).toFixed(1)}km
                </span>
              </div>
              <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                <Timer className="w-4 h-4 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Time</span>
                <span className="font-semibold">
                  {formatDuration(climbData.duration)}
                </span>
              </div>
              <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                <MapPin className="w-4 h-4 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Elevation</span>
                <span className="font-semibold">
                  +{climbData.elevationGain.toFixed(0)}m
                </span>
              </div>
            </div>
          </div>

          {/* Photos Preview */}
          <div className="space-y-3">
            <h5 className="font-medium flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Evidence Photos ({climbData.photos.length})
            </h5>
            <div className="grid grid-cols-3 gap-2">
              {climbData.photos.slice(0, 6).map((photo, index) => {
                const url = URL.createObjectURL(photo);
                return (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-20 object-cover rounded border border-white/20"
                    />
                    {index === 5 && climbData.photos.length > 6 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded">
                        <span className="text-white text-xs font-semibold">
                          +{climbData.photos.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Route Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your experience..."
              className="w-full p-3 bg-background border border-white/20 rounded-lg resize-none"
              rows={6}
              disabled={isProcessing}
            />
          </div>

          {/* GPS Coordinates */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">
                Summit Coordinates
              </span>
            </div>
            <p className="text-sm font-mono">
              {climbData.currentLocation.lat.toFixed(6)},{" "}
              {climbData.currentLocation.lng.toFixed(6)}
            </p>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">Processing Verification</span>
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
          {verificationResult?.success === false && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Verification Error</span>
              </div>
              <p className="text-sm text-red-300 mt-1">
                {verificationResult.error || "Unknown error"}
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
              Cancel
            </Button>
            <Button
              onClick={handleVerification}
              disabled={climbData.photos.length === 0 || isProcessing}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify and Mint NFT
                </>
              )}
            </Button>
          </div>

          {/* Info Message */}
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-green-400 font-medium mb-1">
                  Automatic Verification
                </p>
                <p className="text-green-300">
                  Your climb will be automatically verified using GPS data,
                  evidence photos and route metrics. The NFT will be minted
                  immediately after approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
