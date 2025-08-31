"use client";

import { useState, useEffect, useCallback } from "react";
import { diagnoseWalletEnvironment, type WalletProvider } from "@/lib/wallet-utils";

export interface WalletConflictStatus {
  hasConflicts: boolean;
  conflictTypes: string[];
  recommendedProvider: WalletProvider | null;
  activeProvider: WalletProvider | null;
  phantomDetected: boolean;
  multipleWallets: string[];
  isResolved: boolean;
  lastError: string | null;
}

export interface WalletConflictResolver {
  status: WalletConflictStatus;
  resolveConflicts: () => Promise<boolean>;
  isolateMetaMask: () => Promise<WalletProvider | null>;
  handleEvmAskError: (error: any) => Promise<WalletProvider | null>;
  refreshDiagnostic: () => void;
  isResolving: boolean;
}

export function useWalletConflictResolver(): WalletConflictResolver {
  const [status, setStatus] = useState<WalletConflictStatus>({
    hasConflicts: false,
    conflictTypes: [],
    recommendedProvider: null,
    activeProvider: null,
    phantomDetected: false,
    multipleWallets: [],
    isResolved: false,
    lastError: null,
  });
  
  const [isResolving, setIsResolving] = useState(false);

  // Run diagnostic on mount and when window.ethereum changes
  const refreshDiagnostic = useCallback(() => {
    if (typeof window === "undefined") return;

    const diagnostic = diagnoseWalletEnvironment();
    
    const multipleWallets = diagnostic.providers.map(p => {
      if (p.isPhantom) return "Phantom";
      if (p.isMetaMask) return "MetaMask";
      if (p.isCoinbaseWallet) return "Coinbase";
      if (p.isTrustWallet) return "Trust";
      if (p.isRabby) return "Rabby";
      return "Unknown";
    });

    const hasConflicts = diagnostic.multipleProvidersDetected || 
                        diagnostic.phantomDetected ||
                        diagnostic.conflicts.length > 0;

    const conflictTypes = [];
    if (diagnostic.phantomDetected) conflictTypes.push("phantom_interference");
    if (diagnostic.multipleProvidersDetected) conflictTypes.push("multiple_providers");
    if (diagnostic.conflicts.length > 0) conflictTypes.push("provider_conflicts");

    setStatus({
      hasConflicts,
      conflictTypes,
      recommendedProvider: diagnostic.preferredProvider,
      activeProvider: window.ethereum as WalletProvider,
      phantomDetected: diagnostic.phantomDetected,
      multipleWallets,
      isResolved: !hasConflicts,
      lastError: null,
    });

    console.log("🔍 Wallet Conflict Diagnostic:", {
      hasConflicts,
      conflictTypes,
      multipleWallets,
      phantomDetected: diagnostic.phantomDetected,
    });
  }, []);

  useEffect(() => {
    refreshDiagnostic();
    
    // Listen for ethereum provider changes
    if (typeof window !== "undefined") {
      const handleEthereumChange = () => {
        setTimeout(refreshDiagnostic, 100); // Small delay to let changes settle
      };

      // Some wallets emit these events
      window.addEventListener('ethereum#initialized', handleEthereumChange);
      window.addEventListener('wallet_requestAccounts', handleEthereumChange);
      
      return () => {
        window.removeEventListener('ethereum#initialized', handleEthereumChange);
        window.removeEventListener('wallet_requestAccounts', handleEthereumChange);
      };
    }
  }, [refreshDiagnostic]);

  // Isolate MetaMask from other providers
  const isolateMetaMask = useCallback(async (): Promise<WalletProvider | null> => {
    if (typeof window === "undefined" || !window.ethereum) {
      return null;
    }

    try {
      // If we have multiple providers, find MetaMask specifically
      if ((window.ethereum as any).providers) {
        const providers = (window.ethereum as any).providers;
        const metamaskProvider = providers.find((p: any) => 
          p.isMetaMask && !p.isPhantom && !p.isCoinbaseWallet
        );

        if (metamaskProvider) {
          console.log("✅ Isolated MetaMask provider from multiple wallets");
          return metamaskProvider;
        }
      }

      // Check if current ethereum object is MetaMask
      if ((window.ethereum as any).isMetaMask && !(window.ethereum as any).isPhantom) {
        return window.ethereum as WalletProvider;
      }

      console.warn("⚠️ Could not isolate MetaMask provider");
      return null;
    } catch (error) {
      console.error("❌ Error isolating MetaMask:", error);
      return null;
    }
  }, []);

  // Handle the specific evmAsk.js error from Phantom
  const handleEvmAskError = useCallback(async (error: any): Promise<WalletProvider | null> => {
    console.log("🔧 Handling evmAsk.js error:", error.message);
    
    // Update status with error info
    setStatus(prev => ({
      ...prev,
      lastError: error.message,
      isResolved: false,
    }));

    // Try to get a clean MetaMask provider
    const cleanProvider = await isolateMetaMask();
    
    if (cleanProvider) {
      console.log("✅ Found clean MetaMask provider after evmAsk error");
      return cleanProvider;
    }

    // If isolation fails, try to work with what we have
    if (window.ethereum) {
      // Force MetaMask selection by trying to access MetaMask-specific methods
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });
        
        console.log("✅ Successfully accessed accounts despite evmAsk error");
        return window.ethereum as WalletProvider;
      } catch (fallbackError) {
        console.error("❌ Fallback approach failed:", fallbackError);
      }
    }

    return null;
  }, [isolateMetaMask]);

  // Main conflict resolution function
  const resolveConflicts = useCallback(async (): Promise<boolean> => {
    if (!status.hasConflicts) {
      return true; // No conflicts to resolve
    }

    setIsResolving(true);
    
    try {
      console.log("🔧 Starting wallet conflict resolution...");
      
      // Strategy 1: If Phantom is detected, try to isolate MetaMask
      if (status.phantomDetected) {
        console.log("🔧 Phantom detected, attempting to isolate MetaMask...");
        
        const metamaskProvider = await isolateMetaMask();
        if (metamaskProvider) {
          // Test the isolated provider
          try {
            const accounts = await metamaskProvider.request({
              method: 'eth_accounts'
            });
            
            console.log("✅ Successfully isolated and tested MetaMask");
            
            setStatus(prev => ({
              ...prev,
              isResolved: true,
              activeProvider: metamaskProvider,
              lastError: null,
            }));
            
            return true;
          } catch (testError) {
            console.warn("⚠️ Isolated provider failed test:", testError);
          }
        }
      }

      // Strategy 2: Force provider refresh
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Some wallets expose a provider selection method
          if (typeof (window.ethereum as any).detectProvider === 'function') {
            const detectedProvider = await (window.ethereum as any).detectProvider();
            if (detectedProvider && detectedProvider.isMetaMask) {
              console.log("✅ Detected MetaMask via provider detection");
              setStatus(prev => ({ ...prev, isResolved: true, lastError: null }));
              return true;
            }
          }

          // Try to request accounts to force wallet selection
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log("✅ Successfully requested accounts");
          setStatus(prev => ({ ...prev, isResolved: true, lastError: null }));
          return true;
        } catch (requestError: any) {
          if (requestError.message.includes('User rejected')) {
            console.log("ℹ️ User rejected account request");
            return false;
          }
          
          console.warn("⚠️ Account request failed:", requestError);
        }
      }

      // Strategy 3: Manual resolution instructions
      console.log("⚠️ Automatic resolution failed, manual intervention required");
      setStatus(prev => ({
        ...prev,
        lastError: "Automatic resolution failed. Please disable conflicting wallet extensions.",
        isResolved: false,
      }));
      
      return false;
      
    } catch (error: any) {
      console.error("❌ Conflict resolution failed:", error);
      setStatus(prev => ({
        ...prev,
        lastError: error.message,
        isResolved: false,
      }));
      return false;
    } finally {
      setIsResolving(false);
    }
  }, [status.hasConflicts, status.phantomDetected, isolateMetaMask]);

  return {
    status,
    resolveConflicts,
    isolateMetaMask,
    handleEvmAskError,
    refreshDiagnostic,
    isResolving,
  };
}