/**
 * Wallet utility functions for debugging and provider detection
 * Helps diagnose and resolve wallet connection issues
 */

export interface WalletProvider {
  isMetaMask?: boolean
  isPhantom?: boolean
  isCoinbaseWallet?: boolean
  isTrustWallet?: boolean
  isRabby?: boolean
  request: (args: { method: string; params?: any[] }) => Promise<any>
  enable?: () => Promise<string[]>
  send?: (method: string, params?: any[]) => Promise<any>
}

export interface WalletDiagnostic {
  hasEthereum: boolean
  providers: WalletProvider[]
  preferredProvider: WalletProvider | null
  conflicts: string[]
  recommendations: string[]
  phantomDetected: boolean
  multipleProvidersDetected: boolean
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
    multipleProvidersDetected: false
  }

  if (typeof window === "undefined") {
    diagnostic.recommendations.push("Server-side rendering detected - wallet only available on client")
    return diagnostic
  }

  diagnostic.hasEthereum = !!window.ethereum

  if (!window.ethereum) {
    diagnostic.recommendations.push("No wallet extension detected. Please install MetaMask or another Web3 wallet.")
    return diagnostic
  }

  // Detect multiple providers
  if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
    diagnostic.multipleProvidersDetected = true
    diagnostic.providers = window.ethereum.providers as WalletProvider[]
    
    console.log("🔍 Multiple providers detected:", diagnostic.providers.length)
    
    // Check each provider
    diagnostic.providers.forEach((provider, index) => {
      const walletName = getWalletName(provider)
      console.log(`📱 Provider ${index + 1}: ${walletName}`)
      
      if (provider.isPhantom) {
        diagnostic.phantomDetected = true
        diagnostic.conflicts.push("Phantom Wallet detected - may interfere with MetaMask connection")
      }
    })

    // Find MetaMask
    const metamaskProvider = diagnostic.providers.find(provider => provider.isMetaMask)
    if (metamaskProvider) {
      diagnostic.preferredProvider = metamaskProvider
      diagnostic.recommendations.push("MetaMask found among multiple providers - will use MetaMask")
    } else {
      diagnostic.preferredProvider = diagnostic.providers[0]
      diagnostic.conflicts.push("MetaMask not found among providers - using first available")
      diagnostic.recommendations.push("Consider installing MetaMask for best compatibility")
    }
  } else {
    // Single provider
    diagnostic.providers = [window.ethereum as WalletProvider]
    diagnostic.preferredProvider = window.ethereum as WalletProvider
    
    const walletName = getWalletName(window.ethereum as WalletProvider)
    console.log("📱 Single provider detected:", walletName)
    
    if (window.ethereum.isPhantom) {
      diagnostic.phantomDetected = true
      diagnostic.conflicts.push("Only Phantom Wallet detected - may have compatibility issues")
      diagnostic.recommendations.push("Consider installing MetaMask for better compatibility")
    }
  }

  // Additional conflict detection
  if (diagnostic.phantomDetected && diagnostic.multipleProvidersDetected) {
    diagnostic.recommendations.push("Multiple wallets with Phantom detected - consider disabling Phantom or other wallets except MetaMask")
  }

  return diagnostic
}

/**
 * Get wallet name from provider
 */
export function getWalletName(provider: WalletProvider): string {
  if (provider.isMetaMask) return "MetaMask"
  if (provider.isPhantom) return "Phantom"
  if (provider.isCoinbaseWallet) return "Coinbase Wallet"
  if (provider.isTrustWallet) return "Trust Wallet"
  if (provider.isRabby) return "Rabby"
  return "Unknown Wallet"
}

/**
 * Get the best available provider with conflict resolution
 */
export function getBestProvider(): WalletProvider | null {
  const diagnostic = diagnoseWalletEnvironment()
  
  if (!diagnostic.hasEthereum) {
    return null
  }

  if (diagnostic.preferredProvider) {
    console.log("✅ Using preferred provider:", getWalletName(diagnostic.preferredProvider))
    return diagnostic.preferredProvider
  }

  return null
}

/**
 * Attempt connection with fallback methods for different wallet types
 */
