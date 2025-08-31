"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MountainBackground } from "@/components/mountain-background";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReservationSystem } from "@/components/campaign/reservation-system";
import { AutoVerificationModal } from "@/components/verification/auto-verification-modal";
import {
  Mountain,
  Calendar,
  Users,
  Trophy,
  MapPin,
  Clock,
  ArrowLeft,
  Thermometer,
  Activity,
  Navigation,
  Shield,
  Backpack,
  Heart,
  Star,
  CheckCircle,
  AlertTriangle,
  Camera,
  Play,
  Route,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Campaign {
  id: string;
  title: string;
  description: string;
  longDescription: string;
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
  distance: string;
  terrain: string;
  weather: string;
  technicalRating: string;
  equipment: string[];
  itinerary: { day: number; title: string; description: string }[];
  safetyGuidelines: string[];
  meetingPoint: string;
  guide: { name: string; experience: string; rating: number; avatar: string };
  participantAvatars: string[];
}

// Mock data - in real app this would come from an API
const mockCampaign: Campaign = {
  id: "1",
  title: "Aconcagua Trail Cleanup",
  description:
    "Help preserve the beautiful Aconcagua trails while enjoying nature and earning rewards.",
  longDescription:
    "Join our environmental initiative to clean and maintain the Aconcagua trails, one of the most iconic mountaineering routes in the world. This 3-day cleanup campaign combines environmental responsibility with the opportunity to experience the stunning beauty of the Andes.\n\nOur team will provide all necessary equipment and training for safe and effective trail maintenance. You'll work alongside experienced guides to collect litter, repair trail damage, and ensure that future generations can enjoy these magnificent mountains in their pristine condition.\n\nThis campaign is perfect for outdoor enthusiasts who want to give back to the mountaineering community while earning rewards. No previous mountaineering experience required - just a passion for preserving our natural environment.",
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
  distance: "45km total",
  terrain: "Mountain trails, moderate altitude",
  weather: "5°C to 20°C, variable conditions",
  technicalRating: "F (Facile)",
  equipment: [
    "Hiking boots",
    "Work gloves",
    "Trash bags and collection tools",
    "Daypack",
    "Water bottle",
    "Sunscreen and hat",
    "Light jacket",
    "All camping equipment provided",
  ],
  itinerary: [
    {
      day: 1,
      title: "Arrival in Mendoza & Training",
      description:
        "Team briefing, safety training, equipment distribution, and environmental awareness session",
    },
    {
      day: 2,
      title: "Trail Cleanup Day",
      description:
        "Full day of trail maintenance and cleanup work on Aconcagua access routes, collecting litter and repairing trail damage",
    },
    {
      day: 3,
      title: "Final Cleanup & Celebration",
      description:
        "Morning cleanup work, environmental impact assessment, team celebration, and return to Mendoza",
    },
  ],
  safetyGuidelines: [
    "Basic fitness level recommended",
    "Environmental awareness training provided",
    "Weather-appropriate clothing required",
    "Guides certified in wilderness first aid",
    "Emergency communication equipment",
    "Safe waste disposal procedures",
  ],
  meetingPoint: "Hotel Aconcagua, Mendoza city center",
  guide: {
    name: "Maria Rodriguez",
    experience: "8+ years in environmental conservation and trail maintenance",
    rating: 4.8,
    avatar: "/guides/carlos.jpg",
  },
  participantAvatars: [
    "/participants/p1.jpg",
    "/participants/p2.jpg",
    "/participants/p3.jpg",
    "/participants/p4.jpg",
    "/participants/p5.jpg",
    "/participants/p6.jpg",
    "/participants/p7.jpg",
    "/participants/p8.jpg",
  ],
};

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [joined, setJoined] = useState(false);
  const [showAllItinerary, setShowAllItinerary] = useState(false);
  const [hasReservation, setHasReservation] = useState(false);
  const [showSummitVerification, setShowSummitVerification] = useState(false);

  // In a real app, you'd fetch the campaign data based on the ID
  const campaign = mockCampaign;

  const handleJoinCampaign = () => {
    setJoined(true);
    // Here you would call your API to join the campaign
  };

  const handleStartClimb = () => {
    // Navigate to climb page with campaign context
    router.push(
      `/climb?campaign=${campaign.id}&mountain=${encodeURIComponent(
        campaign.mountain
      )}`
    );
  };

  const handleReservationChange = (hasRes: boolean) => {
    setHasReservation(hasRes);
    setJoined(hasRes); // Keep compatibility with existing logic
  };

  const handleSummitVerification = () => {
    setShowSummitVerification(true);
  };

  const closeSummitVerification = () => {
    setShowSummitVerification(false);
  };

  // Convert campaign data to match ReservationSystem interface
  const reservationCampaign = {
    id: campaign.id,
    title: campaign.title,
    mountain: campaign.mountain,
    location: campaign.location,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    mountainId: 0, // Mock mountain ID for smart contract
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <MountainBackground />

      <div className="relative z-10">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/campaigns">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaigns
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Section */}
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl overflow-hidden">
                {/* Hero Image */}
                <div className="relative h-64 md:h-80">
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

                  {/* Mountain info overlay */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      {campaign.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Mountain className="w-4 h-4" />
                        {campaign.mountain} - {campaign.elevation}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {campaign.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Campaign Info Bar */}
                <div className="p-6 border-b border-white/10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-foreground">
                          {new Date(campaign.startDate).toLocaleDateString()}
                        </div>
                        <div>{campaign.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-foreground">
                          {campaign.participants}/{campaign.maxParticipants}
                        </div>
                        <div>Participants</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-foreground">
                          {campaign.distance}
                        </div>
                        <div>Total Distance</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Trophy className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-secondary">
                          {campaign.reward} HIKE
                        </div>
                        <div>Reward</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    About This Expedition
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    {campaign.longDescription
                      .split("\n\n")
                      .map((paragraph, index) => (
                        <p
                          key={index}
                          className="text-muted-foreground mb-4 last:mb-0"
                        >
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </div>
              </div>

              {/* Itinerary */}
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Expedition Itinerary
                </h2>
                <div className="space-y-3">
                  {(showAllItinerary
                    ? campaign.itinerary
                    : campaign.itinerary.slice(0, 5)
                  ).map((day) => (
                    <div
                      key={day.day}
                      className="flex gap-4 p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {day.day}
                      </div>
                      <div>
                        <h4 className="font-medium">{day.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {campaign.itinerary.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllItinerary(!showAllItinerary)}
                    className="mt-4"
                  >
                    {showAllItinerary
                      ? "Show Less"
                      : `Show All ${campaign.itinerary.length} Days`}
                  </Button>
                )}
              </div>

              {/* Equipment & Safety */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Equipment */}
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Backpack className="w-5 h-5" />
                    Required Equipment
                  </h3>
                  <ul className="space-y-2">
                    {campaign.equipment.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Safety */}
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Safety Guidelines
                  </h3>
                  <ul className="space-y-2">
                    {campaign.safetyGuidelines.map((guideline, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span>{guideline}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Guide Information */}
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Your Guide</h3>
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                      <span className="text-lg font-semibold">CM</span>
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{campaign.guide.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {campaign.guide.experience}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(campaign.guide.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                      <span className="text-sm ml-1">
                        {campaign.guide.rating}/5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Mountain Characteristics */}
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mountain className="w-5 h-5" />
                  Mountain Details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Elevation</span>
                    <span className="font-semibold">{campaign.elevation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="font-semibold">{campaign.distance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Terrain</span>
                    <span className="font-semibold text-right flex-1 ml-4">
                      {campaign.terrain}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weather</span>
                    <span className="font-semibold text-right flex-1 ml-4">
                      {campaign.weather}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Technical Rating
                    </span>
                    <span className="font-semibold">
                      {campaign.technicalRating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rewards */}
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Rewards
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-secondary" />
                      <span className="font-medium">HIKE Tokens</span>
                    </div>
                    <span className="font-bold text-secondary">
                      {campaign.reward}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="font-medium">Achievement Badge</span>
                    </div>
                    <span className="text-primary">Summit Master</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-purple-400" />
                      <span className="font-medium">Special NFT</span>
                    </div>
                    <span className="text-purple-400">Aconcagua '25</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">Experience Points</span>
                    </div>
                    <span className="text-blue-400">+1,200 XP</span>
                  </div>
                </div>
              </div>

              {/* Campaign Participation */}
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold mb-1">
                    {campaign.maxParticipants - campaign.participants}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    spots remaining
                  </div>
                </div>

                <div className="w-full bg-muted/30 rounded-full h-2 mb-6">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (campaign.participants / campaign.maxParticipants) * 100
                      }%`,
                    }}
                  />
                </div>

                {/* Reservation System Component */}
                <ReservationSystem
                  campaign={reservationCampaign}
                  onReservationChange={handleReservationChange}
                />

                {/* Alternative: Direct Summit Verification */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Mountain className="w-4 h-4" />
                    Just want to verify the summit?
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    If you've already climbed {campaign.mountain} on your own, you can
                    verify your summit directly.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSummitVerification}
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Verify Summit Directly
                  </Button>
                </div>
              </div>

              {/* Participants */}
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participants ({campaign.participants})
                </h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  {campaign.participantAvatars.map((avatar, index) => (
                    <Avatar key={index} className="w-8 h-8">
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                        <span className="text-xs font-semibold">
                          {index + 1}
                        </span>
                      </div>
                    </Avatar>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-muted-foreground">
                    Community Rating:
                  </span>
                  <span className="font-semibold">4.8/5</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Summit Verification Modal */}
      <AutoVerificationModal
        isOpen={showSummitVerification}
        onClose={closeSummitVerification}
        type="summit"
        mountainId={0} // Mock mountain ID for smart contract
        mountainName={campaign.mountain}
      />
    </div>
  );
}
