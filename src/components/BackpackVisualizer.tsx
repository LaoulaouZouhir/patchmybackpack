import React, { useState, useRef, useEffect } from 'react';
import type { Spot, SpotCoords } from '../data/auctionData';
import { ExternalLink, ArrowUpRight, Move, Sliders, RotateCcw, Check, Copy, Box, CopyCheck, Eye, Sparkles } from 'lucide-react';
import { getFaviconFromUrl } from '../lib/urlUtils';

interface BackpackVisualizerProps {
  spots: Spot[];
  selectedSpotId: number | null;
  onSelectSpot: (spot: Spot) => void;
  onBidSpot: (spot: Spot) => void;
  onUpdateSpots: (updatedSpots: Spot[]) => void;
  onResetSpots: () => void;
  currency: 'EUR' | 'USD';
  currencyRate: number;
}

export const BackpackVisualizer: React.FC<BackpackVisualizerProps> = ({
  spots,
  selectedSpotId,
  onSelectSpot,
  onBidSpot,
  onUpdateSpots,
  onResetSpots,
  currency,
  currencyRate,
}) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [hoveredSpotId, setHoveredSpotId] = useState<number | null>(null);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [canCalibrate, setCanCalibrate] = useState<boolean>(false);
  const [showGhostOverlay, setShowGhostOverlay] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [matchedNotification, setMatchedNotification] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('calibrate') === 'true') {
        setCanCalibrate(true);
      }
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.shiftKey && e.key.toLowerCase() === 'c') {
          setCanCalibrate((prev) => !prev);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingSpotId, setDraggingSpotId] = useState<number | null>(null);
  const [resizingSpotId, setResizingSpotId] = useState<number | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialTop: number; initialLeft: number; initialWidth: number; initialHeight: number }>({
    mouseX: 0,
    mouseY: 0,
    initialTop: 0,
    initialLeft: 0,
    initialWidth: 0,
    initialHeight: 0,
  });

  const formatPrice = (amountInEur: number) => {
    if (currency === 'USD') {
      return `$${Math.round(amountInEur * currencyRate)}`;
    }
    return `${amountInEur} €`;
  };

  const getSpotCoords = (spot: Spot): SpotCoords => {
    if (viewMode === '3d') {
      return spot.coords3d || spot.coords || spot.coords2d;
    }
    return spot.coords2d || spot.coords;
  };

  const activeSpot = spots.find(s => s.id === (hoveredSpotId || selectedSpotId || 1)) || spots[0];
  const activeSpotCoords = activeSpot ? getSpotCoords(activeSpot) : { top: '0%', left: '0%', width: '0%', height: '0%' };

  // Match 2D to 3D handlers
  const handleMatchSpotFrom2D = (spotId: number) => {
    const updated = spots.map((spot) => {
      if (spot.id === spotId) {
        return {
          ...spot,
          coords3d: {
            ...spot.coords3d,
            top: spot.coords2d.top,
            left: spot.coords2d.left,
            width: spot.coords2d.width,
            height: spot.coords2d.height,
          }
        };
      }
      return spot;
    });
    onUpdateSpots(updated);
    setMatchedNotification(`Spot #${spotId} matched from 2D!`);
    setTimeout(() => setMatchedNotification(null), 2000);
  };

  const handleMatchAllFrom2D = () => {
    const updated = spots.map((spot) => ({
      ...spot,
      coords3d: {
        ...spot.coords3d,
        top: spot.coords2d.top,
        left: spot.coords2d.left,
        width: spot.coords2d.width,
        height: spot.coords2d.height,
      }
    }));
    onUpdateSpots(updated);
    setMatchedNotification('All spots matched from 2D baseline!');
    setTimeout(() => setMatchedNotification(null), 2500);
  };

  // Dragging & Resizing Handlers
  const handleMouseDown = (e: React.MouseEvent, spot: Spot, isResizeHandle = false) => {
    if (!isCalibrating) return;
    e.stopPropagation();
    e.preventDefault();

    onSelectSpot(spot);

    if (containerRef.current) {
      const currentCoords = getSpotCoords(spot);
      const initialTop = parseFloat(currentCoords.top);
      const initialLeft = parseFloat(currentCoords.left);
      const initialWidth = parseFloat(currentCoords.width);
      const initialHeight = parseFloat(currentCoords.height);

      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        initialTop,
        initialLeft,
        initialWidth,
        initialHeight,
      };

      if (isResizeHandle) {
        setResizingSpotId(spot.id);
      } else {
        setDraggingSpotId(spot.id);
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isCalibrating || !containerRef.current) return;
      if (!draggingSpotId && !resizingSpotId) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragStartRef.current.mouseX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStartRef.current.mouseY) / rect.height) * 100;

      const targetId = draggingSpotId || resizingSpotId;

      const updated = spots.map((spot) => {
        if (spot.id === targetId) {
          const currentCoords = getSpotCoords(spot);
          const coordKey = viewMode === '3d' ? 'coords3d' : 'coords2d';

          if (draggingSpotId) {
            const newLeft = Math.max(0, Math.min(100 - parseFloat(currentCoords.width), dragStartRef.current.initialLeft + deltaXPercent));
            const newTop = Math.max(0, Math.min(100 - parseFloat(currentCoords.height), dragStartRef.current.initialTop + deltaYPercent));
            return {
              ...spot,
              [coordKey]: {
                ...currentCoords,
                left: `${newLeft.toFixed(1)}%`,
                top: `${newTop.toFixed(1)}%`,
              }
            };
          } else if (resizingSpotId) {
            const newWidth = Math.max(5, Math.min(90, dragStartRef.current.initialWidth + deltaXPercent));
            const newHeight = Math.max(5, Math.min(90, dragStartRef.current.initialHeight + deltaYPercent));
            return {
              ...spot,
              [coordKey]: {
                ...currentCoords,
                width: `${newWidth.toFixed(1)}%`,
                height: `${newHeight.toFixed(1)}%`,
              }
            };
          }
        }
        return spot;
      });

      onUpdateSpots(updated);
    };

    const handleMouseUp = () => {
      setDraggingSpotId(null);
      setResizingSpotId(null);
    };

    if (draggingSpotId || resizingSpotId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isCalibrating, draggingSpotId, resizingSpotId, spots, viewMode, onUpdateSpots]);

  const copyConfigToClipboard = () => {
    const coordsOnly = spots.map(s => ({
      id: s.id,
      label: s.label,
      coords2d: s.coords2d,
      coords3d: s.coords3d,
    }));
    navigator.clipboard.writeText(JSON.stringify(coordsOnly, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTransformStyle = (coords: SpotCoords) => {
    if (viewMode === '3d') {
      const rx = coords.rotateX || '0deg';
      const ry = coords.rotateY || '0deg';
      const rz = coords.rotateZ || '0deg';
      const sx = coords.skewX || '0deg';
      const sy = coords.skewY || '0deg';
      return `perspective(500px) rotateX(${rx}) rotateY(${ry}) rotateZ(${rz}) skewX(${sx}) skewY(${sy})`;
    }
    return 'none';
  };

  // Helper to apply quick 3D angle presets
  const apply3DPreset = (rx: string, ry: string, rz: string, sx: string, sy: string) => {
    if (!activeSpot) return;
    const updated = spots.map(s => {
      if (s.id === activeSpot.id) {
        return {
          ...s,
          coords3d: {
            ...getSpotCoords(s),
            rotateX: rx,
            rotateY: ry,
            rotateZ: rz,
            skewX: sx,
            skewY: sy,
          }
        };
      }
      return s;
    });
    onUpdateSpots(updated);
  };

  return (
    <div id="spots" className="scroll-mt-24 mx-auto max-w-5xl px-6">
           {/* Top Controls Bar - Centered View Switcher */}
      <div className="flex items-center justify-center relative mb-6">
        
        {/* Prominent Centered Live Auction vs Final Look Toggle */}
        <div
          role="group"
          aria-label="Backpack view mode toggle"
          className="flex items-center rounded-2xl bg-surface-200/90 p-1 border border-hairline shadow-sm"
        >
          {/* Live Auction Tab */}
          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all cursor-pointer ${
              viewMode === '2d'
                ? 'bg-white text-ink shadow-[0_2px_4px_rgba(0,0,0,0.06)]'
                : 'text-ink-muted hover:text-ink hover:bg-white/50'
            }`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-green"></span>
            </span>
            <span>Live Auction</span>
          </button>

          {/* Final Look Tab */}
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all cursor-pointer ${
              viewMode === '3d'
                ? 'bg-white text-ink shadow-[0_2px_4px_rgba(0,0,0,0.06)]'
                : 'text-ink-muted hover:text-ink hover:bg-white/50'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-cognac" />
            <span>Final Look</span>
          </button>
        </div>

        {/* Calibration Mode Toggle & Tools (Hidden by default for visitors, pinned right when enabled) */}
        {canCalibrate && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCalibrating(!isCalibrating)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all cursor-pointer border ${
                isCalibrating
                  ? 'bg-amber-950 text-amber-200 border-amber-800 shadow-sm'
                  : 'bg-white text-ink-muted border-hairline hover:text-ink'
              }`}
            >
              <Move className="h-3.5 w-3.5" />
              <span>{isCalibrating ? `Exit Calibration (${viewMode === '2d' ? 'Live Auction' : 'Final Look'})` : `✏️ Calibrate Spots`}</span>
            </button>

            {isCalibrating && (
              <>
                {/* Match 2D Button (Visible in 3D Mode) */}
                {viewMode === '3d' && (
                  <button
                    type="button"
                    onClick={handleMatchAllFrom2D}
                    className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-semibold text-accent-blue border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer shadow-subtle"
                    title="Copy all spot positions and sizes from Live Auction to Final Look"
                  >
                    <CopyCheck className="h-3.5 w-3.5" />
                    <span>Match 2D</span>
                  </button>
                )}

                {/* Ghost 2D Overlay Guide Toggle */}
                {viewMode === '3d' && (
                  <button
                    type="button"
                    onClick={() => setShowGhostOverlay(!showGhostOverlay)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-medium border transition-colors cursor-pointer ${
                      showGhostOverlay
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white text-ink-muted border-hairline hover:text-ink'
                    }`}
                    title="Overlay translucent 2D blueprint guide for visual alignment"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Ghost 2D</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={copyConfigToClipboard}
                  className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-ink border border-hairline hover:bg-surface-100 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-accent-green" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied JSON!' : 'Copy Coords'}</span>
                </button>

                <button
                  type="button"
                  onClick={onResetSpots}
                  className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[12px] font-medium text-ink-subtle border border-hairline hover:text-ink hover:bg-surface-100 transition-colors cursor-pointer"
                  title="Reset to default coordinates"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        )}

      </div>

      {canCalibrate && isCalibrating && (
        <div className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200/70 text-left flex items-center justify-between">
          <p>
            🖐️ <strong>Calibrating {viewMode === '2d' ? 'Live Auction (2D)' : 'Final Look (3D)'} View:</strong>{' '}
            {viewMode === '3d'
              ? 'Click "Match 2D" to copy all 2D positions as your starting point, then fine-tune with the 3D bend sliders.'
              : 'Drag any spot or resize corner. Switch to Final Look anytime to calibrate both perspectives.'}
          </p>
          {matchedNotification && (
            <span className="shrink-0 font-semibold text-accent-blue bg-blue-100/80 px-2 py-0.5 rounded-lg text-[11px]">
              {matchedNotification}
            </span>
          )}
        </div>
      )}

      {/* Backpack Stage / Canvas Container */}
      <div className="relative mx-auto max-w-4xl">
        <div className="relative w-full rounded-3xl bg-surface-100/60 p-4 sm:p-8 border border-hairline/80 shadow-float">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Bag Canvas with 3D Perspective Transform */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              
              <div
                ref={containerRef}
                style={{ perspective: '800px' }}
                className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5] flex items-center justify-center select-none"
              >
                {/* Backpack Image */}
                <img
                  src={viewMode === '2d' ? '/backpack-2d.png' : '/backpack-3d.png'}
                  alt="Patch My Backpack visual model"
                  className="w-full h-full object-contain select-none transition-all duration-300 rounded-2xl pointer-events-none drop-shadow-sm"
                  draggable={false}
                />

                {/* Optional Ghost 2D Blueprint Guide Overlay */}
                {viewMode === '3d' && showGhostOverlay && (
                  <img
                    src="/backpack-2d.png"
                    alt="2D Blueprint Ghost Guide"
                    className="absolute inset-0 w-full h-full object-contain opacity-35 mix-blend-multiply pointer-events-none transition-opacity"
                  />
                )}

                {/* Hotspots Overlay */}
                <div className="absolute inset-0 pointer-events-auto" style={{ transformStyle: 'preserve-3d' }}>
                  {spots.map((spot) => {
                    const coords = getSpotCoords(spot);
                    const isHovered = hoveredSpotId === spot.id;
                    const isSelected = selectedSpotId === spot.id;
                    const transform = getTransformStyle(coords);

                    return (
                      <div
                        key={spot.id}
                        onMouseDown={(e) => handleMouseDown(e, spot, false)}
                        onClick={() => {
                          if (!isCalibrating) {
                            onSelectSpot(spot);
                            onBidSpot(spot);
                          }
                        }}
                        onMouseEnter={() => !isCalibrating && setHoveredSpotId(spot.id)}
                        onMouseLeave={() => !isCalibrating && setHoveredSpotId(null)}
                        style={{
                          top: coords.top,
                          left: coords.left,
                          width: coords.width,
                          height: coords.height,
                          transform,
                          transformOrigin: 'center center',
                        }}
                        className={`group absolute flex flex-col items-center justify-center rounded-xl transition-all ${
                          isCalibrating
                            ? isSelected
                              ? 'border-2 border-accent-blue bg-accent-blue/20 shadow-md cursor-move z-30 ring-2 ring-accent-blue/30'
                              : 'border-2 border-dashed border-amber-900/60 bg-amber-950/15 cursor-move z-10 hover:border-accent-blue hover:bg-accent-blue/10'
                            : isSelected || isHovered
                              ? 'border-2 border-accent-blue bg-white/80 shadow-lg scale-105 z-20 ring-2 ring-accent-blue/20 cursor-pointer overflow-hidden backdrop-blur-[1px]'
                              : spot.bidCount > 0
                                ? 'border border-solid border-cognac/40 bg-cognac/10 hover:border-accent-blue z-10 cursor-pointer overflow-hidden'
                                : 'border border-dashed border-ink/30 bg-white/40 hover:border-accent-blue hover:bg-white/70 z-10 cursor-pointer overflow-hidden'
                        }`}
                      >
                        {/* Spot Content */}
                        {spot.bidCount > 0 && spot.topBidder.brand ? (
                          <div className="flex h-full w-full flex-col items-center justify-center p-1.5 select-none pointer-events-none text-center bg-white/95 rounded-xl shadow-sm border border-cognac/40 overflow-hidden">
                            {(spot.topBidder.logo || getFaviconFromUrl(spot.topBidder.url)) ? (
                              <div className="flex flex-col items-center justify-center h-full w-full">
                                <img
                                  src={spot.topBidder.logo || getFaviconFromUrl(spot.topBidder.url)}
                                  alt={spot.topBidder.brand}
                                  className="h-7 w-7 sm:h-8 sm:w-8 max-h-[65%] max-w-[75%] object-contain rounded drop-shadow-sm"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                                <span className="text-[8.5px] sm:text-[9.5px] font-semibold tabular-nums text-cognac mt-0.5 leading-tight">
                                  {formatPrice(spot.currentBid)}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full w-full">
                                <span className="text-[10px] sm:text-[11px] font-bold text-ink truncate px-1 max-w-full">
                                  {spot.topBidder.brand}
                                </span>
                                <span className="text-[8.5px] sm:text-[9.5px] font-semibold tabular-nums text-cognac mt-0.5">
                                  {formatPrice(spot.currentBid)}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-between p-1 select-none pointer-events-none">
                            <span className="flex items-center justify-center min-h-0 flex-1">
                              <span className="text-[10px] sm:text-[11px] font-semibold text-ink truncate max-w-full px-1">
                                #{spot.id} Available
                              </span>
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-medium tabular-nums text-ink-muted">
                              from {formatPrice(spot.startingBid)}
                            </span>
                          </div>
                        )}

                        {/* Resize Corner Handle */}
                        {isCalibrating && isSelected && (
                          <div
                            onMouseDown={(e) => handleMouseDown(e, spot, true)}
                            className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-accent-blue border-2 border-white shadow-md cursor-nwse-resize z-40 hover:scale-125 transition-transform"
                            title="Drag to resize"
                          />
                        )}

                        {/* Hover Overlay */}
                        {!isCalibrating && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-black/15 backdrop-blur-[1px]">
                            <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
                              {spot.bidCount > 0 ? 'Outbid' : 'Claim Spot'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="mt-3 text-[11.5px] text-ink-subtle text-center">
                {isCalibrating ? `Calibrating ${viewMode === '2d' ? 'Live Auction' : 'Final Look'} coordinates & surface curvature.` : 'Tap any spot on the bag to inspect details or outbid.'}
              </p>

            </div>

            {/* Right: Selected Spot Inspector & 3D Bend Controls */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full bg-white rounded-2xl p-6 sm:p-7 border border-hairline shadow-subtle">
              {activeSpot && (
                <div className="space-y-5">
                  
                  {/* Spot Header */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-surface-200 text-[11px] font-bold text-ink-muted">
                          {activeSpot.id}
                        </span>
                        <span className="text-[12px] text-ink-muted font-medium">
                          {activeSpot.zone} · {activeSpot.dimensions}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-surface-200 text-ink">
                        Size {activeSpot.size}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-ink tracking-tight">
                      {activeSpot.label}
                    </h3>
                  </div>

                  {/* Calibration Slider Controls */}
                  {isCalibrating ? (
                    <div className="space-y-3.5 p-4 rounded-xl bg-surface-100 border border-hairline text-xs">
                      
                      <div className="flex items-center justify-between font-semibold text-ink border-b border-hairline pb-2">
                        <span className="flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5 text-accent-blue" />
                          <span>{viewMode === '2d' ? 'Live Auction (2D)' : 'Final Look (3D)'} Position & Size (%)</span>
                        </span>
                        
                        {viewMode === '3d' && (
                          <button
                            type="button"
                            onClick={() => handleMatchSpotFrom2D(activeSpot.id)}
                            className="text-[11px] text-accent-blue font-semibold hover:underline cursor-pointer"
                            title="Copy 2D position for this spot"
                          >
                            Match this from 2D
                          </button>
                        )}
                      </div>

                      {/* 2D Position Sliders */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between text-[11px] text-ink-muted mb-0.5">
                            <span>Top:</span>
                            <span className="font-mono">{activeSpotCoords.top}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="90"
                            step="0.5"
                            value={parseFloat(activeSpotCoords.top) || 0}
                            onChange={(e) => {
                              const val = `${e.target.value}%`;
                              const coordKey = viewMode === '3d' ? 'coords3d' : 'coords2d';
                              onUpdateSpots(spots.map(s => s.id === activeSpot.id ? { ...s, [coordKey]: { ...getSpotCoords(s), top: val } } : s));
                            }}
                            className="w-full accent-accent-blue"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-ink-muted mb-0.5">
                            <span>Left:</span>
                            <span className="font-mono">{activeSpotCoords.left}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="90"
                            step="0.5"
                            value={parseFloat(activeSpotCoords.left) || 0}
                            onChange={(e) => {
                              const val = `${e.target.value}%`;
                              const coordKey = viewMode === '3d' ? 'coords3d' : 'coords2d';
                              onUpdateSpots(spots.map(s => s.id === activeSpot.id ? { ...s, [coordKey]: { ...getSpotCoords(s), left: val } } : s));
                            }}
                            className="w-full accent-accent-blue"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-ink-muted mb-0.5">
                            <span>Width:</span>
                            <span className="font-mono">{activeSpotCoords.width}</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="80"
                            step="0.5"
                            value={parseFloat(activeSpotCoords.width) || 10}
                            onChange={(e) => {
                              const val = `${e.target.value}%`;
                              const coordKey = viewMode === '3d' ? 'coords3d' : 'coords2d';
                              onUpdateSpots(spots.map(s => s.id === activeSpot.id ? { ...s, [coordKey]: { ...getSpotCoords(s), width: val } } : s));
                            }}
                            className="w-full accent-accent-blue"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-ink-muted mb-0.5">
                            <span>Height:</span>
                            <span className="font-mono">{activeSpotCoords.height}</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="60"
                            step="0.5"
                            value={parseFloat(activeSpotCoords.height) || 10}
                            onChange={(e) => {
                              const val = `${e.target.value}%`;
                              const coordKey = viewMode === '3d' ? 'coords3d' : 'coords2d';
                              onUpdateSpots(spots.map(s => s.id === activeSpot.id ? { ...s, [coordKey]: { ...getSpotCoords(s), height: val } } : s));
                            }}
                            className="w-full accent-accent-blue"
                          />
                        </div>
                      </div>

                      {/* 3D Bend & Skew Section (Active on 3D View) */}
                      {viewMode === '3d' && (
                        <div className="mt-3 pt-3 border-t border-hairline space-y-2.5">
                          <div className="flex items-center justify-between font-semibold text-cognac">
                            <span className="flex items-center gap-1">
                              <Box className="h-3.5 w-3.5" />
                              <span>3D Bend, Turn & Shear</span>
                            </span>
                          </div>

                          {/* Quick 1-Click Angle Presets */}
                          <div className="flex flex-wrap gap-1.5 pb-1">
                            <button
                              type="button"
                              onClick={() => apply3DPreset('8deg', '-28deg', '2deg', '-4deg', '-4deg')}
                              className="rounded-lg bg-surface-200 px-2 py-0.5 text-[10.5px] font-medium text-ink hover:bg-cognac hover:text-white transition-colors cursor-pointer"
                            >
                              👈 Bend Left
                            </button>
                            <button
                              type="button"
                              onClick={() => apply3DPreset('8deg', '28deg', '-2deg', '4deg', '4deg')}
                              className="rounded-lg bg-surface-200 px-2 py-0.5 text-[10.5px] font-medium text-ink hover:bg-cognac hover:text-white transition-colors cursor-pointer"
                            >
                              👉 Bend Right
                            </button>
                            <button
                              type="button"
                              onClick={() => apply3DPreset('18deg', '-8deg', '0deg', '0deg', '-2deg')}
                              className="rounded-lg bg-surface-200 px-2 py-0.5 text-[10.5px] font-medium text-ink hover:bg-cognac hover:text-white transition-colors cursor-pointer"
                            >
                              👇 Slant Flap
                            </button>
                            <button
                              type="button"
                              onClick={() => apply3DPreset('0deg', '0deg', '0deg', '0deg', '0deg')}
                              className="rounded-lg bg-surface-200 px-2 py-0.5 text-[10.5px] font-medium text-ink-subtle hover:text-ink transition-colors cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>

                          {/* 3D Sliders Grid */}
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            
                            {/* Rotate Y: Turn Left / Right */}
                            <div>
                              <div className="flex justify-between text-[11px] text-ink-muted mb-0.5">
                                <span>Turn Y (Left/Right):</span>
                                <span className="font-mono text-cognac font-semibold">{activeSpotCoords.rotateY || '0deg'}</span>
                              </div>
                              <input
                                type="range"
                                min="-65"
                                max="65"
                                step="1"
                                value={parseInt(activeSpotCoords.rotateY || '0', 10)}
                                onChange={(e) => {
                                  const val = `${e.target.value}deg`;
                                  onUpdateSpots(spots.map(s => s.id === activeSpot.id ? { ...s, coords3d: { ...getSpotCoords(s), rotateY: val } } : s));
                                }}
                                className="w-full accent-cognac"
                              />
                            </div>

                            {/* Rotate X: Tilt Up / Down */}
                            <div>
                              <div className="flex justify-between text-[11px] text-ink-muted mb-0.5">
                                <span>Tilt X (Up/Down):</span>
                                <span className="font-mono text-cognac font-semibold">{activeSpotCoords.rotateX || '0deg'}</span>
                              </div>
                              <input
                                type="range"
                                min="-60"
                                max="60"
                                step="1"
                                value={parseInt(activeSpotCoords.rotateX || '0', 10)}
                                onChange={(e) => {
                                  const val = `${e.target.value}deg`;
                                  onUpdateSpots(spots.map(s => s.id === activeSpot.id ? { ...s, coords3d: { ...getSpotCoords(s), rotateX: val } } : s));
                                }}
                                className="w-full accent-cognac"
                              />
                            </div>

                            {/* Skew X: Horizontal Shear */}
                            <div>
                              <div className="flex justify-between text-[11px] text-ink-muted mb-0.5">
                                <span>Skew X (Horizontal):</span>
                                <span className="font-mono text-cognac font-semibold">{activeSpotCoords.skewX || '0deg'}</span>
                              </div>
                              <input
                                type="range"
                                min="-45"
                                max="45"
                                step="1"
                                value={parseInt(activeSpotCoords.skewX || '0', 10)}
                                onChange={(e) => {
                                  const val = `${e.target.value}deg`;
                                  onUpdateSpots(spots.map(s => s.id === activeSpot.id ? { ...s, coords3d: { ...getSpotCoords(s), skewX: val } } : s));
                                }}
                                className="w-full accent-cognac"
                              />
                            </div>

                            {/* Skew Y: Vertical Shear */}
                            <div>
                              <div className="flex justify-between text-[11px] text-ink-muted mb-0.5">
                                <span>Skew Y (Vertical):</span>
                                <span className="font-mono text-cognac font-semibold">{activeSpotCoords.skewY || '0deg'}</span>
                              </div>
                              <input
                                type="range"
                                min="-45"
                                max="45"
                                step="1"
                                value={parseInt(activeSpotCoords.skewY || '0', 10)}
                                onChange={(e) => {
                                  const val = `${e.target.value}deg`;
                                  onUpdateSpots(spots.map(s => s.id === activeSpot.id ? { ...s, coords3d: { ...getSpotCoords(s), skewY: val } } : s));
                                }}
                                className="w-full accent-cognac"
                              />
                            </div>

                            {/* Rotate Z: Angle */}
                            <div className="col-span-2">
                              <div className="flex justify-between text-[11px] text-ink-muted mb-0.5">
                                <span>Rotate Z (Angle Twist):</span>
                                <span className="font-mono text-cognac font-semibold">{activeSpotCoords.rotateZ || '0deg'}</span>
                              </div>
                              <input
                                type="range"
                                min="-45"
                                max="45"
                                step="1"
                                value={parseInt(activeSpotCoords.rotateZ || '0', 10)}
                                onChange={(e) => {
                                  const val = `${e.target.value}deg`;
                                  onUpdateSpots(spots.map(s => s.id === activeSpot.id ? { ...s, coords3d: { ...getSpotCoords(s), rotateZ: val } } : s));
                                }}
                                className="w-full accent-cognac"
                              />
                            </div>

                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <>
                      {/* Price & Bid Stats */}
                      <div className="flex items-baseline justify-between border-y border-hairline py-4">
                        <div>
                          <span className="text-[12px] text-ink-muted block">
                            {activeSpot.bidCount > 0 ? 'Current top bid' : 'Starting price'}
                          </span>
                          <span className="text-2xl font-semibold tabular-nums text-ink">
                            {formatPrice(activeSpot.bidCount > 0 ? activeSpot.currentBid : activeSpot.startingBid)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[12px] text-ink-muted block mb-0.5">Status</span>
                          {activeSpot.bidCount > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              Taken
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-emerald-50 text-accent-green border border-emerald-200">
                              🟢 Available
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Spot description */}
                      <div className="space-y-2 text-[13px] text-ink-muted leading-relaxed">
                        <p>{activeSpot.description}</p>
                        <p className="text-[12px] text-ink bg-surface-100 p-2.5 rounded-xl border border-hairline/60">
                          <strong>Placement note:</strong> {activeSpot.visibilityNote}
                        </p>
                      </div>

                      {/* Current Sponsor & Outbid / Claim Button */}
                      <div className="pt-2 border-t border-hairline flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <span className="text-[11px] text-ink-subtle block">
                            {activeSpot.bidCount > 0 ? 'Held by' : 'Spot status'}
                          </span>
                          {activeSpot.bidCount > 0 && activeSpot.topBidder.brand ? (
                            <a
                              href={activeSpot.topBidder.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink hover:text-cognac transition-colors truncate mt-0.5"
                            >
                              {(activeSpot.topBidder.logo || getFaviconFromUrl(activeSpot.topBidder.url)) && (
                                <img
                                  src={activeSpot.topBidder.logo || getFaviconFromUrl(activeSpot.topBidder.url)}
                                  alt={activeSpot.topBidder.brand}
                                  className="h-4 w-4 rounded object-contain shrink-0"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              )}
                              <span className="truncate">{activeSpot.topBidder.brand}</span>
                              <ExternalLink className="h-3 w-3 text-ink-subtle shrink-0" />
                            </a>
                          ) : (
                            <span className="text-[13.5px] font-semibold text-accent-green">
                              Open for bidding
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => onBidSpot(activeSpot)}
                          className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85 cursor-pointer shadow-subtle flex items-center gap-1.5"
                        >
                          <span>
                            {activeSpot.bidCount > 0
                              ? `Outbid (${formatPrice(activeSpot.currentBid + 10)})`
                              : `Claim Spot (${formatPrice(activeSpot.startingBid)})`}
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}

                </div>
              )}
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
