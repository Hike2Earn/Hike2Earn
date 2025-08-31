"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mountain,
  X,
  Calendar,
  Users,
  Trophy,
  MapPin,
  Clock,
  Activity,
  Thermometer,
  Navigation,
  Shield,
  Info,
  Camera,
  Star,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Play,
  Route,
} from "lucide-react";
import Image from "next/image";

interface Peak {
  id: number;
  name: string;
  nameEnglish: string;
  distance: string;
  altitude: string;
  difficulty: string;
  technicalGrade: string;
  reward: string;
  coordinates: [number, number];
  firstAscent: { year: number; climbers: string };
  climbingDuration: string;
  bestSeason: string;
  permits: string;
  basecamp: string;
  description: string;
  history: string;
  statistics: {
    successRate: string;
    averageDays: number;
    recordTime: string;
  };
  images: string[];
}

interface PeakDetailsSidePanelProps {
  peak: Peak | null;
  isOpen: boolean;
  onClose: () => void;
  onStartClimb?: (peakId: number) => void;
}

// Map peaks to cerros images
const getPeakImage = (peakName: string) => {
  const imageMap: Record<string, string> = {
    Aconcagua: "/cerros/cerroAconcagua.jpg",
    "Cerro Mercedario": "/cerros/cerroFranke.jpg",
    "Cerro Tupungato": "/cerros/cerroLomasAmarillas.jpg",
    "Cerro Plata": "/cerros/cerroSanBernardo2.jpg",
    "Cerro El Plomo": "/cerros/cerroSanCristobal.jpg",
    "Cerro Vallecitos": "/cerros/cerroAdolfoCalle.jpg",
  };
  return imageMap[peakName] || "/cerros/cerroAconcagua.jpg";
};

export function PeakDetailsSidePanel({
  peak,
  isOpen,
  onClose,
  onStartClimb,
}: PeakDetailsSidePanelProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!peak) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % peak.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + peak.images.length) % peak.images.length
    );
  };

  const handleStartClimb = () => {
    if (peak && onStartClimb) {
      onStartClimb(peak.id);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div
        className={`
        fixed top-0 right-0 h-full w-full sm:w-96 lg:w-[28rem] z-50
        bg-gradient-to-br from-background/98 to-muted/95 backdrop-blur-md
        border-l border-white/20 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        overflow-y-auto
      `}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Header with Image */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={getPeakImage(peak.name)}
            alt={peak.name}
            fill
            className="object-cover"
            onError={(e) => {
              console.error("Failed to load peak image:", e.currentTarget.src);
              e.currentTarget.style.display = "none";
            }}
            onLoad={() => {
              console.log(
                "Peak image loaded successfully:",
                getPeakImage(peak.name)
              );
            }}
          />

          {/* Fallback gradient if image fails */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 opacity-0" />

          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Peak Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
              {peak.name}
            </h1>
            <p className="text-white/90 text-base italic drop-shadow-md">
              "{peak.nameEnglish}"
            </p>
            <p className="text-white text-xl font-bold drop-shadow-lg mt-2">
              {peak.altitude}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">Distance</span>
              </div>
              <p className="text-sm font-semibold">{peak.distance}</p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">Duration</span>
              </div>
              <p className="text-sm font-semibold">{peak.climbingDuration}</p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3 h-3 text-secondary" />
                <span className="text-xs text-muted-foreground">
                  Success Rate
                </span>
              </div>
              <p className="text-sm font-semibold text-secondary">
                {peak.statistics.successRate}
              </p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-3 h-3 text-secondary" />
                <span className="text-xs text-muted-foreground">Reward</span>
              </div>
              <p className="text-sm font-semibold text-secondary">
                {peak.reward}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              About This Peak
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {peak.description}
            </p>
          </div>

          {/* Technical Information - Compact */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              Technical Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-xs text-muted-foreground">
                  Technical Grade
                </span>
                <span className="text-xs font-semibold">
                  {peak.technicalGrade}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-xs text-muted-foreground">
                  Best Season
                </span>
                <span className="text-xs font-semibold">{peak.bestSeason}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-xs text-muted-foreground">Base Camp</span>
                <span className="text-xs font-semibold text-right">
                  {peak.basecamp}
                </span>
              </div>
            </div>
          </div>

          {/* Historical Information - Compact */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Mountain className="w-4 h-4 text-primary" />
              History
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2 line-clamp-3">
              {peak.history}
            </p>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">First Ascent</span>
                <span className="font-semibold">{peak.firstAscent.year}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {peak.firstAscent.climbers}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Statistics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-primary/10 border border-primary/20 rounded-lg">
                <span className="text-xs text-muted-foreground">
                  Average Duration
                </span>
                <span className="text-xs font-semibold text-primary">
                  {peak.statistics.averageDays} days
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-secondary/10 border border-secondary/20 rounded-lg">
                <span className="text-xs text-muted-foreground">
                  Speed Record
                </span>
                <span className="text-xs font-semibold text-secondary">
                  {peak.statistics.recordTime}
                </span>
              </div>
            </div>
          </div>

          {/* Permits */}
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">
              Required Permits
            </div>
            <div className="text-xs font-semibold">{peak.permits}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/10 sticky bottom-0 bg-gradient-to-t from-background to-background/80 backdrop-blur-sm">
            <Button
              onClick={handleStartClimb}
              className="flex-1 text-sm h-10 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Climb
            </Button>
            <Button
              variant="outline"
              className="px-6 text-sm h-10 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 font-medium transition-all duration-200"
            >
              <Route className="w-4 h-4 mr-2" />
              Route
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
