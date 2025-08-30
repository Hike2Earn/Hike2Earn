"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, ArrowUpRight, ArrowDownLeft, Zap, Mountain } from "lucide-react"

const transactions = [
  {
    id: 1,
    type: "earned",
    amount: "45.2 HIKE",
    description: "Mount Washington Climb",
    timestamp: "2 hours ago",
    status: "completed",
    icon: Mountain,
  },
  {
    id: 2,
    type: "staked",
    amount: "100 HIKE",
    description: "Staking Rewards",
    timestamp: "1 day ago",
    status: "completed",
    icon: Zap,
  },
  {
    id: 3,
    type: "earned",
    amount: "23.8 HIKE",
    description: "Eagle Peak Challenge",
    timestamp: "3 days ago",
    status: "completed",
    icon: Mountain,
  },
  {
    id: 4,
    type: "sent",
    amount: "50 HIKE",
    description: "Transfer to 0x742d...35Cc",
    timestamp: "1 week ago",
    status: "completed",
    icon: ArrowUpRight,
  },
]

const typeColors = {
  earned: "text-green-600",
  staked: "text-blue-600",
  sent: "text-orange-600",
}

const typeIcons = {
  earned: ArrowDownLeft,
  staked: Zap,
  sent: ArrowUpRight,
}

export function TransactionHistory() {
  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <History className="w-5 h-5 text-muted-foreground" />
            Transaction History
          </div>
          <Button variant="outline" size="sm" className="glass bg-transparent">
            View All
          </Button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="space-y-4">
          {transactions.map((tx) => {
            const IconComponent = tx.icon

            return (
              <div key={tx.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center`}
                >
                  <IconComponent className={`w-5 h-5 ${typeColors[tx.type as keyof typeof typeColors]}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm truncate">{tx.description}</div>
                    <div className={`font-semibold text-sm ${typeColors[tx.type as keyof typeof typeColors]}`}>
                      {tx.type === "sent" ? "-" : "+"}
                      {tx.amount}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{tx.timestamp}</div>
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
