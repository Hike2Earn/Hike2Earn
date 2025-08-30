"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Smartphone, Shield, Coins, Users, Map, Award } from "lucide-react"

const features = [
  {
    icon: Smartphone,
    title: "Track Every Hike",
    description: "Advanced GPS tracking with altitude verification and photo validation using AI technology.",
    color: "text-primary",
  },
  {
    icon: Coins,
    title: "Earn HIKE Tokens",
    description: "Get rewarded with cryptocurrency for every meter hiked. Higher peaks = bigger rewards.",
    color: "text-secondary",
  },
  {
    icon: Shield,
    title: "Blockchain Verified",
    description: "All hikes are verified on Flare Network using decentralized oracles and data connectors.",
    color: "text-primary",
  },
  {
    icon: Award,
    title: "Unlock NFT Badges",
    description: "Collect unique digital achievements and show off your hiking accomplishments.",
    color: "text-secondary",
  },
  {
    icon: Users,
    title: "Join Communities",
    description: "Connect with hikers worldwide, join challenges, and compete on global leaderboards.",
    color: "text-primary",
  },
  {
    icon: Map,
    title: "Discover Peaks",
    description: "Explore thousands of mountains with detailed route information and difficulty ratings.",
    color: "text-secondary",
  },
]

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("features-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="features-section"
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-muted/20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to <span className="text-gradient">Hike & Earn</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Hike2Earn combines cutting-edge Web3 technology with outdoor adventure to create the ultimate hiking
            experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 h-full hover:scale-105 transition-all duration-300 group">
                <div className="p-0 pb-4">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <div className="p-0">
                  <p className="text-base leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 max-w-2xl mx-auto">
              <div className="p-0 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Start Your Journey?</h3>
                  <p className="text-muted-foreground">Join thousands of hikers earning rewards on every adventure</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Connect Wallet
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="glass border-2 border-primary/20 hover:border-primary/40 text-foreground hover:text-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 bg-transparent"
                  >
                    View Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
