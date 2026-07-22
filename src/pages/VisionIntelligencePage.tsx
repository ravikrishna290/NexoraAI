import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, AlertTriangle, CheckCircle, Camera, Activity,
  Shield, Zap, Clock, User, Flame, Wind, HardHat,
  BarChart2, PlayCircle, Video, Webcam as WebcamIcon, RefreshCw, Maximize2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useDatasetStore } from '../store/useDatasetStore';
import { useRiskStore } from '../store/useRiskStore';
import {
  CAMERA_CONFIG,
  VisionDetection,
  VisionDetectionType,
  VISION_RISK_BOOSTS,
} from '../services/datasetService';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function detectionColor(type: VisionDetectionType) {
  switch (type) {
    case 'FIRE_DETECTED':        return { text: 'text-red-400',    bg: 'bg-red-950',    border: 'border-red-800' };
    case 'SMOKE_DETECTED':       return { text: 'text-orange-400', bg: 'bg-orange-950', border: 'border-orange-800' };
    case 'PPE_VIOLATION':        return { text: 'text-amber-400',  bg: 'bg-amber-950',  border: 'border-amber-800' };
    case 'RESTRICTED_ZONE_ENTRY':return { text: 'text-red-400',    bg: 'bg-red-950',    border: 'border-red-800' };
    case 'WORKER_DOWN':          return { text: 'text-red-400',    bg: 'bg-red-950',    border: 'border-red-800' };
    default:                     return { text: 'text-emerald-400',bg: 'bg-emerald-950',border: 'border-emerald-800' };
  }
}

function detectionIcon(type: VisionDetectionType) {
  switch (type) {
    case 'FIRE_DETECTED':         return <Flame className="w-4 h-4 text-red-400" />;
    case 'SMOKE_DETECTED':        return <Wind className="w-4 h-4 text-orange-400" />;
    case 'PPE_VIOLATION':         return <HardHat className="w-4 h-4 text-amber-400" />;
    case 'RESTRICTED_ZONE_ENTRY': return <AlertTriangle className="w-4 h-4 text-red-400" />;
    default:                      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  }
}

