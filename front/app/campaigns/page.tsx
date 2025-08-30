"use client"

import { useState } from "react"
import { MountainBackground } from "@/components/mountain-background"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mountain, Calendar, Users, Trophy, MapPin, Clock, Search, Filter, Plus } from "lucide-react"
import { CreateCampaignModal } from "@/components/create-campaign-modal"
import { createCampaign } from "@/lib/campaign-utils"
import Link from "next/link"

interface Campaign {
  id: string
  title: string
  description: string
  type: "summit" | "cleanup" | "training" | "expedition"
  difficulty: "beginner" | "intermediate" | "advanced" | "expert"
  mountain: string
  location: string
  startDate: string
  endDate: string
  duration: string
  participants: number
  maxParticipants: number
  reward: number
  image: string
  elevation: string
}

const allCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Aconcagua Summit Expedition",
    description: "Join us for an epic 14-day expedition to reach the highest peak in the Americas at 6,962m. This challenging expedition requires advanced mountaineering skills and excellent physical condition.",
    type: "summit",
    difficulty: "expert",
    mountain: "Aconcagua",
    location: "Mendoza, Argentina",
    startDate: "2025-01-15",
    endDate: "2025-01-29",
    duration: "14 days",
    participants: 8,
    maxParticipants: 12,
    reward: 2500,
    image: "/campaigns/aconcagua.jpg",
    elevation: "6,962m"
  },
  {
    id: "2", 
    title: "Cerro Plomo Day Hike",
    description: "Perfect training hike for intermediate climbers with stunning views of Santiago. Experience high altitude hiking in a safe, guided environment.",
    type: "training",
    difficulty: "intermediate", 
    mountain: "Cerro Plomo",
    location: "Santiago, Chile",
    startDate: "2025-01-20",
    endDate: "2025-01-20",
    duration: "1 day",
    participants: 15,
    maxParticipants: 25,
    reward: 350,
    image: "/campaigns/cerro-plomo.jpg",
    elevation: "5,424m"
  },
  {
    id: "3",
    title: "Andes Trail Clean-up",
    description: "Help preserve our beautiful mountain trails while enjoying nature and earning rewards. Perfect for beginners and families. All equipment provided.",
    type: "cleanup",
    difficulty: "beginner",
    mountain: "Various Trails",
    location: "Cordillera Central",
    startDate: "2025-01-25",
    endDate: "2025-01-25", 
    duration: "6 hours",
    participants: 32,
    maxParticipants: 50,
    reward: 200,
    image: "/campaigns/trail-cleanup.jpg",
    elevation: "2,100m"
  },
  {
    id: "4",
    title: "Volcán Villarrica Trek",
    description: "Experience the thrill of climbing an active volcano with professional guides. Ice axe and crampon training included.",
    type: "summit",
    difficulty: "advanced",
    mountain: "Volcán Villarrica",
    location: "Pucón, Chile",
    startDate: "2025-02-01",
    endDate: "2025-02-03",
    duration: "3 days",
    participants: 6,
    maxParticipants: 15,
    reward: 800,
    image: "/campaigns/volcan-villarrica.jpg",
    elevation: "2,847m"
  },
  {
    id: "5",
    title: "Patagonia Base Camp Trek",
    description: "Multi-day trekking expedition through Torres del Paine with professional guides and full camping equipment provided.",
    type: "expedition",
    difficulty: "advanced",
    mountain: "Torres del Paine",
    location: "Patagonia, Chile",
    startDate: "2025-02-10",
    endDate: "2025-02-17",
    duration: "8 days",
    participants: 4,
    maxParticipants: 12,
    reward: 1200,
    image: "/campaigns/torres-del-paine.jpg",
    elevation: "2,500m"
  },
  {
    id: "6",
    title: "Beginner Mountain Skills Course",
    description: "Learn essential mountain skills including navigation, safety, and basic climbing techniques in a safe environment.",
    type: "training",
    difficulty: "beginner",
    mountain: "Cerro San Cristóbal",
    location: "Santiago, Chile",
    startDate: "2025-01-28",
    endDate: "2025-01-28",
    duration: "4 hours",
    participants: 12,
    maxParticipants: 20,
    reward: 150,
    image: "/campaigns/skills-course.jpg",
    elevation: "880m"
  }
]

