"use client"

import { MapWidget } from "./widgets/map-widget"
import { StatsWidget } from "./widgets/stats-widget"
import { ChallengeWidget } from "./widgets/challenge-widget"
import { AchievementsWidget } from "./widgets/achievements-widget"
import { LeaderboardWidget } from "./widgets/leaderboard-widget"
import { WeatherWidget } from "./widgets/weather-widget"

export function BentoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
      {/* Map Widget - spans 2x2 on desktop */}
      <div className="lg:col-span-2 lg:row-span-2">
        <MapWidget />
      </div>

      {/* Today's Stats */}
      <div className="lg:col-span-1 lg:row-span-1">
        <StatsWidget />
      </div>

      {/* Weather Widget */}
      <div className="lg:col-span-1 lg:row-span-1">
        <WeatherWidget />
      </div>

      {/* Active Challenge */}
      <div className="lg:col-span-2 lg:row-span-1">
        <ChallengeWidget />
      </div>

      {/* Recent Achievements */}
      <div className="lg:col-span-2 lg:row-span-1">
        <AchievementsWidget />
      </div>

      {/* Leaderboard */}
      <div className="lg:col-span-2 lg:row-span-1">
        <LeaderboardWidget />
      </div>
    </div>
  )
}
