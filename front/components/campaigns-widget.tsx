"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mountain, Calendar, Users, Trophy, ArrowRight, MapPin, Clock } from "lucide-react"
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

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Aconcagua Summit Expedition",
    description: "Join us for an epic 14-day expedition to reach the highest peak in the Americas at 6,962m.",
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
    description: "Perfect training hike for intermediate climbers with stunning views of Santiago.",
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
    description: "Help preserve our beautiful mountain trails while enjoying nature and earning rewards.",
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
    description: "Experience the thrill of climbing an active volcano with professional guides.",
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

export function CampaignsWidget() {
  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Mountain className="w-5 h-5 text-primary" />
            Featured Campaigns
          </div>
          <Link href="/campaigns">
            <Button variant="ghost" size="sm" className="text-sm hover:text-primary">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {mockCampaigns.map((campaign) => (
            <div key={campaign.id} className="min-w-[300px] group">
              <Link href={`/campaigns/${campaign.id}`}>
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                  {/* Campaign Image */}
                  <div className="relative h-32 rounded-md overflow-hidden mb-3">
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge className={`text-xs ${typeColors[campaign.type]}`}>
                        {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                      </Badge>
                      <Badge className={`text-xs ${difficultyColors[campaign.difficulty]}`}>
                        {campaign.difficulty.charAt(0).toUpperCase() + campaign.difficulty.slice(1)}
                      </Badge>
                    </div>
                    
                    {/* Mountain info overlay */}
                    <div className="absolute bottom-2 left-2 text-white">
                      <h4 className="font-semibold text-sm">{campaign.mountain}</h4>
                      <p className="text-xs opacity-90">{campaign.elevation}</p>
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
                        <span>{campaign.participants}/{campaign.maxParticipants}</span>
                      </div>
                      <div className="flex items-center gap-1 text-secondary">
                        <Trophy className="w-3 h-3" />
                        <span className="font-semibold">{campaign.reward} HIKE</span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(campaign.startDate).toLocaleDateString()} 
                        {campaign.startDate !== campaign.endDate && 
                          ` - ${new Date(campaign.endDate).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}