"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, Trophy, Mountain, Camera, Plus } from "lucide-react"

interface Post {
  id: string
  user: {
    name: string
    avatar: string
    level: number
  }
  content: string
  image?: string
  achievement?: {
    type: "summit" | "distance" | "elevation"
    title: string
    value: string
  }
  likes: number
  comments: number
  timestamp: string
  isLiked: boolean
}

const mockPosts: Post[] = [
  {
    id: "1",
    user: { name: "Alex Chen", avatar: "/mountain-climber-avatar.png", level: 15 },
    content:
      "Just conquered Mount Washington! The view from the summit was absolutely breathtaking. 4,302 feet of pure determination! 🏔️",
    image: "/mountain-summit-view.png",
    achievement: { type: "summit", title: "Summit Master", value: "4,302 ft" },
    likes: 24,
    comments: 8,
    timestamp: "2 hours ago",
    isLiked: false,
  },
  {
    id: "2",
    user: { name: "Sarah Johnson", avatar: "/mountain-climber-avatar.png", level: 12 },
    content: "Weekly challenge complete! 50 miles of hiking this week. The HIKE rewards are flowing in! 💪",
    achievement: { type: "distance", title: "Distance Warrior", value: "50 miles" },
    likes: 18,
    comments: 5,
    timestamp: "4 hours ago",
    isLiked: true,
  },
  {
    id: "3",
    user: { name: "Mike Rodriguez", avatar: "/mountain-climber-avatar.png", level: 20 },
    content: "Training for the community challenge next week. Who else is joining the group climb to Eagle Peak?",
    likes: 31,
    comments: 12,
    timestamp: "6 hours ago",
    isLiked: false,
  },
]

export function SocialFeed() {
  const [posts, setPosts] = useState(mockPosts)

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post,
      ),
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-xl p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/mountain-climber-avatar.png" />
            <AvatarFallback>YU</AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            className="flex-1 justify-start text-gray-200 bg-white/10 border-white/20 hover:bg-white/15"
          >
            <Plus className="h-4 w-4 mr-2" />
            Share your climbing adventure...
          </Button>
          <Button size="icon" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/15">
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Posts */}
      {posts.map((post) => (
        <div key={post.id} className="backdrop-blur-md bg-white/20 border border-white/30 rounded-xl p-6 space-y-4">
          {/* Post Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {post.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-white">{post.user.name}</h4>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Level {post.user.level}
                  </Badge>
                </div>
                <p className="text-sm text-gray-300">{post.timestamp}</p>
              </div>
            </div>
          </div>

          {/* Achievement Badge */}
          {post.achievement && (
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-emerald-500/20 to-orange-500/20 border border-emerald-500/30">
              <div className="p-2 rounded-full bg-emerald-500/30">
                {post.achievement.type === "summit" && <Mountain className="h-4 w-4 text-emerald-300" />}
                {post.achievement.type === "distance" && <Trophy className="h-4 w-4 text-emerald-300" />}
                {post.achievement.type === "elevation" && <Mountain className="h-4 w-4 text-emerald-300" />}
              </div>
              <div>
                <p className="font-semibold text-emerald-300">{post.achievement.title}</p>
                <p className="text-sm text-gray-300">{post.achievement.value}</p>
              </div>
            </div>
          )}

          {/* Post Content */}
          <p className="text-white leading-relaxed">{post.content}</p>

          {/* Post Image */}
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image || "/placeholder.svg"}
                alt="Post image"
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={`space-x-2 ${post.isLiked ? "text-red-400 hover:text-red-300" : "text-gray-300 hover:text-white"}`}
              >
                <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                <span>{post.likes}</span>
              </Button>
              <Button variant="ghost" size="sm" className="space-x-2 text-gray-300 hover:text-white">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments}</span>
              </Button>
              <Button variant="ghost" size="sm" className="space-x-2 text-gray-300 hover:text-white">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
