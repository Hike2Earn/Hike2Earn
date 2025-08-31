/**
 * Wallet utility functions for debugging and provider detection
 * Helps diagnose and resolve wallet connection issues
 */

export interface WalletProvider {
  isMetaMask?: boolean;
  isPhantom?: boolean;
  isCoinbaseWallet?: boolean;
  isTrustWallet?: boolean;
  isRabby?: boolean;
  selectedAddress?: string | null;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  enable?: () => Promise<string[]>;
  send?: (method: string, params?: any[]) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

export interface WalletDiagnostic {
  hasEthereum: boolean;
  providers: WalletProvider[];
  preferredProvider: WalletProvider | null;
  conflicts: string[];
  recommendations: string[];
  phantomDetected: boolean;
  multipleProvidersDetected: boolean;
}

/**
 * Diagnose wallet environment and detect potential conflicts
 */
export function diagnoseWalletEnvironment(): WalletDiagnostic {
  const diagnostic: WalletDiagnostic = {
    hasEthereum: false,
    providers: [],
    preferredProvider: null,
    conflicts: [],
    recommendations: [],
    phantomDetected: false,
    multipleProvidersDetected: false,
  };

  if (typeof window === "undefined") {
    diagnostic.recommendations.push(
      "Server-side rendering detected - wallet only available on client"
    );
    return diagnostic;
  }

  diagnostic.hasEthereum = !!window.ethereum;

  if (!window.ethereum) {
    diagnostic.recommendations.push(
      "No wallet extension detected. Please install MetaMask or another Web3 wallet."
    );
    return diagnostic;
  }

  // Detect multiple providers
  if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
    diagnostic.multipleProvidersDetected = true;
    diagnostic.providers = window.ethereum.providers as WalletProvider[];

    console.log("🔍 Multiple providers detected:", diagnostic.providers.length);

    // Check each provider
    diagnostic.providers.forEach((provider, index) => {
      const walletName = getWalletName(provider);
      console.log(`📱 Provider ${index + 1}: ${walletName}`);

      if (provider.isPhantom) {
        diagnostic.phantomDetected = true;
        diagnostic.conflicts.push(
          "Phantom Wallet detected - may interfere with MetaMask connection"
        );
      }
    });

    // Find MetaMask
    const metamaskProvider = diagnostic.providers.find(
      (provider) => provider.isMetaMask
    );
    if (metamaskProvider) {
      diagnostic.preferredProvider = metamaskProvider;
      diagnostic.recommendations.push(
        "MetaMask found among multiple providers - will use MetaMask"
      );
    } else {
      diagnostic.preferredProvider = diagnostic.providers[0];
      diagnostic.conflicts.push(
        "MetaMask not found among providers - using first available"
      );
      diagnostic.recommendations.push(
        "Consider installing MetaMask for best compatibility"
      );
    }
  } else {
    // Single provider
    diagnostic.providers = [window.ethereum as WalletProvider];
    diagnostic.preferredProvider = window.ethereum as WalletProvider;

    const walletName = getWalletName(window.ethereum as WalletProvider);
    console.log("📱 Single provider detected:", walletName);

    if (window.ethereum.isPhantom) {
      diagnostic.phantomDetected = true;
      diagnostic.conflicts.push(
        "Only Phantom Wallet detected - may have compatibility issues"
      );
      diagnostic.recommendations.push(
        "Consider installing MetaMask for better compatibility"
      );
    }
  }

  // Additional conflict detection
  if (diagnostic.phantomDetected && diagnostic.multipleProvidersDetected) {
    diagnostic.recommendations.push(
      "Multiple wallets with Phantom detected - consider disabling Phantom or other wallets except MetaMask"
    );
  }

  return diagnostic;
}

/**
 * Get wallet name from provider
 */
export function getWalletName(provider: WalletProvider): string {
  if (provider.isMetaMask) return "MetaMask";
  if (provider.isPhantom) return "Phantom";
  if (provider.isCoinbaseWallet) return "Coinbase Wallet";
  if (provider.isTrustWallet) return "Trust Wallet";
  if (provider.isRabby) return "Rabby";
  return "Unknown Wallet";
}

// Cache para el provider de MetaMask una vez encontrado
let cachedMetaMaskProvider: WalletProvider | null = null;

/**
 * Isolate MetaMask provider from multiple wallet extensions - Enhanced version
 */
