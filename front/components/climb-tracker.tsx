"use client"

import { useState, useEffect } from "react"
import { ClimbMap } from "./climb-map"
import { ClimbControls } from "./climb-controls"
import { ClimbStats } from "./climb-stats"
import { MilestoneNotification } from "./milestone-notification"
import { EmergencyButton } from "./emergency-button"
import { ClimbPhotoCapture } from "./climb-photo-capture"
import { ClimbVerificationModal } from "./climb-verification-modal"
import { useAutoMint } from "@/hooks/useAutoMint"
import { useWallet } from "./wallet-provider"
import { useClimbPersistence } from "@/hooks/useClimbPersistence"

export interface ClimbData {
  isActive: boolean
  status: 'idle' | 'active' | 'paused' | 'finishing' | 'completed'
  startTime: Date | null
  endTime: Date | null
  duration: number
  altitude: number
  distance: number
  speed: number
  elevationGain: number
  currentLocation: {
    lat: number
    lng: number
  }
  targetAltitude: number
  targetDistance: number
  gpsPath: { lat: number; lng: number; timestamp: number; altitude: number }[]
  summitReached: boolean
  photos: File[]
}

export interface ClimbSession {
  id: string
  startTime: Date
  endTime: Date | null
  duration: number
  maxAltitude: number
  totalDistance: number
  elevationGain: number
  gpsPath: { lat: number; lng: number; timestamp: number; altitude: number }[]
  summitCoords: { lat: number; lng: number }
  photos: string[]
  status: 'active' | 'paused' | 'completed'
}

