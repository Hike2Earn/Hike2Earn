import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { MountainBackground } from "@/components/mountain-background"

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <MountainBackground />

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <FeaturesSection />
    </main>
  )
}