export function isolateMetaMaskProvider(): WalletProvider | null {
  if (typeof window === "undefined" || !window.ethereum) {
    console.log("❌ No window.ethereum available");
    return null;
  }

  // Usar cache si ya se encontró un provider válido
  if (cachedMetaMaskProvider) {
    try {
      console.log("✅ Using cached MetaMask provider");
      return cachedMetaMaskProvider;
    } catch (error) {
      console.warn("⚠️ Cached provider invalid, searching again...");
      cachedMetaMaskProvider = null;
    }
  }

  try {
    // Check for multiple providers array
    if ((window.ethereum as any).providers && Array.isArray((window.ethereum as any).providers)) {
      const providers = (window.ethereum as any).providers;
      console.log(`🔍 Found ${providers.length} wallet providers`);
      
      // Strategy 1: Find pure MetaMask (not Phantom disguised)
      const pureMetaMask = providers.find((provider: any) => 
        provider.isMetaMask && 
        !provider.isPhantom && 
        !provider.isCoinbaseWallet &&
        !provider.isTrustWallet &&
        !provider.isRabby &&
        provider._metamask // Additional MetaMask-specific property
      );

      if (pureMetaMask) {
        console.log("🎯 Found pure MetaMask provider");
        cachedMetaMaskProvider = pureMetaMask;
        return pureMetaMask;
      }

      // Strategy 2: Find MetaMask by _metamask property (more reliable)
      const metamaskByProperty = providers.find((provider: any) => 
        provider._metamask || (provider.isMetaMask && provider.request)
      );

      if (metamaskByProperty && !metamaskByProperty.isPhantom) {
        console.log("🎯 Found MetaMask by _metamask property");
        cachedMetaMaskProvider = metamaskByProperty;
        return metamaskByProperty;
      }

      // Strategy 3: Find first working MetaMask-like provider
      for (const provider of providers) {
        if (provider.isMetaMask && provider.request && !provider.isPhantom) {
          console.log("⚠️ Using fallback MetaMask provider (may have conflicts)");
          cachedMetaMaskProvider = provider;
          return provider;
        }
      }
    }

    // Single provider case - enhanced validation
    const singleProvider = window.ethereum;
    if (singleProvider) {
      // Check if it's genuine MetaMask
      const isGenuineMetaMask = (
        (singleProvider as any).isMetaMask && 
        !(singleProvider as any).isPhantom &&
        ((singleProvider as any)._metamask || (singleProvider as any).request)
      );

      if (isGenuineMetaMask) {
        console.log("✅ Using single genuine MetaMask provider");
        cachedMetaMaskProvider = singleProvider;
        return singleProvider;
      }

      // Even if not clearly MetaMask, if it has request method and isMetaMask, use it
      if ((singleProvider as any).isMetaMask && (singleProvider as any).request) {
        console.log("⚠️ Using single provider that claims to be MetaMask");
        cachedMetaMaskProvider = singleProvider;
        return singleProvider;
      }
    }

    console.warn("⚠️ Could not isolate MetaMask provider");
    return null;
  } catch (error) {
    console.error("❌ Error isolating MetaMask provider:", error);
    return null;
  }
}

/**
 * Clear the cached MetaMask provider (useful for testing or when providers change)
 */
export function clearMetaMaskCache(): void {
  cachedMetaMaskProvider = null;
  console.log("🔄 MetaMask provider cache cleared");
}

/**
 * Validate that a provider is working for minting operations
 */
export async function validateProviderForMinting(provider: WalletProvider): Promise<boolean> {
  if (!provider || !provider.request) {
    return false;
  }

  try {
    // Test basic connectivity
    await provider.request({ method: "eth_accounts" });
    
    // Test chain ID access
    await provider.request({ method: "eth_chainId" });
    
    console.log("✅ Provider validation successful");
    return true;
  } catch (error: any) {
    console.warn("❌ Provider validation failed:", error.message);
    
    // Clear cache if this was the cached provider
    if (provider === cachedMetaMaskProvider) {
      clearMetaMaskCache();
    }
    
    return false;
  }
}

/**
 * Get the best available provider with MetaMask priority
 */
export function getBestProvider(): WalletProvider | null {
  console.log("🔍 Getting best provider with MetaMask priority...");
  
  if (typeof window === "undefined" || !window.ethereum) {
    console.log("❌ No ethereum provider available");
    return null;
  }

  // ALWAYS try to get MetaMask first, regardless of conflicts
  console.log("🎯 Attempting to isolate MetaMask provider...");
  const metamaskProvider = isolateMetaMaskProvider();
  
  if (metamaskProvider) {
    console.log("✅ Using MetaMask as primary provider");
    return metamaskProvider;
  }

  // If MetaMask not found, diagnose the environment
  const diagnostic = diagnoseWalletEnvironment();
  console.log("🔍 MetaMask not found, using diagnostic fallback...");

  if (!diagnostic.hasEthereum) {
    return null;
  }

  // Fallback to any available provider, but warn user
  if (diagnostic.preferredProvider) {
    console.warn(
      "⚠️ Using non-MetaMask provider:",
      getWalletName(diagnostic.preferredProvider),
      "- This may cause issues"
    );
    return diagnostic.preferredProvider;
  }

  console.error("❌ No suitable wallet provider found");
  return null;
}

