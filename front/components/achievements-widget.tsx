"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Filter,
  TrendingUp,
  Trophy,
  Mountain,
  Route,
  Pickaxe,
  Crown,
  Star,
  Zap,
  Shield,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NFTBadge } from "@/components/nft-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface NFTAchievement {
  id: number;
  name: string;
  description: string;
  image: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  type: "campaign" | "free-climb";
  earnedAt: string;
  mountain?: string;
  altitude?: number;
  duration?: string;
  difficulty?: number;
  tokenId?: string;
  estimatedValue?: number;
}

const nftAchievements: NFTAchievement[] = [
  {
    id: 1,
    name: "Cerro Manquehue Conqueror",
    description: "Tu primera conquista en las alturas chilenas",
    image: "/cerros/cerroFranke.jpg",
    rarity: "common",
    type: "free-climb",
    earnedAt: "2 days ago",
    mountain: "Cerro Franke",
    altitude: 2100,
    duration: "3h 45m",
    difficulty: 2,
    tokenId: "0x001",
    estimatedValue: 25,
  },
  {
    id: 2,
    name: "Cerro Aconcagua Warrior",
    description: "Conquistaste la cumbre más alta de América",
    image: "/cerros/cerroAconcagua.jpg",
    rarity: "rare",
    type: "campaign",
    earnedAt: "1 week ago",
    mountain: "Cerro Aconcagua",
    altitude: 6961,
    duration: "5h 22m",
    difficulty: 4,
    tokenId: "0x002",
    estimatedValue: 75,
  },
  {
    id: 3,
    name: "Volcán Villarrica Elite",
    description: "Domaste el fuego interno de la tierra",
    image: "/cerros/volcanVillarica.jpg",
    rarity: "epic",
    type: "free-climb",
    earnedAt: "3 days ago",
    mountain: "Volcán Villarrica",
    altitude: 2847,
    duration: "8h 15m",
    difficulty: 5,
    tokenId: "0x003",
    estimatedValue: 150,
  },
  {
    id: 4,
    name: "Torres del Paine Legend",
    description: "La cúspide de la excelencia montañista chilena",
    image: "/cerros/torresDelPaine.jpg",
    rarity: "legendary",
    type: "campaign",
    earnedAt: "5 hours ago",
    mountain: "Torres del Paine",
    altitude: 3050,
    duration: "12h 30m",
    difficulty: 5,
    tokenId: "0x004",
    estimatedValue: 500,
  },
  {
    id: 5,
    name: "Cerro Adolfo Calle Explorer",
    description: "Descubriste las joyas ocultas de la cordillera",
    image: "/cerros/cerroAdolfoCalle.jpg",
    rarity: "rare",
    type: "free-climb",
    earnedAt: "1 day ago",
    mountain: "Cerro Adolfo Calle",
    altitude: 4200,
    duration: "4h 12m",
    difficulty: 3,
    tokenId: "0x005",
    estimatedValue: 60,
  },
  {
    id: 6,
    name: "Cerro San Bernardo Guardian",
    description: "Protector de las cumbres eternas de Chile",
    image: "/cerros/cerroSanBernardo2.jpg",
    rarity: "legendary",
    type: "campaign",
    earnedAt: "2 weeks ago",
    mountain: "Cerro San Bernardo",
    altitude: 3200,
    duration: "15h 45m",
    difficulty: 5,
    tokenId: "0x006",
    estimatedValue: 750,
  },
];

const rarityColors = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-yellow-600",
};

const rarityBorders = {
  common: "shadow-gray-400/20",
  rare: "shadow-blue-400/30",
  epic: "shadow-purple-400/40",
  legendary: "shadow-yellow-400/50 shadow-lg",
};

const typeIcons = {
  campaign: <Route className="w-4 h-4" />,
  "free-climb": <Pickaxe className="w-4 h-4" />,
};

const typeLabels = {
  campaign: "Campaign NFT",
  "free-climb": "Free Climb NFT",
};

