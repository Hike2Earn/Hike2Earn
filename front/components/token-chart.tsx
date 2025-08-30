"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { TrendingUp } from "lucide-react"

const priceData = [
  { time: "00:00", price: 0.12 },
  { time: "04:00", price: 0.115 },
  { time: "08:00", price: 0.118 },
  { time: "12:00", price: 0.125 },
  { time: "16:00", price: 0.122 },
  { time: "20:00", price: 0.126 },
  { time: "24:00", price: 0.128 },
]

export function TokenChart() {
  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="w-5 h-5 text-primary" />
            HIKE Token Price
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              +5.2%
            </Badge>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="text-xs">
                1D
              </Button>
              <Button variant="ghost" size="sm" className="text-xs bg-primary/10 text-primary">
                7D
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                1M
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="mb-4">
          <div className="text-2xl font-bold text-foreground">$0.128</div>
          <div className="text-sm text-green-600">+$0.0063 (+5.2%) today</div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(16 185 129)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(16 185 129)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "rgb(107 114 128)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "rgb(107 114 128)" }}
                domain={["dataMin - 0.005", "dataMax + 0.005"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  backdropFilter: "blur(16px)",
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="rgb(16 185 129)"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
