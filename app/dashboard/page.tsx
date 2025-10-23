"use client";

import React, { useEffect, useRef, useState } from "react";
// removed unused useRouter import

export default function DashboardPage() {
  // ===== STATE VARIABLES =====
  const [isOnline, setIsOnline] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [cameraConnected, setCameraConnected] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0); // used to reload <img> stream

  // Use a ref for the reconnect timer ID (browser setTimeout returns a number)
  const reconnectTimerRef = useRef<number | null>(null);

  // ===== TIME UPDATER =====
  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }));
    }, 1000);
    return () => {
      clearInterval(interval);
      setMounted(false);
      // clear any pending reconnect timer on unmount
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, []);

  // ===== CAMERA CONNECTION LOGIC (from Code 1) =====
  useEffect(() => {
    if (!mounted) return;

    // create a temporary Image to check connection (pre-warm)
    const img = new Image();
    // add a cache-busting query param
    img.src = `/api/proxy-stream?cb=${Date.now()}`;

    let cleanedUp = false;

    img.onload = () => {
      if (cleanedUp) return;
      setCameraConnected(true);
      setCameraError(null);
      setIsOnline(true);

      // if a reconnect timer exists, clear it
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    img.onerror = () => {
      if (cleanedUp) return;
      setCameraConnected(false);
      setCameraError("Cannot connect to ESP32-CAM stream.");
      setIsOnline(false);

      // schedule retry after 5 seconds if not already scheduled
      if (!reconnectTimerRef.current) {
        reconnectTimerRef.current = window.setTimeout(() => {
          setReloadKey((prev) => prev + 1);
          reconnectTimerRef.current = null;
        }, 5000);
      }
    };

    return () => {
      // mark cleaned up so callbacks don't run after unmount
      cleanedUp = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [mounted, reloadKey]);

  // ===== helper: manual reconnect =====
  function manualReconnect() {
    // cancel existing reconnect timer and force reload
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    setCameraError(null);
    setReloadKey((k) => k + 1);
  }

  // ===== RENDER =====
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white font-sans">
      {/* ===== HEADER ===== */}
      <header className="flex justify-between items-center p-4 border-b border-gray-700 bg-black/40 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-red-500 tracking-wider">
            SENTINEL PRO
          </h1>
          <p className="text-xs text-gray-400">Autonomous Surveillance Dashboard</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-300">
            Status:{" "}
            <span
              className={`font-semibold ${isOnline ? "text-green-400" : "text-red-500"}`}
            >
              {isOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </p>
          <p className="text-xs text-gray-500">{currentTime}</p>
        </div>
      </header>

      {/* ===== MAIN DASHBOARD ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
        {/* === LEFT COLUMN: LIVE FEED === */}
        <div className="bg-gray-900 rounded-2xl p-4 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-200">Live Feed</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={manualReconnect}
                className="text-xs px-2 py-1 rounded border border-gray-700 hover:bg-gray-800"
              >
                Reconnect
              </button>
              <span className={`text-xs px-2 py-1 rounded ${cameraConnected ? "bg-green-900/30 text-green-300 border border-green-700/30" : "bg-red-900/30 text-red-300 border border-red-700/30"}`}>
                {cameraConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <div className="relative w-full h-[360px] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-gray-800">
            {cameraConnected ? (
              <img
                key={reloadKey}
                src={`/api/proxy-stream?reload=${reloadKey}`}
                alt="ESP32-CAM Live"
                className="w-full h-full object-cover"
                onError={() => {
                  setCameraConnected(false);
                  setCameraError("Stream lost. Reconnecting...");
                  // schedule a retry immediately (increment reloadKey)
                  setReloadKey((prev) => prev + 1);
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 px-4">
                <span className="text-sm text-center">
                  {cameraError ?? "Connecting to ESP32-CAM..."}
                </span>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={manualReconnect}
                    className="text-xs px-3 py-1 rounded border border-gray-700 hover:bg-gray-800"
                  >
                    Retry Now
                  </button>
                </div>
                <div className="mt-4 w-8 h-8 border-4 border-gray-700 border-t-gray-400 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* === RIGHT COLUMN: STATUS + LOGS === */}
        <div className="space-y-4">
          {/* === THREAT LEVELS === */}
          <div className="bg-gray-900 rounded-2xl p-4 shadow-lg border border-gray-700">
            <h2 className="text-lg font-semibold mb-2 text-gray-200">
              Threat Level
            </h2>
            <p className="text-3xl font-bold text-red-500">NORMAL</p>
            <p className="text-sm text-gray-400 mt-1">
              No detected threats. All clear.
            </p>
          </div>

          {/* === EVENT LOGS === */}
          <div className="bg-gray-900 rounded-2xl p-4 shadow-lg border border-gray-700 max-h-[260px] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2 text-gray-200">
              Event Logs
            </h2>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>[{currentTime}] System initialized.</li>
              <li>[{currentTime}] Awaiting camera feed...</li>
              {cameraConnected && <li>[{currentTime}] Camera feed active.</li>}
              {cameraError && <li>[{currentTime}] ⚠ {cameraError}</li>}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
