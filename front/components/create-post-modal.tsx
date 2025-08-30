"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, MapPin, Trophy, X } from "lucide-react"

export function CreatePostModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePost = () => {
    // Handle post creation
    console.log("Creating post:", { content, image: selectedImage })
    setContent("")
    setSelectedImage(null)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Share Your Adventure</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/mountain-climber-avatar.png" />
              <AvatarFallback>YU</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-white">Your Name</p>
              <p className="text-sm text-muted-foreground">Level 12 Climber</p>
            </div>
          </div>

          {/* Content Input */}
          <Textarea
            placeholder="Share your climbing experience, achievement, or adventure..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-muted-foreground resize-none"
          />

          {/* Image Preview */}
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Upload preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label htmlFor="image-upload">
                <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10" asChild>
                  <span className="cursor-pointer">
                    <Camera className="h-4 w-4 mr-2" />
                    Photo
                  </span>
                </Button>
              </label>
              <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </Button>
              <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10">
                <Trophy className="h-4 w-4 mr-2" />
                Achievement
              </Button>
            </div>

            <Button
              onClick={handlePost}
              disabled={!content.trim()}
              className="bg-gradient-to-r from-emerald-500 to-orange-500 hover:from-emerald-600 hover:to-orange-600"
            >
              Share Adventure
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