/**
 * Advanced provider testing with fallbacks
 */
export async function testProviderConnection(provider: WalletProvider): Promise<{
  isWorking: boolean;
  error?: string;
  accounts?: string[];
}> {
  if (!provider) {
    return { isWorking: false, error: "No provider" };
  }

  try {
    // Test 1: Check if accounts are accessible
    const accounts = await provider.request({
      method: "eth_accounts",
    });

    // Test 2: Try to get chain ID
    const chainId = await provider.request({
      method: "eth_chainId",
    });

    console.log("✅ Provider test passed:", {
      accountsCount: accounts?.length || 0,
      chainId
    });

    return {
      isWorking: true,
      accounts: accounts || []
    };

  } catch (error: any) {
    console.warn("⚠️ Provider test failed:", error.message);
    
    // Check for specific error patterns
    if (error.message.includes("selectExtension") || 
        error.message.includes("evmAsk.js") ||
        error.message.includes("Unexpected error")) {
      return {
        isWorking: false,
        error: "phantom_conflict"
      };
    }

    return {
      isWorking: false,
      error: error.message
    };
  }
}

/**
 * Check if a wallet provider is connected by checking available accounts
 */
export async function isProviderConnected(provider: WalletProvider): Promise<boolean> {
  if (!provider) return false;
  
  try {
    const accounts = await provider.request({
      method: "eth_accounts",
    });
    return accounts && accounts.length > 0;
  } catch (error) {
    console.warn("Failed to check provider connection:", error);
    // Fallback to selectedAddress if available (for backward compatibility)
    return !!provider.selectedAddress;
  }
}

/**
 * Attempt connection with enhanced fallback methods and conflict resolution
 */
export async function connectWithFallback(
  provider: WalletProvider
): Promise<string[]> {
  console.log("🔄 Attempting connection with enhanced fallback methods...");

  const walletName = getWalletName(provider);
  console.log("📱 Connecting to:", walletName);

  // First, test if the provider is working properly
  const providerTest = await testProviderConnection(provider);
  
  if (providerTest.isWorking && providerTest.accounts && providerTest.accounts.length > 0) {
    console.log("✅ Provider already connected with accounts");
    return providerTest.accounts;
  }

  if (providerTest.error === "phantom_conflict") {
    console.log("🔧 Phantom conflict detected, attempting isolation...");
    
    // Try to get isolated MetaMask provider
    const isolatedProvider = isolateMetaMaskProvider();
    if (isolatedProvider) {
      try {
        console.log("🔄 Trying isolated MetaMask provider...");
        const accounts = await isolatedProvider.request({
          method: "eth_requestAccounts",
        });
        console.log("✅ Success with isolated MetaMask");
        return accounts;
      } catch (isolatedError) {
        console.warn("❌ Isolated provider failed:", isolatedError);
      }
    }
  }

  try {
    // Primary method - eth_requestAccounts
    console.log("1️⃣ Trying eth_requestAccounts...");
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });
    console.log("✅ Success with eth_requestAccounts");
    return accounts;
  } catch (requestError: any) {
    console.warn("❌ eth_requestAccounts failed:", requestError.message);

    // Enhanced error handling for evmAsk.js and selectExtension errors
    if (
      requestError.message?.includes("selectExtension") ||
      requestError.message?.includes("evmAsk.js") ||
      requestError.message?.includes("Unexpected error")
    ) {
      console.log("🔄 Detected wallet extension conflict, trying recovery methods...");

      // Method 2 - Force provider refresh and retry
      try {
        console.log("2️⃣ Refreshing provider and retrying...");
        
        // Wait a moment for provider to stabilize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const refreshedProvider = getBestProvider();
        if (refreshedProvider && refreshedProvider !== provider) {
          const accounts = await refreshedProvider.request({
            method: "eth_requestAccounts",
          });
          console.log("✅ Success with refreshed provider");
          return accounts;
        }
      } catch (refreshError) {
        console.warn("❌ Provider refresh failed:", refreshError);
      }

      // Method 3 - enable() for older wallets
      if (provider.enable) {
        try {
          console.log("3️⃣ Trying enable() method...");
          const accounts = await provider.enable();
          console.log("✅ Success with enable() method");
          return accounts;
        } catch (enableError) {
          console.warn("❌ enable() method failed:", enableError);
        }
      }

      // Method 4 - send() method
      if (provider.send) {
        try {
          console.log("4️⃣ Trying send() method...");
          const accounts = await provider.send("eth_requestAccounts", []);
          console.log("✅ Success with send() method");
          return accounts;
        } catch (sendError) {
          console.warn("❌ send() method failed:", sendError);
        }
      }

      // Method 5 - Try accessing MetaMask directly through window object
      if (typeof window !== "undefined" && (window as any).MetaMask) {
        try {
          console.log("5️⃣ Trying direct MetaMask access...");
          const directMetaMask = (window as any).MetaMask;
          const accounts = await directMetaMask.request({
            method: "eth_requestAccounts",
          });
          console.log("✅ Success with direct MetaMask");
          return accounts;
        } catch (directError) {
          console.warn("❌ Direct MetaMask access failed:", directError);
        }
      }
    }

    // Re-throw the original error if all methods fail
    throw new Error(`All connection methods failed. Original error: ${requestError.message}. 
      
      This usually happens when multiple wallet extensions conflict. 
      Try disabling other wallet extensions and keeping only MetaMask enabled.`);
  }
}

