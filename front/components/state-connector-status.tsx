"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, Clock, AlertTriangle } from "lucide-react"

interface AttestationStatus {
  id: string
  type: "GPS" | "Photo" | "Weather" | "Elevation"
  status: "pending" | "verified" | "failed"
  timestamp: Date
  data: any
}

export function StateConnectorStatus() {
  const [attestations, setAttestations] = useState<AttestationStatus[]>([
    {
      id: "att_001",
      type: "GPS",
      status: "verified",
      timestamp: new Date(Date.now() - 300000),
      data: { lat: 44.2619, lng: -71.3036, accuracy: 5 },
    },
    {
      id: "att_002",
      type: "Elevation",
      status: "verified",
      timestamp: new Date(Date.now() - 240000),
      data: { altitude: 1916, source: "barometric" },
    },
    {
      id: "att_003",
      type: "Photo",
      status: "pending",
      timestamp: new Date(Date.now() - 60000),
      data: { hash: "0xabc123...", location: "summit" },
    },
  ])

  const getStatusIcon = (status: AttestationStatus["status"]) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
    }
  }

  const getStatusColor = (status: AttestationStatus["status"]) => {
    switch (status) {
      case "verified":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
    }
  }

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">State Connector</h3>
        </div>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
          Active
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        {attestations.map((attestation) => (
          <div key={attestation.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center space-x-3">
              {getStatusIcon(attestation.status)}
              <div>
                <p className="font-medium text-white text-sm">{attestation.type} Verification</p>
                <p className="text-xs text-muted-foreground">{attestation.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
            <Badge variant="secondary" className={`text-xs ${getStatusColor(attestation.status)}`}>
              {attestation.status}
            </Badge>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-400 mb-2">
            <strong>State Connector Benefits:</strong>
          </p>
          <ul className="text-xs text-blue-300 space-y-1">
            <li>• Trustless external data verification</li>
            <li>• GPS coordinate validation</li>
            <li>• Weather condition attestation</li>
            <li>• Photo timestamp verification</li>
          </ul>
        </div>

        <Button
          variant="outline"
          className="w-full bg-white/5 border-white/10 hover:bg-white/10"
          onClick={() => {
            // Simulate new attestation request
            const newAttestation: AttestationStatus = {
              id: `att_${Date.now()}`,
              type: "Weather",
              status: "pending",
              timestamp: new Date(),
              data: { temperature: 15, conditions: "clear" },
            }
            setAttestations([...attestations, newAttestation])
          }}
        >
          Request New Attestation
        </Button>
      </div>
    </div>
  )
}
