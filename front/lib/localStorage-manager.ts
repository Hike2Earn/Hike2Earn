"use client";

// Types for localStorage management
export interface CampaignReservation {
  id: string;
  campaignId: string;
  mountainId: number;
  userId: string;
  status: 'reserved' | 'in_progress' | 'verifying' | 'minting' | 'completed' | 'failed';
  reservedAt: number;
  mountainName: string;
  campaignTitle: string;
  verificationPhotos?: string[]; // base64 images
  nftTokenId?: string;
  txHash?: string;
  completedAt?: number;
  error?: string;
}

export interface SummitVerification {
  id: string;
  mountainId: number;
  mountainName: string;
  userId: string;
  status: 'pending' | 'verifying' | 'minting' | 'completed' | 'failed';
  photos: string[]; // base64 images
  createdAt: number;
  nftTokenId?: string;
  txHash?: string;
  completedAt?: number;
  error?: string;
}

const STORAGE_KEYS = {
  RESERVATIONS: 'hike2earn_reservations',
  SUMMIT_VERIFICATIONS: 'hike2earn_summit_verifications',
  USER_NFTS: 'hike2earn_user_nfts'
};

class LocalStorageManager {
  // Campaign Reservations
  getReservations(userId?: string): CampaignReservation[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      const reservations = stored ? JSON.parse(stored) : [];
      
      return userId 
        ? reservations.filter((r: CampaignReservation) => r.userId === userId)
        : reservations;
    } catch (error) {
      console.error('Error getting reservations:', error);
      return [];
    }
  }

  addReservation(reservation: CampaignReservation): void {
    if (typeof window === 'undefined') return;
    
    try {
      const existing = this.getReservations();
      const updated = [...existing, reservation];
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding reservation:', error);
    }
  }

  updateReservation(id: string, updates: Partial<CampaignReservation>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const existing = this.getReservations();
      const updated = existing.map(r => 
        r.id === id ? { ...r, ...updates } : r
      );
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  }

  getReservation(id: string): CampaignReservation | null {
    const reservations = this.getReservations();
    return reservations.find(r => r.id === id) || null;
  }

  getReservationByCampaign(campaignId: string, userId: string): CampaignReservation | null {
    const reservations = this.getReservations(userId);
    return reservations.find(r => r.campaignId === campaignId) || null;
  }

  // Summit Verifications
  getSummitVerifications(userId?: string): SummitVerification[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUMMIT_VERIFICATIONS);
      const verifications = stored ? JSON.parse(stored) : [];
      
      return userId 
        ? verifications.filter((v: SummitVerification) => v.userId === userId)
        : verifications;
    } catch (error) {
      console.error('Error getting summit verifications:', error);
      return [];
    }
  }

  addSummitVerification(verification: SummitVerification): void {
    if (typeof window === 'undefined') return;
    
    try {
      const existing = this.getSummitVerifications();
      const updated = [...existing, verification];
      localStorage.setItem(STORAGE_KEYS.SUMMIT_VERIFICATIONS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding summit verification:', error);
    }
  }

  updateSummitVerification(id: string, updates: Partial<SummitVerification>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const existing = this.getSummitVerifications();
      const updated = existing.map(v => 
        v.id === id ? { ...v, ...updates } : v
      );
      localStorage.setItem(STORAGE_KEYS.SUMMIT_VERIFICATIONS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating summit verification:', error);
    }
  }

  getSummitVerification(id: string): SummitVerification | null {
    const verifications = this.getSummitVerifications();
    return verifications.find(v => v.id === id) || null;
  }

  // User NFTs tracking
  getUserNFTs(userId: string): string[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_NFTS);
      const nfts = stored ? JSON.parse(stored) : {};
      return nfts[userId] || [];
    } catch (error) {
      console.error('Error getting user NFTs:', error);
      return [];
    }
  }

  addUserNFT(userId: string, tokenId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_NFTS);
      const nfts = stored ? JSON.parse(stored) : {};
      
      if (!nfts[userId]) {
        nfts[userId] = [];
      }
      
      if (!nfts[userId].includes(tokenId)) {
        nfts[userId].push(tokenId);
        localStorage.setItem(STORAGE_KEYS.USER_NFTS, JSON.stringify(nfts));
      }
    } catch (error) {
      console.error('Error adding user NFT:', error);
    }
  }

  // Utility functions
  generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  hasReservation(campaignId: string, userId: string): boolean {
    return this.getReservationByCampaign(campaignId, userId) !== null;
  }

  clearAllData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.RESERVATIONS);
      localStorage.removeItem(STORAGE_KEYS.SUMMIT_VERIFICATIONS);
      localStorage.removeItem(STORAGE_KEYS.USER_NFTS);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  // Get all pending verifications (for debugging)
  getAllPendingVerifications(): {
    reservations: CampaignReservation[];
    summits: SummitVerification[];
  } {
    return {
      reservations: this.getReservations().filter(r => 
        ['verifying', 'minting'].includes(r.status)
      ),
      summits: this.getSummitVerifications().filter(s => 
        ['verifying', 'minting'].includes(s.status)
      )
    };
  }
}

// Export singleton instance
export const storageManager = new LocalStorageManager();

// Export utility functions
export const createReservationId = () => storageManager.generateId();
export const createVerificationId = () => storageManager.generateId();

// Helper function to convert File to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Mock data for demo
export const DEMO_MOUNTAINS = [
  { id: 0, name: "Cerro de la Silla", campaignId: 0 },
  { id: 1, name: "Cerro de las Mitras", campaignId: 0 },
  { id: 2, name: "Volcán Nevado", campaignId: 1 }
];

export const createMockProofURI = (mountainId: number): string => {
  return `ipfs://QmDemo${mountainId}${Date.now()}/climb-proof.json`;
};