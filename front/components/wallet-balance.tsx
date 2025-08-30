"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "./wallet-provider"
import { Coins, Zap, Send, ArrowDownToLine } from "lucide-react"

export function WalletBalance() {
  const { balance, peakBalance } = useWallet()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* FLR Balance */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            Flare (FLR)
          </div>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div>
            <div className="text-3xl font-bold text-foreground">{Number.parseFloat(balance).toFixed(4)}</div>
            <div className="text-sm text-muted-foreground">≈ $42.18 USD</div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
            <Button size="sm" variant="outline" className="flex-1 glass bg-transparent">
              <ArrowDownToLine className="w-4 h-4 mr-2" />
              Receive
            </Button>
          </div>
        </div>
      </div>

      {/* HIKE Balance */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            HIKE Tokens
          </div>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div>
            <div className="text-3xl font-bold text-primary">{Number.parseFloat(peakBalance).toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">≈ $156.89 USD</div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-secondary">
              <Coins className="w-4 h-4 mr-2" />
              Stake
            </Button>
            <Button size="sm" variant="outline" className="flex-1 glass bg-transparent">
              <Send className="w-4 h-4 mr-2" />
              Transfer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