export function ClimbTracker() {
  const { isConnected } = useWallet();
  const { processSummitVerification, isProcessing } = useAutoMint();
  
  const [sessionId, setSessionId] = useState<string | null>(null)
  const { saveSession, loadActiveSession, completeSession, abandonSession } = useClimbPersistence(sessionId);
  
  const [climbData, setClimbData] = useState<ClimbData>({
    isActive: false,
    status: 'idle',
    startTime: null,
    endTime: null,
    duration: 0,
    altitude: 1247,
    distance: 0,
    speed: 0,
    elevationGain: 0,
    currentLocation: {
      lat: 46.5197,
      lng: 6.6323,
    },
    targetAltitude: 3000,
    targetDistance: 5000,
    gpsPath: [],
    summitReached: false,
    photos: []
  })

  const [showMilestone, setShowMilestone] = useState<string | null>(null)
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)

  // Simulate real-time updates when climbing is active
  useEffect(() => {
    if (!climbData.isActive) return

    const interval = setInterval(() => {
      setClimbData((prev) => {
        const newAltitude = prev.altitude + Math.random() * 2
        const newDistance = prev.distance + Math.random() * 10
        const newSpeed = 3 + Math.random() * 2 // 3-5 km/h
        const newDuration = prev.duration + 1

        // Update GPS path
        const newGpsPoint = {
          lat: prev.currentLocation.lat + (Math.random() - 0.5) * 0.0001,
          lng: prev.currentLocation.lng + (Math.random() - 0.5) * 0.0001,
          timestamp: Date.now(),
          altitude: newAltitude
        };

        const newCurrentLocation = { lat: newGpsPoint.lat, lng: newGpsPoint.lng };

        // Check for milestones
        if (Math.floor(newAltitude / 500) > Math.floor(prev.altitude / 500)) {
          setShowMilestone(`${Math.floor(newAltitude / 500) * 500}m altitude reached!`)
        }

        // Check if summit is reached (90% of target altitude)
        const summitReached = newAltitude >= prev.targetAltitude * 0.9;
        if (summitReached && !prev.summitReached) {
          setShowMilestone(`🏔️ ¡Cumbre alcanzada! ${newAltitude.toFixed(0)}m`)
        }

        return {
          ...prev,
          altitude: newAltitude,
          distance: newDistance,
          speed: newSpeed,
          duration: newDuration,
          elevationGain: newAltitude - 1247,
          currentLocation: newCurrentLocation,
          gpsPath: [...prev.gpsPath, newGpsPoint],
          summitReached
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [climbData.isActive])

  // Load active session on component mount
  useEffect(() => {
    const activeSession = loadActiveSession();
    if (activeSession && activeSession.session.status === 'active') {
      setSessionId(activeSession.sessionId);
      
      // Restore climb data from session
      const session = activeSession.session;
      setClimbData(prev => ({
        ...prev,
        isActive: session.status === 'active',
        status: session.status === 'active' ? 'active' : 'paused',
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        altitude: session.maxAltitude,
        distance: session.totalDistance,
        elevationGain: session.elevationGain,
        currentLocation: session.summitCoords,
        gpsPath: session.gpsPath,
      }));

      setShowMilestone("📱 Sesión anterior restaurada. Continuando tracking...");
    }
  }, []); // Run only on mount

  // Auto-save session when data changes
  useEffect(() => {
    if (sessionId && climbData.status !== 'idle' && climbData.startTime) {
      saveSession(climbData);
    }
  }, [climbData, sessionId, saveSession])

  const handleStartStop = () => {
    setClimbData((prev) => {
      const newIsActive = !prev.isActive;
      const newStatus = newIsActive 
        ? 'active' 
        : prev.status === 'active' ? 'paused' : prev.status;
      
      // Create new session ID when starting
      if (newIsActive && !sessionId) {
        const newSessionId = `climb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
      }

      return {
        ...prev,
        isActive: newIsActive,
        status: newStatus,
        startTime: newIsActive && !prev.startTime ? new Date() : prev.startTime,
      };
    });
  };

  const handleReset = () => {
    // Abandon current session if exists
    if (sessionId && climbData.status !== 'completed') {
      abandonSession("User reset");
    }
    
    setSessionId(null);
    setClimbData({
      isActive: false,
      status: 'idle',
      startTime: null,
      endTime: null,
      duration: 0,
      altitude: 1247,
      distance: 0,
      speed: 0,
      elevationGain: 0,
      currentLocation: {
        lat: 46.5197,
        lng: 6.6323,
      },
      targetAltitude: 3000,
      targetDistance: 5000,
      gpsPath: [],
      summitReached: false,
      photos: []
    });
  };

  const handleCameraClick = () => {
    if (climbData.summitReached || climbData.altitude >= climbData.targetAltitude * 0.8) {
      setShowPhotoCapture(true);
    } else {
      setShowMilestone("📸 La cámara se activará cuando te acerques más a la cumbre");
    }
  };

  const handlePhotosConfirmed = (photos: File[]) => {
    setClimbData((prev) => ({ ...prev, photos }));
    setShowPhotoCapture(false);
    
    // Show finish option after photos are captured
    setShowMilestone("📷 Fotos capturadas! Ahora puedes finalizar tu recorrido");
  };

  const handleFinishClimb = async () => {
    if (climbData.photos.length === 0) {
      setShowMilestone("📸 Debes capturar fotos antes de finalizar el recorrido");
      return;
    }

    setClimbData((prev) => ({
      ...prev,
      status: 'finishing',
      isActive: false,
      endTime: new Date()
    }));

    // Note: Final session will be saved by completeSession after verification

    // Open verification modal
    setShowVerificationModal(true);
  };

  const handleVerificationComplete = (success: boolean, tokenId?: string) => {
    setShowVerificationModal(false);
    
    if (success) {
      // Complete the session and save to history
      completeSession(climbData, tokenId);
      
      setClimbData((prev) => ({ ...prev, status: 'completed' }));
      setShowMilestone(`🎉 ¡NFT minteado exitosamente! Token ID: ${tokenId?.slice(0, 8)}...`);
      
      // Clear sessionId after completion
      setTimeout(() => setSessionId(null), 3000);
    } else {
      setClimbData((prev) => ({ ...prev, status: 'paused' }));
      setShowMilestone("❌ Error en la verificación. Puedes intentar nuevamente.");
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Main Map */}
      <ClimbMap climbData={climbData} />

      {/* Stats Panel - Desktop Sidebar / Mobile Bottom Sheet */}
      <div className="absolute inset-x-0 bottom-0 lg:inset-y-0 lg:right-0 lg:w-96 lg:bottom-auto">
        <ClimbStats climbData={climbData} />
      </div>

      {/* Control Buttons */}
      <ClimbControls 
        isActive={climbData.isActive} 
        status={climbData.status}
        summitReached={climbData.summitReached}
        hasPhotos={climbData.photos.length > 0}
        onStartStop={handleStartStop} 
        onReset={handleReset}
        onCameraClick={handleCameraClick}
        onFinishClimb={handleFinishClimb}
      />

      {/* Emergency Button */}
      <EmergencyButton />

      {/* Milestone Notifications */}
      {showMilestone && <MilestoneNotification message={showMilestone} onClose={() => setShowMilestone(null)} />}

      {/* Photo Capture Modal */}
      <ClimbPhotoCapture
        isOpen={showPhotoCapture}
        onClose={() => setShowPhotoCapture(false)}
        onPhotosConfirmed={handlePhotosConfirmed}
        climbData={{
          altitude: climbData.altitude,
          distance: climbData.distance,
          duration: climbData.duration,
          currentLocation: climbData.currentLocation
        }}
      />

      {/* Verification Modal */}
      {showVerificationModal && (
        <ClimbVerificationModal
          isOpen={showVerificationModal}
          onClose={() => {
            setShowVerificationModal(false);
            setClimbData((prev) => ({ ...prev, status: 'paused' }));
          }}
          climbData={climbData}
          onVerificationComplete={handleVerificationComplete}
        />
      )}
    </div>
  )
}
