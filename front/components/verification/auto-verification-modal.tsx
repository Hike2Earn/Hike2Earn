"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Sparkles,
} from "lucide-react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "campaign" | "summit";

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
  mountainName,
}: VerificationModalProps) {
  const {
    processCampaignVerification,
    processSummitVerification,
    isProcessing,
    verificationProgress,
    currentStep,
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

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: UploadedPhoto = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview: e.target?.result as string,
          };

          setUploadedPhotos((prev) => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Clear input for re-upload
    if (event.target) {
      event.target.value = "";
    }
  };

  const removePhoto = (id: string) => {
    setUploadedPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  const handleVerification = async () => {
    if (uploadedPhotos.length === 0) return;

    const photos = uploadedPhotos.map((p) => p.file);
    const verificationData = {
      photos,
      description,
      gpsCoords: { lat: 0, lng: 0 }, // Mock GPS for demo
    };

    try {
      let result;

      if (type === "campaign" && reservationId) {
        result = await processCampaignVerification(
          reservationId,
          verificationData
        );
      } else if (
        type === "summit" &&
        mountainId !== undefined &&
        mountainName
      ) {
        result = await processSummitVerification(
          mountainId,
          mountainName,
          verificationData
        );
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
      // Check if it's a user rejection or other error
      const isUserRejected =
        error.message?.includes("user rejected") ||
        error.message?.includes("User rejected") ||
        error.message?.includes("Transaction cancelled") ||
        error.code === 4001;

      if (isUserRejected) {
        // User cancelled the transaction - show friendly message and close
        setResult({
          success: false,
          error: "Transaction cancelled by user",
        });
        // Close the modal after showing the message briefly
        setTimeout(() => {
          onClose();
          resetModal();
        }, 2000);
      } else {
        // For other errors, show a simplified message
        let friendlyError = "Verification error";
        if (error.message?.includes("insufficient funds")) {
          friendlyError = "Insufficient funds for transaction";
        } else if (error.message?.includes("network")) {
          friendlyError = "Network connection error";
        }

        setResult({
          success: false,
          error: friendlyError,
        });
      }
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

            <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
            <p className="text-muted-foreground mb-4">
              {result.tokenId?.startsWith("verified_")
                ? "Your NFT was created successfully. The transaction was completed correctly."
                : "Your verification was approved automatically"}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">
                  NFT Minted Successfully
                </span>
              </div>

              {result.tokenId && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Token ID:
                  </p>
                  <p className="text-sm font-mono text-primary">
                    {result.tokenId}
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
            <Camera className="w-5 h-5" />
            {type === "campaign" ? "Verify Participation" : "Verify Summit"}
          </DialogTitle>
          <DialogDescription>
            {type === "campaign"
              ? "Upload photos and description to verify your campaign participation and receive your reward NFT."
              : "Upload summit photos to verify your achievement and receive your commemorative NFT."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign/Summit Info */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {type === "campaign" ? (
                <Trophy className="w-4 h-4 text-primary" />
              ) : (
                <Mountain className="w-4 h-4 text-primary" />
              )}
              <h4 className="font-semibold text-primary">
                {type === "campaign" ? campaignTitle : mountainName}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {type === "campaign"
                ? "Upload photos showing your participation in the event"
                : "Upload photos showing you reached the summit"}
            </p>
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Verification Photos</h5>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photos
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
                <p className="text-muted-foreground mb-2">No photos selected</p>
                <p className="text-sm text-muted-foreground">
                  Click "Upload Photos" to add evidence
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your experience..."
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
          {result?.success === false && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Verification Error</span>
              </div>
              <p className="text-sm text-red-300 mt-1">
                {result.error || "Unknown error"}
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
              disabled={uploadedPhotos.length === 0 || isProcessing}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
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
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-400 font-medium mb-1">
                  Automatic Verification
                </p>
                <p className="text-blue-300">
                  Your verification will be processed automatically. Once
                  approved, your NFT will be created successfully and the window
                  will close automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
