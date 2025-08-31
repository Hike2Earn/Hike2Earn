"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/components/wallet-provider";
import { useAutoMint } from "@/hooks/useAutoMint";
import {
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Trophy,
  Camera,
} from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  mountain: string;
  location: string;
  startDate: string;
  endDate: string;
  mountainId: number; // For smart contract
}

interface ReservationSystemProps {
  campaign: Campaign;
  onReservationChange?: (hasReservation: boolean) => void;
}

export function ReservationSystem({
  campaign,
  onReservationChange,
}: ReservationSystemProps) {
  const { isConnected, address } = useWallet();
  const {
    createReservation,
    hasReservation,
    getUserReservations,
    isProcessing,
  } = useAutoMint();

  const [isReserved, setIsReserved] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user already has a reservation
  useEffect(() => {
    if (!isConnected || !address) {
      setIsReserved(false);
      setReservationId(null);
      return;
    }

    const hasRes = hasReservation(campaign.id);
    setIsReserved(hasRes);

    if (hasRes) {
      const reservations = getUserReservations();
      const reservation = reservations.find(
        (r) => r.campaignId === campaign.id
      );
      setReservationId(reservation?.id || null);
    }

    onReservationChange?.(hasRes);
  }, [
    campaign.id,
    hasReservation,
    getUserReservations,
    isConnected,
    address,
    onReservationChange,
  ]);

  const handleReservation = async () => {
    if (!isConnected || !address) return;

    setLoading(true);
    try {
      const id = createReservation(
        campaign.id,
        campaign.title,
        campaign.mountainId,
        campaign.mountain
      );

      setReservationId(id);
      setIsReserved(true);
      onReservationChange?.(true);
    } catch (error) {
      console.error("Failed to create reservation:", error);
    } finally {
      setLoading(false);
    }
  };

  const getReservationStatus = () => {
    if (!reservationId) return null;

    const reservations = getUserReservations();
    const reservation = reservations.find((r) => r.id === reservationId);
    return reservation?.status || "reserved";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      reserved: {
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        icon: Clock,
        label: "Reserved",
      },
      in_progress: {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: Clock,
        label: "En progreso",
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
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const isEventActive = () => {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    return now >= startDate && now <= endDate;
  };

  const isEventUpcoming = () => {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    return now < startDate;
  };

  const isEventPast = () => {
    const now = new Date();
    const endDate = new Date(campaign.endDate);
    return now > endDate;
  };

  if (!isConnected) {
    return (
      <div className="text-center p-4 bg-muted/20 rounded-lg border border-muted/30">
        <p className="text-sm text-muted-foreground mb-2">
          Connect your wallet to participate
        </p>
        <Button variant="outline" size="sm" disabled>
          Connect Wallet
        </Button>
      </div>
    );
  }

  if (isReserved) {
    const status = getReservationStatus();
    const statusBadge = status ? getStatusBadge(status) : null;

    return (
      <div className="space-y-4">
        {/* Reservation Status */}
        <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold text-primary">Spot Reserved!</p>
              <p className="text-sm text-muted-foreground">
                Event added to your calendar
              </p>
            </div>
          </div>
          {statusBadge}
        </div>

        {/* Campaign Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(campaign.startDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>
              {campaign.mountain} - {campaign.location}
            </span>
          </div>
        </div>

        {/* Event Status Information */}
        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
          {isEventUpcoming() && (
            <div className="flex items-center gap-2 text-blue-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Upcoming Event - Get Ready for the Adventure
              </span>
            </div>
          )}

          {isEventActive() && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">
                Event Active! - You can now upload your verification
              </span>
            </div>
          )}

          {isEventPast() && status === "reserved" && (
            <div className="flex items-center gap-2 text-orange-400">
              <Camera className="w-4 h-4" />
              <span className="text-sm">
                Evento finalizado - Sube tu verificación para obtener el NFT
              </span>
            </div>
          )}

          {status === "completed" && (
            <div className="flex items-center gap-2 text-green-400">
              <Trophy className="w-4 h-4" />
              <span className="text-sm">
                ¡Felicidades! NFT minteado exitosamente
              </span>
            </div>
          )}
        </div>

        {/* Processing indicator */}
        {isProcessing && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-orange-400">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
              <span className="text-sm">Procesando verificación...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Campaign Preview */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(campaign.startDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>
            {campaign.mountain} - {campaign.location}
          </span>
        </div>
      </div>

      {/* Reservation Button */}
      <Button
        onClick={handleReservation}
        disabled={loading || isEventPast()}
        className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            Reserving...
          </>
        ) : isEventPast() ? (
          "Event Ended"
        ) : (
          "Reserve Spot"
        )}
      </Button>

      {isEventPast() && (
        <p className="text-xs text-center text-muted-foreground">
          Este evento ya finalizó. Busca próximos eventos disponibles.
        </p>
      )}
    </div>
  );
}
