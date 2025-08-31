"use client";

import { useEffect, useCallback } from "react";
import type { ClimbData, ClimbSession } from "@/components/climb-tracker";

export interface ClimbHistory {
  id: string;
  session: ClimbSession;
  createdAt: number;
  status: 'completed' | 'abandoned' | 'failed';
  nftTokenId?: string;
}

const STORAGE_KEYS = {
  ACTIVE_SESSION: 'hike2earn_active_climb',
  CLIMB_HISTORY: 'hike2earn_climb_history',
  CLIMB_SESSIONS: 'hike2earn_climb_sessions',
} as const;

export function useClimbPersistence(sessionId: string | null) {
  
  // Save active climb session
  const saveSession = useCallback((climbData: ClimbData) => {
    if (!sessionId || climbData.status === 'idle') return;

    const session: ClimbSession = {
      id: sessionId,
      startTime: climbData.startTime!,
      endTime: climbData.endTime,
      duration: climbData.duration,
      maxAltitude: climbData.altitude,
      totalDistance: climbData.distance,
      elevationGain: climbData.elevationGain,
      gpsPath: climbData.gpsPath,
      summitCoords: climbData.currentLocation,
      photos: [], // Photos are handled separately due to size
      status: climbData.isActive ? 'active' : 'paused'
    };

    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify({
        sessionId,
        session,
        lastUpdated: Date.now()
      }));

      // Also save to sessions history
      const existingSessions = getClimbSessions();
      existingSessions[sessionId] = session;
      localStorage.setItem(STORAGE_KEYS.CLIMB_SESSIONS, JSON.stringify(existingSessions));
      
      console.log("✅ Climb session saved:", sessionId);
    } catch (error) {
      console.error("❌ Failed to save climb session:", error);
    }
  }, [sessionId]);

  // Load active climb session
  const loadActiveSession = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (!stored) return null;

      const { sessionId: storedId, session, lastUpdated } = JSON.parse(stored);
      
      // Check if session is not too old (max 24 hours)
      if (Date.now() - lastUpdated > 24 * 60 * 60 * 1000) {
        console.log("⏰ Active session expired, removing...");
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
        return null;
      }

      return { sessionId: storedId, session };
    } catch (error) {
      console.error("❌ Failed to load active session:", error);
      return null;
    }
  }, []);

  // Complete climb session and move to history
  const completeSession = useCallback((climbData: ClimbData, nftTokenId?: string) => {
    if (!sessionId) return;

    const finalSession: ClimbSession = {
      id: sessionId,
      startTime: climbData.startTime!,
      endTime: climbData.endTime || new Date(),
      duration: climbData.duration,
      maxAltitude: climbData.altitude,
      totalDistance: climbData.distance,
      elevationGain: climbData.elevationGain,
      gpsPath: climbData.gpsPath,
      summitCoords: climbData.currentLocation,
      photos: [], // Base64 strings would make this too large
      status: 'completed'
    };

    const historyEntry: ClimbHistory = {
      id: sessionId,
      session: finalSession,
      createdAt: Date.now(),
      status: 'completed',
      nftTokenId
    };

    try {
      // Add to history
      const history = getClimbHistory();
      history.unshift(historyEntry); // Add to beginning
      
      // Keep only last 50 climbs
      if (history.length > 50) {
        history.splice(50);
      }
      
      localStorage.setItem(STORAGE_KEYS.CLIMB_HISTORY, JSON.stringify(history));

      // Remove active session
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);

      console.log("✅ Climb completed and saved to history:", sessionId);
    } catch (error) {
      console.error("❌ Failed to complete session:", error);
    }
  }, [sessionId]);

  // Abandon current session
  const abandonSession = useCallback((reason: string = "User abandoned") => {
    if (!sessionId) return;

    try {
      const active = loadActiveSession();
      if (active) {
        const historyEntry: ClimbHistory = {
          id: sessionId,
          session: active.session,
          createdAt: Date.now(),
          status: 'abandoned'
        };

        const history = getClimbHistory();
        history.unshift(historyEntry);
        localStorage.setItem(STORAGE_KEYS.CLIMB_HISTORY, JSON.stringify(history));
      }

      // Remove active session
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      
      console.log("⚠️ Session abandoned:", sessionId, reason);
    } catch (error) {
      console.error("❌ Failed to abandon session:", error);
    }
  }, [sessionId, loadActiveSession]);

  // Get climb history
  const getClimbHistory = useCallback((): ClimbHistory[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLIMB_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("❌ Failed to get climb history:", error);
      return [];
    }
  }, []);

  // Get all climb sessions
  const getClimbSessions = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLIMB_SESSIONS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("❌ Failed to get climb sessions:", error);
      return {};
    }
  }, []);

  // Get climb statistics
  const getClimbStats = useCallback(() => {
    const history = getClimbHistory();
    const completed = history.filter(h => h.status === 'completed');
    
    if (completed.length === 0) {
      return {
        totalClimbs: 0,
        totalDistance: 0,
        totalElevation: 0,
        totalDuration: 0,
        highestAltitude: 0,
        nftCount: 0,
        averageDistance: 0,
        averageDuration: 0
      };
    }

    const stats = completed.reduce((acc, climb) => {
      acc.totalDistance += climb.session.totalDistance;
      acc.totalElevation += climb.session.elevationGain;
      acc.totalDuration += climb.session.duration;
      acc.highestAltitude = Math.max(acc.highestAltitude, climb.session.maxAltitude);
      if (climb.nftTokenId) acc.nftCount++;
      return acc;
    }, {
      totalDistance: 0,
      totalElevation: 0,
      totalDuration: 0,
      highestAltitude: 0,
      nftCount: 0
    });

    return {
      totalClimbs: completed.length,
      ...stats,
      averageDistance: stats.totalDistance / completed.length,
      averageDuration: stats.totalDuration / completed.length
    };
  }, [getClimbHistory]);

  // Clear all data (for testing/reset)
  const clearAllData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log("🗑️ All climb data cleared");
  }, []);

  // Auto-save when window closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId) {
        console.log("💾 Auto-saving session before page unload");
        // The actual saving happens through the normal saveSession calls
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && sessionId) {
        console.log("💾 Auto-saving session on visibility change");
        // The actual saving happens through the normal saveSession calls
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionId]);

  return {
    saveSession,
    loadActiveSession,
    completeSession,
    abandonSession,
    getClimbHistory,
    getClimbSessions,
    getClimbStats,
    clearAllData
  };
}