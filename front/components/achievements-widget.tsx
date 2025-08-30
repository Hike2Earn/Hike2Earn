"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Award, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const achievements = [
  {
    id: 1,
    name: "First Peak",
    description: "Complete your first climb",
    image: "/mountain-badge-bronze.png",
    rarity: "common",
    earnedAt: "2 days ago",
  },
  {
    id: 2,
    name: "High Climber",
    description: "Reach 2000m altitude",
    image: "/mountain-badge-silver.png",
    rarity: "rare",
    earnedAt: "1 week ago",
  },
  {
    id: 3,
    name: "Peak Master",
    description: "Complete 10 climbs",
    image: "/mountain-badge-gold.png",
    rarity: "epic",
    earnedAt: "3 days ago",
  },
  {
    id: 4,
    name: "Summit King",
    description: "Reach 3000m altitude",
    image: "/mountain-badge-diamond.png",
    rarity: "legendary",
    earnedAt: "5 hours ago",
  },
]

const rarityColors = {
  common: "bg-gray-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-yellow-500",
}

export function AchievementsWidget() {
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(null)

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl h-full">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Award className="w-5 h-5 text-secondary" />
            Recent Achievements
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="glass w-8 h-8 p-0 bg-transparent">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="glass w-8 h-8 p-0 bg-transparent">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex-shrink-0 cursor-pointer group"
              onClick={() => setSelectedAchievement(selectedAchievement === achievement.id ? null : achievement.id)}
            >
              <div className="relative">
                {/* NFT Badge */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:scale-110 transition-transform duration-300 relative">
                  <img
                    src={achievement.image || "/placeholder.svg"}
                    alt={achievement.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Rarity Indicator */}
                <div
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${rarityColors[achievement.rarity as keyof typeof rarityColors]} border-2 border-white`}
                />

                {/* Hover Details */}
                {selectedAchievement === achievement.id && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10">
                    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3 w-48 animate-in fade-in-0 zoom-in-95 duration-200">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm">{achievement.name}</div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${rarityColors[achievement.rarity as keyof typeof rarityColors]} text-white border-0 capitalize`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{achievement.description}</div>
                        <div className="text-xs text-muted-foreground">Earned {achievement.earnedAt}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Achievement Name */}
              <div className="mt-2 text-center">
                <div className="text-xs font-semibold truncate w-20">{achievement.name}</div>
                <div className="text-xs text-muted-foreground">{achievement.earnedAt}</div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <Button variant="outline" className="w-full glass bg-transparent">
            View All Achievements
          </Button>
        </div>
      </div>
    </div>
  )
}
