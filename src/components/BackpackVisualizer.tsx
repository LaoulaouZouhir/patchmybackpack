import React, { useState, useRef, useEffect } from 'react';
import type { Spot, SpotCoords } from '../data/auctionData';
import { ArrowUpRight, Move, Sliders, RotateCcw, Check, Copy, Box, CopyCheck, Eye, Sparkles } from 'lucide-react';
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
  };  return (
    <div id="spots" className="scroll-mt-24 mx-auto w-full max-w-5xl px-4 sm:px-6">
      
      {/* Top Controls Bar - Centered View Switcher */}
      <div className="flex items-center justify-center relative mb-2 sm:mb-2.5">
        
        {/* Prominent Centered Live Auction vs Final Look Toggle */}
        <div
          role="group"
          aria-label="Backpack view mode toggle"
          className="flex items-center rounded-2xl bg-surface-200/90 p-1 border border-hairline shadow-2xs"
        >
          {/* Live Auction Tab */}
          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1 text-[12.5px] font-semibold transition-all cursor-pointer ${
              viewMode === '2d'
                ? 'bg-white text-ink shadow-[0_2px_6px_rgba(0,0,0,0.08)]'
                : 'text-ink-muted hover:text-ink hover:bg-white/50'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
            </span>
            <span>Live Auction</span>
          </button>

          {/* Final Look Tab */}
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1 text-[12.5px] font-semibold transition-all cursor-pointer ${
              viewMode === '3d'
                ? 'bg-white text-ink shadow-[0_2px_6px_rgba(0,0,0,0.08)]'
                : 'text-ink-muted hover:text-ink hover:bg-white/50'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-cognac" />
            <span>Final Look</span>
          </button>
        </div>

        {/* Calibration Mode Toggle & Tools (Hidden by default, enabled via Shift+C or ?calibrate=true) */}
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
              <span>{isCalibrating ? `Exit Calibration` : `✏️ Calibrate Spots`}</span>
            </button>

            {isCalibrating && (
              <>
                {viewMode === '3d' && (
                  <button
                    type="button"
                    onClick={handleMatchAllFrom2D}
                    className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-semibold text-accent-blue border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer shadow-subtle"
                    title="Copy all spot positions from 2D"
                  >
                    <CopyCheck className="h-3.5 w-3.5" />
                    <span>Match 2D</span>
                  </button>
                )}

                {viewMode === '3d' && (
                  <button
                    type="button"
                    onClick={() => setShowGhostOverlay(!showGhostOverlay)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-medium border transition-colors cursor-pointer ${
                      showGhostOverlay
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white text-ink-muted border-hairline hover:text-ink'
                    }`}
                    title="Overlay translucent 2D blueprint guide"
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
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
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
        <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-xs text-amber-900 border border-amber-200/80 text-left flex items-center justify-between shadow-xs">
          <p>
            🖐️ <strong>Calibrating {viewMode === '2d' ? 'Live Auction (2D)' : 'Final Look (3D)'} View:</strong>{' '}
            Drag any spot or resize corner. Switch perspectives anytime.
          </p>
          {matchedNotification && (
            <span className="shrink-0 font-semibold text-accent-blue bg-blue-100/80 px-2.5 py-1 rounded-lg text-[11px]">
              {matchedNotification}
            </span>
          )}
        </div>
      )}

      {/* Main Backpack Showcase Stage */}
      <div className="relative mx-auto w-full max-w-[360px] sm:max-w-[440px] md:max-w-[490px] lg:max-w-[530px]">
        <div className="relative w-full rounded-2xl sm:rounded-3xl bg-gradient-to-b from-surface-100/95 via-surface-100/70 to-surface-200/50 p-2 sm:p-3 border border-hairline/90 shadow-[0_15px_40px_-12px_rgba(0,0,0,0.07)]">
          
          {/* Bag Canvas Container */}
          <div className="relative w-full flex items-center justify-center">
            <div
              ref={containerRef}
              style={{ perspective: '1000px' }}
              className="relative w-full aspect-[768/1024] flex items-center justify-center select-none"
            >
              {/* 2D Backpack Image */}
              <img
                src="/backpack-2d.png"
                alt="Patch My Backpack 2D model"
                className={`absolute inset-0 w-full h-full object-contain select-none transition-opacity duration-300 pointer-events-none drop-shadow-md ${
                  viewMode === '2d' ? 'opacity-100' : 'opacity-0'
                }`}
                draggable={false}
                loading="eager"
                decoding="sync"
              />

              {/* 3D Backpack Image */}
              <img
                src="/backpack-3d.png"
                alt="Patch My Backpack 3D model"
                className={`absolute inset-0 w-full h-full object-contain select-none transition-opacity duration-300 pointer-events-none drop-shadow-md ${
                  viewMode === '3d' ? 'opacity-100' : 'opacity-0'
                }`}
                draggable={false}
                loading="eager"
                decoding="sync"
              />

              {/* Optional Ghost 2D Blueprint Guide Overlay */}
              {viewMode === '3d' && showGhostOverlay && (
                <img
                  src="/backpack-2d.png"
                  alt="2D Blueprint Ghost Guide"
                  className="absolute inset-0 w-full h-full object-contain opacity-35 mix-blend-multiply pointer-events-none transition-opacity duration-300"
                />
              )}

              {/* Hotspots Overlay */}
              <div className="absolute inset-0 pointer-events-auto" style={{ transformStyle: 'preserve-3d' }}>
                {spots.map((spot) => {
                  const coords = getSpotCoords(spot);
                  const isHovered = hoveredSpotId === spot.id;
                  const isSelected = selectedSpotId === spot.id;
                  const transform = getTransformStyle(coords);
                  const isTaken = spot.bidCount > 0 && spot.topBidder.brand;

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
                      className={`group absolute flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ease-out ${
                        isCalibrating
                          ? isSelected
                            ? 'border-2 border-cognac bg-cognac/25 shadow-lg cursor-move z-30 ring-4 ring-cognac/30'
                            : 'border-2 border-dashed border-amber-900/70 bg-amber-950/20 cursor-move z-10 hover:border-cognac hover:bg-cognac/15'
                          : isSelected || isHovered
                            ? isTaken
                              ? 'border-2 border-cognac bg-cognac/15 shadow-xl scale-105 z-20 ring-4 ring-cognac/20 cursor-pointer overflow-hidden backdrop-blur-xs'
                              : 'border-2 border-cognac bg-cognac/10 shadow-xl scale-105 z-20 ring-4 ring-cognac/20 cursor-pointer overflow-hidden backdrop-blur-xs'
                            : isTaken
                              ? 'border-2 border-cognac/70 bg-black/5 hover:border-cognac z-10 cursor-pointer overflow-hidden'
                              : 'border-2 border-dashed border-neutral-400/60 bg-black/5 hover:border-neutral-800 hover:bg-black/10 z-10 cursor-pointer overflow-hidden'
                      }`}
                    >
                      {/* Spot Content - Inspired by the clean stickers in the reference photo */}
                      {isTaken ? (
                        <div className="flex h-full w-full flex-col items-center justify-center p-1.5 select-none pointer-events-none text-center">
                          {spot.topBidder.logo || (spot.topBidder.url ? getFaviconFromUrl(spot.topBidder.url) : '') ? (
                            <div className="flex flex-col items-center justify-center h-full w-full">
                              <img
                                src={spot.topBidder.logo || getFaviconFromUrl(spot.topBidder.url)}
                                alt={spot.topBidder.brand || 'Sponsor'}
                                className="h-8 w-8 sm:h-11 sm:w-11 md:h-14 md:w-14 max-h-[64%] max-w-[82%] object-contain drop-shadow-xs transition-transform group-hover:scale-105"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                              <span className="text-[9.5px] sm:text-[11px] md:text-[12.5px] font-bold tabular-nums text-neutral-800 mt-1 leading-tight bg-neutral-100/90 border border-neutral-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                                {formatPrice(spot.currentBid)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full w-full">
                              <span className="text-[11px] sm:text-[13px] md:text-[15px] font-bold text-ink truncate px-1 max-w-full">
                                {spot.topBidder.brand || `#${spot.id} Taken`}
                              </span>
                              <span className="text-[9.5px] sm:text-[11px] md:text-[12.5px] font-bold tabular-nums text-neutral-800 mt-1 bg-neutral-100/90 border border-neutral-200/80 px-2 py-0.5 rounded-md">
                                {formatPrice(spot.currentBid)}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Open Spot (Clean layout matching "LARGE from 500 €" in reference photo) */
                        <div className="flex h-full w-full flex-col items-center justify-center p-1 select-none pointer-events-none text-center">
                          <span className="text-[9.5px] sm:text-[11px] md:text-[12.5px] font-bold uppercase tracking-wider text-neutral-600 truncate max-w-full">
                            {spot.size === 'L' ? 'LARGE' : spot.size === 'XL' ? 'XL SPOT' : spot.size === 'S' ? 'SMALL' : 'MEDIUM'}
                          </span>
                          <span className="text-[9px] sm:text-[10.5px] md:text-[12px] font-medium tabular-nums text-neutral-500 mt-0.5">
                            from {formatPrice(spot.startingBid)}
                          </span>
                        </div>
                      )}

                      {/* Resize Corner Handle (Calibration Mode) */}
                      {isCalibrating && isSelected && (
                        <div
                          onMouseDown={(e) => handleMouseDown(e, spot, true)}
                          className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-accent-blue border-2 border-white shadow-md cursor-nwse-resize z-40 hover:scale-125 transition-transform"
                          title="Drag to resize"
                        />
                      )}

                      {/* Hover Overlay */}
                      {!isCalibrating && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-black/20 backdrop-blur-[1px]">
                          <span className="rounded-full bg-ink px-3 py-1 text-[11.5px] font-semibold text-white shadow-md">
                            {isTaken ? 'Outbid' : 'Claim Spot'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Spot Quick Action Strip (Below Backpack Canvas) */}
          {activeSpot && !isCalibrating && (
            <div className="mt-2.5 pt-2 border-t border-hairline/80 flex flex-col sm:flex-row items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2.5 text-left">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-200 text-[12px] font-bold text-ink shrink-0 border border-hairline">
                  {activeSpot.id}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12.5px] font-semibold text-ink">
                      {activeSpot.label}
                    </span>
                    <span className="text-[10.5px] font-medium text-ink-muted">
                      ({activeSpot.dimensions})
                    </span>
                  </div>
                  <div className="text-[11.5px] text-ink-muted">
                    {activeSpot.bidCount > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>Current top bid: <strong className="text-ink font-semibold tabular-nums">{formatPrice(activeSpot.currentBid)}</strong> by <span className="font-semibold text-ink">{activeSpot.topBidder.brand}</span></span>
                        {activeSpot.topBidder.twitter && (
                          <a
                            href={`https://x.com/${activeSpot.topBidder.twitter.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10.5px] text-ink-subtle hover:text-ink font-medium"
                          >
                            <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            <span>@{activeSpot.topBidder.twitter.replace(/^@/, '')}</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <span>Starting price: <strong className="text-emerald-700 font-semibold tabular-nums">{formatPrice(activeSpot.startingBid)}</strong> · <span className="text-emerald-600 font-medium">🟢 Open for bids</span></span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onBidSpot(activeSpot)}
                className="w-full sm:w-auto rounded-full bg-ink hover:bg-neutral-800 text-white px-4 py-1.5 text-[12px] font-semibold transition-all cursor-pointer shadow-xs active:scale-[0.99] flex items-center justify-center gap-1 shrink-0"
              >
                <span>
                  {activeSpot.bidCount > 0
                    ? `Outbid (${formatPrice(activeSpot.currentBid + 10)})`
                    : `Claim Spot (${formatPrice(activeSpot.startingBid)})`}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

        </div>

        <p className="mt-1.5 text-[11px] sm:text-[11.5px] text-ink-muted text-center">
          {isCalibrating ? `Calibrating ${viewMode === '2d' ? 'Live Auction' : 'Final Look'} coordinates.` : 'Click any spot on the backpack to place a bid or view spot specs.'}
        </p>

      </div>

      {/* Calibration Controls Panel (Expands below when isCalibrating is true) */}
      {canCalibrate && isCalibrating && activeSpot && (
        <div className="mt-8 mx-auto max-w-2xl bg-white rounded-3xl p-6 border border-hairline shadow-subtle text-left">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between font-semibold text-ink border-b border-hairline pb-3">
              <span className="flex items-center gap-2 text-sm">
                <Sliders className="h-4 w-4 text-accent-blue" />
                <span>Calibrating Spot #{activeSpot.id}: {activeSpot.label}</span>
              </span>
              
              {viewMode === '3d' && (
                <button
                  type="button"
                  onClick={() => handleMatchSpotFrom2D(activeSpot.id)}
                  className="text-[12px] text-accent-blue font-semibold hover:underline cursor-pointer"
                >
                  Match this from 2D
                </button>
              )}
            </div>

            {/* 2D Position Sliders */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-ink-muted mb-1">
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
                <div className="flex justify-between text-ink-muted mb-1">
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
                <div className="flex justify-between text-ink-muted mb-1">
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
                <div className="flex justify-between text-ink-muted mb-1">
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

            {/* 3D Bend & Shear Sliders */}
            {viewMode === '3d' && (
              <div className="mt-4 pt-4 border-t border-hairline space-y-3">
                <div className="flex items-center justify-between font-semibold text-cognac text-xs">
                  <span className="flex items-center gap-1.5">
                    <Box className="h-4 w-4" />
                    <span>3D Angle & Curvature Presets:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => apply3DPreset('8deg', '-28deg', '2deg', '-4deg', '-4deg')}
                      className="rounded-lg bg-surface-200 px-2.5 py-1 text-[11px] font-medium text-ink hover:bg-cognac hover:text-white transition-colors cursor-pointer"
                    >
                      👈 Left
                    </button>
                    <button
                      type="button"
                      onClick={() => apply3DPreset('8deg', '28deg', '-2deg', '4deg', '4deg')}
                      className="rounded-lg bg-surface-200 px-2.5 py-1 text-[11px] font-medium text-ink hover:bg-cognac hover:text-white transition-colors cursor-pointer"
                    >
                      👉 Right
                    </button>
                    <button
                      type="button"
                      onClick={() => apply3DPreset('18deg', '-8deg', '0deg', '0deg', '-2deg')}
                      className="rounded-lg bg-surface-200 px-2.5 py-1 text-[11px] font-medium text-ink hover:bg-cognac hover:text-white transition-colors cursor-pointer"
                    >
                      👇 Flap
                    </button>
                    <button
                      type="button"
                      onClick={() => apply3DPreset('0deg', '0deg', '0deg', '0deg', '0deg')}
                      className="rounded-lg bg-surface-200 px-2.5 py-1 text-[11px] font-medium text-ink-subtle hover:text-ink transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                  <div>
                    <div className="flex justify-between text-ink-muted mb-1">
                      <span>Turn Y:</span>
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

                  <div>
                    <div className="flex justify-between text-ink-muted mb-1">
                      <span>Tilt X:</span>
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

                  <div>
                    <div className="flex justify-between text-ink-muted mb-1">
                      <span>Skew X:</span>
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

                  <div>
                    <div className="flex justify-between text-ink-muted mb-1">
                      <span>Skew Y:</span>
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
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

