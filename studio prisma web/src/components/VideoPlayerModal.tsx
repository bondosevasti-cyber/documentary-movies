import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, X, RotateCcw, RotateCw, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Documentary } from '../types';

interface VideoPlayerModalProps {
  documentary: Documentary | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ documentary, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState('4K HDR');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [documentary]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 180);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      if (volume === 0) setVolume(0.5);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3200);
  };

  if (!documentary) return null;

  return (
    <motion.div
      id="video-player-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-2 sm:p-6"
    >
      <motion.div
        id="video-player-container"
        initial={{ opacity: 0, scale: 0.94, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.965, y: 16 }}
        transition={{ type: 'spring', stiffness: 230, damping: 25, mass: 0.85 }}
        ref={playerContainerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden border border-orange-500/30 shadow-[0_0_50px_rgba(255,107,0,0.3)] group"
      >
        {/* Top Header Overlay */}
        <div className="player-opening-rim" aria-hidden="true" />
        <div
          className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full">
              {documentary.category}
            </span>
            <span className="px-2.5 py-1 text-xs font-medium bg-white/10 text-neutral-300 rounded-full">
              {documentary.quality}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-md">
              {documentary.title}
            </h2>
          </div>

          <button
            id="close-player-btn"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange-500/80 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 border border-white/20 hover:border-orange-400 hover:shadow-[0_0_15px_rgba(255,107,0,0.5)] cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Element */}
        <video
          ref={videoRef}
          src={documentary.videoUrl}
          poster={documentary.backdropUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
          playsInline
        />

        {/* Big Center Play/Pause Ripple on Click */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 cursor-pointer"
          >
            <div className="lit-play w-20 h-20 rounded-full text-white flex items-center justify-center transform hover:scale-110 transition-transform">
              <Play className="w-9 h-9 fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Bottom Controls Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 z-20 p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 flex flex-col gap-3 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress Timeline Scrubber */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-xs font-mono text-neutral-300 min-w-[40px]">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF771C] focus:outline-none"
              />
            </div>
            <span className="text-xs font-mono text-neutral-400 min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime -= 10;
                }}
                className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Rewind 10s"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime += 10;
                }}
                className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Forward 10s"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF771C]"
                />
              </div>

              {documentary.narrator && (
                <div className="hidden md:flex items-center text-xs text-neutral-400 pl-2 border-l border-white/10">
                  Narrated by <span className="text-neutral-200 font-medium ml-1">{documentary.narrator}</span>
                </div>
              )}
            </div>

            {/* Right actions: Quality & Fullscreen */}
            <div className="flex items-center gap-3 relative">
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 text-orange-400 border border-orange-500/30 transition-colors cursor-pointer"
                >
                  {selectedQuality}
                </button>

                {showQualityMenu && (
                  <div className="lit-panel absolute bottom-full right-0 mb-2 w-32 bg-[#12141A] border border-white/10 rounded-xl p-1.5 shadow-2xl z-30">
                    {['4K HDR', '1080p 60fps', '720p HD'].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setSelectedQuality(q);
                          setShowQualityMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                          selectedQuality === q ? 'bg-orange-500/20 text-orange-400 font-bold' : 'text-neutral-300 hover:bg-white/5'
                        }`}
                      >
                        <span>{q}</span>
                        {selectedQuality === q && <Check className="w-3.5 h-3.5 text-orange-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
