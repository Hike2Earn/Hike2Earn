'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MountainBackground } from '@/components/mountain-background'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <MountainBackground />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold">¡Algo salió mal!</h1>
          
          {/* Description */}
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Ocurrió un error inesperado durante tu aventura. 
              No te preocupes, estos contratiempos son parte del camino.
            </p>
            
            {error.message && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 font-mono">
                  {error.message}
                </p>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={reset}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Intentar de Nuevo
            </Button>
            
            <Link href="/">
              <Button variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
          
          {/* Additional Info */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">¿El problema persiste?</p>
            <ul className="space-y-1">
              <li>• Recarga la página completamente</li>
              <li>• Verifica tu conexión a internet</li>
              <li>• Intenta desconectar y reconectar tu wallet</li>
              <li>• Contacta al equipo si el error continúa</li>
            </ul>
            
            {error.digest && (
              <p className="text-xs opacity-70 pt-2">
                ID de Error: {error.digest}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}