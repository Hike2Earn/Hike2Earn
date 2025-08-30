import { BentoGrid } from "@/components/bento-grid"
import { MountainBackground } from "@/components/mountain-background"

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <MountainBackground />

      <div className="relative z-10">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BentoGrid />
        </main>
      </div>
    </div>
  )
}