function detectionLabel(d: VisionDetection): string {
  switch (d.detectionType) {
    case 'FIRE_DETECTED':         return 'Fire Detected';
    case 'SMOKE_DETECTED':        return 'Smoke Detected';
    case 'RESTRICTED_ZONE_ENTRY': return 'Restricted Zone Entry';
    case 'WORKER_DOWN':           return 'Worker Down';
    case 'PPE_VIOLATION':
      switch (d.subType) {
        case 'HELMET_MISSING':  return 'Helmet Missing';
        case 'VEST_MISSING':    return 'Vest Missing';
        case 'GLOVES_MISSING':  return 'Gloves Missing';
        case 'GOGGLES_MISSING': return 'Goggles Missing';
        default:                return 'PPE Violation';
      }
    default: return 'All Clear';
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

// ─────────────────────────────────────────────────────────────────────────────
// Camera Feed Card (Supports RTSP CCTV Stream + Live Webcam Mode)
// ─────────────────────────────────────────────────────────────────────────────

const CameraCard: React.FC<{
  cam: typeof CAMERA_CONFIG[number];
  alert: VisionDetection | null;
  onSelect: (cam: typeof CAMERA_CONFIG[number], alert: VisionDetection | null) => void;
  isSelected: boolean;
}> = ({ cam, alert, onSelect, isSelected }) => {
  const col = alert ? detectionColor(alert.detectionType) : null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamError, setWebcamError] = useState(false);

  // Scanline animation tick
  const [scanLine, setScanLine] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setScanLine(p => (p + 2) % 100), 50);
    return () => clearInterval(id);
  }, []);

  // Handle webcam activation
  const toggleWebcam = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!useWebcam) {
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setUseWebcam(true);
          setWebcamError(false);
        })
        .catch(() => {
          setWebcamError(true);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setUseWebcam(false);
    }
  };

  return (
    <motion.div
      layout
      onClick={() => onSelect(cam, alert)}
      className={`rounded-lg border cursor-pointer overflow-hidden transition-all ${
        isSelected
          ? 'border-brand-cyan shadow-lg shadow-cyan-500/20 ring-1 ring-brand-cyan'
          : alert
          ? `${col!.border} shadow-lg`
          : 'border-slate-800 hover:border-slate-600'
      }`}
    >
      {/* Camera feed viewport */}
      <div className="relative h-36 bg-slate-950 overflow-hidden">

        {/* Live Webcam Stream Element */}
        <video
          ref={videoRef}
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover ${useWebcam ? 'block' : 'hidden'}`}
        />

        {/* Standard CCTV Stream Viewport when webcam disabled */}
        {!useWebcam && (
          <>
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  radial-gradient(ellipse at 30% 60%, ${alert?.detectionType === 'FIRE_DETECTED' ? '#EF444450' : alert ? '#F59E0B30' : '#1E3A5F40'} 40%, transparent 70%),
                  linear-gradient(to bottom, transparent ${scanLine}%, rgba(255,255,255,0.02) ${scanLine + 0.5}%, transparent ${scanLine + 1}%)
                `,
              }}
            />
            {/* High-tech grid overlay */}
            <div className="absolute inset-0 opacity-[0.08]"
              style={{ backgroundImage: 'radial-gradient(circle, #60A5FA 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
          </>
        )}

        {/* CCTV HUD corner markers */}
        {['top-1.5 left-1.5', 'top-1.5 right-1.5', 'bottom-1.5 left-1.5', 'bottom-1.5 right-1.5'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-2.5 h-2.5 border-2 ${alert ? col!.border : 'border-slate-600'} opacity-70 pointer-events-none`}
            style={{ borderRadius: i === 0 ? '3px 0 0 0' : i === 1 ? '0 3px 0 0' : i === 2 ? '0 0 0 3px' : '0 0 3px 0' }} />
        ))}

        {/* Detection alert overlay flash */}
        {alert && (
          <motion.div
            className={`absolute inset-0 ${col!.bg} opacity-20 pointer-events-none`}
            animate={{ opacity: [0.05, 0.25, 0.05] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Live YOLO Bounding Box Overlay */}
        {alert?.detectionType === 'PPE_VIOLATION' && (
          <motion.div
            className={`absolute border-2 ${col!.border} pointer-events-none`}
            style={{ top: '22%', left: '28%', width: '44%', height: '54%', borderRadius: 4 }}
            animate={{ borderColor: ['#F59E0B', '#EF4444', '#F59E0B'] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <span className="absolute -top-5 left-0 text-[9px] font-mono bg-amber-900/90 text-amber-200 px-1 py-0.5 rounded font-bold shadow">
              {detectionLabel(alert)} [{alert.confidence}%]
            </span>
          </motion.div>
        )}
        {(alert?.detectionType === 'FIRE_DETECTED' || alert?.detectionType === 'SMOKE_DETECTED') && (
          <motion.div
            className="absolute inset-0 rounded pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 70%, rgba(239,68,68,0.4) 0%, transparent 65%)' }}
            animate={{ opacity: [0.3, 0.85, 0.3] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}

        {/* Top Control Bar: RTSP Status + Webcam Button */}
        <div className="absolute top-1 inset-x-1 flex justify-between items-center z-10">
          <div className="flex items-center gap-1">
            {alert ? (
              <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${col!.bg} ${col!.text} border ${col!.border}`}>
                ▲ {detectionLabel(alert).toUpperCase()}
              </span>
            ) : (
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded">
                ● RTSP 1080p
              </span>
            )}
          </div>

          <button
            onClick={toggleWebcam}
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono flex items-center gap-1 transition-all ${
              useWebcam ? 'bg-red-600 text-white font-bold animate-pulse' : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title="Toggle Live Webcam Feed"
          >
            <WebcamIcon className="w-3 h-3" />
            {useWebcam ? 'LIVE WEBCAM' : 'WEBCAM'}
          </button>
        </div>

        {/* Bottom CCTV Telemetry Bar */}
        <div className="absolute bottom-0 inset-x-0 h-6 bg-black/75 backdrop-blur-sm px-2 flex items-center justify-between text-[9px] font-mono">
          <span className="text-slate-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
            {cam.id} • 30 FPS
          </span>
          <span className="text-slate-400">
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
        </div>
      </div>

      {/* Camera info footer */}
      <div className="p-2.5 bg-slate-900 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold font-mono text-slate-200">{cam.id}</span>
          <Badge variant={alert ? alert.severity : 'SAFE'} size="sm">
            {alert ? 'ALERT' : 'NORMAL'}
          </Badge>
        </div>
        <div className="text-[10px] font-mono text-slate-400 truncate">{cam.name}</div>
        <div className="text-[10px] font-mono text-slate-500">{cam.zone}</div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Detection Timeline Row
// ─────────────────────────────────────────────────────────────────────────────
const TimelineRow: React.FC<{ detection: VisionDetection; onSelect: (d: VisionDetection) => void; isSelected: boolean }> = ({ detection, onSelect, isSelected }) => {
  const col = detectionColor(detection.detectionType);
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => onSelect(detection)}
      className={`flex items-start gap-3 p-2.5 rounded cursor-pointer border transition-all ${
        isSelected ? 'border-brand-cyan bg-slate-800' : `${col.border} ${col.bg}/30 hover:bg-slate-800`
      }`}
    >
      <div className="mt-0.5 flex-shrink-0">{detectionIcon(detection.detectionType)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[11px] font-bold font-mono ${col.text}`}>{detectionLabel(detection)}</span>
          <span className="text-[10px] font-mono text-slate-500">{formatTime(detection.timestamp)}</span>
        </div>
        <div className="text-[10px] font-mono text-slate-400 truncate">{detection.cameraId} — {detection.cameraZone}</div>
        {detection.workerName && (
          <div className="text-[10px] font-mono text-slate-500">{detection.workerName}</div>
        )}
      </div>
      <div className="text-[11px] font-mono text-slate-300 flex-shrink-0">{detection.confidence}%</div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Evidence Viewer Panel
// ─────────────────────────────────────────────────────────────────────────────
const EvidenceViewer: React.FC<{ detection: VisionDetection | null }> = ({ detection }) => {
  if (!detection) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-600 py-10 gap-3">
        <Eye className="w-10 h-10 opacity-30" />
        <p className="text-xs font-mono">Select a detection to view evidence</p>
      </div>
    );
  }

  const col = detectionColor(detection.detectionType);

  return (
    <div className="space-y-3">
      {/* Evidence image area */}
      <div className="relative h-40 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle, #60A5FA 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
        {detection.detectionType === 'FIRE_DETECTED' && (
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(239,68,68,0.6) 0%, rgba(245,158,11,0.3) 40%, transparent 70%)' }}>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-4xl animate-bounce">🔥</div>
          </div>
        )}
        {detection.detectionType === 'SMOKE_DETECTED' && (
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-60">🌫️</div>
        )}
        {detection.detectionType === 'PPE_VIOLATION' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-amber-500 rounded w-20 h-28 flex flex-col items-center justify-center gap-1">
              <div className="text-3xl">👷</div>
              <div className="text-[9px] font-mono text-amber-400 font-bold text-center px-1">{detectionLabel(detection).toUpperCase()}</div>
            </div>
          </div>
        )}
        {detection.detectionType === 'RESTRICTED_ZONE_ENTRY' && (
          <div className="absolute inset-0 flex items-center justify-center gap-3">
            <div className="text-4xl opacity-70">⛔</div>
            <div className="text-4xl opacity-70">🚶</div>
          </div>
        )}

        {/* Camera overlay */}
        <div className="absolute bottom-0 inset-x-0 h-7 bg-black/70 px-2 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-300">{detection.cameraId} • FRAME CAPTURED</span>
          <span className="text-[10px] font-mono text-slate-400">{formatTime(detection.timestamp)}</span>
        </div>
      </div>

      {/* Detection metadata */}
      <div className={`p-3 rounded border ${col.border} ${col.bg} space-y-2 font-mono text-xs`}>
        <div className="flex justify-between">
          <span className="text-slate-400">Detection Type:</span>
          <span className={`font-bold ${col.text}`}>{detectionLabel(detection)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Confidence:</span>
          <span className="text-slate-200 font-bold">{detection.confidence}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Camera:</span>
          <span className="text-slate-200">{detection.cameraId} — {detection.cameraZone}</span>
        </div>
        {detection.workerName && (
          <div className="flex justify-between">
            <span className="text-slate-400">Worker:</span>
            <span className="text-slate-200">{detection.workerName}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-400">Risk Boost:</span>
          <span className="text-red-400 font-bold">+{detection.riskBoost} pts</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Supervisor Notified:</span>
          <span className={detection.notified ? 'text-emerald-400' : 'text-amber-400'}>
            {detection.notified ? 'YES' : 'PENDING'}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed">
        {detection.imageTag}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export const VisionIntelligencePage: React.FC = () => {
  const {
    visionDetections,
    cameraAlerts,
    triggerPPEEvent,
    triggerSmokeEvent,
    currentSmokeSnapshot,
  } = useDatasetStore();
  const { applyVisionRiskBoost } = useRiskStore();

  const [selectedCam, setSelectedCam] = useState<typeof CAMERA_CONFIG[number] | null>(null);
  const [selectedDetection, setSelectedDetection] = useState<VisionDetection | null>(null);
  const [totalPPE, setTotalPPE] = useState(0);
  const [totalFire, setTotalFire] = useState(0);
  const [totalSmoke, setTotalSmoke] = useState(0);
  const [totalZone, setTotalZone] = useState(0);

  // Auto-fire detection events on an interval
  useEffect(() => {
    const ppeInterval = setInterval(() => {
      const d = triggerPPEEvent();
      applyVisionRiskBoost(d.riskBoost, d.detectionType);
      setTotalPPE(p => p + 1);
    }, 8000);

    const smokeInterval = setInterval(() => {
      const d = triggerSmokeEvent();
      if (d) {
        applyVisionRiskBoost(d.riskBoost, d.detectionType);
        if (d.detectionType === 'FIRE_DETECTED') setTotalFire(p => p + 1);
        else setTotalSmoke(p => p + 1);
      }
    }, 15000);

    return () => {
      clearInterval(ppeInterval);
      clearInterval(smokeInterval);
    };
  }, []);

  // Seed initial detections on mount
  useEffect(() => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const d = triggerPPEEvent();
        setTotalPPE(p => p + 1);
      }, i * 400);
    }
    setTimeout(() => {
      const d = triggerSmokeEvent();
      if (d) setTotalSmoke(p => p + 1);
    }, 600);
  }, []);

  const handleCamSelect = useCallback((cam: typeof CAMERA_CONFIG[number], alert: VisionDetection | null) => {
    setSelectedCam(cam);
    setSelectedDetection(alert);
  }, []);

  const alertCount = Object.values(cameraAlerts).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Eye className="w-5 h-5 text-brand-cyan" />
            Vision Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            AI Vision Network • 6 RTSP Feeds Online • Live Webcam Mode Support • Fire & Smoke Analysis • Real Dataset Driven
          </p>
        </div>
        <div className="flex items-center gap-3">
          {alertCount > 0 && (
            <Badge variant="CRITICAL" pulse>{alertCount} ACTIVE ALERTS</Badge>
          )}
          <Badge variant="SAFE" pulse>6 / 6 CAMERAS ONLINE</Badge>
        </div>
      </div>

      {/* ── Detection Statistics Strip ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'PPE Violations', value: totalPPE, icon: HardHat, color: 'text-amber-400', bg: 'bg-amber-950/50', border: 'border-amber-800/60' },
          { label: 'Fire Events', value: totalFire, icon: Flame, color: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-800/60' },
          { label: 'Smoke Events', value: totalSmoke, icon: Wind, color: 'text-orange-400', bg: 'bg-orange-950/50', border: 'border-orange-800/60' },
          { label: 'Zone Violations', value: totalZone, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-800/60' },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`rounded-lg border ${border} ${bg} p-3 flex items-center gap-3`}>
            <div className={`w-9 h-9 rounded-md bg-slate-900 flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <div>
              <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
              <div className="text-[10px] text-slate-400 font-mono">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Smoke Sensor Readout ── */}
      {currentSmokeSnapshot && (
        <div className={`rounded-lg border p-3 flex items-center gap-6 font-mono text-xs ${
          currentSmokeSnapshot.fireAlarm ? 'border-red-800 bg-red-950/30' : 'border-slate-800 bg-slate-900/50'
        }`}>
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${currentSmokeSnapshot.fireAlarm ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className="text-slate-400">IoT Smoke/Fire Sensor Feed</span>
            <Badge variant={currentSmokeSnapshot.fireAlarm ? 'CRITICAL' : 'SAFE'} size="sm">
              {currentSmokeSnapshot.smokeLevel}
            </Badge>
          </div>
          <span className="text-slate-300">Temp: <strong>{currentSmokeSnapshot.tempC}°C</strong></span>
          <span className="text-slate-300">TVOC: <strong className={currentSmokeSnapshot.tvocPpb > 500 ? 'text-red-400' : ''}>{currentSmokeSnapshot.tvocPpb} ppb</strong></span>
          <span className="text-slate-300">eCO₂: <strong>{currentSmokeSnapshot.eco2Ppm} ppm</strong></span>
          <span className="text-slate-300">PM2.5: <strong className={currentSmokeSnapshot.pm25 > 5 ? 'text-amber-400' : ''}>{currentSmokeSnapshot.pm25} μg/m³</strong></span>
          {currentSmokeSnapshot.fireAlarm && (
            <motion.span className="text-red-400 font-bold animate-pulse ml-auto">
              ⚠ FIRE ALARM ACTIVE
            </motion.span>
          )}
        </div>
      )}

      {/* ── Main 3-column layout ── */}
      <div className="grid grid-cols-12 gap-5">

        {/* Left: Camera Grid (8/12) */}
        <div className="col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-brand-cyan" /> Live Camera Grid (Click WEBCAM for Live Camera Stream)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">6 RTSP feeds • AI detection active • 30fps inference</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {CAMERA_CONFIG.map((cam) => (
              <CameraCard
                key={cam.id}
                cam={cam}
                alert={cameraAlerts[cam.id] || null}
                onSelect={handleCamSelect}
                isSelected={selectedCam?.id === cam.id}
              />
            ))}
          </div>
        </div>

        {/* Right column (4/12) */}
        <div className="col-span-4 space-y-4">

          {/* Evidence Viewer */}
          <Card variant="elevated" title="EVIDENCE VIEWER">
            <EvidenceViewer detection={selectedDetection} />
          </Card>

          {/* Active Alerts */}
          {Object.values(cameraAlerts).filter(Boolean).length > 0 && (
            <Card variant="elevated" title="ACTIVE ALERTS">
              <div className="space-y-2">
                {Object.values(cameraAlerts).filter(Boolean).map((alert) => {
                  const col = detectionColor(alert!.detectionType);
                  return (
                    <motion.div
                      key={alert!.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-2.5 p-2 rounded border ${col.border} ${col.bg}/40`}
                    >
                      <Zap className={`w-3.5 h-3.5 ${col.text} animate-pulse flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-[11px] font-bold font-mono ${col.text} truncate`}>
                          {detectionLabel(alert!)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">{alert!.cameraId}</div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{alert!.confidence}%</span>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ── AI Detection Timeline ── */}
      <Card variant="elevated" title={`AI DETECTION TIMELINE — ${visionDetections.length} EVENTS`}>
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {visionDetections.length === 0 ? (
              <div className="text-center py-8 text-slate-600 text-xs font-mono">
                No detections recorded yet — AI vision inference running...
              </div>
            ) : (
              visionDetections.map((d) => (
                <TimelineRow
                  key={d.id}
                  detection={d}
                  onSelect={setSelectedDetection}
                  isSelected={selectedDetection?.id === d.id}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
};
