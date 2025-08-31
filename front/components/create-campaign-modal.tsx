"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Trophy,
  Plus,
  X,
  DollarSign,
  Wallet,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWallet } from "@/components/wallet-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useHike2Earn } from "@/hooks/useHike2Earn";

// Mountain data - this could be imported from a shared location
const mendozaPeaks = [
  {
    id: 1,
    name: "Aconcagua",
    altitude: "6,962m",
    difficulty: "expert",
    reward: "2500 HIKE",
  },
  {
    id: 2,
    name: "Cerro Mercedario",
    altitude: "6,770m",
    difficulty: "expert",
    reward: "2200 HIKE",
  },
  {
    id: 3,
    name: "Cerro Tupungato",
    altitude: "6,570m",
    difficulty: "advanced",
    reward: "1800 HIKE",
  },
  {
    id: 4,
    name: "Cerro Plata",
    altitude: "6,100m",
    difficulty: "advanced",
    reward: "1500 HIKE",
  },
  {
    id: 5,
    name: "Cerro El Plomo",
    altitude: "5,424m",
    difficulty: "intermediate",
    reward: "800 HIKE",
  },
  {
    id: 6,
    name: "Cerro Vallecitos",
    altitude: "5,462m",
    difficulty: "intermediate",
    reward: "900 HIKE",
  },
];

interface CampaignFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  prizePoolLSK: string;
  selectedMountains: number[];
}

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCampaign: (
    campaignData: any
  ) => Promise<{ success: boolean; campaignId?: string; error?: string }>;
}

