"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "./wallet-provider"
import { Wallet, Copy, ExternalLink, AlertCircle } from "lucide-react"
import { useState } from "react"
import { FLARE_NETWORK_CONFIG } from "@/lib/web3" // Declare the variable here

export function WalletHeader() {
  const { isConnected, address, connectWallet, disconnectWallet, isLoading, error } = useWallet()
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl max-w-md mx-auto p-8">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Connect Your Wallet</h1>
              <p className="text-muted-foreground">
                Connect your wallet to view your HIKE tokens, NFT achievements, and manage your climbing rewards.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            <Button
              onClick={connectWallet}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold"
            >
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </Button>

            <div className="text-xs text-muted-foreground">
              Supports MetaMask and other Web3 wallets on Flare Network
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Wallet</h1>
        <p className="text-muted-foreground">Manage your HIKE tokens and climbing rewards</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Wallet Address */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl flex items-center gap-3 p-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold">{formatAddress(address!)}</div>
            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
              Flare Network
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={copyAddress} className="w-8 h-8 p-0">
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => window.open(`${FLARE_NETWORK_CONFIG.blockExplorer}/address/${address}`, "_blank")}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Disconnect Button */}
        <Button variant="outline" onClick={disconnectWallet} className="glass bg-transparent">
          Disconnect
        </Button>
      </div>

      {copied && (
        <div className="fixed top-4 right-4 z-50">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3">
            <div className="text-sm text-green-600">Address copied!</div>
          </div>
        </div>
      )}
    </div>
  )
}
