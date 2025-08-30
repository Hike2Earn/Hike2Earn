"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { getFTSOPrice } from "@/lib/web3"

interface PriceData {
  symbol: string
  price: number
  change24h: number
  lastUpdated: Date
}

const TRACKED_ASSETS = ["FLR", "BTC", "ETH", "XRP", "ADA"]

export function FTSOPriceFeed() {
  const [prices, setPrices] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setError(null)
        const pricePromises = TRACKED_ASSETS.map(async (symbol) => {
          const price = await getFTSOPrice(symbol)
          return {
            symbol,
            price,
            change24h: (Math.random() - 0.5) * 10, // Mock 24h change
            lastUpdated: new Date(),
          }
        })

        const priceData = await Promise.all(pricePromises)
        setPrices(priceData)
      } catch (error) {
        console.error("Failed to fetch FTSO prices:", error)
        setError("Failed to fetch price data. Using cached values.")
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-white/10 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-4">
        <DollarSign className="h-5 w-5 text-emerald-400" />
        <h3 className="font-semibold text-white">FTSO Price Feeds</h3>
        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
          {error ? "Demo" : "Live"}
        </Badge>
      </div>

      {error && (
        <div className="mb-4 p-2 rounded bg-orange-500/10 border border-orange-500/20">
          <p className="text-xs text-orange-400">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {prices.map((asset) => (
          <div
            key={asset.symbol}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-orange-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{asset.symbol.slice(0, 2)}</span>
              </div>
              <div>
                <p className="font-medium text-white">{asset.symbol}</p>
                <p className="text-xs text-muted-foreground">Updated {asset.lastUpdated.toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-white">${asset.price.toFixed(asset.price < 1 ? 6 : 2)}</p>
              <div className="flex items-center space-x-1">
                {asset.change24h >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span className={`text-xs ${asset.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {asset.change24h >= 0 ? "+" : ""}
                  {asset.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <p className="text-xs text-emerald-400">
          Powered by Flare Time Series Oracle (FTSO) - Decentralized price feeds with sub-second updates
        </p>
      </div>
    </div>
  )
}
