"use client"

import React from 'react'

interface NFTBadgeProps {
  type: 'campaign' | 'free-climb'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  name: string
  size?: number
}

const rarityGradients = {
  common: { from: '#9CA3AF', to: '#6B7280', accent: '#374151' },
  rare: { from: '#3B82F6', to: '#1D4ED8', accent: '#1E40AF' },
  epic: { from: '#A855F7', to: '#7C3AED', accent: '#6D28D9' },
  legendary: { from: '#F59E0B', to: '#D97706', accent: '#B45309' }
}

const typeSymbols = {
  campaign: '🏆',
  'free-climb': '🏔️'
}

export function NFTBadge({ type, rarity, name, size = 60 }: NFTBadgeProps) {
  const colors = rarityGradients[rarity]
  const symbol = typeSymbols[type]
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 60 60" 
      className="w-full h-full"
    >
      {/* Background with rarity gradient */}
      <defs>
        <radialGradient id={`gradient-${rarity}-${type}`} cx="50%" cy="30%">
          <stop offset="0%" stopColor={colors.from} />
          <stop offset="100%" stopColor={colors.to} />
        </radialGradient>
        
        {/* Shimmer effect for legendary */}
        {rarity === 'legendary' && (
          <linearGradient id={`shimmer-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values="-120 0;120 0;-120 0"
              dur="2s"
              repeatCount="indefinite"
            />
          </linearGradient>
        )}
        
        <filter id={`glow-${rarity}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Main badge background */}
      <circle 
        cx="30" 
        cy="30" 
        r="27" 
        fill={`url(#gradient-${rarity}-${type})`}
        stroke={colors.accent}
        strokeWidth="1"
        filter={rarity === 'legendary' ? `url(#glow-${rarity})` : 'none'}
      />
      
      {/* Mountain silhouette for backdrop */}
      <path 
        d="M 8 45 L 18 25 L 28 35 L 38 20 L 48 30 L 52 18 L 52 45 Z" 
        fill="rgba(0,0,0,0.2)"
      />
      
      {/* Central symbol */}
      <circle cx="30" cy="23" r="9" fill="rgba(255,255,255,0.9)" />
      <text 
        x="30" 
        y="27" 
        textAnchor="middle" 
        fontSize="10" 
        fill={colors.accent}
      >
        {symbol}
      </text>
      
      {/* Type indicator */}
      <rect 
        x="12" 
        y="38" 
        width="36" 
        height="8" 
        rx="4" 
        fill="rgba(0,0,0,0.7)"
      />
      <text 
        x="30" 
        y="43" 
        textAnchor="middle" 
        fontSize="4" 
        fill="white" 
        fontWeight="bold"
      >
        {rarity.toUpperCase()}
      </text>
      
      {/* Rarity stars */}
      {Array.from({ length: rarity === 'legendary' ? 5 : rarity === 'epic' ? 4 : rarity === 'rare' ? 3 : 2 }).map((_, i) => (
        <text 
          key={i}
          x={20 + i * 4} 
          y="52" 
          textAnchor="middle" 
          fontSize="4" 
          fill="gold"
        >
          ⭐
        </text>
      ))}
      
      {/* Shimmer overlay for legendary */}
      {rarity === 'legendary' && (
        <circle 
          cx="30" 
          cy="30" 
          r="27" 
          fill={`url(#shimmer-${type})`} 
          opacity="0.6"
        />
      )}
    </svg>
  )
}