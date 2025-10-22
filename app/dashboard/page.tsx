"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [detectionCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [streamUrl, setStreamUrl] = useState("http://192.168.4.1:81/stream");
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [mode, setMode] = useState<'SENTINEL' | 'VIGILANTE'>('SENTINEL');

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sp_token") : null;
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  function logout() {
    localStorage.removeItem("sp_token");
    router.replace("/login");
  }

  async function connectCamera() {
    setConnectionStatus("Connecting...");
    setConnected(false);
    
    try {
      // Test the stream URL by trying to load the image
      const img = new Image();
      img.onload = () => {
        setConnected(true);
        setIsOnline(true);
        setConnectionStatus("Connected");
      };
      img.onerror = () => {
        setConnected(false);
        setIsOnline(false);
        setConnectionStatus("Connection Failed");
      };
      img.src = streamUrl;
    } catch (error) {
      setConnected(false);
      setIsOnline(false);
      setConnectionStatus("Connection Failed");
    }
  }

  function toggleMode() {
    setMode(prev => prev === 'SENTINEL' ? 'VIGILANTE' : 'SENTINEL');
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-[#eaeaea] flex flex-col overflow-hidden">
      {/* Header - Fixed height */}
      <header className="flex-shrink-0 border-b border-[#1f1f1f] bg-[linear-gradient(90deg,#0a0a0a,#111111,#0a0a0a)]">
        <div className="mx-auto h-auto min-h-16 max-w-[1400px] px-2 sm:px-4 py-2 sm:py-0">
          {/* Mobile Layout */}
          <div className="flex flex-col sm:hidden gap-3">
            {/* Top row - Brand and status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-[#111] border border-[#333] flex items-center justify-center text-sm font-semibold">SP</div>
                <span className="font-semibold text-lg">SentinelPro</span>
                <div className={`flex items-center gap-2 rounded-full border px-2 py-1 text-xs ${isOnline ? "bg-emerald-900/40 border-emerald-500/50" : "bg-red-900/40 border-red-500/50"}`}>
                  <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-400" : "bg-red-400"}`}></span>
                  <span className="hidden xs:inline">{isOnline ? "ONLINE" : "OFFLINE"}</span>
                </div>
              </div>
              <span className="text-xs text-[#9b9b9b]">{currentTime}</span>
            </div>
            
            {/* Stream URL input */}
            <input
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="ESP32-CAM stream URL"
              className="w-full rounded-md border border-[#333] bg-[#111] px-3 py-2 text-sm text-[#eaeaea] placeholder:text-[#777]"
            />
            
            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={toggleMode}
                className={`flex-1 min-w-0 inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors ${
                  mode === 'SENTINEL'
                    ? "border-blue-500/50 bg-blue-900/20 text-blue-400 hover:bg-blue-900/30"
                    : "border-purple-500/50 bg-purple-900/20 text-purple-400 hover:bg-purple-900/30"
                }`}
              >
                <span>{mode === 'SENTINEL' ? '🛡️' : '👁️'}</span>
                <span className="hidden xs:inline">{mode}</span>
              </button>
              <button 
                onClick={connectCamera} 
                className={`flex-1 min-w-0 inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors ${
                  connected 
                    ? "border-emerald-500/50 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30" 
                    : "border-[#333] bg-[#111] hover:bg-[#151515]"
                }`}
              >
                <span>🔌</span>
                <span className="hidden xs:inline">{connectionStatus}</span>
              </button>
              <button onClick={logout} className="inline-flex items-center rounded-md border border-[#333] bg-[#111] px-3 py-2 text-xs hover:bg-[#151515]">
                <span className="hidden xs:inline">Logout</span>
                <span className="xs:hidden">🚪</span>
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-[#111] border border-[#333] flex items-center justify-center text-sm font-semibold">SP</div>
              <span className="font-semibold text-lg">SentinelPro</span>
              <div className={`ml-3 flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${isOnline ? "bg-emerald-900/40 border-emerald-500/50" : "bg-red-900/40 border-red-500/50"}`}>
                <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-400" : "bg-red-400"}`}></span>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#9b9b9b] hidden lg:inline">{currentTime}</span>
              <input
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="ESP32-CAM stream URL"
                className="hidden md:block w-[280px] rounded-md border border-[#333] bg-[#111] px-3 py-2 text-sm text-[#eaeaea] placeholder:text-[#777]"
              />
              <button 
                onClick={toggleMode}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  mode === 'SENTINEL'
                    ? "border-blue-500/50 bg-blue-900/20 text-blue-400 hover:bg-blue-900/30"
                    : "border-purple-500/50 bg-purple-900/20 text-purple-400 hover:bg-purple-900/30"
                }`}
              >
                <span>{mode === 'SENTINEL' ? '🛡️' : '👁️'}</span>
                {mode}
              </button>
              <button 
                onClick={connectCamera} 
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  connected 
                    ? "border-emerald-500/50 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30" 
                    : "border-[#333] bg-[#111] hover:bg-[#151515]"
                }`}
              >
                <span>🔌</span>
                {connectionStatus}
              </button>
              <button onClick={logout} className="inline-flex items-center rounded-md border border-[#333] bg-[#111] px-3 py-2 text-sm hover:bg-[#151515]">Logout</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Flexible height, no scroll */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side - Camera Feed (50% width on desktop, full width on mobile) */}
        <section className="flex-1 flex flex-col overflow-hidden border-r-0 lg:border-r border-[#1f1f1f] bg-[linear-gradient(135deg,#0b0b0b,#0a0a0a)]">
          <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-4 py-3 border-b border-[#1f1f1f] gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="flex items-center gap-2 text-sm sm:text-base font-semibold">📹 Live Camera Feed</h2>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                mode === 'SENTINEL' 
                  ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' 
                  : 'bg-purple-900/30 text-purple-400 border border-purple-500/30'
              }`}>
                <span className="hidden sm:inline">{mode === 'SENTINEL' ? '🛡️ SENTINEL MODE' : '👁️ VIGILANTE MODE'}</span>
                <span className="sm:hidden">{mode === 'SENTINEL' ? '🛡️ SENTINEL' : '👁️ VIGILANTE'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-2 rounded bg-red-600 px-2 py-1 font-semibold">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                <span className="hidden sm:inline">REC</span>
              </div>
              <div className="rounded bg-black/60 px-2 py-1">{currentTime}</div>
            </div>
          </div>
          <div className="flex-1 relative bg-black min-h-[200px] lg:min-h-0">
            {connected ? (
              <img 
                src={streamUrl} 
                alt="ESP32-CAM Stream" 
                className="h-full w-full object-cover"
                onError={() => {
                  setConnected(false);
                  setIsOnline(false);
                  setConnectionStatus("Stream Error");
                }}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-center text-[#777] p-4">
                <div>
                  <div className="mb-4 text-3xl sm:text-5xl">📷</div>
                  <div className="text-base sm:text-lg font-medium mb-2">ESP32-CAM Not Connected</div>
                  <div className="text-xs sm:text-sm text-[#999] mb-3">Enter the stream URL and click Connect to start monitoring</div>
                  <div className={`text-xs px-3 py-1 rounded ${
                    mode === 'SENTINEL' 
                      ? 'bg-blue-900/20 text-blue-300 border border-blue-500/20' 
                      : 'bg-purple-900/20 text-purple-300 border border-purple-500/20'
                  }`}>
                    <span className="hidden sm:inline">
                      {mode === 'SENTINEL' 
                        ? '🛡️ SENTINEL: Continuous panning surveillance' 
                        : '👁️ VIGILANTE: Stationary facial recognition'
                      }
                    </span>
                    <span className="sm:hidden">
                      {mode === 'SENTINEL' 
                        ? '🛡️ SENTINEL: Panning surveillance' 
                        : '👁️ VIGILANTE: Facial recognition'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Side - Alert Logs and Stats (50% width on desktop, full width on mobile) */}
        <section className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] border-t lg:border-t-0 lg:border-l border-[#1f1f1f]">
          {/* Alert Logs */}
          <div className="flex-1 flex flex-col overflow-hidden border-b border-[#1f1f1f]">
            <div className="flex-shrink-0 px-2 sm:px-4 py-3 border-b border-[#1f1f1f]">
              <h2 className="flex items-center gap-2 text-sm sm:text-base font-semibold">🚨 Recent Alerts</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 bg-black">
              <div className="font-mono text-green-400 text-xs sm:text-sm space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-green-600 text-xs">[14:32:15]</span>
                  <span className="text-green-300">[INFO]</span>
                  <span className="text-xs sm:text-sm">Motion detected in Zone A</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-green-600 text-xs">[14:17:42]</span>
                  <span className="text-green-300">[INFO]</span>
                  <span className="text-xs sm:text-sm">Human presence detected</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-green-600 text-xs">[14:15:30]</span>
                  <span className="text-blue-400">[SENTINEL]</span>
                  <span className="text-xs sm:text-sm">Servo motor panning left to right</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-green-600 text-xs">[13:32:15]</span>
                  <span className="text-green-300">[INFO]</span>
                  <span className="text-xs sm:text-sm">System calibration complete</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-green-600 text-xs">[12:32:15]</span>
                  <span className="text-green-300">[INFO]</span>
                  <span className="text-xs sm:text-sm">Facial recognition model updated</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-green-600 text-xs">[11:32:15]</span>
                  <span className="text-green-300">[INFO]</span>
                  <span className="text-xs sm:text-sm">Battery level: 85%</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-green-600 text-xs">[10:32:15]</span>
                  <span className="text-green-300">[INFO]</span>
                  <span className="text-xs sm:text-sm">System startup complete</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-green-600 text-xs">[10:30:00]</span>
                  <span className="text-yellow-400">[WARN]</span>
                  <span className="text-xs sm:text-sm">Initializing AI models...</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-green-600 text-xs">[10:29:50]</span>
                  <span className="text-purple-400">[VIGILANTE]</span>
                  <span className="text-xs sm:text-sm">Facial recognition scan complete</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-green-600 text-xs">[10:29:45]</span>
                  <span className="text-green-300">[INFO]</span>
                  <span className="text-xs sm:text-sm">ESP32-CAM connected</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-green-600 text-xs">[10:29:30]</span>
                  <span className="text-green-300">[INFO]</span>
                  <span className="text-xs sm:text-sm">WiFi connected to SentinelPro_Network</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-green-600 text-xs">[10:29:15]</span>
                  <span className="text-green-300">[INFO]</span>
                  <span className="text-xs sm:text-sm">SentinelPro v1.0.0 started</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats Panel */}
          <div className="flex-shrink-0 border-t border-[#1f1f1f]">
            <div className="px-2 sm:px-4 py-3">
              <h3 className="mb-3 text-xs sm:text-sm font-semibold text-[#9b9b9b]">System Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span>AI Processing</span>
                  <span className="text-emerald-400 text-xs">● Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Motion Detection</span>
                  <span className="text-emerald-400 text-xs">● Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Facial Recognition</span>
                  <span className="text-emerald-400 text-xs">● Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Battery Level</span>
                  <span className="text-amber-400 text-xs">85%</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}