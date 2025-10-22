"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [streamUrl, setStreamUrl] = useState("http://192.168.4.1:81/stream");
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [mode, setMode] = useState<'SENTINEL' | 'VIGILANTE'>('VIGILANTE');
  const [threatDetected, setThreatDetected] = useState(false);
  const [threatLevel, setThreatLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('LOW');
  const [threatCount, setThreatCount] = useState(0);
  const [lastThreatTime, setLastThreatTime] = useState<string | null>(null);
  const [threatHistory, setThreatHistory] = useState<Array<{ id: number; time: string }>>([]);
  const [logsOpen, setLogsOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sp_token") : null;
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load soldiers and logs from API (Supabase backend)
  useEffect(() => {
    async function load() {
      try {
        const [soldiersRes, logsRes] = await Promise.all([
          fetch('/api/soldiers'),
          fetch('/api/system-logs')
        ]);
        if (soldiersRes.ok) setSoldiers(await soldiersRes.json());
        if (logsRes.ok) setLogs(await logsRes.json());
      } catch (_) {}
    }
    load();
  }, []);

  function logout() {
    localStorage.removeItem("sp_token");
    router.replace("/login");
  }

  async function connectCamera() {
    setConnectionStatus("Connecting...");
    setConnected(false);
    
    try {
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

  function simulateThreatDetection() {
    const threats = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
    const randomThreat = threats[Math.floor(Math.random() * threats.length)];
    setThreatLevel(randomThreat);
    setThreatDetected(true);
    setThreatCount(prev => {
      const next = prev + 1;
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      setLastThreatTime(time);
      setThreatHistory(history => [{ id: next, time }, ...history].slice(0, 20));
      return next;
    });
    
    // Auto-clear threat after 10 seconds
    setTimeout(() => {
      setThreatDetected(false);
    }, 10000);
  }

  const [soldiers, setSoldiers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [showNewSoldier, setShowNewSoldier] = useState(false);
  const [newSoldier, setNewSoldier] = useState({
    name: "",
    rank: "Private",
    unit: "",
    clearance: "",
    avatar: ""
  });
  // removed duplicate newSoldier state

  return (
    <div className="h-screen bg-[#0a0a0a] text-[#eaeaea] flex flex-col overflow-hidden">
      {/* Threat Alert Banner */}
      {threatDetected && (
        <div className={`flex-shrink-0 border-b px-4 py-3 ${
          threatLevel === 'CRITICAL' ? 'bg-red-900/40 border-red-500/50' :
          threatLevel === 'HIGH' ? 'bg-orange-900/40 border-orange-500/50' :
          threatLevel === 'MEDIUM' ? 'bg-yellow-900/40 border-yellow-500/50' :
          'bg-blue-900/40 border-blue-500/50'
        }`}>
          <div className="mx-auto max-w-[1400px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full animate-pulse ${
                threatLevel === 'CRITICAL' ? 'bg-red-400' :
                threatLevel === 'HIGH' ? 'bg-orange-400' :
                threatLevel === 'MEDIUM' ? 'bg-yellow-400' :
                'bg-blue-400'
              }`}></div>
              <div>
                <span className="font-semibold text-sm">
                  {threatLevel} THREAT DETECTED
                </span>
                <span className="text-xs ml-2 opacity-75">
                  Threat #{threatCount} • {mounted ? currentTime : "--:--:--"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setThreatDetected(false)}
                className="text-xs px-3 py-1 rounded border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
              >
                Acknowledge
              </button>
              <button 
                onClick={simulateThreatDetection}
                className="text-xs px-3 py-1 rounded border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
              >
                Test Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#1f1f1f] bg-[linear-gradient(90deg,#0a0a0a,#111111,#0a0a0a)]">
        <div className="mx-auto h-auto min-h-16 max-w-[1400px] px-2 sm:px-4 py-2 sm:py-0">
          {/* Mobile Layout */}
          <div className="flex flex-col sm:hidden gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-[#111] border border-[#333] flex items-center justify-center text-sm font-semibold">SP</div>
                <span className="font-semibold text-lg">SentinelPro</span>
                <div className={`flex items-center gap-2 rounded-full border px-2 py-1 text-xs ${isOnline ? "bg-emerald-900/40 border-emerald-500/50" : "bg-red-900/40 border-red-500/50"}`}>
                  <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-400" : "bg-red-400"}`}></span>
                  <span className="hidden xs:inline">{isOnline ? "ONLINE" : "OFFLINE"}</span>
                </div>
              </div>
              <span className="text-xs text-[#9b9b9b]">{mounted ? currentTime : "--:--:--"}</span>
            </div>
            
            <input
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="ESP32-CAM stream URL"
              className="w-full rounded-md border border-[#333] bg-[#111] px-3 py-2 text-sm text-[#eaeaea] placeholder:text-[#777]"
            />
            
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={toggleMode}
                className={`flex-1 min-w-0 inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors ${
                  mode === 'SENTINEL'
                    ? "border-blue-500/50 bg-blue-900/20 text-blue-400 hover:bg-blue-900/30"
                    : "border-purple-500/50 bg-purple-900/20 text-purple-400 hover:bg-purple-900/30"
                }`}
              >
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
                <span className="hidden xs:inline">{connectionStatus}</span>
              </button>
              <button onClick={logout} className="inline-flex items-center rounded-md border border-[#333] bg-[#111] px-3 py-2 text-xs hover:bg-[#151515]">
                <span className="hidden xs:inline">Logout</span>
                <span className="xs:hidden">Logout</span>
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
              <span className="text-sm text-[#9b9b9b] hidden lg:inline">{mounted ? currentTime : "--:--:--"}</span>
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
              {connectionStatus}
            </button>
            <button onClick={logout} className="inline-flex items-center rounded-md border border-[#333] bg-[#111] px-3 py-2 text-sm hover:bg-[#151515]">Logout</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Floating Logs Modal (Expanded) */}
        {logsOpen ? (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setLogsOpen(false)}></div>
            <div className="relative z-10 w-full sm:max-w-3xl sm:rounded-lg sm:border border-[#333] bg-[#0b0b0b] shadow-xl m-0 sm:m-4">
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-[#1f1f1f]">
                <h3 className="text-sm font-semibold">System Logs</h3>
                <button onClick={() => setLogsOpen(false)} className="text-xs px-2 py-1 rounded border border-[#2a2a2a] hover:bg-[#151515]">Close</button>
              </div>
              <div className="p-3 sm:p-4 max-h-[70vh] overflow-y-auto">
                <div className="font-mono text-green-400 text-xs sm:text-sm space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-xs">[14:32:15]</span>
                    <span className="text-green-300">[INFO]</span>
                    <span>Motion detected in Zone A</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-xs">[14:17:42]</span>
                    <span className="text-green-300">[INFO]</span>
                    <span>Human presence detected</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-xs">[14:15:30]</span>
                    <span className="text-blue-400">[SENTINEL]</span>
                    <span>Servo motor panning left to right</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-xs">[13:32:15]</span>
                    <span className="text-green-300">[INFO]</span>
                    <span>System calibration complete</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-xs">[12:32:15]</span>
                    <span className="text-green-300">[INFO]</span>
                    <span>Facial recognition model updated</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-xs">[11:32:15]</span>
                    <span className="text-green-300">[INFO]</span>
                    <span>Battery level: 85%</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-xs">[10:32:15]</span>
                    <span className="text-green-300">[INFO]</span>
                    <span>System startup complete</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-xs">[10:30:00]</span>
                    <span className="text-yellow-400">[WARN]</span>
                    <span>Initializing AI models...</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-xs">[10:29:50]</span>
                    <span className="text-purple-400">[VIGILANTE]</span>
                    <span>Facial recognition scan complete</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-xs">[10:29:45]</span>
                    <span className="text-green-300">[INFO]</span>
                    <span>ESP32-CAM connected</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-xs">[10:29:30]</span>
                    <span className="text-green-300">[INFO]</span>
                    <span>WiFi connected to SentinelPro_Network</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-xs">[10:29:15]</span>
                    <span className="text-green-300">[INFO]</span>
                    <span>SentinelPro v1.0.0 started</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        
        {/* Left Side - Live Camera Feed */}
        <section className="flex-1 flex flex-col overflow-hidden border-r-0 lg:border-r border-[#1f1f1f] bg-[linear-gradient(135deg,#0b0b0b,#0a0a0a)]">
          <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-4 py-3 border-b border-[#1f1f1f] gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="flex items-center gap-2 text-sm sm:text-base font-semibold">Live Camera Feed</h2>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                mode === 'SENTINEL' 
                  ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' 
                  : 'bg-purple-900/30 text-purple-400 border border-purple-500/30'
              }`}>
                <span className="hidden sm:inline">{mode === 'SENTINEL' ? 'SENTINEL MODE' : 'VIGILANTE MODE'}</span>
                <span className="sm:hidden">{mode === 'SENTINEL' ? 'SENTINEL' : 'VIGILANTE'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="rounded bg-black/60 px-2 py-1">{mounted ? currentTime : "--:--:--"}</div>
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
                  <div className="mb-4 text-3xl sm:text-5xl">Camera</div>
                  <div className="text-base sm:text-lg font-medium mb-2">ESP32-CAM Not Connected</div>
                  <div className="text-xs sm:text-sm text-[#999] mb-3">Enter the stream URL and click Connect to start monitoring</div>
                  <div className={`text-xs px-3 py-1 rounded ${
                    mode === 'SENTINEL' 
                      ? 'bg-blue-900/20 text-blue-300 border border-blue-500/20' 
                      : 'bg-purple-900/20 text-purple-300 border border-purple-500/20'
                  }`}>
                    <span className="hidden sm:inline">
                      {mode === 'SENTINEL' 
                        ? 'SENTINEL: Continuous panning surveillance' 
                        : 'VIGILANTE: Stationary facial recognition'
                      }
                    </span>
                    <span className="sm:hidden">
                    {mode === 'SENTINEL' 
                        ? 'SENTINEL: Panning surveillance' 
                        : 'VIGILANTE: Facial recognition'
                    }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Side - Face Comparison & Database */}
        <section className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] border-t lg:border-t-0 lg:border-l border-[#1f1f1f]">
          {/* Face Comparison Section */}
          <div className="flex-1 flex flex-col overflow-hidden border-b border-[#1f1f1f]">
            <div className="flex-shrink-0 px-2 sm:px-4 py-3 border-b border-[#1f1f1f]">
              <h2 className="flex items-center gap-2 text-sm sm:text-base font-semibold">Threat Detection</h2>
            </div>
            <div className="flex-1 px-2 sm:px-4 py-3 bg-black">
              {mode === 'VIGILANTE' ? (
                <div className="space-y-4">
                  {/* Face Recognition (full width in Vigilante) */}
                  <div className="bg-[#111] rounded-lg p-3 sm:p-4 border border-[#333]">
                    <h3 className="text-xs sm:text-sm font-semibold mb-3 text-purple-400">Face Recognition</h3>
                    {/* Live Detection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-[#0a0a0a] rounded p-3 sm:p-4 border border-[#222]">
                        <div className="text-xs text-[#999] mb-2">Current Frame</div>
                        <div className="w-full h-40 sm:h-56 bg-[#111] rounded border border-[#333] flex items-center justify-center text-[#666] text-xs sm:text-sm">
                          {connected ? "Live Feed" : "No Signal"}
                        </div>
                      </div>
                      <div className="bg-[#0a0a0a] rounded p-3 sm:p-4 border border-[#222]">
                        <div className="text-xs text-[#999] mb-2">Face Match</div>
                        <div className="w-full h-40 sm:h-56 bg-[#111] rounded border border-[#333] flex items-center justify-center text-[#666] text-xs sm:text-sm">
                          {connected ? "Processing..." : "Awaiting Input"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-[#999]">Confidence Score:</span>
                      <span className="text-emerald-400 font-semibold">94.2%</span>
                    </div>
                    {/* Match Results (driven by soldiers table) */}
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold mb-2 text-blue-400">Match Results</h4>
                      <div className="space-y-2">
                        {soldiers.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded border border-[#222]">
                            <span className="text-xs sm:text-sm">{s.name}</span>
                            <span className={Number(s.confidence) >= 90 ? 'text-emerald-400 text-xs' : Number(s.confidence) >= 85 ? 'text-yellow-400 text-xs' : 'text-orange-400 text-xs'}>
                              {s.confidence ?? '-'}% Match
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Inline System Logs (always visible) */}
                  <div className="bg-[#111] rounded-lg p-4 border border-[#333]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-emerald-400">System Logs</h3>
                      <button onClick={() => setLogsOpen(true)} className="text-xs px-2 py-1 rounded border border-[#2a2a2a] hover:bg-[#151515]">Expand</button>
                    </div>
                    <div className="font-mono text-green-400 text-xs sm:text-sm space-y-1">
                      {logs.map((l: any) => (
                        <div key={l.id} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                          <span className="text-green-600 text-xs">[{new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}]</span>
                          <span className={l.level === 'WARN' ? 'text-yellow-400' : l.level === 'ERROR' ? 'text-red-400' : 'text-green-300'}>[{l.level ?? 'INFO'}]</span>
                          <span className="text-xs sm:text-sm">{l.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Threat Detection (Summary) */}
                  <div className="bg-[#111] rounded-lg p-4 border border-[#333]">
                    <h3 className="text-sm font-semibold mb-3 text-emerald-400">Threat Detection</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#999]">As of {mounted ? currentTime : "--:--:--"}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded border ${
                        threatDetected
                          ? threatLevel === 'CRITICAL' ? 'text-red-400 border-red-500/40 bg-red-900/20' :
                            threatLevel === 'HIGH' ? 'text-orange-400 border-orange-500/40 bg-orange-900/20' :
                            threatLevel === 'MEDIUM' ? 'text-yellow-400 border-yellow-500/40 bg-yellow-900/20' :
                            'text-blue-400 border-blue-500/40 bg-blue-900/20'
                          : 'text-emerald-400 border-emerald-500/40 bg-emerald-900/20'
                      }`}>
                        {threatDetected ? `${threatLevel} THREAT` : 'CLEAR'}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#0a0a0a] rounded p-3 border border-[#222]">
                        <div className="text-[#999]">Threat Count</div>
                        <div className="text-red-400 text-base font-semibold">{threatCount}</div>
                      </div>
                      <div className="bg-[#0a0a0a] rounded p-3 border border-[#222]">
                        <div className="text-[#999]">Last Event</div>
                        <div className="text-[#eaeaea] text-base font-semibold">{lastThreatTime ? lastThreatTime : "—"}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {threatDetected ? (
                        <button onClick={() => setThreatDetected(false)} className="text-xs px-3 py-2 rounded border border-white/20 bg-white/10 hover:bg-white/20 transition-colors">Acknowledge</button>
                      ) : null}
                    </div>
                  </div>

                  {/* Alert Logs */}
                  <div className="bg-[#111] rounded-lg p-4 border border-[#333]">
                    <h3 className="text-sm font-semibold mb-3 text-emerald-400">System Logs</h3>
                    <div className="font-mono text-green-400 text-xs sm:text-sm space-y-1 max-h-48 overflow-y-auto">
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
              )}
            </div>
          </div>

          {/* Database Section */}
          <div className="flex-shrink-0 border-t border-[#1f1f1f]">
            <div className="px-2 sm:px-4 py-3">
              <h3 className="mb-3 text-xs sm:text-sm font-semibold text-[#9b9b9b]">Soldier Database</h3>
              {/* New Soldier Panel */}
              {showNewSoldier ? (
                <div className="mb-3 bg-[#111] rounded-lg p-4 border border-[#333]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-emerald-400">New Soldier</h4>
                    <button onClick={() => setShowNewSoldier(false)} className="text-xs px-2 py-1 rounded border border-[#2a2a2a] hover:bg-[#151515]">Close</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="grid gap-1">
                      <label className="text-[#9b9b9b]">Name</label>
                      <input value={newSoldier.name} onChange={(e)=>setNewSoldier({...newSoldier,name:e.target.value})} className="w-full bg-[#0f0f0f] border border-[#232323] text-[#eaeaea] rounded px-2 py-2" placeholder="e.g. Sgt. John Mitchell" />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-[#9b9b9b]">Rank</label>
                      <input value={newSoldier.rank} onChange={(e)=>setNewSoldier({...newSoldier,rank:e.target.value})} className="w-full bg-[#0f0f0f] border border-[#232323] text-[#eaeaea] rounded px-2 py-2" placeholder="e.g. Sergeant" />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-[#9b9b9b]">Unit</label>
                      <input value={newSoldier.unit} onChange={(e)=>setNewSoldier({...newSoldier,unit:e.target.value})} className="w-full bg-[#0f0f0f] border border-[#232323] text-[#eaeaea] rounded px-2 py-2" placeholder="e.g. Alpha Company" />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-[#9b9b9b]">Clearance</label>
                      <input value={newSoldier.clearance} onChange={(e)=>setNewSoldier({...newSoldier,clearance:e.target.value})} className="w-full bg-[#0f0f0f] border border-[#232323] text-[#eaeaea] rounded px-2 py-2" placeholder="e.g. Level 3" />
                    </div>
                    <div className="grid gap-1 sm:col-span-2">
                      <label className="text-[#9b9b9b]">Photo</label>
                      <input type="file" accept="image/*" onChange={(e)=>{
                        const f=e.target.files?.[0];
                        if(!f) return;
                        const reader=new FileReader();
                        reader.onload=()=>{ setNewSoldier({...newSoldier, avatar: String(reader.result)}); };
                        reader.readAsDataURL(f);
                      }} className="w-full bg-[#0f0f0f] border border-[#232323] text-[#eaeaea] rounded px-2 py-2" />
                      {newSoldier.avatar ? (
                        <div className="mt-2 flex items-center gap-2">
                          <img src={newSoldier.avatar} alt="preview" className="h-10 w-10 rounded object-cover border border-[#333]" />
                          <span className="text-[#9b9b9b]">Preview</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={async ()=>{
                      if(!newSoldier.name.trim()) return;
                      await fetch('/api/soldiers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                        name:newSoldier.name, rank:newSoldier.rank, unit:newSoldier.unit || null, clearance:newSoldier.clearance || null, avatar_url: newSoldier.avatar || null
                      })});
                      const res = await fetch('/api/soldiers');
                      if(res.ok) setSoldiers(await res.json());
                      setNewSoldier({ name:"", rank:"Private", unit:"", clearance:"", avatar:"" });
                      setShowNewSoldier(false);
                    }} className="text-xs px-3 py-2 rounded border border-emerald-500/40 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30">Create</button>
                    <button onClick={()=>{ setNewSoldier({ name:"", rank:"Private", unit:"", clearance:"", avatar:"" }); setShowNewSoldier(false); }} className="text-xs px-3 py-2 rounded border border-[#2a2a2a] hover:bg-[#151515]">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="mb-3 flex items-center justify-end">
                  <button onClick={()=>setShowNewSoldier(true)} className="text-xs px-2 py-1 rounded border border-[#2a2a2a] hover:bg-[#151515]">New Soldier</button>
                </div>
              )}

              <div className="space-y-2 max-h-52 overflow-y-auto">
                {soldiers.map((soldier) => (
                  <div key={soldier.id} className="bg-[#111] rounded p-2 border border-[#222]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{soldier.name}</div>
                        <div className="text-xs text-[#999] truncate">{soldier.rank} • {soldier.unit}</div>
                </div>
                      <div className="flex items-center gap-2">
                        <button onClick={async () => {
                          const name = prompt('Name', soldier.name) || soldier.name;
                          const rank = prompt('Rank', soldier.rank) || soldier.rank;
                          await fetch(`/api/soldiers/${soldier.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...soldier, name, rank }) });
                          const res = await fetch('/api/soldiers');
                          if (res.ok) setSoldiers(await res.json());
                        }} className="text-xs px-2 py-1 rounded border border-[#2a2a2a] hover:bg-[#151515]">Edit</button>
                        <button onClick={async () => {
                          if (!confirm('Delete this soldier?')) return;
                          await fetch(`/api/soldiers/${soldier.id}`, { method: 'DELETE' });
                          const res = await fetch('/api/soldiers');
                          if (res.ok) setSoldiers(await res.json());
                        }} className="text-xs px-2 py-1 rounded border border-red-500/40 text-red-400 hover:bg-red-900/20">Delete</button>
                </div>
                </div>
                </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}