export function CreateCampaignModal({
  isOpen,
  onClose,
  onCreateCampaign,
}: CreateCampaignModalProps) {
  const { isConnected, address, connectWallet } = useWallet();
  const {
    createCampaign,
    isLoading: contractLoading,
    error: contractError,
    contractHealthy,
    setError: setContractError,
    isContractOwner,
    requestCampaignCreation,
  } = useHike2Earn();

  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    prizePoolLSK: "",
    selectedMountains: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [creationStep, setCreationStep] = useState<
    "form" | "validating" | "creating" | "success" | "error"
  >("form");

  const handleInputChange = (field: keyof CampaignFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleMountain = (mountainId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedMountains: prev.selectedMountains.includes(mountainId)
        ? prev.selectedMountains.filter((id) => id !== mountainId)
        : [...prev.selectedMountains, mountainId],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Campaign name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (formData.selectedMountains.length === 0)
      newErrors.mountains = "Select at least one mountain";

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    if (!formData.prizePoolLSK || parseFloat(formData.prizePoolLSK) <= 0) {
      newErrors.prizes = "LSK prize pool must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("🚀 Starting campaign creation process...");

    // Clear previous errors
    setErrors({});
    setContractError(null);
    setCreationStep("validating");

    // Check wallet connection
    if (!isConnected) {
      setErrors({ wallet: "Please connect your wallet first" });
      setCreationStep("error");
      return;
    }

    // Check contract health
    if (!contractHealthy) {
      setErrors({
        contract:
          "Smart contract is not available. Please check your wallet connection and network.",
      });
      setCreationStep("error");
      return;
    }

    // Validate form
    if (!validateForm()) {
      setCreationStep("form");
      return;
    }

    try {
      setIsLoading(true);
      setCreationStep("creating");
      setTxHash("");

      console.log("📝 Creating campaign with data:", formData);

      // Convert dates to Unix timestamps
      const startTimestamp = Math.floor(
        new Date(formData.startDate).getTime() / 1000
      );
      const endTimestamp = Math.floor(
        new Date(formData.endDate).getTime() / 1000
      );

      console.log("🕒 Timestamps:", { startTimestamp, endTimestamp });

      // Create campaign request using the new partnership system
      const result = await requestCampaignCreation({
        name: formData.name,
        startDate: startTimestamp,
        endDate: endTimestamp,
        description: formData.description,
        mountainIds: formData.selectedMountains,
        prizePoolLSK: formData.prizePoolLSK
          ? parseFloat(formData.prizePoolLSK)
          : 0,
      });

      if (result.success) {
        console.log(
          "✅ Campaign request submitted successfully:",
          result.campaignId
        );
        setTxHash(result.campaignId || "request_submitted");
        setCreationStep("success");

        // Also call the parent callback for UI updates
        try {
          const campaignData = {
            name: formData.name,
            description: formData.description,
            startDate: startTimestamp,
            endDate: endTimestamp,
            prizePoolLSK: formData.prizePoolLSK
              ? parseFloat(formData.prizePoolLSK)
              : 0,
            mountainIds: formData.selectedMountains,
          };
          await onCreateCampaign(campaignData);
        } catch (callbackError) {
          console.warn(
            "⚠️ Parent callback failed, but campaign request was submitted successfully"
          );
        }

        // Reset form and close modal after showing success
        setTimeout(() => {
          resetForm();
          onClose();
        }, 5000); // Longer delay for partnership message
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("❌ Campaign creation failed:", error);

      let errorMessage = error.message || "Failed to create campaign";

      // Handle specific error cases
      if (error.message?.includes("Transaction was rejected")) {
        errorMessage =
          "You rejected the transaction. Please try again and confirm in your wallet.";
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage =
          "You don't have enough funds to create this campaign. Please add more LSK to your wallet.";
      } else if (error.message?.includes("caller is not the owner")) {
        errorMessage =
          "Campaign creation is currently managed by our partnership team. Please contact us at partnerships@hike2earn.com to create your mountain climbing campaign. We'll help you set up and launch your campaign!";
      } else if (error.message?.includes("execution reverted")) {
        errorMessage =
          "Campaign creation was rejected by the smart contract. Please check your inputs and try again.";
      } else if (error.message?.includes("Contract not available")) {
        errorMessage =
          "Smart contract is not available. Please check your wallet connection and network.";
      }

      setErrors({ submit: errorMessage });
      setCreationStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      prizePoolLSK: "",
      selectedMountains: [],
    });
    setTxHash("");
    setErrors({});
    setCreationStep("form");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-100 text-xl">
            Create New Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Wallet Status */}
          {!isConnected ? (
            <Alert className="bg-yellow-500/20 border-yellow-500/30">
              <Wallet className="h-4 w-4" />
              <AlertDescription className="text-yellow-200">
                Connect your wallet to create campaigns.{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-yellow-200 underline"
                  onClick={connectWallet}
                >
                  Connect Wallet
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-500/20 border-green-500/30">
              <Wallet className="h-4 w-4" />
              <AlertDescription className="text-green-200">
                Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </AlertDescription>
            </Alert>
          )}

          {/* Contract Status */}
          {contractError && (
            <Alert className="bg-red-500/20 border-red-500/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-200">
                Contract Error: {contractError}
              </AlertDescription>
            </Alert>
          )}

          {!contractHealthy && isConnected && (
            <Alert className="bg-yellow-500/20 border-yellow-500/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-yellow-200">
                Smart contract is not available. Please check your network
                connection.
              </AlertDescription>
            </Alert>
          )}

          {/* Creation Progress */}
          {creationStep === "validating" && (
            <Alert className="bg-blue-500/20 border-blue-500/30">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription className="text-blue-200">
                Validating campaign data...
              </AlertDescription>
            </Alert>
          )}

          {creationStep === "creating" && (
            <Alert className="bg-blue-500/20 border-blue-500/30">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription className="text-blue-200">
                Creating campaign on blockchain... Please confirm the
                transaction in your wallet.
              </AlertDescription>
            </Alert>
          )}

          {creationStep === "success" && txHash && (
            <Alert className="bg-green-500/20 border-green-500/30">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-200">
                🎉 Campaign request submitted successfully!
                <br />
                Request ID:{" "}
                <code className="text-xs">{txHash.slice(0, 20)}...</code>
                <br />
                Our partnership team will review and create your campaign within
                24 hours.
                <br />
                This modal will close automatically in a few seconds.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Messages */}
          {(errors.wallet || errors.submit || errors.contract) &&
            creationStep === "error" && (
              <Alert className="bg-red-500/20 border-red-500/30">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  {errors.wallet || errors.submit || errors.contract}
                </AlertDescription>
              </Alert>
            )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-200">
                Campaign Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter campaign name..."
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-200">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your campaign goals, requirements, and details..."
                className="min-h-[100px] bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 resize-none"
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="startDate"
                className="text-white flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
              />
              {errors.startDate && (
                <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="endDate"
                className="text-white flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                End Date
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
              />
              {errors.endDate && (
                <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Mountain Selection */}
          <div>
            <Label className="text-white flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Select Mountains
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {mendozaPeaks.map((peak) => (
                <div
                  key={peak.id}
                  onClick={() => toggleMountain(peak.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.selectedMountains.includes(peak.id)
                      ? "bg-emerald-500/20 border-emerald-500/50"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="text-white font-medium text-sm">
                    {peak.name}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {peak.altitude} • {peak.difficulty}
                  </div>
                </div>
              ))}
            </div>
            {errors.mountains && (
              <p className="text-red-400 text-sm mt-1">{errors.mountains}</p>
            )}
          </div>

          {/* Prize Pool */}
          <div className="space-y-4">
            <Label className="text-white flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Prize Pool
            </Label>

            {/* LSK Prize */}
            <div>
              <Label htmlFor="lskPrize" className="text-slate-200 text-sm">
                LSK Prize Pool
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="lskPrize"
                  type="number"
                  step="0.001"
                  value={formData.prizePoolLSK}
                  onChange={(e) =>
                    handleInputChange("prizePoolLSK", e.target.value)
                  }
                  placeholder="Enter amount in LSK"
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {errors.prizes && (
              <p className="text-red-400 text-sm mt-1">{errors.prizes}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-slate-800 border-slate-600 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                !isConnected ||
                !contractHealthy ||
                creationStep === "success"
              }
              className="bg-gradient-to-r from-emerald-500 to-orange-500 hover:from-emerald-600 hover:to-orange-600 disabled:opacity-50"
            >
              {creationStep === "validating" && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {creationStep === "creating" && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {creationStep === "success" && (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}

              {creationStep === "validating"
                ? "Validating..."
                : creationStep === "creating"
                ? "Creating on Blockchain..."
                : creationStep === "success"
                ? "Campaign Created!"
                : !isConnected
                ? "Connect Wallet First"
                : !contractHealthy
                ? "Contract Unavailable"
                : "Create Campaign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
