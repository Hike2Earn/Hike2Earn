"use client";

import { MapWidget } from "./map-widget";
import { StatsWidget } from "./stats-widget";
import { ChallengeWidget } from "./challenge-widget";
import { AchievementsWidget } from "./achievements-widget";
import { LeaderboardWidget } from "./leaderboard-widget";
import { WeatherWidget } from "./weather-widget";

interface BentoGridProps {
  sidePanelOpen?: boolean;
  onPeakSelect?: (peakId: number | null) => void;
  selectedPeakId?: number | null;
}

export function BentoGrid({
  sidePanelOpen = false,
  onPeakSelect,
  selectedPeakId,
}: BentoGridProps) {
  return (
    <div
      className={`
      grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2
      lg:grid-rows-[minmax(150px,1fr)_minmax(200px,auto)_auto]
      transition-all duration-300 ease-in-out
      ${sidePanelOpen ? "lg:grid-cols-3 lg:mr-[28rem]" : "lg:grid-cols-4"}
    `}
    >
      {/* Map Widget - Left column, spans 2 rows */}
      <div
        className={`
        lg:row-span-2 lg:col-start-1 lg:row-start-1
        max-h-[300px] lg:max-h-[350px] overflow-hidden
        ${sidePanelOpen ? "lg:col-span-1" : "lg:col-span-2"}
      `}
      >
        <MapWidget
          onPeakSelect={onPeakSelect}
          selectedPeakId={selectedPeakId}
        />
      </div>

      {/* Medals Showcase - Right column, single row */}
      <div
        className={`
        lg:row-span-1 lg:row-start-1
        ${
          sidePanelOpen
            ? "lg:col-span-2 lg:col-start-2"
            : "lg:col-span-2 lg:col-start-3"
        }
      `}
      >
        <AchievementsWidget />
      </div>

      {/* Stats Widget - Row 2, position based on panel state */}
      <div
        className={`
        lg:row-span-1 lg:row-start-2
        ${
          sidePanelOpen
            ? "lg:col-span-1 lg:col-start-1"
            : "lg:col-span-1 lg:col-start-1"
        }
      `}
      >
        <StatsWidget />
      </div>

      {/* Weather Widget - Row 2, position based on panel state */}
      <div
        className={`
        lg:row-span-1 lg:row-start-2
        ${
          sidePanelOpen
            ? "lg:col-span-1 lg:col-start-2"
            : "lg:col-span-1 lg:col-start-2"
        }
      `}
      >
        <WeatherWidget />
      </div>

      {/* Challenge Widget - Row 2, right columns */}
      <div
        className={`
        lg:row-span-1 lg:row-start-2
        ${
          sidePanelOpen
            ? "lg:col-span-1 lg:col-start-3"
            : "lg:col-span-2 lg:col-start-3"
        }
      `}
      >
        <ChallengeWidget />
      </div>

      {/* Leaderboard - Bottom full width */}
      <div
        className={`
        lg:row-span-1 lg:row-start-3 lg:col-start-1
        ${sidePanelOpen ? "lg:col-span-3" : "lg:col-span-4"}
      `}
      >
        <LeaderboardWidget />
      </div>
    </div>
  );
}
