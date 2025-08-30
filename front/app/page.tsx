import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { MountainBackground } from "@/components/mountain-background"
// import { ContractStatus } from "@/components/contract-status"

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

      {/* Contract Status Section - Temporarily disabled */}
      {/*
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gradient mb-2">Smart Contract Status</h2>
            <p className="text-muted-foreground">
              Live connection to Hike2Earn contract on Flare Network
            </p>
          </div>
          <ContractStatus />
        </div>
      </section>
      */}
    </main>
  )
}
