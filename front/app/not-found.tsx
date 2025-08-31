'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MountainBackground } from '@/components/mountain-background'
import { Mountain, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <MountainBackground />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          {/* Mountain Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              <Mountain className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          {/* Error Code */}
          <h1 className="text-8xl font-bold text-primary/50">404</h1>
          
          {/* Title */}
          <h2 className="text-2xl font-bold">Cumbre No Encontrada</h2>
          
          {/* Description */}
          <p className="text-muted-foreground">
            Lo sentimos, la página que buscas se perdió en las montañas.
            Es posible que haya sido movida o ya no exista.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                <Home className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Página Anterior
            </Button>
          </div>
          
          {/* Additional Help */}
          <div className="text-sm text-muted-foreground">
            <p>¿Necesitas ayuda? Intenta:</p>
            <ul className="mt-2 space-y-1">
              <li>• Revisar la URL por errores de escritura</li>
              <li>• Usar el menú de navegación</li>
              <li>• Buscar en la página de campañas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}