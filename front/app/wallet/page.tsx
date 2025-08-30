import { WalletDashboard } from "@/components/wallet-dashboard"
import { MountainBackground } from "@/components/mountain-background"
import { WalletDiagnostic } from "@/components/wallet-diagnostic"

export default function WalletPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <MountainBackground />

      <div className="relative z-10">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <WalletDiagnostic />
            <WalletDashboard />
          </div>
        </main>
      </div>
    </div>
  )
}