const rarityIcons = {
  common: <Shield className="w-3 h-3" />,
  rare: <Star className="w-3 h-3" />,
  epic: <Zap className="w-3 h-3" />,
  legendary: <Crown className="w-3 h-3" />,
};

export function AchievementsWidget() {
  const [filterType, setFilterType] = useState<
    "all" | "campaign" | "free-climb"
  >("all");
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredNFTs = useMemo(() => {
    if (filterType === "all") return nftAchievements;
    return nftAchievements.filter((nft) => nft.type === filterType);
  }, [filterType]);

  const totalValue = useMemo(() => {
    return filteredNFTs.reduce(
      (sum, nft) => sum + (nft.estimatedValue || 0),
      0
    );
  }, [filteredNFTs]);

  const visibleNFTs = filteredNFTs.slice(currentIndex, currentIndex + 4);

  const nextSlide = () => {
    if (currentIndex + 4 < filteredNFTs.length) {
      setCurrentIndex(currentIndex + 4);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(Math.max(0, currentIndex - 4));
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl h-full min-h-[200px]">
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20">
              <Trophy className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gradient">Medals</h3>
              <p className="text-xs text-muted-foreground">
                {filteredNFTs.length} NFTs • {totalValue} HIKE
              </p>
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
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
            className={
              filterType === "all"
                ? "bg-gradient-to-r from-primary to-secondary"
                : "glass bg-transparent"
            }
          >
            All NFTs
          </Button>
          <Button
            variant={filterType === "campaign" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("campaign")}
            className={`flex items-center gap-2 ${
              filterType === "campaign"
                ? "bg-gradient-to-r from-primary to-secondary"
                : "glass bg-transparent"
            }`}
          >
            <Route className="w-4 h-4" />
            Campaigns
          </Button>
          <Button
            variant={filterType === "free-climb" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("free-climb")}
            className={`flex items-center gap-2 ${
              filterType === "free-climb"
                ? "bg-gradient-to-r from-primary to-secondary"
                : "glass bg-transparent"
            }`}
          >
            <Pickaxe className="w-4 h-4" />
            Free Climb
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
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    className={`relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 shadow-2xl ${
                      rarityBorders[nft.rarity]
                    } ${
                      nft.rarity === "legendary" ? "animate-pulse" : ""
                    } group-hover:shadow-3xl transition-all duration-500 transform-gpu border border-white/10`}
                  >
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
                      <Badge
                        className={`text-xs bg-gradient-to-r ${
                          rarityColors[nft.rarity]
                        } text-white border-0 shadow-lg animate-bounce-subtle flex items-center gap-1`}
                      >
                        {typeIcons[nft.type]}
                        {rarityIcons[nft.rarity]}
                        <span className="text-xs">
                          {nft.rarity.toUpperCase()}
                        </span>
                      </Badge>
                    </div>

                    {/* Floating Value Badge */}
                    <div className="absolute -top-1 -right-1 z-10">
                      <Badge
                        variant="outline"
                        className="text-xs bg-gradient-to-r from-black/80 to-gray-800/80 text-yellow-300 border-yellow-300/30 shadow-lg"
                      >
                        {nft.estimatedValue} HIKE
                      </Badge>
                    </div>

                    {/* Particles Effect for Legendary */}
                    {nft.rarity === "legendary" && (
                      <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                            style={{
                              left: `${20 + Math.random() * 60}%`,
                              top: `${20 + Math.random() * 60}%`,
                              animationDelay: `${Math.random() * 2}s`,
                              animationDuration: `${2 + Math.random()}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Hover Overlay with Glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end rounded-xl">
                      <div className="p-3 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="text-white text-xs font-bold truncate drop-shadow-lg">
                          {nft.name}
                        </div>
                        <div className="text-yellow-200 text-xs truncate">
                          {nft.mountain}
                        </div>
                        <div className="text-white/60 text-xs mt-1">
                          {nft.altitude}m • {nft.duration}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact Quick Stats */}
                  <div className="mt-1 text-center">
                    <div className="text-xs font-semibold truncate">
                      {nft.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {nft.earnedAt}
                    </div>
                  </div>
                </div>
              </DialogTrigger>

              {/* Enhanced Modal Content */}
              <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden bg-white border-2 border-gray-200 text-gray-900 mx-4 shadow-2xl">
                <div className="overflow-y-auto max-h-[80vh] pr-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-400">
                  <DialogHeader className="space-y-4">
                    {/* NFT Image */}
                    <div
                      className={`relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-xl border-2 border-gray-200 ${
                        rarityBorders[nft.rarity]
                      } mx-auto max-w-xs`}
                    >
                      <img
                        src={nft.image || "/placeholder.svg"}
                        alt={nft.name}
                        className="w-full h-full object-cover"
                      />
                      {nft.rarity === "legendary" && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse" />
                      )}
                    </div>

                    {/* NFT Title and Badges */}
                    <div className="text-center space-y-3">
                      <DialogTitle className="text-2xl font-bold text-gray-900">
                        {nft.name}
                      </DialogTitle>

                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Badge
                          className={`bg-gradient-to-r ${
                            rarityColors[nft.rarity]
                          } text-white border-0 px-3 py-1`}
                        >
                          {nft.rarity.toUpperCase()}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-sm border-gray-300 text-gray-700 bg-gray-50 px-3 py-1 flex items-center gap-2"
                        >
                          {typeIcons[nft.type]}
                          <span>{typeLabels[nft.type]}</span>
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-sm border-gray-300 text-gray-700 bg-gray-50 px-3 py-1"
                        >
                          #{nft.tokenId}
                        </Badge>
                      </div>
                    </div>
                  </DialogHeader>

                  {/* Description */}
                  <div className="mt-6 text-center">
                    <p className="text-gray-700 text-base leading-relaxed">
                      {nft.description}
                    </p>
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1 font-medium">
                        Mountain
                      </div>
                      <div className="text-gray-900 font-semibold">
                        {nft.mountain}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1 font-medium">
                        Altitude
                      </div>
                      <div className="text-gray-900 font-semibold">
                        {nft.altitude?.toLocaleString()}m
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1 font-medium">
                        Duration
                      </div>
                      <div className="text-gray-900 font-semibold">
                        {nft.duration}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1 font-medium">
                        Value
                      </div>
                      <div className="text-blue-600 font-semibold">
                        {nft.estimatedValue} HIKE
                      </div>
                    </div>
                    <div className="sm:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1 font-medium">
                        Difficulty
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < (nft.difficulty || 0)
                                ? "bg-yellow-500"
                                : "bg-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-gray-900 font-semibold">
                          {nft.difficulty}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Earned Date */}
                  <div className="mt-6 text-center">
                    <div className="text-sm text-gray-600">
                      Earned {nft.earnedAt}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-8">
                    <Button
                      variant="outline"
                      className="flex-1 bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                    >
                      View on Explorer
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share Trophy
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}

          {/* Enhanced Empty slots */}
          {Array.from({ length: Math.max(0, 4 - visibleNFTs.length) }).map(
            (_, index) => (
              <div
                key={`empty-${index}`}
                className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent hover:border-white/30 transition-colors duration-300 group"
              >
                <div className="text-center opacity-50 group-hover:opacity-70 transition-opacity">
                  <Mountain className="w-8 h-8 text-white/40 mx-auto mb-2" />
                  <div className="text-sm text-white/70 font-medium">
                    Next Medal
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Enhanced View All Button */}
        <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 text-white font-semibold py-3 shadow-lg hover:shadow-xl border border-white/20 backdrop-blur-sm">
          <Award className="w-5 h-5 mr-2" />
          View All Medals
          <span className="ml-2 text-xs bg-white/90 text-primary px-2 py-1 rounded-full font-medium">
            {nftAchievements.length - 4}+ more
          </span>
        </Button>
      </div>
    </div>
  );
}
