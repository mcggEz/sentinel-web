// === Sentinel Proxy Stream Route (Full Fixed Version) ===
// Path: app/api/proxy-stream/route.ts
// Purpose: Proxies MJPEG stream from ESP32-CAM to Next.js client.

import { NextRequest } from "next/server";

// ====== CHANGE THIS ======
const ESP32_STREAM_URL = "http://192.168.68.151:81/stream"; 
// Replace with your ESP32-CAM's local IP from Serial Monitor

// ====== STREAM HANDLER ======
export async function GET(req: NextRequest) {
  try {
    // Forward client request to ESP32 stream
    const response = await fetch(ESP32_STREAM_URL, {
      method: "GET",
      headers: {
        "User-Agent": "Next.js-Proxy",
        "Connection": "keep-alive",
      },
    });

    // If the ESP32 didn’t respond
    if (!response.ok) {
      return new Response(`ESP32 Stream Error: ${response.statusText}`, {
        status: response.status,
      });
    }

    // Copy headers from ESP32 to client response
    const headers = new Headers();
    headers.set("Content-Type", "multipart/x-mixed-replace; boundary=frame");
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");

    // Use a TransformStream to continuously relay chunks
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Pipe the stream from ESP32
    (async () => {
      const reader = response.body?.getReader();
      if (!reader) {
        console.error("ESP32 stream body is not readable");
        await writer.close();
        return;
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) await writer.write(value);
        }
      } catch (err) {
        console.error("Proxy stream error:", err);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, { headers });
  } catch (err: any) {
    console.error("Proxy route failed:", err);
    return new Response(`Failed to connect to ESP32 stream: ${err.message}`, {
      status: 500,
    });
  }
}
