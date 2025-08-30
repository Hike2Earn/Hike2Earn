"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Trophy, TrendingUp } from "lucide-react"

const trendingChallenges = [
  { name: "Summit September", participants: 1247, reward: "500 HIKE" },
  { name: "Elevation Elite", participants: 892, reward: "300 HIKE" },
  { name: "Distance Demon", participants: 634, reward: "200 HIKE" },
]

const upcomingEvents = [
  { name: "Group Climb: Eagle Peak", date: "Oct 15", participants: 23 },
  { name: "Photography Hike", date: "Oct 18", participants: 15 },
  { name: "Sunrise Summit Challenge", date: "Oct 22", participants: 31 },
]

const topClimbers = [
  { name: "Emma Wilson", level: 25, points: 15420 },
  { name: "David Park", level: 23, points: 14890 },
  { name: "Lisa Chen", level: 22, points: 14230 },
]

export function SocialSidebar() {
  return (
    <div className="space-y-6">
      {/* Trending Challenges */}
      <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <h3 className="font-semibold text-white">Trending Challenges</h3>
        </div>
        <div className="space-y-3">
          {trendingChallenges.map((challenge, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
            >
              <div>
                <p className="font-medium text-white text-sm">{challenge.name}</p>
                <p className="text-xs text-gray-300">{challenge.participants} participants</p>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                {challenge.reward}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-5 w-5 text-orange-400" />
          <h3 className="font-semibold text-white">Upcoming Events</h3>
        </div>
        <div className="space-y-3">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="p-3 rounded-lg bg-white/10 hover:bg-white/15 transition-colors cursor-pointer">
              <p className="font-medium text-white text-sm">{event.name}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-300">{event.date}</p>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3 text-gray-300" />
                  <span className="text-xs text-gray-300">{event.participants}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4 bg-white/10 border-white/20 hover:bg-white/15">
          View All Events
        </Button>
      </div>

      {/* Top Climbers */}
      <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <h3 className="font-semibold text-white">Top Climbers</h3>
        </div>
        <div className="space-y-3">
          {topClimbers.map((climber, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-orange-500 text-white text-xs font-bold">
                {index + 1}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/mountain-climber-avatar.png" />
                <AvatarFallback>
                  {climber.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{climber.name}</p>
                <p className="text-xs text-gray-300">{climber.points.toLocaleString()} points</p>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                L{climber.level}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
