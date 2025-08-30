"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { ethers } from "ethers"
import { connectWallet as connectWalletUtil, isWalletAvailable, FLARE_NETWORK_CONFIG } from "@/lib/web3"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: string
  hikeBalance: string
  isLoading: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchToFlare: () => Promise<void>
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
    if (!isWalletAvailable()) {
      setError("No wallet extension detected. Please install MetaMask or another Web3 wallet.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const walletAddress = await connectWalletUtil()

      if (walletAddress) {
        setAddress(walletAddress)
        setIsConnected(true)

        // Get FLR balance
        const provider = new ethers.BrowserProvider(window.ethereum!)
        const balance = await provider.getBalance(walletAddress)
        setBalance(ethers.formatEther(balance))

        // Mock HIKE balance (in real implementation, would call contract)
        setHikeBalance("1247.56")
      } else {
        throw new Error("Failed to get wallet address")
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err)
      setError(err.message || "Failed to connect wallet")
      setIsConnected(false)
      setAddress(null)
    } finally {
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

  const switchToFlare = async () => {
    if (!isWalletAvailable()) return

    try {
      setIsLoading(true)
      setError(null)

      await window.ethereum!.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${FLARE_NETWORK_CONFIG.chainId.toString(16)}` }],
      })
    } catch (switchError: any) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum!.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${FLARE_NETWORK_CONFIG.chainId.toString(16)}`,
                chainName: FLARE_NETWORK_CONFIG.name,
                nativeCurrency: {
                  name: FLARE_NETWORK_CONFIG.currency,
                  symbol: FLARE_NETWORK_CONFIG.currency,
                  decimals: 18,
                },
                rpcUrls: [FLARE_NETWORK_CONFIG.rpcUrl],
                blockExplorerUrls: [FLARE_NETWORK_CONFIG.blockExplorer],
              },
            ],
          })
        } catch (addError: any) {
          console.warn("Failed to add Flare Network:", addError)
          if (addError.code === 4001) {
            setError("User rejected adding Flare Network")
          }
        }
      } else if (switchError.code === 4001) {
        setError("User rejected network switch")
      } else {
        console.warn("Failed to switch to Flare Network:", switchError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only set up account change listeners if wallet is already connected
    if (isConnected && isWalletAvailable()) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (accounts[0] !== address) {
          setAddress(accounts[0])
          // Refresh balance when account changes
          if (accounts[0]) {
            const refreshBalance = async () => {
              try {
                const provider = new ethers.BrowserProvider(window.ethereum!)
                const balance = await provider.getBalance(accounts[0])
                setBalance(ethers.formatEther(balance))
              } catch (err) {
                console.warn("Could not refresh balance:", err)
              }
            }
            refreshBalance()
          }
        }
      }

      window.ethereum!.on("accountsChanged", handleAccountsChanged)

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
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
    switchToFlare,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
