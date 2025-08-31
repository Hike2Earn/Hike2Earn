"use client";

import { useState, useEffect, useCallback } from "react";
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
import { getBestProvider, isolateMetaMaskProvider } from "@/lib/wallet-utils";
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
  const [autoSwitchAttempted, setAutoSwitchAttempted] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  // Get current network information
  const networkValidation = currentChainId
    ? validateNetwork(currentChainId)
    : null;
  const currentNetworkInfo = currentChainId
    ? getNetworkDisplayInfo(currentChainId)
    : null;

  // Auto-switch attempt when component mounts and network needs switching
  useEffect(() => {
    if (networkValidation?.needsSwitch && 
        networkValidation?.canAutoSwitch && 
        !autoSwitchAttempted && 
        !isLoading &&
        isConnected) {
      
      console.log("🔄 Auto-attempting network switch to", PRIMARY_NETWORK.name);
      setAutoSwitchAttempted(true);
      
      // Small delay to avoid immediate switch after wallet connection
      setTimeout(() => {
        handleSwitchNetwork(true);
      }, 1000);
    }
  }, [networkValidation, isConnected, autoSwitchAttempted, isLoading]);

  useEffect(() => {
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Reset auto-switch flag when chainId changes (successful switch)
  useEffect(() => {
    if (currentChainId === PRIMARY_NETWORK.chainId) {
      setAutoSwitchAttempted(false);
      setShowManualInstructions(false);
      setError(null);
    }
  }, [currentChainId]);

  // If not connected or on correct network, don't show the switcher
  if (!isConnected || !currentChainId || !networkValidation?.needsSwitch) {
    return null;
  }

  const handleSwitchNetwork = async (isAutoSwitch: boolean = false) => {
    // Prevent spam clicking for manual switches
    if (!isAutoSwitch) {
      const now = Date.now();
      if (now - lastSwitchAttempt < 2000) {
        return;
      }
      setLastSwitchAttempt(now);
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isAutoSwitch) {
        console.log("🤖 Auto-switching to", PRIMARY_NETWORK.name, "...");
      } else {
        console.log("🔄 Manually switching to", PRIMARY_NETWORK.name, "...");
      }
      
      console.log("🔄 Target network details:", {
        chainId: PRIMARY_NETWORK.chainId,
        name: PRIMARY_NETWORK.name,
        rpcUrl: PRIMARY_NETWORK.rpcUrl,
      });

      const success = await switchToPrimaryNetwork();

      if (success) {
        console.log("✅ Successfully switched to primary network");

        // For auto-switch, be less aggressive with verification
        const delay = isAutoSwitch ? 1000 : 2000;
        
        setTimeout(async () => {
          try {
            // Try to get chain ID with enhanced provider selection
            const provider = getBestProvider();
            const targetProvider = provider || window.ethereum;
            
            if (targetProvider) {
              const newChainIdHex = await targetProvider.request({
                method: "eth_chainId",
              });
              const newChainId = parseInt(newChainIdHex, 16);
              console.log("🔄 New chain ID after switch:", newChainId);

              if (newChainId === PRIMARY_NETWORK.chainId) {
                console.log("✅ Network switch confirmed!");
                onNetworkChanged?.();
              } else {
                console.warn("⚠️ Network switch may not have completed correctly");
                if (!isAutoSwitch) {
                  onNetworkChanged?.(); // Still notify for manual switches
                }
              }
            }
          } catch (checkError) {
            console.warn("⚠️ Could not verify network switch:", checkError);
            if (!isAutoSwitch) {
              onNetworkChanged?.(); // Still notify for manual switches
            }
          }
        }, delay);
      } else {
        throw new Error("Network switch was cancelled or failed");
      }
    } catch (err: any) {
      console.error(`❌ ${isAutoSwitch ? 'Auto-switch' : 'Manual switch'} failed:`, err);

      let errorMessage = "Failed to switch network";
      let shouldShowManualInstructions = false;

      if (err.message?.includes("User rejected")) {
        errorMessage = isAutoSwitch 
          ? "Auto-switch cancelled. Manual switch required." 
          : "Network switch was cancelled by user";
        shouldShowManualInstructions = true;
      } else if (err.message?.includes("already pending")) {
        errorMessage = "A network switch is already pending. Check your wallet.";
      } else if (err.message?.includes("Unrecognized chain ID")) {
        errorMessage = "Lisk Sepolia network is not added to your wallet.";
        shouldShowManualInstructions = true;
      } else if (err.message?.includes("evmAsk.js") || err.message?.includes("selectExtension")) {
        errorMessage = "Wallet extension conflict detected. Please disable conflicting wallet extensions.";
        shouldShowManualInstructions = true;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      
      if (shouldShowManualInstructions && isAutoSwitch) {
        setShowManualInstructions(true);
      }
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
            {autoSwitchAttempted && !isLoading && (
              <p className="text-xs mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-blue-700 dark:text-blue-300">
                🤖 Auto-switch attempted. Use manual switch if needed.
              </p>
            )}
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
              onClick={() => handleSwitchNetwork(false)}
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

// Enhanced Hook for network status with robust detection
export function useNetworkStatus() {
  const { isConnected } = useWallet();
  const [chainId, setChainId] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkNetwork = useCallback(async (attempt: number = 0): Promise<void> => {
    if (!isConnected || typeof window === "undefined" || !window.ethereum) {
      setChainId(null);
      setIsChecking(false);
      setLastError(null);
      return;
    }

    try {
      console.log(`🔍 Checking network (attempt ${attempt + 1})...`);
      let currentChainId: number | null = null;

      // Method 1: Direct eth_chainId request with enhanced provider selection
      try {
        const provider = getBestProvider();
        const targetProvider = provider || window.ethereum;

        const chainIdHex = await targetProvider.request({
          method: "eth_chainId",
        });
        
        currentChainId = parseInt(chainIdHex, 16);
        console.log(`✅ Got chainId via direct request: ${currentChainId}`);
      } catch (method1Error: any) {
        console.warn("⚠️ Direct chainId request failed:", method1Error.message);

        // Method 2: Try with isolated MetaMask provider
        if (method1Error.message.includes("evmAsk.js") || method1Error.message.includes("selectExtension")) {
          try {
            const isolatedProvider = isolateMetaMaskProvider();
            if (isolatedProvider) {
              const chainIdHex = await isolatedProvider.request({
                method: "eth_chainId",
              });
              currentChainId = parseInt(chainIdHex, 16);
              console.log(`✅ Got chainId via isolated provider: ${currentChainId}`);
            }
          } catch (method2Error) {
            console.warn("⚠️ Isolated provider chainId failed:", method2Error);
          }
        }

        // Method 3: Fallback to ethereum object property
        if (!currentChainId && (window.ethereum as any).chainId) {
          try {
            const chainIdHex = (window.ethereum as any).chainId;
            currentChainId = parseInt(chainIdHex, 16);
            console.log(`✅ Got chainId from ethereum object: ${currentChainId}`);
          } catch (method3Error) {
            console.warn("⚠️ Ethereum object chainId failed:", method3Error);
          }
        }

        // Method 4: Try network detection via block info
        if (!currentChainId) {
          try {
            // This might help determine if we're connected to any network
            const block = await window.ethereum.request({
              method: "eth_getBlockByNumber",
              params: ["latest", false],
            });
            
            if (block) {
              // Retry chainId after confirming network connection
              const chainIdHex = await window.ethereum.request({
                method: "eth_chainId",
              });
              currentChainId = parseInt(chainIdHex, 16);
              console.log(`✅ Got chainId after block check: ${currentChainId}`);
            }
          } catch (method4Error) {
            console.warn("⚠️ Block-based network detection failed:", method4Error);
          }
        }
      }

      if (currentChainId && !isNaN(currentChainId)) {
        setChainId(currentChainId);
        setLastError(null);
        setRetryCount(0);
        console.log(`🎯 Network detected: Chain ${currentChainId}`);
      } else {
        throw new Error("Could not determine chainId with any method");
      }

    } catch (error: any) {
      console.error(`❌ Network detection failed (attempt ${attempt + 1}):`, error);
      setLastError(error.message);

      // Retry logic with exponential backoff
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.log(`🔄 Retrying network detection in ${delay}ms...`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          checkNetwork(attempt + 1);
        }, delay);
        return;
      }

      // After 3 attempts, set a reasonable fallback
      console.warn("⚠️ All network detection attempts failed, using fallback");
      setChainId(1); // Default to Ethereum mainnet as fallback
      setRetryCount(0);
    } finally {
      setIsChecking(false);
    }
  }, [isConnected]);

  useEffect(() => {
    setIsChecking(true);
    checkNetwork();

    // Enhanced event listeners for network changes
    if (typeof window !== "undefined" && window.ethereum) {
      const ethereum = window.ethereum;

      const handleChainChanged = (chainIdHex: string) => {
        try {
          const newChainId = parseInt(chainIdHex, 16);
          if (!isNaN(newChainId)) {
            console.log(`🔄 Network changed to: ${newChainId}`);
            setChainId(newChainId);
            setIsChecking(false);
            setLastError(null);
          }
        } catch (error) {
          console.warn("⚠️ Error parsing chainChanged event:", error);
          // Re-check network if parsing fails
          checkNetwork();
        }
      };

      const handleNetworkChanged = (networkId: string) => {
        console.log(`🔄 Network changed (deprecated event): ${networkId}`);
        // Re-check network for deprecated event
        checkNetwork();
      };

      const handleAccountsChanged = (accounts: string[]) => {
        // Network might have changed with account change
        if (accounts.length > 0) {
          console.log("🔄 Accounts changed, re-checking network...");
          setTimeout(checkNetwork, 500); // Small delay to let network settle
        }
      };

      // Add listeners for all relevant events
      ethereum.on?.("chainChanged", handleChainChanged);
      ethereum.on?.("networkChanged", handleNetworkChanged);
      ethereum.on?.("accountsChanged", handleAccountsChanged);

      return () => {
        ethereum.removeListener?.("chainChanged", handleChainChanged);
        ethereum.removeListener?.("networkChanged", handleNetworkChanged);
        ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      };
    }
  }, [isConnected, checkNetwork]);

  const networkValidation = chainId ? validateNetwork(chainId) : null;

  return {
    chainId,
    isChecking,
    isSupported: networkValidation?.isSupported || false,
    needsSwitch: networkValidation?.needsSwitch || false,
    networkInfo: chainId ? getNetworkDisplayInfo(chainId) : null,
    validation: networkValidation,
    lastError,
    retryCount,
    refreshNetwork: () => checkNetwork(),
  };
}

// Global types are declared in network-config.ts
