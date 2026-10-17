import React, { useState } from 'react';
import { Activity, ShieldAlert, AlertTriangle, Eye, Zap, Flame } from 'lucide-react';

interface BodyScanner3DProps {
  selectedRegion: string;
  onSelectRegion?: (region: string) => void;
}

interface BodyPart {
  id: string;
  name: string;
  sensitivity: 'CRITICAL EXTREME' | 'HIGH SENSITIVITY' | 'MODERATE SENSITIVITY';
  score: number;
  risk: string;
  color: string;
  cx: number;
  cy: number;
  r: number;
}

export const BodyScanner3D: React.FC<BodyScanner3DProps> = ({ selectedRegion, onSelectRegion }) => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const bodyParts: BodyPart[] = [
    { id: 'face', name: 'Facial Zone & Eyes', sensitivity: 'CRITICAL EXTREME', score: 10, risk: 'Airway obstruction, permanent blindness, severe disfigurement', color: '#ef4444', cx: 120, cy: 45, r: 16 },
    { id: 'neck', name: 'Anterior & Posterior Neck', sensitivity: 'CRITICAL EXTREME', score: 9, risk: 'Airway constriction, carotid vascular compromise', color: '#ef4444', cx: 120, cy: 75, r: 12 },
    { id: 'genitals', name: 'Perineum & Genital Region', sensitivity: 'CRITICAL EXTREME', score: 9, risk: 'Urethral stricture, sepsis, loss of pelvic function', color: '#ef4444', cx: 120, cy: 225, r: 14 },
    { id: 'hands', name: 'Palms & Bilateral Hands', sensitivity: 'HIGH SENSITIVITY', score: 8, risk: 'Flexor tendon contractures, permanent loss of fine motor dexterity', color: '#f59e0b', cx: 55, cy: 190, r: 14 },
    { id: 'feet', name: 'Bilateral Feet & Ankle', sensitivity: 'HIGH SENSITIVITY', score: 8, risk: 'Weight-bearing disability, deep plantar fascia destruction', color: '#f59e0b', cx: 100, cy: 345, r: 14 },
    { id: 'joint', name: 'Major Joints (Elbows/Knees)', sensitivity: 'HIGH SENSITIVITY', score: 8, risk: 'Joint ankylosis, severe functional movement restriction', color: '#f59e0b', cx: 65, cy: 145, r: 12 },
    { id: 'torso', name: 'Chest & Abdominal Wall', sensitivity: 'MODERATE SENSITIVITY', score: 6, risk: 'Chest wall restriction requiring emergency escharotomy', color: '#14b8a6', cx: 120, cy: 135, r: 24 },
    { id: 'arm', name: 'Upper Extremities / Arms', sensitivity: 'MODERATE SENSITIVITY', score: 5, risk: 'Compartment syndrome in circumferential burns', color: '#14b8a6', cx: 70, cy: 110, r: 14 },
    { id: 'leg', name: 'Lower Extremities / Thighs', sensitivity: 'MODERATE SENSITIVITY', score: 5, risk: 'Deep vein thrombosis, extensive fluid loss area', color: '#14b8a6', cx: 105, cy: 285, r: 18 }
  ];

  const activePart = bodyParts.find((p) => p.id === (hoveredPart || selectedRegion)) || bodyParts[0];

  return (
    <div className="glass-panel p-6 rounded-3xl border border-rose-500/20 space-y-6 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-rose-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            3D Holographic Anatomical Sensitivity Scanner
          </span>
          <h3 className="text-lg font-black text-slate-100 mt-0.5">
            Interactive Human Sensitivity Detector
          </h3>
        </div>

        <span className="px-3 py-1 bg-slate-900 text-teal-300 font-mono font-bold text-xs rounded-xl border border-slate-800 flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          Live Active Mapping
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* 3D Visual Hologram Body Diagram */}
        <div className="relative bg-slate-950/80 rounded-2xl p-6 border border-slate-800 flex items-center justify-center min-h-[360px] shadow-2xl">
          <svg viewBox="0 0 240 390" className="w-48 h-full drop-shadow-2xl">
            {/* Cybernetic Grid Background lines */}
            <line x1="0" y1="60" x2="240" y2="60" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1="180" x2="240" y2="180" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1="300" x2="240" y2="300" stroke="#1e293b" strokeDasharray="3 3" />

            {/* Human Silhouette Wireframe */}
            {/* Head */}
            <circle cx="120" cy="45" r="22" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            {/* Neck */}
            <rect x="112" y="67" width="16" height="16" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            {/* Torso */}
            <path d="M 90,83 L 150,83 L 140,210 L 100,210 Z" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            {/* Arms */}
            <path d="M 88,85 L 60,150 L 45,200" fill="none" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
            <path d="M 152,85 L 180,150 L 195,200" fill="none" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
            {/* Hands */}
            <circle cx="45" cy="202" r="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            <circle cx="195" cy="202" r="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            {/* Legs */}
            <path d="M 105,210 L 100,340 L 95,365" fill="none" stroke="#334155" strokeWidth="16" strokeLinecap="round" />
            <path d="M 135,210 L 140,340 L 145,365" fill="none" stroke="#334155" strokeWidth="16" strokeLinecap="round" />

            {/* Pulsating Anatomical Hotspot Nodes */}
            {bodyParts.map((part) => {
              const isSelected = selectedRegion === part.id;
              const isHovered = hoveredPart === part.id;
              const active = isSelected || isHovered;

              return (
                <g
                  key={part.id}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPart(part.id)}
                  onMouseLeave={() => setHoveredPart(null)}
                  onClick={() => onSelectRegion && onSelectRegion(part.id)}
                >
                  {/* Outer Pulsating Ring */}
                  <circle
                    cx={part.cx}
                    cy={part.cy}
                    r={part.r + (active ? 8 : 4)}
                    fill="none"
                    stroke={part.color}
                    strokeWidth={active ? '2.5' : '1'}
                    opacity={active ? 0.9 : 0.4}
                    className={active ? 'animate-ping' : ''}
                  />
                  {/* Core Node Circle */}
                  <circle
                    cx={part.cx}
                    cy={part.cy}
                    r={part.r}
                    fill={part.color}
                    opacity={active ? 0.95 : 0.65}
                    stroke="#ffffff"
                    strokeWidth={active ? '2' : '0.5'}
                  />
                  {/* Label Text */}
                  {active && (
                    <text
                      x={part.cx}
                      y={part.cy - part.r - 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {part.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sensitivity Metrics HUD Panel */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Target Anatomical Region</span>
              <span className="text-xs font-mono font-extrabold text-teal-300 capitalize">{activePart.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Sensitivity Level</span>
              <span
                className="text-xs font-black px-2.5 py-1 rounded-md border"
                style={{ backgroundColor: `${activePart.color}20`, color: activePart.color, borderColor: `${activePart.color}40` }}
              >
                {activePart.sensitivity}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Sensitivity Risk Score</span>
              <span className="text-lg font-mono font-black text-slate-100">{activePart.score} / 10</span>
            </div>

            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${activePart.score * 10}%`, backgroundColor: activePart.color }}
              />
            </div>
          </div>

          {/* Clinical Risk Explanation Box */}
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Anatomical Destruction Risk</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">{activePart.risk}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
