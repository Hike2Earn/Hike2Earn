"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  Users,
  Trophy,
  Target,
  Flame,
  Calendar,
  MapPin,
  Star,
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  badge: string;
  change: number; // Position change from last week
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  participants: number;
  maxParticipants: number;
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: "1",
    name: "Ana García",
    avatar: "/api/placeholder/32/32",
    score: 2847,
    badge: "🏔️ Summit Master",
    change: 2,
  },
  {
    id: "2",
    name: "Carlos Mendoza",
    avatar: "/api/placeholder/32/32",
    score: 2654,
    badge: "🌟 Trail Blazer",
    change: -1,
  },
  {
    id: "3",
    name: "María Silva",
    avatar: "/api/placeholder/32/32",
    score: 2398,
    badge: "🏆 Peak Conqueror",
    change: 1,
  },
  {
    id: "4",
    name: "José Rodríguez",
    avatar: "/api/placeholder/32/32",
    score: 2156,
    badge: "⚡ Speed Demon",
    change: 0,
  },
  {
    id: "5",
    name: "Laura Torres",
    avatar: "/api/placeholder/32/32",
    score: 1987,
    badge: "🌄 Sunrise Chaser",
    change: 3,
  },
];

const mockEvents: UpcomingEvent[] = [
  {
    id: "1",
    title: "Cerro Manquehue Sunrise Hike",
    date: "Dec 15, 2024",
    location: "Cerro Manquehue",
    participants: 12,
    maxParticipants: 20,
  },
  {
    id: "2",
    title: "Cajón del Maipo Group Trek",
    date: "Dec 18, 2024",
    location: "Cajón del Maipo",
    participants: 8,
    maxParticipants: 15,
  },
  {
    id: "3",
    title: "Trail Cleanup Day",
    date: "Dec 20, 2024",
    location: "Various Trails",
    participants: 25,
    maxParticipants: 30,
  },
];

export function SocialSidebar() {
  const [userStats] = useState({
    totalDistance: 145.7,
    totalElevation: 8765,
    monthlyGoal: 200,
    monthlyProgress: 145.7,
    rank: 42,
    totalRank: 1250,
  });

  return (
    <div className="space-y-6">
      {/* User Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Target className="w-5 h-5 mr-2 text-emerald-400" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Monthly Goal Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Monthly Goal</span>
              <span className="text-white">
                {userStats.monthlyProgress}km / {userStats.monthlyGoal}km
              </span>
            </div>
            <Progress
              value={(userStats.monthlyProgress / userStats.monthlyGoal) * 100}
              className="h-2"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-emerald-400">
                {userStats.totalDistance}km
              </div>
              <div className="text-xs text-gray-400">Total Distance</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {userStats.totalElevation}m
              </div>
              <div className="text-xs text-gray-400">Elevation Gain</div>
            </div>
          </div>

          {/* Rank */}
          <div className="text-center pt-2 border-t border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Global Rank</div>
            <div className="text-xl font-bold text-yellow-400">
              #{userStats.rank}
            </div>
            <div className="text-xs text-gray-500">
              of {userStats.totalRank.toLocaleString()} climbers
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLeaderboard.map((user, index) => (
              <div key={user.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 text-center">
                  <span
                    className={`text-sm font-bold ${
                      index === 0
                        ? "text-yellow-400"
                        : index === 1
                        ? "text-gray-400"
                        : index === 2
                        ? "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    #{index + 1}
                  </span>
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name}
                    </p>
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {user.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">
                    {user.score.toLocaleString()} pts
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {user.change > 0 && (
                    <span className="text-xs text-green-400 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />+{user.change}
                    </span>
                  )}
                  {user.change < 0 && (
                    <span className="text-xs text-red-400">{user.change}</span>
                  )}
                  {user.change === 0 && (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-400" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockEvents.map((event) => (
              <div
                key={event.id}
                className="border border-gray-700 rounded-lg p-3"
              >
                <h4 className="font-medium text-white mb-2">{event.title}</h4>
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {event.participants}/{event.maxParticipants} joined
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-orange-500 hover:from-emerald-600 hover:to-orange-600"
                  disabled={event.participants >= event.maxParticipants}
                >
                  {event.participants >= event.maxParticipants
                    ? "Full"
                    : "Join Event"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Flame className="w-4 h-4 mr-2 text-orange-400" />
            Start New Hike
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Users className="w-4 h-4 mr-2 text-blue-400" />
            Find Hiking Buddies
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Star className="w-4 h-4 mr-2 text-yellow-400" />
            View Achievements
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
