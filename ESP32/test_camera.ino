#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>

// ===============================
// AI Thinker ESP32-CAM Pin Map
// ===============================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// ===============================
// Wi-Fi Credentials
// ===============================
const char* ssid     = "ZTE_2.4G_w7iTVe";
const char* password = "$tR!b3ran#";

WebServer server(80);

// Forward declaration
void startCameraServer();

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();
  Serial.println("Booting ESP32-CAM...");

  // --- Camera configuration ---
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  // --- Quality & frame settings ---
  if (psramFound()) {
    Serial.println("PSRAM found ✅");
    config.frame_size   = FRAMESIZE_VGA;  // 640x480
    config.jpeg_quality = 10;             // 0-63 (lower = better)
    config.fb_count     = 2;
    config.grab_mode    = CAMERA_GRAB_LATEST;
  } else {
    Serial.println("No PSRAM detected ⚠️");
    config.frame_size   = FRAMESIZE_QVGA;  // 320x240
    config.jpeg_quality = 12;
    config.fb_count     = 1;
  }

  // --- Initialize camera ---
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    delay(5000);
    ESP.restart();
  }
  Serial.println("Camera initialized successfully ✅");

  // --- Connect Wi-Fi ---
  WiFi.begin(ssid, password);
  WiFi.setSleep(false);
  
  Serial.print("Connecting to Wi-Fi");
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 30) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nWiFi failed to connect. Check credentials.");
    delay(5000);
    ESP.restart();
  }

  Serial.println("\n✅ Wi-Fi connected!");
  Serial.print("Camera Stream URL: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/stream");

  // --- Start web server ---
  startCameraServer();
}

void loop() {
  server.handleClient();
  
  // Monitor WiFi - restart if disconnected
  static unsigned long lastWiFiCheck = 0;
  if (millis() - lastWiFiCheck > 10000) {  // check every 10s
    lastWiFiCheck = millis();
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi disconnected - restarting...");
      delay(1000);
      ESP.restart();
    }
  }
  
  delay(10);  // prevent watchdog reset
}

// ===============================
// Web Server Handlers  
// ===============================
void handle_jpg_stream() {
  WiFiClient client = server.client();
  
  // Set headers for MJPEG stream
  client.println("HTTP/1.1 200 OK");
  client.println("Access-Control-Allow-Origin: *");
  client.println("Content-Type: multipart/x-mixed-replace; boundary=frame");
  client.println();

  while (client.connected()) {
    camera_fb_t * fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Camera capture failed");
      client.stop();
      return;
    }

    client.printf("--frame\r\n");
    client.printf("Content-Type: image/jpeg\r\n");
    client.printf("Content-Length: %u\r\n\r\n", fb->len);
    client.write(fb->buf, fb->len);
    client.printf("\r\n");

    esp_camera_fb_return(fb);
  }
}

void handle_jpg() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    server.send(500, "text/plain", "Camera capture failed");
    return;
  }

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Type", "image/jpeg");
  server.sendHeader("Content-Length", String(fb->len));
  server.sendHeader("Connection", "close");
  server.send(200, "image/jpeg", "");
  
  WiFiClient client = server.client();
  client.write(fb->buf, fb->len);

  esp_camera_fb_return(fb);
}

void handle_root() {
  String html = "<!DOCTYPE html><html><head>";
  html += "<title>ESP32-CAM Stream</title>";
  html += "<meta name='viewport' content='width=device-width,initial-scale=1'>";
  html += "<style>body{font-family:Arial,sans-serif;text-align:center;background:#111;color:#eee}";
  html += "img{max-width:100%;border:1px solid #333;margin:10px}";
  html += "a{color:#58a;text-decoration:none}";
  html += "</style></head><body>";
  html += "<h2>ESP32-CAM Stream</h2>";
  html += "<p>IP: " + WiFi.localIP().toString() + "</p>";
  html += "<p><a href='/jpg'>Snapshot</a> | <a href='/stream'>Stream</a></p>";
  html += "<img src='/stream' alt='Camera Stream'>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void startCameraServer() {
  server.on("/", HTTP_GET, handle_root);
  server.on("/jpg", HTTP_GET, handle_jpg);
  server.on("/stream", HTTP_GET, handle_jpg_stream);
  
  // Add CORS headers for all routes
  server.enableCORS(true);
  
  server.begin();
  Serial.println("HTTP server started ✅");
}