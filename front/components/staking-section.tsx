"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Zap, TrendingUp, Clock } from "lucide-react"

export function StakingSection() {
  const [stakeAmount, setStakeAmount] = useState([100])
  const [isStaking, setIsStaking] = useState(false)

  const currentStaked = 500
  const availableBalance = 1247.56
  const apy = 12.5
  const estimatedRewards = (stakeAmount[0] * apy) / 100

  const handleStake = () => {
    setIsStaking(true)
    // Simulate staking transaction
    setTimeout(() => {
      setIsStaking(false)
      // Update UI with new staked amount
    }, 2000)
  }

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Zap className="w-5 h-5 text-primary" />
          Staking
        </div>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Current Staking Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Currently Staked</span>
            <span className="font-semibold">{currentStaked} HIKE</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">APY</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              {apy}%
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Rewards Earned</span>
            <span className="font-semibold text-primary">+23.4 HIKE</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <h4 className="font-semibold mb-4">Stake More HIKE</h4>

          {/* Stake Amount Slider */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Amount to Stake</span>
                <span className="font-semibold">{stakeAmount[0]} HIKE</span>
              </div>
              <Slider
                value={stakeAmount}
                onValueChange={setStakeAmount}
                max={availableBalance}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 HIKE</span>
                <span>{availableBalance.toFixed(0)} HIKE</span>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 glass text-xs bg-transparent"
                onClick={() => setStakeAmount([25])}
              >
                25
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 glass text-xs bg-transparent"
                onClick={() => setStakeAmount([50])}
              >
                50
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 glass text-xs bg-transparent"
                onClick={() => setStakeAmount([100])}
              >
                100
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 glass text-xs bg-transparent"
                onClick={() => setStakeAmount([Math.floor(availableBalance)])}
              >
                Max
              </Button>
            </div>

            {/* Estimated Rewards */}
            <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Estimated Annual Rewards</span>
              </div>
              <div className="text-lg font-bold text-primary">+{estimatedRewards.toFixed(1)} HIKE</div>
              <div className="text-xs text-muted-foreground">≈ ${(estimatedRewards * 0.128).toFixed(2)} USD</div>
            </div>

            {/* Stake Button */}
            <Button
              onClick={handleStake}
              disabled={isStaking || stakeAmount[0] === 0}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {isStaking ? "Staking..." : `Stake ${stakeAmount[0]} HIKE`}
            </Button>

            {/* Unstake Info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Unstaking period: 7 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
