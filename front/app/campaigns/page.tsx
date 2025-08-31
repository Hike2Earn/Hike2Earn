"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MountainBackground } from "@/components/mountain-background";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mountain,
  Calendar,
  Users,
  Trophy,
  MapPin,
  Clock,
  Search,
  Plus,
  Wallet,
  CheckCircle,
  Star,
} from "lucide-react";
import Image from "next/image";
import { CreateCampaignModal } from "@/components/create-campaign-modal";
import { createCampaign } from "@/lib/campaign-utils";
import { useHike2Earn } from "@/hooks/useHike2Earn";
import { useWallet } from "@/components/wallet-provider";
import { useAutoMint } from "@/hooks/useAutoMint";
import { ErrorBoundary, useErrorHandler } from "@/components/error-boundary";
import {
  NetworkSwitcher,
  useNetworkStatus,
} from "@/components/network-switcher";
import {
  WalletErrorBoundary,
  useWalletErrorHandler,
} from "@/components/wallet-error-boundary";
import { useWalletConflictResolver } from "@/hooks/useWalletConflictResolver";
import { getNetworkDisplayInfo } from "@/lib/network-config";
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

interface CreateCampaignData {
  name: string;
  description: string;
  type?: string;
  difficulty?: string;
  location?: string;
  maxParticipants?: string;
  startDate: number;
  endDate: number;
  prizePoolLSK: number;
  mountainIds?: number[];
  erc20Tokens?: string[];
  erc20Amounts?: number[];
}

const allCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Aconcagua Trail Cleanup",
    description:
      "Help preserve the beautiful Aconcagua trails while enjoying nature and earning rewards. Join our cleanup initiative to maintain the pristine condition of one of the world's most iconic mountaineering routes.",
    type: "cleanup",
    difficulty: "intermediate",
    mountain: "Aconcagua",
    location: "Mendoza, Argentina",
    startDate: "2025-12-15",
    endDate: "2025-12-29",
    duration: "3 days",
    participants: 12,
    maxParticipants: 25,
    reward: 1000,
    image: "/cerros/cerroAconcagua.jpg",
    elevation: "6,962m",
  },
  {
    id: "2",
    title: "Cerro Plomo Day Hike",
    description:
      "Perfect training hike for intermediate climbers with stunning views of Santiago. Experience high altitude hiking in a safe, guided environment.",
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
      "Help preserve our beautiful mountain trails while enjoying nature and earning rewards. Perfect for beginners and families. All equipment provided.",
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
      "Experience the thrill of climbing an active volcano with professional guides. Ice axe and crampon training included.",
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
  {
    id: "5",
    title: "Patagonia Base Camp Trek",
    description:
      "Multi-day trekking expedition through Torres del Paine with professional guides and full camping equipment provided.",
    type: "expedition",
    difficulty: "advanced",
    mountain: "Torres del Paine",
    location: "Patagonia, Chile",
    startDate: "2026-01-10",
    endDate: "2026-01-17",
    duration: "8 days",
    participants: 4,
    maxParticipants: 12,
    reward: 1200,
    image: "/cerros/torresDelPaine.jpg",
    elevation: "2,500m",
  },
  {
    id: "6",
    title: "Beginner Mountain Skills Course",
    description:
      "Learn essential mountain skills including navigation, safety, and basic climbing techniques in a safe environment.",
    type: "training",
    difficulty: "beginner",
    mountain: "Cerro San Cristóbal",
    location: "Santiago, Chile",
    startDate: "2026-01-28",
    endDate: "2026-01-28",
    duration: "4 hours",
    participants: 12,
    maxParticipants: 20,
    reward: 150,
    image: "/cerros/cerroSanCristobal.jpg",
    elevation: "880m",
  },
  {
    id: "7",
    title: "Cerro Adolfo Calle Challenge",
    description:
      "Technical climbing adventure on Cerro Adolfo Calle with stunning views of the Andes. Perfect for experienced climbers looking to test their skills on challenging terrain.",
    type: "summit",
    difficulty: "advanced",
    mountain: "Cerro Adolfo Calle",
    location: "Mendoza, Argentina",
    startDate: "2026-02-15",
    endDate: "2026-02-17",
    duration: "3 days",
    participants: 3,
    maxParticipants: 8,
    reward: 950,
    image: "/cerros/cerroAdolfoCalle.jpg",
    elevation: "4,218m",
  },
  {
    id: "8",
    title: "Cerro San Bernardo Circuit",
    description:
      "Multi-peak adventure exploring both Cerro San Bernardo summits. Experience high-altitude camping and breathtaking panoramic views of the surrounding valleys.",
    type: "expedition",
    difficulty: "advanced",
    mountain: "Cerro San Bernardo",
    location: "Mendoza, Argentina",
    startDate: "2026-02-20",
    endDate: "2026-02-25",
    duration: "6 days",
    participants: 5,
    maxParticipants: 10,
    reward: 1100,
    image: "/cerros/cerroSanBernardo2.jpg",
    elevation: "4,500m",
  },
  {
    id: "9",
    title: "Cerro Stepánek Summit",
    description:
      "Challenging ascent to Cerro Stepánek with technical climbing sections. Join our experienced team for this rewarding mountaineering expedition.",
    type: "summit",
    difficulty: "expert",
    mountain: "Cerro Stepánek",
    location: "Patagonia, Chile",
    startDate: "2026-03-01",
    endDate: "2026-03-05",
    duration: "5 days",
    participants: 2,
    maxParticipants: 6,
    reward: 1400,
    image: "/cerros/cerroStepanek.jpg",
    elevation: "3,200m",
  },
];

function CampaignsPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);
  const [contractCampaigns, setContractCampaigns] = useState<Campaign[]>([]);
  const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);


  const { address, isConnected } = useWallet();
  const { hasReservation, storageManager } = useAutoMint();
  const {
    getAllCampaigns,
    isLoading: contractLoading,
    error: contractError,
    contractHealthy,
  } = useHike2Earn();
  const { chainId, needsSwitch, isSupported } = useNetworkStatus();

  const { handleError } = useErrorHandler();
  const {
    error: walletError,
    handleError: handleWalletError,
    retry: retryWallet,
  } = useWalletErrorHandler();
  const {
    status: conflictStatus,
    resolveConflicts,
    handleEvmAskError,
  } = useWalletConflictResolver();

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




  // Memoize the campaign loading function to avoid dependency issues
  // Load local campaigns from localStorage
  const loadLocalCampaigns = useCallback(() => {
    try {
      const storedCampaigns = localStorage.getItem("localCampaigns");

      if (storedCampaigns) {
        const localCampaigns = JSON.parse(storedCampaigns);
        setLocalCampaigns(localCampaigns);
      } else {
        setLocalCampaigns([]);
      }
    } catch (error) {
      setLocalCampaigns([]);
    }
  }, []);

  const loadContractCampaigns = useCallback(async () => {
    // Prevent concurrent loading
    if (isLoadingCampaigns) {
      return;
    }


    if (isConnected && contractHealthy && isSupported && !needsSwitch) {
      setIsLoadingCampaigns(true);

      try {
        const campaigns = await getAllCampaigns();


        if (!campaigns || !Array.isArray(campaigns)) {
          setContractCampaigns([]);
          return;
        }

        if (campaigns.length === 0) {
          setContractCampaigns([]);
          return;
        }

        // Available images from /cerros/ directory
        const availableImages = [
          "/cerros/cerroAconcagua.jpg",
          "/cerros/cerroAdolfoCalle.jpg",
          "/cerros/cerroFranke.jpg",
          "/cerros/cerroLomasAmarillas.jpg",
          "/cerros/cerroSanBernardo2.jpg",
          "/cerros/cerroSanBernardo3.jpg",
          "/cerros/cerroSanCristobal.jpg",
          "/cerros/cerroStepanek.jpg",
          "/cerros/san bernardo1.jpg",
          "/cerros/torresDelPaine.jpg",
          "/cerros/volcanVillarica.jpg",
        ];

        // Convert contract campaigns to UI format
        const formattedCampaigns: Campaign[] = campaigns.map(
          (campaign, index) => {

            // Use a different image for each campaign based on its index
            const imageIndex = index % availableImages.length;
            const campaignImage = availableImages[imageIndex];


            return {
              id: `contract-${campaign.id}`,
              title: campaign.name || `Mountain Campaign #${campaign.id}`,
              description: `Mountain climbing campaign with ${campaign.prizePoolLSK} LSK prize pool. Complete the challenge and earn rewards!`,
              type: "summit" as const,
              difficulty: "intermediate" as const,
              mountain: "Blockchain Mountain",
              location: "Lisk Blockchain",
              startDate: new Date(campaign.startDate * 1000)
                .toISOString()
                .split("T")[0],
              endDate: new Date(campaign.endDate * 1000)
                .toISOString()
                .split("T")[0],
              duration:
                Math.ceil(
                  (campaign.endDate - campaign.startDate) / (24 * 60 * 60)
                ) + " days",
              participants: campaign.participantCount,
              maxParticipants: Math.max(campaign.participantCount + 10, 50),
              reward: Math.floor(parseFloat(campaign.prizePoolLSK) * 100),
              image: campaignImage,
              elevation: "Blockchain Height",
            };
          }
        );



        setContractCampaigns(formattedCampaigns);
      } catch (error) {
        setContractCampaigns([]); // Clear campaigns on error

        // Handle different types of errors gracefully
        if (error instanceof Error) {
          if (
            error.message.includes("Unexpected error") ||
            error.message.includes("evmAsk.js") ||
            error.message.includes("selectExtension")
          ) {
          } else if (error.message.includes("user rejected")) {
          } else {
          }
        } else {
        }
      } finally {
        setIsLoadingCampaigns(false);
      }
    } else {
      // Clear campaigns if not connected or network wrong
      setContractCampaigns([]);
    }
  }, []); // Remove all dependencies to prevent infinite loops

  // Load campaigns from contract when conditions change
  useEffect(() => {
    if (isConnected && contractHealthy && isSupported && !needsSwitch) {
      loadContractCampaigns();
    } else {
      setContractCampaigns([]);
    }
  }, [isConnected, contractHealthy, isSupported, needsSwitch, chainId]); // Only depend on connection state

  // Load local campaigns on component mount
  useEffect(() => {
    loadLocalCampaigns();
  }, [loadLocalCampaigns]);

  // Combine all available campaigns with safety checks
  const allAvailableCampaigns = useMemo(() => {
    const combined = [
      ...allCampaigns,
      ...userCampaigns,
      ...contractCampaigns,
      ...localCampaigns,
    ].filter((campaign) => {
      // Safety check: ensure campaign has required properties
      if (!campaign || typeof campaign !== "object") {
        return false;
      }

      if (!campaign.id || !campaign.title || !campaign.description) {
        return false;
      }

      return true;
    });


    return combined;
  }, [allCampaigns, userCampaigns, contractCampaigns, localCampaigns]);

  const filteredCampaigns = allAvailableCampaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.mountain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || campaign.type === typeFilter;
    const matchesDifficulty =
      difficultyFilter === "all" || campaign.difficulty === difficultyFilter;

    return matchesSearch && matchesType && matchesDifficulty;
  });

  const handleCreateCampaign = async (
    campaignData: CreateCampaignData
  ): Promise<{ success: boolean; campaignId?: string; error?: string }> => {
    try {
      // Check if we're on the right network
      if (!isSupported || needsSwitch) {
        throw new Error(
          "Please switch to Lisk Sepolia network before creating campaigns"
        );
      }

      // Check if contract is healthy
      if (!contractHealthy) {
        throw new Error(
          "Smart contract not available. Please check your connection."
        );
      }

      // Use the campaign utilities for validation and creation
      const result = await createCampaign(campaignData);

      if (!result.success) {
        throw new Error(result.error || "Failed to create campaign");
      }

      // Create local campaign representation for UI
      const newCampaign: Campaign = {
        id: `user-${result.campaignId || Date.now()}`,
        title: campaignData.name,
        description: campaignData.description,
        type:
          (campaignData.type as
            | "summit"
            | "cleanup"
            | "training"
            | "expedition") ?? "summit",
        difficulty:
          (campaignData.difficulty as
            | "beginner"
            | "intermediate"
            | "advanced"
            | "expert") ?? "intermediate",
        mountain:
          (campaignData.mountainIds?.length || 0) > 0
            ? "Multiple Mountains"
            : "Custom Route",
        location: campaignData.location ?? "User Created",
        startDate: new Date(campaignData.startDate * 1000)
          .toISOString()
          .split("T")[0],
        endDate: new Date(campaignData.endDate * 1000)
          .toISOString()
          .split("T")[0],
        duration:
          Math.ceil(
            (campaignData.endDate - campaignData.startDate) / (24 * 60 * 60)
          ) + " days",
        participants: 0,
        maxParticipants: campaignData.maxParticipants
          ? parseInt(campaignData.maxParticipants)
          : 20,
        reward: Math.floor(campaignData.prizePoolLSK * 1000), // Convert LSK to HIKE tokens (simplified)
        image: "/cerros/cerroAconcagua.jpg",
        elevation: "Variable",
      };

      setUserCampaigns((prev) => [newCampaign, ...prev]);

      // Reload contract campaigns and local campaigns to show the new one
      setTimeout(() => {
        loadContractCampaigns();
        loadLocalCampaigns();
      }, 2000);

      return { success: true, campaignId: result.campaignId };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return { success: false, error: errorMessage };
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <MountainBackground />

      <div className="relative z-10">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Mountain className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-gradient">
                  Mountain Campaigns
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {/* Contract Status */}

                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-orange-500 hover:from-emerald-600 hover:to-orange-600 disabled:opacity-50"
                  disabled={!isConnected || !contractHealthy}
                  title={
                    !isConnected
                      ? "Connect your wallet to explore partnership opportunities"
                      : !contractHealthy
                      ? "Smart contract not available"
                      : "Create your own mountain climbing campaign"
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {!isConnected
                    ? "Connect Wallet"
                    : !contractHealthy
                    ? "Contract Unavailable"
                    : "Create Campaign"}
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Join exciting mountaineering campaigns, help preserve our trails,
              or improve your skills. Create your own campaigns and earn HIKE
              tokens and exclusive NFTs while exploring the most beautiful peaks
              in the Andes.
            </p>

            {/* Contract Status Info - Network Wrong */}
            {isConnected &&
              contractHealthy &&
              (!isSupported || needsSwitch) && (
                <div className="mt-3 p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-lg transition-all duration-300 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-amber-400">
                        🌐 Network Switch Required
                      </span>
                      <p className="text-xs text-muted-foreground/80 mt-0.5">
                        Switch to Lisk Sepolia to access all available campaigns
                      </p>
                      <p className="text-xs text-muted-foreground/80 mt-1">
                        Currently showing {allCampaigns.length} featured
                        campaigns (more campaigns will load when connected to
                        Lisk Sepolia)
                      </p>
                    </div>
                  </div>
                </div>
              )}


            {/* Contract Error */}
            {isConnected && !contractHealthy && (
              <div className="mt-3 p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg transition-all duration-300 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-red-400">
                      Smart Contract Issue
                    </span>
                    <p className="text-xs text-red-300/90 mt-0.5">
                      {contractError ||
                        "Unable to connect to smart contract. Some features may be limited."}
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      Showing {allCampaigns.length} featured campaigns
                    </p>

                  </div>
                </div>
              </div>
            )}

            {/* Connection Prompt */}
            {!isConnected && (
              <div className="mt-3 p-2.5 bg-blue-500/5 border border-blue-500/10 rounded-lg transition-all duration-300 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-blue-400">
                      Wallet Not Connected
                    </span>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">
                      Connect your wallet to view all available campaigns and
                      create new ones.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Network Switcher - show prominently when wrong network */}
            {isConnected && (needsSwitch || (!isSupported && chainId)) && (
              <div className="mt-3">
                <NetworkSwitcher
                  currentChainId={chainId || undefined}
                  onNetworkChanged={() => {
                    // Reload contract campaigns after network switch
                    setTimeout(() => loadContractCampaigns(), 1000);
                  }}
                />
              </div>
            )}

            {/* Network Status Warning */}
            {isConnected && chainId && !isSupported && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <div>
                    <span className="text-sm font-medium text-amber-400">
                      Network Status
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Connected to {getNetworkDisplayInfo(chainId).name} (Chain
                      ID: {chainId}). Smart contract features require Lisk
                      Sepolia network (Chain ID: 4202).
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>Debug Info:</strong> Expected: 4202, Current:{" "}
                      {chainId}, Match: {chainId === 4202 ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              >
                <option value="all">All Types</option>
                <option value="summit">Summit</option>
                <option value="cleanup">Clean-up</option>
                <option value="training">Training</option>
                <option value="expedition">Expedition</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => {
              try {
                const isReserved = hasUserReservation(campaign.id);
                const isCompleted = hasCompletedCampaign(campaign.id);

                return (
                  <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                    <div
                      className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300 group cursor-pointer relative ${
                        isCompleted
                          ? "bg-green-500/10 border-green-500/30"
                          : isReserved
                          ? "bg-primary/10 border-primary/30"
                          : ""
                      }`}
                    >
                      {/* Campaign Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={campaign.image}
                          alt={campaign.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // Fallback to gradient if image fails to load
                            e.currentTarget.style.display = "none";
                          }}
                          onLoad={() => {
                          }}
                        />
                        {/* Fallback gradient if image fails */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/20 opacity-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Status Badge - Top Priority */}
                        {isCompleted && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-green-500/80 text-white border-green-400/50 backdrop-blur-sm">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completado
                            </Badge>
                          </div>
                        )}

                        {!isCompleted && isReserved && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-primary/80 text-white border-primary/50 backdrop-blur-sm">
                              <Star className="w-3 h-3 mr-1" />
                              Reserved
                            </Badge>
                          </div>
                        )}

                        {/* Mountain info overlay */}
                        <div className="absolute bottom-3 left-3 text-white">
                          <h4 className="font-semibold">{campaign.mountain}</h4>
                          <p className="text-sm opacity-90">
                            {campaign.elevation}
                          </p>
                        </div>
                      </div>

                      {/* Campaign Content */}
                      <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {campaign.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {campaign.description}
                        </p>

                        {/* Campaign Info Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">
                              {campaign.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{campaign.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>
                              {campaign.participants}/{campaign.maxParticipants}{" "}
                              joined
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-secondary">
                            <Trophy className="w-4 h-4" />
                            <span className="font-semibold">
                              {campaign.reward} HIKE
                            </span>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(campaign.startDate).toLocaleDateString()}
                            {campaign.startDate !== campaign.endDate &&
                              ` - ${new Date(
                                campaign.endDate
                              ).toLocaleDateString()}`}
                          </span>
                        </div>

                        {/* Participants Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Spots Available
                            </span>
                            <span className="font-semibold">
                              {campaign.maxParticipants - campaign.participants}{" "}
                              remaining
                            </span>
                          </div>
                          <div className="w-full bg-muted/30 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  (campaign.participants /
                                    campaign.maxParticipants) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              } catch (renderError) {
                return (
                  <div
                    key={campaign.id}
                    className="backdrop-blur-md bg-red-500/10 border border-red-500/20 rounded-xl p-4"
                  >
                    <p className="text-red-400 text-sm font-semibold">
                      Error loading campaign
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {campaign.title || "Unknown campaign"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: {campaign.id}
                    </p>
                  </div>
                );
              }
            })}
          </div>

          {/* No Results */}
          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <Mountain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms to find more
                campaigns.
              </p>
              {isConnected &&
                contractHealthy &&
                contractCampaigns.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    No campaigns are stored in the smart contract yet. Try
                    checking your wallet connection and network.
                  </p>
                )}
            </div>
          )}
        </main>
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCampaign={handleCreateCampaign}
      />
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <WalletErrorBoundary>
      <ErrorBoundary
        onError={(error, errorInfo) => {
        }}
      >
        <CampaignsPageContent />
      </ErrorBoundary>
    </WalletErrorBoundary>
  );
}
