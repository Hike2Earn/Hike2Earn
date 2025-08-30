"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Award, ChevronLeft, ChevronRight, Filter, TrendingUp, Trophy, Mountain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NFTBadge } from "@/components/nft-badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"

interface NFTAchievement {
  id: number
  name: string
  description: string
  image: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  type: 'campaign' | 'free-climb'
  earnedAt: string
  mountain?: string
  altitude?: number
  duration?: string
  difficulty?: number
  tokenId?: string
  estimatedValue?: number
}

const nftAchievements: NFTAchievement[] = [
  {
    id: 1,
    name: "First Peak Conqueror",
    description: "Your journey begins with the first summit",
    image: "/mountain-badge-bronze.png",
    rarity: "common",
    type: "free-climb",
    earnedAt: "2 days ago",
    mountain: "Mount Wilson",
    altitude: 1742,
    duration: "3h 45m",
    difficulty: 2,
    tokenId: "0x001",
    estimatedValue: 25
  },
  {
    id: 2,
    name: "Alpine Warrior",
    description: "Conquered the heights above the clouds",
    image: "/mountain-badge-silver.png",
    rarity: "rare",
    type: "campaign",
    earnedAt: "1 week ago",
    mountain: "Mount Baldy",
    altitude: 3068,
    duration: "5h 22m",
    difficulty: 4,
    tokenId: "0x002",
    estimatedValue: 75
  },
  {
    id: 3,
    name: "Peak Master Elite",
    description: "Mastery through perseverance and skill",
    image: "/mountain-badge-gold.png",
    rarity: "epic",
    type: "free-climb",
    earnedAt: "3 days ago",
    mountain: "Mount Whitney",
    altitude: 4421,
    duration: "8h 15m",
    difficulty: 5,
    tokenId: "0x003",
    estimatedValue: 150
  },
  {
    id: 4,
    name: "Summit King Legend",
    description: "The pinnacle of mountaineering excellence",
    image: "/mountain-badge-diamond.png",
    rarity: "legendary",
    type: "campaign",
    earnedAt: "5 hours ago",
    mountain: "Mount Denali",
    altitude: 6190,
    duration: "12h 30m",
    difficulty: 5,
    tokenId: "0x004",
    estimatedValue: 500
  },
  {
    id: 5,
    name: "Canyon Explorer",
    description: "Discovered hidden gems in the depths",
    image: "/canyon-badge-bronze.png",
    rarity: "rare",
    type: "free-climb",
    earnedAt: "1 day ago",
    mountain: "Antelope Canyon",
    altitude: 1200,
    duration: "4h 12m",
    difficulty: 3,
    tokenId: "0x005",
    estimatedValue: 60
  },
  {
    id: 6,
    name: "Glacier Guardian",
    description: "Braved the frozen peaks of eternity",
    image: "/glacier-badge-diamond.png",
    rarity: "legendary",
    type: "campaign",
    earnedAt: "2 weeks ago",
    mountain: "Mount Everest Base",
    altitude: 5364,
    duration: "15h 45m",
    difficulty: 5,
    tokenId: "0x006",
    estimatedValue: 750
  }
]

const rarityColors = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-yellow-600",
}

const rarityBorders = {
  common: "shadow-gray-400/20",
  rare: "shadow-blue-400/30",
  epic: "shadow-purple-400/40",
  legendary: "shadow-yellow-400/50 shadow-lg",
}

const typeIcons = {
  campaign: "🏆",
  "free-climb": "🏔️"
}

const typeLabels = {
  campaign: "Campaign NFT",
  "free-climb": "Free Climb NFT"
}

