"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  Globe,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  validateNetwork,
  switchToPrimaryNetwork,
  getNetworkDisplayInfo,
  PRIMARY_NETWORK,
} from "@/lib/network-config";
import { useWallet } from "@/components/wallet-provider";
import { cn } from "@/lib/utils";

interface NetworkSwitcherProps {
  className?: string;
  currentChainId?: number;
  onNetworkChanged?: () => void;
}

export function NetworkSwitcher({
  className,
  currentChainId,
  onNetworkChanged,
}: NetworkSwitcherProps) {
  const { isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSwitchAttempt, setLastSwitchAttempt] = useState<number>(0);

  // Get current network information
  const networkValidation = currentChainId
    ? validateNetwork(currentChainId)
    : null;
  const currentNetworkInfo = currentChainId
    ? getNetworkDisplayInfo(currentChainId)
    : null;

  useEffect(() => {
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // If not connected or on correct network, don't show the switcher
  if (!isConnected || !currentChainId || !networkValidation?.needsSwitch) {
    return null;
  }

  const handleSwitchNetwork = async () => {
    // Prevent spam clicking
    const now = Date.now();
    if (now - lastSwitchAttempt < 2000) {
      return;
    }
    setLastSwitchAttempt(now);

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔄 Attempting to switch to Lisk Sepolia...");
      console.log("🔄 Target network details:", {
        chainId: PRIMARY_NETWORK.chainId,
        name: PRIMARY_NETWORK.name,
        rpcUrl: PRIMARY_NETWORK.rpcUrl,
      });

      const success = await switchToPrimaryNetwork();

      if (success) {
        console.log("✅ Successfully switched to primary network");

        // Force re-check network after switch
        setTimeout(async () => {
          try {
            if (window.ethereum) {
              const newChainIdHex = await window.ethereum.request({
                method: "eth_chainId",
              });
              const newChainId = parseInt(newChainIdHex, 16);
              console.log("🔄 New chain ID after switch:", newChainId);

              if (newChainId === PRIMARY_NETWORK.chainId) {
                console.log("✅ Network switch confirmed!");
                onNetworkChanged?.();
              } else {
                console.warn(
                  "⚠️ Network switch may not have completed correctly"
                );
              }
            }
          } catch (checkError) {
            console.warn("⚠️ Could not verify network switch:", checkError);
            onNetworkChanged?.();
          }
        }, 2000);
      } else {
        throw new Error("Network switch was cancelled or failed");
      }
    } catch (err: any) {
      console.error("❌ Failed to switch network:", err);

      let errorMessage = "Failed to switch network";
      if (err.message?.includes("User rejected")) {
        errorMessage = "Network switch was cancelled by user";
      } else if (err.message?.includes("already pending")) {
        errorMessage = "A network switch is already pending. Check MetaMask.";
      } else if (err.message?.includes("Unrecognized chain ID")) {
        errorMessage =
          "Lisk Sepolia network is not added to MetaMask. Please add it manually.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        "border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800 animate-pulse",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
            <h3 className="font-semibold text-red-800 dark:text-red-200">
              ⚠️ Network Switch Required
            </h3>
          </div>

          {/* Description */}
          <div className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <p className="font-medium mb-2">
              🔗 Smart contract features require the correct blockchain network
            </p>
            <p className="text-xs opacity-90">
              The Hike2Earn contract is deployed on {PRIMARY_NETWORK.name}{" "}
              (Chain ID: {PRIMARY_NETWORK.chainId}). Switch now to access live
              campaigns, create new ones, and earn HIKE tokens!
            </p>
          </div>

          {/* Current vs Required Network */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Network:</span>
              <Badge
                variant="outline"
                className="text-red-600 border-red-200 bg-red-50 dark:bg-red-950/20"
              >
                <Globe className="w-3 h-3 mr-1" />
                {currentNetworkInfo?.name || `Chain ${currentChainId}`}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Required Network:</span>
              <Badge
                variant="outline"
                className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {PRIMARY_NETWORK.name}
              </Badge>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSwitchNetwork}
              disabled={isLoading || !networkValidation?.canAutoSwitch}
              size="lg"
              className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 animate-pulse font-semibold text-white shadow-lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Switching Networks...
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5 mr-2" />
                  🚀 Switch to {PRIMARY_NETWORK.name}
                </>
              )}
            </Button>

            {PRIMARY_NETWORK.blockExplorer && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-amber-200 hover:bg-amber-100 dark:hover:bg-amber-950/40"
              >
                <a
                  href={PRIMARY_NETWORK.blockExplorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`View ${PRIMARY_NETWORK.name} Explorer`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>

          {/* Manual instructions fallback */}
          {!networkValidation?.canAutoSwitch && (
            <div className="text-xs text-muted-foreground bg-white/50 p-2 rounded border">
              <strong>Manual Switch Required:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-0.5">
                <li>Open your wallet</li>
                <li>Find network settings</li>
                <li>Switch to {PRIMARY_NETWORK.name}</li>
                <li>Chain ID: {PRIMARY_NETWORK.chainId}</li>
              </ol>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for navigation bars
export function NetworkSwitcherCompact({
  className,
  currentChainId,
  onNetworkChanged,
}: NetworkSwitcherProps) {
  const { isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const networkValidation = currentChainId
    ? validateNetwork(currentChainId)
    : null;
  const currentNetworkInfo = currentChainId
    ? getNetworkDisplayInfo(currentChainId)
    : null;

  if (!isConnected || !currentChainId || !networkValidation?.needsSwitch) {
    return null;
  }

  const handleSwitchNetwork = async () => {
    setIsLoading(true);
    try {
      await switchToPrimaryNetwork();
      onNetworkChanged?.();
    } catch (err) {
      console.error("Failed to switch network:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge
        variant="destructive"
        className="animate-pulse cursor-pointer"
        onClick={handleSwitchNetwork}
      >
        <AlertTriangle className="w-3 h-3 mr-1" />
        Wrong Network
      </Badge>

      <Button
        size="sm"
        variant="outline"
        onClick={handleSwitchNetwork}
        disabled={isLoading}
        className="h-7"
      >
        {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Switch"}
      </Button>
    </div>
  );
}

// Hook for network status
export function useNetworkStatus() {
  const { isConnected } = useWallet();
  const [chainId, setChainId] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkNetwork = async () => {
      if (!isConnected || typeof window === "undefined" || !window.ethereum) {
        setChainId(null);
        setIsChecking(false);
        return;
      }

      try {
        // Try multiple methods to get chainId
        let chainIdHex: string;
        let currentChainId: number;

        try {
          // Method 1: Direct request
          chainIdHex = await window.ethereum.request({
            method: "eth_chainId",
          });
          currentChainId = parseInt(chainIdHex, 16);
        } catch (method1Error) {
          try {
            // Method 2: Get network info
            const network = await window.ethereum.request({
              method: "eth_getBlockByNumber",
              params: ["latest", false],
            });
            // This is a fallback - if we get here, we're on some network
            chainIdHex = await window.ethereum.request({
              method: "eth_chainId",
            });
            currentChainId = parseInt(chainIdHex, 16);
          } catch (method2Error) {
            // Method 3: Check if ethereum object has chainId property
            if ((window.ethereum as any).chainId) {
              chainIdHex = (window.ethereum as any).chainId;
              currentChainId = parseInt(chainIdHex, 16);
            } else {
              throw new Error("All chainId detection methods failed");
            }
          }
        }

        setChainId(currentChainId);
      } catch (error: any) {
        // Set a fallback chainId to avoid null state
        setChainId(1); // Default to Ethereum mainnet as fallback
      } finally {
        setIsChecking(false);
      }
    };

    checkNetwork();

    // Listen for network changes
    if (typeof window !== "undefined" && window.ethereum) {
      const ethereum = window.ethereum;

      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        setIsChecking(false); // Reset checking state on network change
      };

      const handleNetworkChanged = (networkId: string) => {
        // Some wallets still use this deprecated event
        checkNetwork();
      };

      // Add listeners for both events
      ethereum.on?.("chainChanged", handleChainChanged);
      ethereum.on?.("networkChanged", handleNetworkChanged);

      return () => {
        ethereum.removeListener?.("chainChanged", handleChainChanged);
        ethereum.removeListener?.("networkChanged", handleNetworkChanged);
      };
    }
  }, [isConnected]);

  const networkValidation = chainId ? validateNetwork(chainId) : null;

  return {
    chainId,
    isChecking,
    isSupported: networkValidation?.isSupported || false,
    needsSwitch: networkValidation?.needsSwitch || false,
    networkInfo: chainId ? getNetworkDisplayInfo(chainId) : null,
    validation: networkValidation,
  };
}

// Global types are declared in network-config.ts
