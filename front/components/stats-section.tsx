"use client"

import { useEffect, useState } from "react"
import { Mountain, Users, Trophy, Coins } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "10,247",
    label: "Active Climbers",
    description: "Worldwide community",
    color: "text-primary",
  },
  {
    icon: Mountain,
    value: "523",
    label: "Mountains Tracked",
    description: "Across 45 countries",
    color: "text-secondary",
  },
  {
    icon: Coins,
    value: "$1.2M",
    label: "HIKE Distributed",
    description: "In rewards earned",
    color: "text-primary",
  },
  {
    icon: Trophy,
    value: "8,934",
    label: "NFT Badges",
    description: "Achievements unlocked",
    color: "text-secondary",
  },
]

export function StatsSection() {
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

    const element = document.getElementById("stats-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="stats-section" className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Join the <span className="text-gradient">Global Movement</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Thousands of climbers are already earning rewards and building the future of outdoor adventure
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 text-center hover:scale-105 transition-transform duration-300 group">
                <div className="p-0 space-y-4">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>

                  <div>
                    <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                    <div className="text-lg font-semibold text-foreground mb-1">{stat.label}</div>
                    <div className="text-sm text-muted-foreground">{stat.description}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
