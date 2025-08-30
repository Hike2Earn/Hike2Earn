"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "./wallet-provider"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { LISK_NETWORK_CONFIG } from "@/lib/web3"

// Utility function to format numbers with commas
const formatNumber = (num: string | number): string => {
  const numValue = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(numValue)) return '0'
  
  // Format with commas and up to 2 decimal places, but remove unnecessary zeros
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numValue)
}

// Utility function to format wallet address
const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function WalletButton() {
  const { isConnected, address, hikeBalance, connectWallet, disconnectWallet, isLoading, error } = useWallet()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleConnectWallet = async () => {
    console.log("🔘 Connect Wallet button clicked")
    console.log("📊 Current wallet state:", { isConnected, address, hikeBalance, isLoading, error })
    
    try {
      await connectWallet()
    } catch (err) {
      console.error("Button click error:", err)
    }
  }


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openInExplorer = () => {
    if (address) {
      window.open(`${LISK_NETWORK_CONFIG.blockExplorer}/address/${address}`, "_blank")
    }
  }

  if (!isConnected) {
    const hasError = error !== null
    const buttonColor = hasError ? '#dc2626' : (isLoading ? '#f59e0b' : '#2563eb')
    const hoverColor = hasError ? '#b91c1c' : (isLoading ? '#d97706' : '#1d4ed8')
    const borderColor = hasError ? '#ef4444' : (isLoading ? '#f59e0b' : '#3b82f6')
    
    return (
      <Button
        onClick={handleConnectWallet}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all text-white shadow-lg min-w-[140px] ${
          hasError ? 'bg-red-600 hover:bg-red-700 border-red-500' :
          isLoading ? 'bg-amber-500 hover:bg-amber-600 border-amber-400' :
          'bg-blue-600 hover:bg-blue-700 border-blue-500'
        }`}
        style={{ 
          backgroundColor: buttonColor, 
          color: 'white',
          border: `1px solid ${borderColor}`,
          minHeight: '40px'
        }}
        title={hasError ? `Error: ${error}` : undefined}
      >
        <Wallet className="w-4 h-4" />
        <span className="text-sm font-semibold">
          {isLoading ? "Connecting..." : hasError ? "Try Again" : "Connect Wallet"}
        </span>
      </Button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 border border-green-500 rounded-lg transition-all text-white shadow-lg min-w-[140px]"
        style={{ 
          backgroundColor: '#16a34a', 
          color: 'white',
          border: '1px solid #22c55e',
          minHeight: '40px'
        }}
      >
        <Wallet className="w-4 h-4 text-white" />
        <span className="text-sm font-semibold">
          {formatNumber(hikeBalance)} HIKE
        </span>
        <ChevronDown className={cn(
          "w-3 h-3 transition-transform text-white",
          isDropdownOpen && "rotate-180"
        )} />
      </Button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl z-50">
          <div className="p-3">
            {/* Account Info */}
            <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">
                  {formatAddress(address!)}
                </div>
                <div className="text-xs text-green-400">
                  Connected to Lisk
                </div>
              </div>
            </div>

            {/* Balance Display */}
            <div className="p-2 bg-white/5 rounded-lg mb-3">
              <div className="text-xs text-muted-foreground">HIKE Balance</div>
              <div className="text-lg font-bold text-white">
                {formatNumber(hikeBalance)} HIKE
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-1">
              <Button
                onClick={copyAddress}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-white hover:bg-white/10"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? "Copied!" : "Copy Address"}
              </Button>
              
              <Button
                onClick={openInExplorer}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-white hover:bg-white/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View in Explorer
              </Button>
              
              <div className="border-t border-white/10 my-2"></div>
              
              <Button
                onClick={disconnectWallet}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast for copied address */}
      {copied && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 backdrop-blur-md">
            <div className="text-sm text-green-200">Address copied to clipboard!</div>
          </div>
        </div>
      )}
    </div>
  )
}