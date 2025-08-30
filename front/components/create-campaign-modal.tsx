"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Trophy, Plus, X, DollarSign } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mountain data - this could be imported from a shared location
const mendozaPeaks = [
  { id: 1, name: "Aconcagua", altitude: "6,962m", difficulty: "expert", reward: "2500 HIKE" },
  { id: 2, name: "Cerro Mercedario", altitude: "6,770m", difficulty: "expert", reward: "2200 HIKE" },
  { id: 3, name: "Cerro Tupungato", altitude: "6,570m", difficulty: "advanced", reward: "1800 HIKE" },
  { id: 4, name: "Cerro Plata", altitude: "6,100m", difficulty: "advanced", reward: "1500 HIKE" },
  { id: 5, name: "Cerro El Plomo", altitude: "5,424m", difficulty: "intermediate", reward: "800 HIKE" },
  { id: 6, name: "Cerro Vallecitos", altitude: "5,462m", difficulty: "intermediate", reward: "900 HIKE" },
]

// ERC20 token options
const supportedTokens = [
  { symbol: "USDC", name: "USD Coin", address: "0x..." },
  { symbol: "USDT", name: "Tether", address: "0x..." },
  { symbol: "WETH", name: "Wrapped ETH", address: "0x..." },
  { symbol: "FLR", name: "Flare", address: "0x..." },
]

interface CampaignFormData {
  name: string
  description: string
  startDate: string
  endDate: string
  prizePoolETH: string
  selectedMountains: number[]
  erc20Prizes: { token: string, amount: string }[]
}

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateCampaign: (campaignData: any) => void
}

export function CreateCampaignModal({ isOpen, onClose, onCreateCampaign }: CreateCampaignModalProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    prizePoolETH: "",
    selectedMountains: [],
    erc20Prizes: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof CampaignFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const toggleMountain = (mountainId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedMountains: prev.selectedMountains.includes(mountainId)
        ? prev.selectedMountains.filter(id => id !== mountainId)
        : [...prev.selectedMountains, mountainId]
    }))
  }

  const addERC20Prize = () => {
    setFormData(prev => ({
      ...prev,
      erc20Prizes: [...prev.erc20Prizes, { token: "", amount: "" }]
    }))
  }

  const removeERC20Prize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      erc20Prizes: prev.erc20Prizes.filter((_, i) => i !== index)
    }))
  }

  const updateERC20Prize = (index: number, field: "token" | "amount", value: string) => {
    setFormData(prev => ({
      ...prev,
      erc20Prizes: prev.erc20Prizes.map((prize, i) => 
        i === index ? { ...prize, [field]: value } : prize
      )
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Campaign name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.startDate) newErrors.startDate = "Start date is required"
    if (!formData.endDate) newErrors.endDate = "End date is required"
    if (formData.selectedMountains.length === 0) newErrors.mountains = "Select at least one mountain"
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date"
    }

    if (!formData.prizePoolETH && formData.erc20Prizes.every(prize => !prize.amount)) {
      newErrors.prizes = "Add at least one prize (ETH or ERC20 tokens)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Convert form data to match Solidity struct format
      const campaignData = {
        name: formData.name,
        description: formData.description,
        startDate: Math.floor(new Date(formData.startDate).getTime() / 1000), // Convert to Unix timestamp
        endDate: Math.floor(new Date(formData.endDate).getTime() / 1000),
        prizePoolETH: formData.prizePoolETH ? parseFloat(formData.prizePoolETH) : 0,
        mountainIds: formData.selectedMountains,
        erc20Tokens: formData.erc20Prizes.filter(prize => prize.token && prize.amount).map(prize => prize.token),
        erc20Amounts: formData.erc20Prizes.filter(prize => prize.token && prize.amount).map(prize => parseFloat(prize.amount)),
        isActive: true,
        prizeDistributed: false,
        totalNFTsMinted: 0,
        participants: [],
      }

      await onCreateCampaign(campaignData)
      
      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        prizePoolETH: "",
        selectedMountains: [],
        erc20Prizes: [],
      })
      onClose()
    } catch (error) {
      console.error("Failed to create campaign:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900/95 backdrop-blur-xl border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Create New Campaign</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Campaign Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter campaign name..."
                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your campaign goals, requirements, and details..."
                className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-muted-foreground resize-none"
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-white flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
              {errors.startDate && <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <Label htmlFor="endDate" className="text-white flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
              {errors.endDate && <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Mountain Selection */}
          <div>
            <Label className="text-white flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Select Mountains
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {mendozaPeaks.map((peak) => (
                <div
                  key={peak.id}
                  onClick={() => toggleMountain(peak.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.selectedMountains.includes(peak.id)
                      ? "bg-emerald-500/20 border-emerald-500/50"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="text-white font-medium text-sm">{peak.name}</div>
                  <div className="text-muted-foreground text-xs">{peak.altitude} • {peak.difficulty}</div>
                </div>
              ))}
            </div>
            {errors.mountains && <p className="text-red-400 text-sm mt-1">{errors.mountains}</p>}
          </div>

          {/* Prize Pool */}
          <div className="space-y-4">
            <Label className="text-white flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Prize Pool
            </Label>

            {/* ETH Prize */}
            <div>
              <Label htmlFor="ethPrize" className="text-white text-sm">ETH Prize Pool</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ethPrize"
                  type="number"
                  step="0.001"
                  value={formData.prizePoolETH}
                  onChange={(e) => handleInputChange("prizePoolETH", e.target.value)}
                  placeholder="0.0"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* ERC20 Tokens */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white text-sm">ERC20 Token Prizes</Label>
                <Button
                  type="button"
                  onClick={addERC20Prize}
                  size="sm"
                  variant="outline"
                  className="bg-white/5 border-white/10 hover:bg-white/10"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Token
                </Button>
              </div>

              {formData.erc20Prizes.map((prize, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select
                      value={prize.token}
                      onValueChange={(value) => updateERC20Prize(index, "token", value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedTokens.map((token) => (
                          <SelectItem key={token.symbol} value={token.address}>
                            {token.symbol} - {token.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={prize.amount}
                      onChange={(e) => updateERC20Prize(index, "amount", e.target.value)}
                      placeholder="Amount"
                      className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeERC20Prize(index)}
                    size="icon"
                    variant="destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {errors.prizes && <p className="text-red-400 text-sm mt-1">{errors.prizes}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-500 to-orange-500 hover:from-emerald-600 hover:to-orange-600"
            >
              {isLoading ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}