"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export default function VideoPlayer({ src, poster, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Play/Pause
  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle Mute/Unmute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  // Handle Fullscreen
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Update progress bar
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setProgress((current / total) * 100);
    setCurrentTime(current);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  // Handle timeline seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const time = (Number(e.target.value) / 100) * videoRef.current.duration;
    videoRef.current.currentTime = time;
    setProgress(Number(e.target.value));
  };

  // Format time (seconds to mm:ss)
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative group bg-[#09090b] border border-[#27272a] rounded-lg overflow-hidden flex items-center justify-center font-sans ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        playsInline
      />

      {/* Central Play/Pause Button Animation */}
      <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 ease-out ${
          !isPlaying ? "bg-black/40 backdrop-blur-[2px]" : "bg-transparent"
        }`}
      >
        <div 
          className={`h-20 w-20 flex items-center justify-center rounded-full bg-[#a78bfa]/20 border border-[#a78bfa]/50 text-[#a78bfa] transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            isPlaying ? "scale-150 opacity-0" : "scale-100 opacity-100 shadow-[0_0_30px_rgba(167,139,250,0.3)]"
          }`}
        >
          {isPlaying ? <Pause className="w-8 h-8 ml-0" /> : <Play className="w-8 h-8 ml-1" />}
        </div>
      </div>

      {/* Bottom Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-4 pt-12 bg-linear-to-t from-[#09090b] hover:from-[#09090b] to-transparent transition-all duration-300 ease-in-out ${
          showControls || !isPlaying ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent clicking controls from toggling video
      >
        <div className="flex flex-col gap-3">
          {/* Timeline / Progress bar */}
          <div className="relative w-full h-[6px] group/timeline flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="absolute z-20 w-full h-full opacity-0 cursor-pointer"
            />
            {/* Background track */}
            <div className="absolute left-0 right-0 h-[3px] bg-[#27272a] rounded-full overflow-hidden transition-all duration-300 group-hover/timeline:h-[6px]">
              {/* Active track */}
              <div 
                className="h-full bg-[#a78bfa] relative"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Scrubber thumb */}
            <div 
              className="absolute h-3 w-3 bg-[#fafafa] rounded-full shadow-md z-10 opacity-0 group-hover/timeline:opacity-100 transition-opacity duration-200 pointer-events-none transform -translate-x-1/2"
              style={{ left: `${progress}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-[#fafafa]">
            <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay}
                className="text-[#fafafa] hover:text-[#a78bfa] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] rounded-full p-1"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={toggleMute}
                className="text-[#fafafa] hover:text-[#a78bfa] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] rounded-full p-1"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <div className="text-xs font-medium text-[#a1a1aa] tracking-wide ml-2">
                {formatTime(currentTime)} <span className="mx-1 opacity-50">/</span> {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleFullscreen}
                className="text-[#fafafa] hover:text-[#a78bfa] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] rounded-full p-1"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
