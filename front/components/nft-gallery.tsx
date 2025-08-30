"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, Eye } from "lucide-react"

const nftBadges = [
  {
    id: 1,
    name: "First Peak",
    image: "/mountain-badge-bronze.png",
    rarity: "common",
    description: "Completed your first climb",
    earnedAt: "2024-01-15",
  },
  {
    id: 2,
    name: "High Climber",
    image: "/mountain-badge-silver.png",
    rarity: "rare",
    description: "Reached 2000m altitude",
    earnedAt: "2024-01-20",
  },
  {
    id: 3,
    name: "Peak Master",
    image: "/mountain-badge-gold.png",
    rarity: "epic",
    description: "Completed 10 climbs",
    earnedAt: "2024-01-25",
  },
  {
    id: 4,
    name: "Summit King",
    image: "/mountain-badge-diamond.png",
    rarity: "legendary",
    description: "Reached 3000m altitude",
    earnedAt: "2024-01-30",
  },
]

const rarityColors = {
  common: "bg-gray-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-yellow-500",
}

export function NFTGallery() {
  const [selectedNFT, setSelectedNFT] = useState<number | null>(null)

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Award className="w-5 h-5 text-secondary" />
            NFT Achievements
          </div>
          <Badge variant="outline" className="text-xs">
            {nftBadges.length} Owned
          </Badge>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-4">
          {nftBadges.map((nft) => (
            <div
              key={nft.id}
              className="relative group cursor-pointer"
              onClick={() => setSelectedNFT(selectedNFT === nft.id ? null : nft.id)}
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:scale-105 transition-transform duration-300">
                <img src={nft.image || "/placeholder.svg"} alt={nft.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Rarity Indicator */}
                <div
                  className={`absolute top-2 right-2 w-3 h-3 rounded-full ${rarityColors[nft.rarity as keyof typeof rarityColors]} border border-white`}
                />

                {/* View Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button size="sm" variant="secondary" className="glass">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>

              <div className="mt-2">
                <div className="font-semibold text-sm truncate">{nft.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{nft.rarity}</div>
              </div>

              {/* NFT Details Modal */}
              {selectedNFT === nft.id && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                          <img
                            src={nft.image || "/placeholder.svg"}
                            alt={nft.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold">{nft.name}</h3>
                            <Badge
                              variant="outline"
                              className={`text-xs ${rarityColors[nft.rarity as keyof typeof rarityColors]} text-white border-0 capitalize`}
                            >
                              {nft.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{nft.description}</p>
                          <div className="text-xs text-muted-foreground">
                            Earned on {new Date(nft.earnedAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 glass bg-transparent"
                            onClick={() => setSelectedNFT(null)}
                          >
                            Close
                          </Button>
                          <Button className="flex-1 bg-gradient-to-r from-primary to-secondary">Share</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