const typeColors = {
  summit: "bg-primary/20 text-primary border-primary/30",
  cleanup: "bg-green-500/20 text-green-400 border-green-500/30",
  training: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  expedition: "bg-purple-500/20 text-purple-400 border-purple-500/30"
}

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  expert: "bg-red-500/20 text-red-400 border-red-500/30"
}

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([])

  // Combine default campaigns with user-created campaigns
  const allAvailableCampaigns = [...allCampaigns, ...userCampaigns]

  const filteredCampaigns = allAvailableCampaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.mountain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === "all" || campaign.type === typeFilter
    const matchesDifficulty = difficultyFilter === "all" || campaign.difficulty === difficultyFilter

    return matchesSearch && matchesType && matchesDifficulty
  })

  const handleCreateCampaign = async (campaignData: any) => {
    try {
      // Use the campaign utilities for validation and creation
      const result = await createCampaign(campaignData)
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create campaign")
      }

      // Create local campaign representation for UI
      const newCampaign: Campaign = {
        id: result.campaignId || `user-${Date.now()}`,
        title: campaignData.name,
        description: campaignData.description,
        type: "summit", // Default type, could be derived from data
        difficulty: "intermediate", // Default difficulty, could be derived from mountain selection
        mountain: campaignData.mountainIds?.length > 0 ? "Multiple Mountains" : "Custom Route",
        location: "User Created",
        startDate: new Date(campaignData.startDate * 1000).toISOString().split('T')[0],
        endDate: new Date(campaignData.endDate * 1000).toISOString().split('T')[0],
        duration: Math.ceil((campaignData.endDate - campaignData.startDate) / (24 * 60 * 60)) + " days",
        participants: 0,
        maxParticipants: 20, // Default max participants
        reward: Math.floor(campaignData.prizePoolETH * 1000), // Convert ETH to HIKE tokens (simplified)
        image: "/campaigns/user-created.jpg",
        elevation: "Variable"
      }
      
      setUserCampaigns(prev => [newCampaign, ...prev])
      
    } catch (error) {
      console.error("Failed to create campaign:", error)
      throw error
    }
  }

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
                <h1 className="text-3xl font-bold text-gradient">Mountain Campaigns</h1>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-orange-500 hover:from-emerald-600 hover:to-orange-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Join exciting mountaineering campaigns, help preserve our trails, or improve your skills. 
              Create your own campaigns and earn HIKE tokens and exclusive NFTs while exploring the most beautiful peaks in the Andes.
            </p>
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
            {filteredCampaigns.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300 group cursor-pointer">
                  {/* Campaign Image */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className={`text-xs ${typeColors[campaign.type]}`}>
                        {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                      </Badge>
                      <Badge className={`text-xs ${difficultyColors[campaign.difficulty]}`}>
                        {campaign.difficulty.charAt(0).toUpperCase() + campaign.difficulty.slice(1)}
                      </Badge>
                    </div>
                    
                    {/* Mountain info overlay */}
                    <div className="absolute bottom-3 left-3 text-white">
                      <h4 className="font-semibold">{campaign.mountain}</h4>
                      <p className="text-sm opacity-90">{campaign.elevation}</p>
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
                        <span className="truncate">{campaign.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{campaign.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{campaign.participants}/{campaign.maxParticipants} joined</span>
                      </div>
                      <div className="flex items-center gap-2 text-secondary">
                        <Trophy className="w-4 h-4" />
                        <span className="font-semibold">{campaign.reward} HIKE</span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(campaign.startDate).toLocaleDateString()} 
                        {campaign.startDate !== campaign.endDate && 
                          ` - ${new Date(campaign.endDate).toLocaleDateString()}`
                        }
                      </span>
                    </div>

                    {/* Participants Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spots Available</span>
                        <span className="font-semibold">
                          {campaign.maxParticipants - campaign.participants} remaining
                        </span>
                      </div>
                      <div className="w-full bg-muted/30 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(campaign.participants / campaign.maxParticipants) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* No Results */}
          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <Mountain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms to find more campaigns.
              </p>
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
  )
}