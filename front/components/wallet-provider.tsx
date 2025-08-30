"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { ethers } from "ethers"
import { connectWallet as connectWalletUtil, isWalletAvailable, LISK_NETWORK_CONFIG, getHikeTokenBalance } from "@/lib/web3"
import { getBestProvider, getErrorMessage, diagnoseWalletEnvironment } from "@/lib/wallet-utils"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: string
  hikeBalance: string
  isLoading: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchToLisk: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState("0")
  const [hikeBalance, setHikeBalance] = useState("0")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const connectWallet = async () => {
    console.log("🚀 Starting wallet connection process...")
    
    // First check if any wallet is available
    if (!isWalletAvailable()) {
      const diagnostic = diagnoseWalletEnvironment()
      const errorMsg = diagnostic.recommendations.length > 0 
        ? diagnostic.recommendations[0]
        : "No wallet extension detected. Please install MetaMask or another Web3 wallet."
      
      console.error("❌ Wallet availability check failed:", errorMsg)
      setError(errorMsg)
      alert("MetaMask not detected!\n\nPlease install MetaMask from https://metamask.io to connect your wallet.")
      return
    }

    console.log("✅ Wallet extension detected, proceeding with connection...")

    try {
      setIsLoading(true)
      setError(null)
      console.log("⏳ Setting loading state and clearing previous errors...")

      console.log("🔗 Calling connectWalletUtil with advanced error handling...")
      const walletAddress = await connectWalletUtil()
      console.log("📍 Received wallet address:", walletAddress)

      if (walletAddress) {
        console.log("✅ Valid wallet address received, updating state...")
        setAddress(walletAddress)
        setIsConnected(true)

        console.log("💰 Fetching LSK balance...")
        // Get LSK balance using the best provider
        const bestProvider = getBestProvider()
        
        if (bestProvider) {
          const provider = new ethers.BrowserProvider(bestProvider)
          const balance = await provider.getBalance(walletAddress)
          const formattedBalance = ethers.formatEther(balance)
          console.log("💰 LSK Balance:", formattedBalance)
          setBalance(formattedBalance)
        } else {
          console.warn("⚠️ Could not get provider for balance check")
          setBalance("0")
        }

        console.log("🪙 Fetching HIKE token balance...")
        // Get HIKE balance from contract
        try {
          const hikeBalance = await getHikeTokenBalance(walletAddress)
          console.log("🪙 HIKE Balance:", hikeBalance)
          setHikeBalance(hikeBalance.toString())
        } catch (hikeError) {
          console.warn("⚠️ Could not fetch HIKE balance:", hikeError)
          setHikeBalance("0")
        }

        console.log("🎉 Wallet connection completed successfully!")
        alert("Wallet connected successfully! 🎉")
      } else {
        throw new Error("Failed to get wallet address")
      }
    } catch (err: any) {
      console.error("❌ Wallet connection error:", err)
      
      // Use advanced error handling
      const errorInfo = getErrorMessage(err)
      console.error("📝 Error details:", errorInfo)
      
      const errorMessage = err.message || "Failed to connect wallet"
      
      // Create user-friendly message
      let userMessage = `${errorInfo.title}\n\n${errorInfo.message}`
      
      if (errorInfo.suggestions.length > 0) {
        userMessage += "\n\nSuggestions:\n" + errorInfo.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")
      }
      
      console.error("❌ Error message:", errorMessage)
      setError(errorMessage)
      setIsConnected(false)
      setAddress(null)
      
      // Show user-friendly error message
      alert(userMessage)
    } finally {
      console.log("🔄 Cleaning up - setting loading to false...")
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress(null)
    setBalance("0")
    setHikeBalance("0")
    setError(null)
  }

  const switchToLisk = async () => {
    if (!isWalletAvailable()) return

    try {
      setIsLoading(true)
      setError(null)

      await window.ethereum!.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${LISK_NETWORK_CONFIG.chainId.toString(16)}` }],
      })
    } catch (switchError: any) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum!.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${LISK_NETWORK_CONFIG.chainId.toString(16)}`,
                chainName: LISK_NETWORK_CONFIG.name,
                nativeCurrency: {
                  name: LISK_NETWORK_CONFIG.currency,
                  symbol: LISK_NETWORK_CONFIG.currency,
                  decimals: 18,
                },
                rpcUrls: [LISK_NETWORK_CONFIG.rpcUrl],
                blockExplorerUrls: [LISK_NETWORK_CONFIG.blockExplorer],
              },
            ],
          })
        } catch (addError: any) {
          console.warn("Failed to add Lisk Network:", addError)
          if (addError.code === 4001) {
            setError("User rejected adding Lisk Network")
          }
        }
      } else if (switchError.code === 4001) {
        setError("User rejected network switch")
      } else {
        console.warn("Failed to switch to Lisk Network:", switchError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only set up account change listeners if wallet is already connected
    if (isConnected && isWalletAvailable()) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("🔄 Account changed:", accounts)
        
        if (accounts.length === 0) {
          console.log("📤 No accounts - disconnecting wallet")
          disconnectWallet()
        } else if (accounts[0] !== address) {
          console.log("🔄 Switching to new account:", accounts[0])
          setAddress(accounts[0])
          
          // Refresh balance when account changes
          if (accounts[0]) {
            const refreshBalance = async () => {
              try {
                const bestProvider = getBestProvider()
                
                if (bestProvider) {
                  const provider = new ethers.BrowserProvider(bestProvider)
                  const balance = await provider.getBalance(accounts[0])
                  const formattedBalance = ethers.formatEther(balance)
                  console.log("💰 Updated balance:", formattedBalance)
                  setBalance(formattedBalance)
                } else {
                  console.warn("⚠️ Could not get provider for balance refresh")
                }
              } catch (err) {
                console.warn("⚠️ Could not refresh balance:", err)
              }
            }
            refreshBalance()
          }
        }
      }

      // Use the best provider for event listeners
      const bestProvider = getBestProvider()
      if (bestProvider && bestProvider.on) {
        bestProvider.on("accountsChanged", handleAccountsChanged)

        return () => {
          if (bestProvider.removeListener) {
            bestProvider.removeListener("accountsChanged", handleAccountsChanged)
          }
        }
      } else if (window.ethereum?.on) {
        // Fallback to window.ethereum
        window.ethereum.on("accountsChanged", handleAccountsChanged)

        return () => {
          if (window.ethereum?.removeListener) {
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          }
        }
      }
    }
  }, [isConnected, address])

  const value: WalletContextType = {
    isConnected,
    address,
    balance,
    hikeBalance,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    switchToLisk,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
