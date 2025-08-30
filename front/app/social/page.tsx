import { Suspense } from "react"
import { SocialFeed } from "@/components/social-feed"
import { SocialSidebar } from "@/components/social-sidebar"
import { CreatePostModal } from "@/components/create-post-modal"

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            <Suspense fallback={<div>Loading feed...</div>}>
              <SocialFeed />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <SocialSidebar />
          </div>
        </div>
      </div>

      <CreatePostModal />
    </div>
  )
}