export async function connectWithFallback(provider: WalletProvider): Promise<string[]> {
  console.log("🔄 Attempting connection with fallback methods...")
  
  const walletName = getWalletName(provider)
  console.log("📱 Connecting to:", walletName)

  try {
    // Primary method - eth_requestAccounts
    console.log("1️⃣ Trying eth_requestAccounts...")
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    })
    console.log("✅ Success with eth_requestAccounts")
    return accounts
  } catch (requestError: any) {
    console.warn("❌ eth_requestAccounts failed:", requestError.message)
    
    // Handle specific errors
    if (requestError.message?.includes("selectExtension") || 
        requestError.message?.includes("Unexpected error")) {
      
      console.log("🔄 Detected selectExtension error, trying alternative methods...")
      
      // Method 2 - enable() for older wallets
      if (provider.enable) {
        try {
          console.log("2️⃣ Trying enable() method...")
          const accounts = await provider.enable()
          console.log("✅ Success with enable() method")
          return accounts
        } catch (enableError) {
          console.warn("❌ enable() method failed:", enableError)
        }
      }
      
      // Method 3 - send() method
      if (provider.send) {
        try {
          console.log("3️⃣ Trying send() method...")
          const accounts = await provider.send("eth_requestAccounts", [])
          console.log("✅ Success with send() method")
          return accounts
        } catch (sendError) {
          console.warn("❌ send() method failed:", sendError)
        }
      }
      
      // Method 4 - Direct provider access for Phantom
      if (provider.isPhantom && window.ethereum.providers) {
        console.log("4️⃣ Trying direct Phantom provider access...")
        try {
          // Find non-phantom provider
          const nonPhantomProvider = window.ethereum.providers.find(
            (p: any) => !p.isPhantom && p.isMetaMask
          )
          
          if (nonPhantomProvider) {
            const accounts = await nonPhantomProvider.request({
              method: "eth_requestAccounts",
            })
            console.log("✅ Success with non-Phantom provider")
            return accounts
          }
        } catch (directError) {
          console.warn("❌ Direct provider access failed:", directError)
        }
      }
    }
    
    // Re-throw the original error if all methods fail
    throw requestError
  }
}

/**
 * Log wallet environment for debugging
 */
export function logWalletEnvironment(): void {
  const diagnostic = diagnoseWalletEnvironment()
  
  console.group("🔍 Wallet Environment Diagnostic")
  console.log("Has Ethereum:", diagnostic.hasEthereum)
  console.log("Providers count:", diagnostic.providers.length)
  console.log("Multiple providers:", diagnostic.multipleProvidersDetected)
  console.log("Phantom detected:", diagnostic.phantomDetected)
  
  if (diagnostic.preferredProvider) {
    console.log("Preferred provider:", getWalletName(diagnostic.preferredProvider))
  }
  
  if (diagnostic.conflicts.length > 0) {
    console.warn("⚠️ Conflicts:", diagnostic.conflicts)
  }
  
  if (diagnostic.recommendations.length > 0) {
    console.info("💡 Recommendations:", diagnostic.recommendations)
  }
  
  console.groupEnd()
}

/**
 * Show user-friendly error message based on diagnostic
 */
export function getErrorMessage(error: any): { title: string; message: string; suggestions: string[] } {
  const diagnostic = diagnoseWalletEnvironment()
  
  if (error.message?.includes("selectExtension") || error.message?.includes("Unexpected error")) {
    return {
      title: "Multiple Wallet Extensions Detected",
      message: "Your browser has multiple wallet extensions that are conflicting with each other.",
      suggestions: [
        "Disable all wallet extensions except MetaMask",
        "Refresh the page and try again",
        "Open MetaMask directly and connect from there",
        "Try using a different browser with only MetaMask installed"
      ]
    }
  }
  
  if (error.code === 4001) {
    return {
      title: "Connection Rejected",
      message: "You rejected the wallet connection request.",
      suggestions: [
        "Click 'Connect Wallet' again",
        "Accept the connection request in your wallet",
        "Make sure your wallet is unlocked"
      ]
    }
  }
  
  if (error.code === -32002) {
    return {
      title: "Connection Request Pending",
      message: "A connection request is already pending.",
      suggestions: [
        "Check your wallet extension for a pending request",
        "Complete or cancel the pending request",
        "Try again after resolving the pending request"
      ]
    }
  }
  
  if (diagnostic.phantomDetected && !diagnostic.multipleProvidersDetected) {
    return {
      title: "Phantom Wallet Detected",
      message: "You have only Phantom wallet installed, which may not be fully compatible.",
      suggestions: [
        "Install MetaMask for better compatibility",
        "Try using Phantom's Ethereum connection",
        "Consider using a browser with MetaMask"
      ]
    }
  }
  
  return {
    title: "Connection Failed",
    message: error.message || "Failed to connect wallet",
    suggestions: [
      "Make sure your wallet is unlocked",
      "Refresh the page and try again",
      "Check if your wallet supports this network",
      "Try using MetaMask if you have other wallets installed"
    ]
  }
}