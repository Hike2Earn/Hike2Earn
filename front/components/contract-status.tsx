"use client"

import { useState, useEffect } from "react"
import { useHike2Earn } from "@/hooks/useHike2Earn"
import { useWallet } from "./wallet-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Activity, Mountain, Trophy, RefreshCw, AlertCircle } from "lucide-react"

export function ContractStatus() {
  const { isConnected, address } = useWallet()
  const { 
    getCampaignCount, 
    getMountainCount, 
    getAllCampaigns,
    getUserNFTs,
    isLoading, 
    error 
  } = useHike2Earn()

  const [contractData, setContractData] = useState({
    campaignCount: 0,
    mountainCount: 0,
    campaigns: [] as any[],
    userNFTs: [] as number[],
    lastUpdated: null as Date | null
  })

  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadContractData = async () => {
    if (!isConnected) return
    
    setIsRefreshing(true)
    
    try {
      const [campaignCount, mountainCount, campaigns, nfts] = await Promise.all([
        getCampaignCount(),
        getMountainCount(),
        getAllCampaigns(),
        address ? getUserNFTs(address) : Promise.resolve([])
      ])

      setContractData({
        campaignCount,
        mountainCount,
        campaigns,
        userNFTs: nfts,
        lastUpdated: new Date()
      })
    } catch (error) {
      console.error("Error loading contract data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadContractData()
  }, [isConnected, address])

  if (!isConnected) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Contract Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            <span>Wallet not connected</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Connect your wallet to interact with the smart contract.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Connection Status */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            Contract Status
            <Button
              variant="ghost"
              size="sm"
              onClick={loadContractData}
              disabled={isRefreshing}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Connected
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            <div>Contract: 0xD9986...29570</div>
            {contractData.lastUpdated && (
              <div>Updated: {contractData.lastUpdated.toLocaleTimeString()}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Count */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {isLoading ? "..." : contractData.campaignCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Active campaigns
          </p>
        </CardContent>
      </Card>

      {/* Mountain Count */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mountain className="w-4 h-4" />
            Mountains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary">
            {isLoading ? "..." : contractData.mountainCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Available peaks
          </p>
        </CardContent>
      </Card>

      {/* User NFTs */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Your NFTs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-400">
            {isLoading ? "..." : contractData.userNFTs.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Climbing achievements
          </p>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-500/10 border border-red-500/20 md:col-span-2 lg:col-span-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold">Contract Error</span>
            </div>
            <p className="text-sm text-red-300 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Campaign Details */}
      {contractData.campaigns.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm">Live Contract Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contractData.campaigns.slice(0, 3).map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-semibold text-sm">{campaign.name || `Campaign #${campaign.id}`}</div>
                    <div className="text-xs text-muted-foreground">
                      Prize Pool: {campaign.prizePoolETH} ETH • Participants: {campaign.participantCount}
                    </div>
                  </div>
                  <Badge className={campaign.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                    {campaign.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}