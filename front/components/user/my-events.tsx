"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/components/wallet-provider";
import { useAutoMint } from "@/hooks/useAutoMint";
import { AutoVerificationModal } from "@/components/verification/auto-verification-modal";
import {
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Camera,
  CheckCircle,
  AlertCircle,
  Mountain,
  Sparkles,
  RefreshCw,
  Eye,
} from "lucide-react";
import {
  CampaignReservation,
  SummitVerification,
} from "@/lib/localStorage-manager";

export function MyEvents() {
  const { isConnected, address } = useWallet();
  const {
    getUserReservations,
    getUserSummitVerifications,
    retryMinting,
    isProcessing,
  } = useAutoMint();

  const [reservations, setReservations] = useState<CampaignReservation[]>([]);
  const [summitVerifications, setSummitVerifications] = useState<
    SummitVerification[]
  >([]);
  const [selectedReservation, setSelectedReservation] =
    useState<CampaignReservation | null>(null);
  const [selectedSummit, setSelectedSummit] =
    useState<SummitVerification | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [modalType, setModalType] = useState<"campaign" | "summit">("campaign");

  // Load user data
  useEffect(() => {
    if (!isConnected || !address) {
      setReservations([]);
      setSummitVerifications([]);
      return;
    }

    setReservations(getUserReservations());
    setSummitVerifications(getUserSummitVerifications());
  }, [isConnected, address, getUserReservations, getUserSummitVerifications]);

  // Refresh data
  const refreshData = () => {
    if (!isConnected || !address) return;
    setReservations(getUserReservations());
    setSummitVerifications(getUserSummitVerifications());
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      reserved: {
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        icon: Clock,
        label: "Reservado",
      },
      in_progress: {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: Clock,
        label: "En Progreso",
      },
      verifying: {
        color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        icon: Camera,
        label: "Verificando",
      },
      minting: {
        color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        icon: Trophy,
        label: "Minteando NFT",
      },
      completed: {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: CheckCircle,
        label: "Completado",
      },
      failed: {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: AlertCircle,
        label: "Error",
      },
      pending: {
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        icon: Clock,
        label: "Pendiente",
      },
    };

    return configs[status as keyof typeof configs] || configs.pending;
  };

  const canVerify = (reservation: CampaignReservation): boolean => {
    if (reservation.status !== "reserved") return false;

    // Check if event has ended (mock logic for demo)
    const now = new Date();
    const mockEndDate = new Date(reservation.reservedAt + 24 * 60 * 60 * 1000); // 24 hours after reservation
    return now >= mockEndDate;
  };

  const handleVerify = (reservation: CampaignReservation) => {
    setSelectedReservation(reservation);
    setSelectedSummit(null);
    setModalType("campaign");
    setShowVerificationModal(true);
  };

  const handleSummitVerify = (summit: SummitVerification) => {
    setSelectedSummit(summit);
    setSelectedReservation(null);
    setModalType("summit");
    setShowVerificationModal(true);
  };

  const handleRetry = async (type: "campaign" | "summit", id: string) => {
    try {
      const result = await retryMinting(type, id);
      if (result.success) {
        refreshData();
      }
    } catch (error) {
      console.error("Retry failed:", error);
    }
  };

  const closeModal = () => {
    setShowVerificationModal(false);
    setSelectedReservation(null);
    setSelectedSummit(null);
    refreshData();
  };

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <Mountain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Connect your Wallet</h3>
        <p className="text-muted-foreground">
          Connect your wallet to view your events and verifications
        </p>
      </div>
    );
  }

  const totalEvents = reservations.length + summitVerifications.length;

  if (totalEvents === 0) {
    return (
      <div className="text-center p-8">
        <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay eventos</h3>
        <p className="text-muted-foreground mb-4">
          Aún no tienes eventos reservados o verificaciones pendientes
        </p>
        <Button variant="outline" onClick={refreshData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mis Eventos</h2>
          <p className="text-muted-foreground">
            {totalEvents} evento{totalEvents !== 1 ? "s" : ""} total
            {totalEvents !== 1 ? "es" : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Campaign Reservations */}
      {reservations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Eventos de Campañas ({reservations.length})
          </h3>

          <div className="grid gap-4">
            {reservations.map((reservation) => {
              const statusConfig = getStatusConfig(reservation.status);
              const StatusIcon = statusConfig.icon;
              const canVerifyNow = canVerify(reservation);

              return (
                <Card
                  key={reservation.id}
                  className="backdrop-blur-md bg-white/10 border-white/20"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {reservation.campaignTitle}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Mountain className="w-3 h-3" />
                            {reservation.mountainName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(
                              reservation.reservedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* NFT Info */}
                      {reservation.nftTokenId && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium text-green-400">
                              NFT Minteado
                            </span>
                          </div>
                          <p className="text-xs text-green-300">
                            Token ID: {reservation.nftTokenId}
                          </p>
                        </div>
                      )}

                      {/* Error Info */}
                      {reservation.status === "failed" && reservation.error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-sm font-medium text-red-400">
                              Error
                            </span>
                          </div>
                          <p className="text-xs text-red-300">
                            {reservation.error}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {canVerifyNow && reservation.status === "reserved" && (
                          <Button
                            size="sm"
                            onClick={() => handleVerify(reservation)}
                            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Verificar Participación
                          </Button>
                        )}

                        {reservation.status === "failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleRetry("campaign", reservation.id)
                            }
                            disabled={isProcessing}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reintentar
                          </Button>
                        )}

                        {reservation.verificationPhotos &&
                          reservation.verificationPhotos.length > 0 && (
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Fotos ({reservation.verificationPhotos.length}
                              )
                            </Button>
                          )}
                      </div>

                      {/* Status Messages */}
                      {reservation.status === "reserved" && !canVerifyNow && (
                        <p className="text-xs text-muted-foreground">
                          Wait until the event ends to verify your participation
                        </p>
                      )}

                      {reservation.status === "verifying" && (
                        <div className="flex items-center gap-2 text-purple-400">
                          <div className="w-3 h-3 animate-spin rounded-full border border-purple-400 border-t-transparent" />
                          <span className="text-xs">
                            Verificación en proceso...
                          </span>
                        </div>
                      )}

                      {reservation.status === "minting" && (
                        <div className="flex items-center gap-2 text-orange-400">
                          <div className="w-3 h-3 animate-spin rounded-full border border-orange-400 border-t-transparent" />
                          <span className="text-xs">Minteando NFT...</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Summit Verifications */}
      {summitVerifications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mountain className="w-5 h-5" />
            Verificaciones de Cumbres ({summitVerifications.length})
          </h3>

          <div className="grid gap-4">
            {summitVerifications.map((summit) => {
              const statusConfig = getStatusConfig(summit.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card
                  key={summit.id}
                  className="backdrop-blur-md bg-white/10 border-white/20"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {summit.mountainName}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(summit.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* NFT Info */}
                      {summit.nftTokenId && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium text-green-400">
                              NFT Minteado
                            </span>
                          </div>
                          <p className="text-xs text-green-300">
                            Token ID: {summit.nftTokenId}
                          </p>
                        </div>
                      )}

                      {/* Error Info */}
                      {summit.status === "failed" && summit.error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-sm font-medium text-red-400">
                              Error
                            </span>
                          </div>
                          <p className="text-xs text-red-300">{summit.error}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {summit.status === "failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetry("summit", summit.id)}
                            disabled={isProcessing}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reintentar
                          </Button>
                        )}

                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Fotos ({summit.photos.length})
                        </Button>
                      </div>

                      {/* Status Messages */}
                      {summit.status === "verifying" && (
                        <div className="flex items-center gap-2 text-purple-400">
                          <div className="w-3 h-3 animate-spin rounded-full border border-purple-400 border-t-transparent" />
                          <span className="text-xs">
                            Verificación en proceso...
                          </span>
                        </div>
                      )}

                      {summit.status === "minting" && (
                        <div className="flex items-center gap-2 text-orange-400">
                          <div className="w-3 h-3 animate-spin rounded-full border border-orange-400 border-t-transparent" />
                          <span className="text-xs">Minteando NFT...</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Verification Modal */}
      <AutoVerificationModal
        isOpen={showVerificationModal}
        onClose={closeModal}
        type={modalType}
        reservationId={selectedReservation?.id}
        campaignTitle={selectedReservation?.campaignTitle}
        mountainId={selectedSummit?.mountainId}
        mountainName={selectedSummit?.mountainName}
      />
    </div>
  );
}