/**
 * Log wallet environment for debugging
 */
/**
 * Handle the "Unexpected error" that occurs with multiple wallet extensions
 */
export function handleMultipleWalletError(originalError: any): string {
  console.error("🚨 Multiple wallet extensions detected!", originalError);

  // Check for multiple providers
  const providers = [];
  if (window.ethereum) {
    providers.push("Ethereum (MetaMask)");
    if (window.ethereum.providers) {
      providers.push(
        ...window.ethereum.providers.map((p: any) => {
          if (p.isPhantom) return "Phantom";
          if (p.isMetaMask) return "MetaMask";
          if (p.isCoinbaseWallet) return "Coinbase Wallet";
          if (p.isTrustWallet) return "Trust Wallet";
          if (p.isRabby) return "Rabby";
          return "Unknown Wallet";
        })
      );
    }
  }

  const errorMessage = `Multiple wallet extensions detected (${providers.join(
    ", "
  )}). This causes conflicts.

SOLUTION:
1. Open Chrome Extensions (chrome://extensions/)
2. Disable ALL wallet extensions except MetaMask
3. Refresh this page
4. Try connecting again

If you prefer to use a different wallet, disable MetaMask instead.`;

  return errorMessage;
}

export function logWalletEnvironment(): void {
  const diagnostic = diagnoseWalletEnvironment();

  console.group("🔍 Wallet Environment Diagnostic");
  console.log("Has Ethereum:", diagnostic.hasEthereum);
  console.log("Providers count:", diagnostic.providers.length);
  console.log("Multiple providers:", diagnostic.multipleProvidersDetected);
  console.log("Phantom detected:", diagnostic.phantomDetected);

  if (diagnostic.preferredProvider) {
    console.log(
      "Preferred provider:",
      getWalletName(diagnostic.preferredProvider)
    );
  }

  if (diagnostic.conflicts.length > 0) {
    console.warn("⚠️ Conflicts:", diagnostic.conflicts);
  }

  if (diagnostic.recommendations.length > 0) {
    console.info("💡 Recommendations:", diagnostic.recommendations);
  }

  console.groupEnd();
}

/**
 * Show user-friendly error message based on diagnostic
 */
export function getErrorMessage(error: any): {
  title: string;
  message: string;
  suggestions: string[];
} {
  const diagnostic = diagnoseWalletEnvironment();

  if (
    error.message?.includes("selectExtension") ||
    error.message?.includes("Unexpected error")
  ) {
    return {
      title: "Multiple Wallet Extensions Detected",
      message:
        "Your browser has multiple wallet extensions that are conflicting with each other.",
      suggestions: [
        "Disable all wallet extensions except MetaMask",
        "Refresh the page and try again",
        "Open MetaMask directly and connect from there",
        "Try using a different browser with only MetaMask installed",
      ],
    };
  }

  if (error.code === 4001) {
    return {
      title: "Connection Rejected",
      message: "You rejected the wallet connection request.",
      suggestions: [
        "Click 'Connect Wallet' again",
        "Accept the connection request in your wallet",
        "Make sure your wallet is unlocked",
      ],
    };
  }

  if (error.code === -32002) {
    return {
      title: "Connection Request Pending",
      message: "A connection request is already pending.",
      suggestions: [
        "Check your wallet extension for a pending request",
        "Complete or cancel the pending request",
        "Try again after resolving the pending request",
      ],
    };
  }

  if (diagnostic.phantomDetected && !diagnostic.multipleProvidersDetected) {
    return {
      title: "Phantom Wallet Detected",
      message:
        "You have only Phantom wallet installed, which may not be fully compatible.",
      suggestions: [
        "Install MetaMask for better compatibility",
        "Try using Phantom's Ethereum connection",
        "Consider using a browser with MetaMask",
      ],
    };
  }

  return {
    title: "Connection Failed",
    message: error.message || "Failed to connect wallet",
    suggestions: [
      "Make sure your wallet is unlocked",
      "Refresh the page and try again",
      "Check if your wallet supports this network",
      "Try using MetaMask if you have other wallets installed",
    ],
  };
}
