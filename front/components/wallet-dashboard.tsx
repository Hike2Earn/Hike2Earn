"use client"

import { WalletHeader } from "./wallet-header"
import { WalletBalance } from "./wallet-balance"
import { TokenChart } from "./token-chart"
import { TransactionHistory } from "./transaction-history"
import { NFTGallery } from "./nft-gallery"
import { StakingSection } from "./staking-section"

export function WalletDashboard() {
  return (
    <div className="space-y-8">
      <WalletHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Wallet Info */}
        <div className="lg:col-span-2 space-y-6">
          <WalletBalance />
          <TokenChart />
          <TransactionHistory />
        </div>

        {/* Right Column - NFTs and Staking */}
        <div className="space-y-6">
          <StakingSection />
          <NFTGallery />
        </div>
      </div>
    </div>
  )
}