export function AchievementsWidget() {
  const [filterType, setFilterType] = useState<'all' | 'campaign' | 'free-climb'>('all')
  const [currentIndex, setCurrentIndex] = useState(0)

  const filteredNFTs = useMemo(() => {
    if (filterType === 'all') return nftAchievements
    return nftAchievements.filter(nft => nft.type === filterType)
  }, [filterType])

  const totalValue = useMemo(() => {
    return filteredNFTs.reduce((sum, nft) => sum + (nft.estimatedValue || 0), 0)
  }, [filteredNFTs])

  const visibleNFTs = filteredNFTs.slice(currentIndex, currentIndex + 4)

  const nextSlide = () => {
    if (currentIndex + 4 < filteredNFTs.length) {
      setCurrentIndex(currentIndex + 4)
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(Math.max(0, currentIndex - 4))
    }
  }

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl h-full min-h-[200px]">
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20">
              <Trophy className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gradient">NFT Trophy Showcase</h3>
              <p className="text-xs text-muted-foreground">{filteredNFTs.length} NFTs • {totalValue} HIKE</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="glass bg-transparent p-2"
              onClick={prevSlide}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="glass bg-transparent p-2"
              onClick={nextSlide}
              disabled={currentIndex + 4 >= filteredNFTs.length}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
            className={filterType === 'all' ? 'bg-gradient-to-r from-primary to-secondary' : 'glass bg-transparent'}
          >
            All NFTs
          </Button>
          <Button
            variant={filterType === 'campaign' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('campaign')}
            className={filterType === 'campaign' ? 'bg-gradient-to-r from-primary to-secondary' : 'glass bg-transparent'}
          >
            🏆 Campaigns
          </Button>
          <Button
            variant={filterType === 'free-climb' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('free-climb')}
            className={filterType === 'free-climb' ? 'bg-gradient-to-r from-primary to-secondary' : 'glass bg-transparent'}
          >
            🏔️ Free Climb
          </Button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {visibleNFTs.map((nft, index) => (
            <Dialog key={nft.id}>
              <DialogTrigger asChild>
                <div
                  className="relative cursor-pointer group perspective-1000 nft-card-hover animate-in slide-in-from-bottom-4 fade-in-0"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className={`relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 shadow-2xl ${rarityBorders[nft.rarity]} ${nft.rarity === 'legendary' ? 'animate-pulse' : ''} group-hover:shadow-3xl transition-all duration-500 transform-gpu border border-white/10`}>
                    {/* NFT Badge */}
                    <div className="aspect-square relative">
                      <NFTBadge 
                        type={nft.type}
                        rarity={nft.rarity}
                        name={nft.name}
                        size={60}
                      />
                    </div>

                    {/* Floating Type Badge */}
                    <div className="absolute -top-1 -left-1 z-10">
                      <Badge className={`text-xs bg-gradient-to-r ${rarityColors[nft.rarity]} text-white border-0 shadow-lg animate-bounce-subtle`}>
                        {typeIcons[nft.type]} {nft.rarity.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Floating Value Badge */}
                    <div className="absolute -top-1 -right-1 z-10">
                      <Badge variant="outline" className="text-xs bg-gradient-to-r from-black/80 to-gray-800/80 text-yellow-300 border-yellow-300/30 shadow-lg">
                        {nft.estimatedValue} HIKE
                      </Badge>
                    </div>

                    {/* Particles Effect for Legendary */}
                    {nft.rarity === 'legendary' && (
                      <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                            style={{
                              left: `${20 + Math.random() * 60}%`,
                              top: `${20 + Math.random() * 60}%`,
                              animationDelay: `${Math.random() * 2}s`,
                              animationDuration: `${2 + Math.random()}s`
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Hover Overlay with Glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end rounded-xl">
                      <div className="p-3 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="text-white text-xs font-bold truncate drop-shadow-lg">{nft.name}</div>
                        <div className="text-yellow-200 text-xs truncate">{nft.mountain}</div>
                        <div className="text-white/60 text-xs mt-1">{nft.altitude}m • {nft.duration}</div>
                      </div>
                    </div>
                  </div>

                  {/* Compact Quick Stats */}
                  <div className="mt-1 text-center">
                    <div className="text-xs font-semibold truncate">{nft.name}</div>
                    <div className="text-xs text-muted-foreground">{nft.earnedAt}</div>
                  </div>
                </div>
              </DialogTrigger>
              
              {/* Enhanced Modal Content */}
              <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden backdrop-blur-xl bg-white/5 border-white/10 text-white mx-4">
                <div className="overflow-y-auto max-h-[80vh] pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
                  <DialogHeader className="space-y-4">
                    {/* NFT Image */}
                    <div className={`relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 shadow-xl ${rarityBorders[nft.rarity]} mx-auto max-w-xs`}>
                      <img
                        src={nft.image || "/placeholder.svg"}
                        alt={nft.name}
                        className="w-full h-full object-cover"
                      />
                      {nft.rarity === 'legendary' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      )}
                    </div>

                    {/* NFT Title and Badges */}
                    <div className="text-center space-y-3">
                      <DialogTitle className="text-2xl font-bold text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {nft.name}
                      </DialogTitle>
                      
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Badge className={`bg-gradient-to-r ${rarityColors[nft.rarity]} text-white border-0 px-3 py-1`}>
                          {nft.rarity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-white/20 text-white/80">
                          {typeIcons[nft.type]} {typeLabels[nft.type]}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-white/20 text-white/80">
                          #{nft.tokenId}
                        </Badge>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  {/* Description */}
                  <div className="mt-6 text-center">
                    <p className="text-white/80 text-sm leading-relaxed">{nft.description}</p>
                  </div>
                  
                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <div className="text-xs text-white/60 mb-1 font-medium">Mountain</div>
                      <div className="text-white font-semibold">{nft.mountain}</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <div className="text-xs text-white/60 mb-1 font-medium">Altitude</div>
                      <div className="text-white font-semibold">{nft.altitude?.toLocaleString()}m</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <div className="text-xs text-white/60 mb-1 font-medium">Duration</div>
                      <div className="text-white font-semibold">{nft.duration}</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <div className="text-xs text-white/60 mb-1 font-medium">Value</div>
                      <div className="text-yellow-400 font-semibold">{nft.estimatedValue} HIKE</div>
                    </div>
                    <div className="sm:col-span-2 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <div className="text-xs text-white/60 mb-1 font-medium">Difficulty</div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i < (nft.difficulty || 0) ? 'bg-yellow-400' : 'bg-white/20'}`} />
                        ))}
                        <span className="ml-2 text-white font-semibold">{nft.difficulty}/5</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Earned Date */}
                  <div className="mt-6 text-center">
                    <div className="text-xs text-white/60">
                      Earned {nft.earnedAt}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-8">
                    <Button 
                      variant="outline" 
                      className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                    >
                      View on Explorer
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-opacity">
                      Share Trophy
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
          
          {/* Enhanced Empty slots */}
          {Array.from({ length: Math.max(0, 4 - visibleNFTs.length) }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent hover:border-white/30 transition-colors duration-300 group">
              <div className="text-center opacity-50 group-hover:opacity-70 transition-opacity">
                <Mountain className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <div className="text-xs text-white/40">Next Trophy</div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Stats Row */}
        <div className="flex items-center justify-between mb-4 p-4 rounded-xl bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/20 border border-white/10 shadow-lg">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-white">{filteredNFTs.length}</span>
              <span className="text-white/70">Trophies</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="font-bold text-white">{totalValue}</span>
              <span className="text-white/70">HIKE</span>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold shadow-lg">
            🏆 Elite Collection
          </Badge>
        </div>

        {/* Enhanced View All Button */}
        <Button className="w-full bg-gradient-to-r from-primary via-secondary to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 transition-all duration-700 text-white font-bold py-3 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]">
          <Trophy className="w-5 h-5 mr-2 animate-pulse" />
          View Complete Trophy Gallery
          <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
            {nftAchievements.length - 4}+ more
          </span>
        </Button>
      </div>

    </div>
  )
}
