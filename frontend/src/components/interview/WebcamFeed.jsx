import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  RefreshCw,
  AlertCircle,
  Settings2,
  FlipHorizontal,
  Sliders,
  User,
  Zap,
  Volume2
} from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

// Lightweight resolution presets designed to keep CPU and memory footprint minimal
const QUALITY_PRESETS = {
  eco: {
    id: 'eco',
    label: '360p Eco (Lightweight)',
    shortLabel: '360p',
    width: { ideal: 640, max: 854 },
    height: { ideal: 360, max: 480 },
    frameRate: { ideal: 24, max: 24 }
  },
  standard: {
    id: 'standard',
    label: '480p Standard (Balanced)',
    shortLabel: '480p',
    width: { ideal: 854, max: 1280 },
    height: { ideal: 480, max: 720 },
    frameRate: { ideal: 30, max: 30 }
  },
  hd: {
    id: 'hd',
    label: '720p HD (High Definition)',
    shortLabel: '720p',
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 30 }
  }
};

export default function WebcamFeed({
  isRecording = false,
  isCameraOn = true,
  isMicMuted = false,
  onToggleCamera,
  onToggleMic,
  audioLevel = 0,
  candidateName = 'Candidate',
  compactMode = false
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Camera state
  const [hasPermission, setHasPermission] = useState(null); // null | true | false
  const [errorMessage, setErrorMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [quality, setQuality] = useState('eco'); // 'eco' by default for maximum lightweight performance
  const [showSettings, setShowSettings] = useState(false);

  // Available camera devices
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // Fetch list of available video devices
  const refreshDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');

      setDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (e) {
      console.warn('Unable to enumerate media devices:', e);
    }
  }, [selectedDeviceId]);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (e) {
        console.warn('Error stopping stream tracks:', e);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Progressive resilient camera acquisition
  const startCamera = useCallback(async () => {
    setIsRetrying(true);
    setErrorMessage('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser.');
      }

      // Stop previous stream first to release hardware lock
      stopCamera();

      const preset = QUALITY_PRESETS[quality] || QUALITY_PRESETS.eco;
      let stream = null;

      // Tier 1: Selected Device + Selected Resolution Preset
      try {
        const videoConstraints = {
          width: preset.width,
          height: preset.height,
          frameRate: preset.frameRate,
          facingMode: 'user'
        };
        if (selectedDeviceId) {
          videoConstraints.deviceId = { exact: selectedDeviceId };
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
      } catch (tier1Err) {
        console.warn('Camera Tier 1 failed, attempting Tier 2 (Loose dimensions)...', tier1Err.message);

        // Tier 2: Selected Device with loose low-res constraints
        try {
          const looseConstraints = {
            width: { ideal: 640 },
            height: { ideal: 360 }
          };
          if (selectedDeviceId) {
            looseConstraints.deviceId = { exact: selectedDeviceId };
          }
          stream = await navigator.mediaDevices.getUserMedia({ video: looseConstraints });
        } catch (tier2Err) {
          console.warn('Camera Tier 2 failed, attempting Tier 3 (Unconstrained video)...', tier2Err.message);

          // Tier 3: Unconstrained generic video
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
          } catch (tier3Err) {
            throw tier3Err;
          }
        }
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn('Autoplay caught:', e));
        };
      }

      setHasPermission(true);

      // Re-query devices so labels become visible now that permission is granted
      refreshDevices();
    } catch (err) {
      console.warn('Webcam initialization failed:', err.name, err.message);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera access was blocked by your browser. Please allow camera permissions.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera hardware detected. You can continue seamlessly in Audio-Only mode.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorMessage('Camera is currently in use by another app or browser tab.');
      } else if (err.name === 'OverconstrainedError') {
        setErrorMessage('Selected resolution is not supported by your camera hardware. Try switching to 360p Eco.');
      } else {
        setErrorMessage(err.message || 'Unable to connect to camera.');
      }
    } finally {
      setIsRetrying(false);
    }
  }, [quality, selectedDeviceId, stopCamera, refreshDevices]);

  // Handle hardware device changes (e.g. plugging in webcam)
  useEffect(() => {
    refreshDevices();
    const handleDeviceChange = () => refreshDevices();
    navigator.mediaDevices?.addEventListener?.('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener?.('devicechange', handleDeviceChange);
    };
  }, [refreshDevices]);

  // Start or stop camera based on state & selected device/quality
  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraOn, selectedDeviceId, quality]);

  // Keep srcObject connected on re-renders
  useEffect(() => {
    if (isCameraOn && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  });

  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`relative w-full h-full min-h-[360px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col justify-between ${compactMode ? 'text-xs' : ''}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isMirrored ? 'scale-x-[-1]' : 'scale-x-1'
        } ${isCameraOn && hasPermission ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
      />

      {/* AUDIO-ONLY / CANDIDATE PERSONA AVATAR VIEW */}
      {(!isCameraOn || hasPermission === false) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-4 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 z-10 text-center">
          {/* Animated Candidate Avatar with Audio-responsive Ring */}
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-100 font-bold text-2xl shadow-2xl transition-all duration-150 ${
                !isMicMuted && audioLevel > 0.05
                  ? 'ring-4 ring-emerald-500/50 scale-105 shadow-emerald-500/20'
                  : 'ring-2 ring-slate-700/60'
              }`}
            >
              {getInitials(candidateName)}
            </div>

            {/* Speaking Badge */}
            {!isMicMuted && audioLevel > 0.05 && (
              <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-600 rounded-full text-white shadow-lg animate-bounce">
                <Volume2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="space-y-1.5 max-w-sm">
            <div className="flex items-center justify-center gap-2">
              <h4 className="text-slate-100 text-sm font-bold">{candidateName}</h4>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-emerald-400 font-semibold">
                Audio-Only Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {!isCameraOn
                ? 'Camera is off to conserve CPU and bandwidth. Your microphone audio is active.'
                : errorMessage || 'Microphone is active for live voice interview.'}
            </p>
          </div>

          {/* Quick Actions in Audio-Only Mode */}
          <div className="flex items-center gap-2 pt-1">
            {hasPermission === false ? (
              <button
                type="button"
                onClick={startCamera}
                disabled={isRetrying}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry Camera'}
              </button>
            ) : (
              onToggleCamera && (
                <button
                  type="button"
                  onClick={onToggleCamera}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-indigo-400" />
                  Turn On Video
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* TOP BAR: Candidate Badge, Quality Chip & Live Indicator */}
      <div className="relative z-20 p-3.5 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs font-semibold text-slate-200 shadow-md">
            <span
              className={`w-2 h-2 rounded-full ${
                isCameraOn && hasPermission ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>{candidateName}</span>
          </div>

          {isCameraOn && hasPermission && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono font-medium text-slate-300">
              <Zap className="w-3 h-3 text-amber-400" />
              {QUALITY_PRESETS[quality]?.shortLabel || '360p'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick Mirror Toggle Button */}
          {isCameraOn && hasPermission && (
            <button
              type="button"
              onClick={() => setIsMirrored(!isMirrored)}
              className={`p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
                isMirrored
                  ? 'bg-slate-900/80 border-slate-700/70 text-indigo-400 hover:text-indigo-300'
                  : 'bg-slate-900/80 border-slate-700/70 text-slate-400 hover:text-slate-200'
              }`}
              title={isMirrored ? 'Mirrored (Click for True Orientation)' : 'True Orientation (Click to Mirror)'}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Settings Popover Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
              showSettings
                ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-200'
                : 'bg-slate-900/80 border-slate-700/70 text-slate-400 hover:text-slate-200'
            }`}
            title="Video & Device Settings"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>

          {isRecording && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/90 backdrop-blur-md text-white text-[11px] font-bold tracking-wider animate-pulse shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              REC
            </div>
          )}
        </div>
      </div>

      {/* QUICK VIDEO SETTINGS DRAWER / POPOVER */}
      {showSettings && (
        <div className="absolute top-14 right-3 z-30 w-64 p-3.5 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Video & Camera Settings
            </span>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Camera Selection Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Camera Input
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              {devices.length === 0 ? (
                <option value="">Default System Camera</option>
              ) : (
                devices.map((d, idx) => (
                  <option key={d.deviceId || idx} value={d.deviceId}>
                    {d.label || `Camera ${idx + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Quality / Resolution Preset */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Performance Profile</span>
              <span className="text-[10px] text-emerald-400 font-mono">Eco = Fast</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.values(QUALITY_PRESETS).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setQuality(p.id)}
                  className={`py-1.5 px-2 rounded-lg text-center text-xs font-semibold border transition-all cursor-pointer ${
                    quality === p.id
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Mirror Flip Option */}
          <div className="flex items-center justify-between pt-1 text-xs text-slate-300">
            <span>Mirror Video</span>
            <button
              type="button"
              onClick={() => setIsMirrored(!isMirrored)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                isMirrored
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isMirrored ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM FLOATING BAR: Equalizer & Mic/Cam Controls */}
      <div className="relative z-20 p-3.5 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex items-center justify-between gap-3">
        {/* Real-time Voice Audio Visualizer */}
        <div className="flex items-center gap-2">
          <div className="w-24 sm:w-32">
            <AudioVisualizer
              level={audioLevel}
              isActive={!isMicMuted && isRecording}
              color="emerald"
              barCount={12}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline uppercase">
            {isMicMuted ? 'Muted' : audioLevel > 0.05 ? 'Speaking' : 'Listening'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onToggleMic && (
            <button
              type="button"
              onClick={onToggleMic}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isMicMuted
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
                  : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:bg-slate-800 shadow-md'
              }`}
              title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          {onToggleCamera && (
            <button
              type="button"
              onClick={onToggleCamera}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                !isCameraOn
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
                  : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:bg-slate-800 shadow-md'
              }`}
              title={isCameraOn ? 'Switch to Audio-Only Mode' : 'Turn On Camera'}
            >
              {isCameraOn ? <Camera className="w-4 h-4 text-emerald-400" /> : <CameraOff className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

