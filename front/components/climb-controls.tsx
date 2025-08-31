"use client"

import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Camera, CheckCircle, Square } from "lucide-react"

interface ClimbControlsProps {
  isActive: boolean
  status: 'idle' | 'active' | 'paused' | 'finishing' | 'completed'
  summitReached: boolean
  hasPhotos: boolean
  onStartStop: () => void
  onReset: () => void
  onCameraClick: () => void
  onFinishClimb: () => void
}

export function ClimbControls({ 
  isActive, 
  status, 
  summitReached, 
  hasPhotos, 
  onStartStop, 
  onReset, 
  onCameraClick, 
  onFinishClimb 
}: ClimbControlsProps) {
  const isProcessing = status === 'finishing';
  const isCompleted = status === 'completed';
  const canTakePhoto = summitReached || status === 'paused';
  const canFinish = status === 'paused' && hasPhotos;

  // Get status text using priority-based logic to avoid TypeScript flow analysis issues
  const getStatusText = (): string => {
    // Priority 1: Final states
    if (isCompleted) return "🎉 Completado";
    if (isProcessing) return "⏳ Finalizando...";
    
    // Priority 2: Action-ready states
    if (canFinish) return "✅ Listo para finalizar";
    
    // Priority 3: Photo-related states
    if (hasPhotos) return "📸 Fotos capturadas";
    if (canTakePhoto) return "📷 Cámara disponible";
    
    // Priority 4: Activity states
    if (isActive) return "🏃 Tracking activo";
    
    // Priority 5: Base status states
    // Use a lookup object to avoid direct comparisons
    const statusMessages: Record<string, string> = {
      'paused': "⏸️ Pausado",
      'idle': "▶️ Listo para comenzar",
      'active': "🏃 Tracking activo",
      'finishing': "⏳ Finalizando...",
      'completed': "🎉 Completado"
    };
    
    return statusMessages[status] || "▶️ Listo para comenzar";
  };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 lg:bottom-6">
      <div className="flex items-center gap-4">
        {/* Reset Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={onReset}
          disabled={isProcessing}
          className="glass w-14 h-14 rounded-full p-0 hover:scale-110 transition-transform duration-200 bg-transparent disabled:opacity-50"
        >
          <RotateCcw className="w-6 h-6" />
        </Button>

        {/* Finish Button - appears when paused and has photos */}
        {canFinish && (
          <Button
            variant="outline"
            size="lg"
            onClick={onFinishClimb}
            disabled={isProcessing}
            className="glass w-14 h-14 rounded-full p-0 hover:scale-110 transition-transform duration-200 bg-green-500/20 border-green-500/30 hover:bg-green-500/30 disabled:opacity-50"
          >
            <CheckCircle className="w-6 h-6 text-green-400" />
          </Button>
        )}

        {/* Main Start/Stop Button */}
        <Button
          size="lg"
          onClick={onStartStop}
          disabled={isProcessing || isCompleted}
          className={`w-20 h-20 rounded-full p-0 relative overflow-hidden transition-all duration-300 ${
            isCompleted
              ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
              : isActive
              ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
              : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
          } hover:scale-110 active:scale-95 disabled:opacity-50`}
        >
          <div className="relative z-10">
            {isCompleted ? (
              <CheckCircle className="w-8 h-8" />
            ) : isProcessing ? (
              <Square className="w-8 h-8 animate-pulse" />
            ) : isActive ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </div>

          {/* Ripple Effect */}
          {!isCompleted && !isProcessing && (
            <div
              className={`absolute inset-0 rounded-full ${
                isActive ? "bg-red-400" : "bg-primary/80"
              } animate-ping opacity-20`}
            />
          )}
        </Button>

        {/* Camera Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={onCameraClick}
          disabled={!canTakePhoto || isProcessing || isCompleted}
          className={`glass w-14 h-14 rounded-full p-0 hover:scale-110 transition-transform duration-200 bg-transparent disabled:opacity-50 ${
            canTakePhoto && !hasPhotos 
              ? "animate-bounce border-yellow-500/30 bg-yellow-500/10" 
              : hasPhotos 
              ? "border-green-500/30 bg-green-500/10" 
              : ""
          }`}
          style={{ animationDuration: canTakePhoto && !hasPhotos ? "2s" : undefined }}
        >
          <Camera className={`w-6 h-6 ${
            hasPhotos ? "text-green-400" : canTakePhoto ? "text-yellow-400" : ""
          }`} />
          {hasPhotos && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full flex items-center justify-center">
              <CheckCircle className="w-2 h-2 text-white" />
            </div>
          )}
        </Button>
      </div>
      
      {/* Status Text */}
      <div className="text-center mt-3">
        <span className="text-xs text-muted-foreground bg-black/30 px-2 py-1 rounded-full">
          {getStatusText()}
        </span>
      </div>
    </div>
  )
}
