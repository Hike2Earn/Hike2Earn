"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Mountain,
  Users,
  Trophy,
} from "lucide-react";

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    badge: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  location?: string;
  activity?: {
    type: "climb" | "achievement" | "group";
    mountain?: string;
    distance?: number;
    elevation?: number;
  };
}

const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "Ana García",
      avatar: "/api/placeholder/40/40",
      badge: "🏔️ Summit Master",
    },
    content:
      "¡Increíble ascenso al Cerro Manquehue! Las vistas desde la cima son espectaculares. ¿Alguien más ha hecho esta ruta?",
    image: "/api/placeholder/600/400",
    timestamp: "2h ago",
    likes: 24,
    comments: 8,
    shares: 3,
    location: "Cerro Manquehue, Chile",
    activity: {
      type: "climb",
      mountain: "Cerro Manquehue",
      distance: 8.5,
      elevation: 1632,
    },
  },
  {
    id: "2",
    author: {
      name: "Carlos Mendoza",
      avatar: "/api/placeholder/40/40",
      badge: "🌟 Trail Blazer",
    },
    content:
      "Nuevo logro desbloqueado: ¡100km recorridos este mes! La comunidad Hike2Earn me motiva a seguir adelante. 🏆",
    timestamp: "4h ago",
    likes: 156,
    comments: 23,
    shares: 12,
    activity: {
      type: "achievement",
      distance: 100,
    },
  },
  {
    id: "3",
    author: {
      name: "Grupo Los Andes",
      avatar: "/api/placeholder/40/40",
      badge: "👥 Adventure Team",
    },
    content:
      "¡Únete a nuestra expedición grupal al Cajón del Maipo! Saldremos este fin de semana. Experiencia de nivel intermedio requerida.",
    timestamp: "6h ago",
    likes: 89,
    comments: 45,
    shares: 28,
    location: "Cajón del Maipo, Chile",
    activity: {
      type: "group",
      mountain: "Cajón del Maipo",
    },
  },
];

export function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [loading, setLoading] = useState(false);

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleComment = (postId: string) => {
    // Placeholder for comment functionality
    console.log("Comment on post:", postId);
  };

  const handleShare = (postId: string) => {
    // Placeholder for share functionality
    console.log("Share post:", postId);
  };

  return (
    <div className="space-y-6">
      {/* Create Post Button */}
      <Card>
        <CardContent className="p-4">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            ✏️ Share Your Adventure
          </Button>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage
                    src={post.author.avatar}
                    alt={post.author.name}
                  />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white">
                      {post.author.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {post.author.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{post.timestamp}</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Activity Badge */}
            {post.activity && (
              <div className="mb-3">
                <Badge
                  variant="outline"
                  className="mb-2 border-emerald-500/20 text-emerald-400"
                >
                  {post.activity.type === "climb" && (
                    <>
                      <Mountain className="w-3 h-3 mr-1" />
                      Climbed {post.activity.mountain} •{" "}
                      {post.activity.distance}km • {post.activity.elevation}m
                      elevation
                    </>
                  )}
                  {post.activity.type === "achievement" && (
                    <>
                      <Trophy className="w-3 h-3 mr-1" />
                      Achievement: {post.activity.distance}km this month!
                    </>
                  )}
                  {post.activity.type === "group" && (
                    <>
                      <Users className="w-3 h-3 mr-1" />
                      Group Expedition to {post.activity.mountain}
                    </>
                  )}
                </Badge>
              </div>
            )}

            {/* Post Content */}
            <p className="text-white mb-3 leading-relaxed">{post.content}</p>

            {/* Post Image */}
            {post.image && (
              <div className="mb-3 rounded-lg overflow-hidden">
                <img
                  src={post.image}
                  alt="Post content"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Location */}
            {post.location && (
              <div className="flex items-center text-sm text-gray-400 mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                {post.location}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-700">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {post.likes}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleComment(post.id)}
                  className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {post.comments}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(post.id)}
                  className="text-gray-400 hover:text-green-400 hover:bg-green-500/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {post.shares}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More Button */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setLoading(true)}
          disabled={loading}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          {loading ? "Loading..." : "Load More Posts"}
        </Button>
      </div>
    </div>
  );
}
