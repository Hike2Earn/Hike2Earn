"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mountain,
  Calendar,
  Users,
  Trophy,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useWallet } from "@/components/wallet-provider";
import { useAutoMint } from "@/hooks/useAutoMint";
import Link from "next/link";

interface Campaign {
  id: string;
  title: string;
  description: string;
  type: "summit" | "cleanup" | "training" | "expedition";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  mountain: string;
  location: string;
  startDate: string;
  endDate: string;
  duration: string;
  participants: number;
  maxParticipants: number;
  reward: number;
  image: string;
  elevation: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Aconcagua Summit Expedition",
    description:
      "Join us for an epic 14-day expedition to reach the highest peak in the Americas at 6,962m.",
    type: "summit",
    difficulty: "expert",
    mountain: "Aconcagua",
    location: "Mendoza, Argentina",
    startDate: "2025-12-15",
    endDate: "2025-12-29",
    duration: "14 days",
    participants: 8,
    maxParticipants: 12,
    reward: 2500,
    image: "/cerros/cerroAconcagua.jpg",
    elevation: "6,962m",
  },
  {
    id: "2",
    title: "Cerro Plomo Day Hike",
    description:
      "Perfect training hike for intermediate climbers with stunning views of Santiago.",
    type: "training",
    difficulty: "intermediate",
    mountain: "Cerro Plomo",
    location: "Santiago, Chile",
    startDate: "2025-12-20",
    endDate: "2025-12-20",
    duration: "1 day",
    participants: 15,
    maxParticipants: 25,
    reward: 350,
    image: "/cerros/cerroFranke.jpg",
    elevation: "5,424m",
  },
  {
    id: "3",
    title: "Andes Trail Clean-up",
    description:
      "Help preserve our beautiful mountain trails while enjoying nature and earning rewards.",
    type: "cleanup",
    difficulty: "beginner",
    mountain: "Various Trails",
    location: "Cordillera Central",
    startDate: "2025-12-25",
    endDate: "2025-12-25",
    duration: "6 hours",
    participants: 32,
    maxParticipants: 50,
    reward: 200,
    image: "/cerros/cerroLomasAmarillas.jpg",
    elevation: "2,100m",
  },
  {
    id: "4",
    title: "Volcán Villarrica Trek",
    description:
      "Experience the thrill of climbing an active volcano with professional guides.",
    type: "summit",
    difficulty: "advanced",
    mountain: "Volcán Villarrica",
    location: "Pucón, Chile",
    startDate: "2026-01-01",
    endDate: "2026-01-03",
    duration: "3 days",
    participants: 6,
    maxParticipants: 15,
    reward: 800,
    image: "/cerros/volcanVillarica.jpg",
    elevation: "2,847m",
  },
];

export function CampaignsWidget() {
  const { address, isConnected } = useWallet();
  const { hasReservation, storageManager } = useAutoMint();

  // Helper function to check if user has reservation for a campaign
  const hasUserReservation = (campaignId: string): boolean => {
    if (!isConnected || !address) return false;
    return hasReservation(campaignId);
  };

  // Helper function to check if user has completed this campaign (has NFT)
  const hasCompletedCampaign = (campaignId: string): boolean => {
    if (!isConnected || !address) return false;

    const reservations = storageManager.getReservations(address);
    const campaignReservation = reservations.find(
      (r) => r.campaignId === campaignId
    );

    return (
      campaignReservation?.status === "completed" &&
      Boolean(campaignReservation.nftTokenId)
    );
  };

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Mountain className="w-5 h-5 text-primary" />
            Featured Campaigns
          </div>
          <Link href="/campaigns">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm hover:text-primary"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {mockCampaigns.map((campaign) => {
            const isReserved = hasUserReservation(campaign.id);
            const isCompleted = hasCompletedCampaign(campaign.id);

            return (
              <div key={campaign.id} className="min-w-[300px] group">
                <Link href={`/campaigns/${campaign.id}`}>
                  <div
                    className={`backdrop-blur-sm border rounded-lg p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer relative ${
                      isCompleted
                        ? "bg-green-500/10 border-green-500/30"
                        : isReserved
                        ? "bg-primary/10 border-primary/30"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    {/* Campaign Image */}
                    <div className="relative h-32 rounded-md overflow-hidden mb-3">
                      <Image
                        src={campaign.image}
                        alt={campaign.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          console.error(
                            `❌ Failed to load campaign image: ${campaign.image}`
                          );
                          // Fallback to gradient if image fails to load
                          e.currentTarget.style.display = "none";
                        }}
                        onLoad={() => {
                          console.log(
                            `✅ Successfully loaded campaign image: ${campaign.image}`
                          );
                        }}
                      />
                      {/* Fallback gradient if image fails */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/20 opacity-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Status Badge - Top Priority */}
                      {isCompleted && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-500/80 text-white border-green-400/50 backdrop-blur-sm">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completado
                          </Badge>
                        </div>
                      )}

                      {!isCompleted && isReserved && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-primary/80 text-white border-primary/50 backdrop-blur-sm">
                            <Star className="w-3 h-3 mr-1" />
                            Reservado
                          </Badge>
                        </div>
                      )}

                      {/* Mountain info overlay */}
                      <div className="absolute bottom-2 left-2 text-white">
                        <h4 className="font-semibold text-sm">
                          {campaign.mountain}
                        </h4>
                        <p className="text-xs opacity-90">
                          {campaign.elevation}
                        </p>
                      </div>
                    </div>

                    {/* Campaign Details */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {campaign.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {campaign.description}
                        </p>
                      </div>

                      {/* Campaign Info */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{campaign.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{campaign.duration}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>
                            {campaign.participants}/{campaign.maxParticipants}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-secondary">
                          <Trophy className="w-3 h-3" />
                          <span className="font-semibold">
                            {campaign.reward} HIKE
                          </span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(campaign.startDate).toLocaleDateString()}
                          {campaign.startDate !== campaign.endDate &&
                            ` - ${new Date(
                              campaign.endDate
                            ).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
