"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, TrendingUp, TrendingDown, Minus } from "lucide-react"

const leaderboardData = [
  {
    id: 1,
    rank: 1,
    name: "Alex Mountain",
    avatar: "/climber-avatar-1.png",
    peakTokens: 15420,
    change: "up",
    isYou: false,
  },
  {
    id: 2,
    rank: 2,
    name: "Sarah Peak",
    avatar: "/climber-avatar-2.png",
    peakTokens: 14890,
    change: "down",
    isYou: false,
  },
  {
    id: 3,
    rank: 3,
    name: "Mike Summit",
    avatar: "/climber-avatar-3.png",
    peakTokens: 13750,
    change: "up",
    isYou: false,
  },
  {
    id: 4,
    rank: 4,
    name: "Emma Ridge",
    avatar: "/climber-avatar-4.png",
    peakTokens: 12340,
    change: "same",
    isYou: false,
  },
  {
    id: 5,
    rank: 5,
    name: "You",
    avatar: "/ai-avatar.png",
    peakTokens: 11247,
    change: "up",
    isYou: true,
  },
]

const changeIcons = {
  up: TrendingUp,
  down: TrendingDown,
  same: Minus,
}

const changeColors = {
  up: "text-green-500",
  down: "text-red-500",
  same: "text-muted-foreground",
}

export function LeaderboardWidget() {
  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl h-full">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Crown className="w-5 h-5 text-secondary" />
            Leaderboard
          </div>
          <Badge variant="outline" className="text-xs">
            Weekly
          </Badge>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-3">
        {leaderboardData.map((user, index) => {
          const ChangeIcon = changeIcons[user.change as keyof typeof changeIcons]

          return (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                user.isYou ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/30"
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8">
                {user.rank === 1 ? (
                  <Crown className="w-5 h-5 text-yellow-500" />
                ) : (
                  <span className={`font-bold text-sm ${user.rank <= 3 ? "text-secondary" : "text-muted-foreground"}`}>
                    #{user.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm truncate ${user.isYou ? "text-primary" : "text-foreground"}`}>
                    {user.name}
                  </span>
                  {user.isYou && (
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                      You
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{user.peakTokens.toLocaleString()} HIKE</div>
              </div>

              {/* Change Indicator */}
              <div className={`${changeColors[user.change as keyof typeof changeColors]}`}>
                <ChangeIcon className="w-4 h-4" />
              </div>
            </div>
          )
        })}

        {/* View Full Leaderboard */}
        <div className="pt-3 border-t border-white/10">
          <Button variant="outline" className="w-full glass bg-transparent">
            View Full Leaderboard
          </Button>
        </div>
      </div>
    </div>
  )
}
