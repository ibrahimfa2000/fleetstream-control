# DVR Management System Setup Guide

## MQTT Broker Setup

### Option 1: HiveMQ Cloud (Recommended for Quick Start)
1. Sign up at https://www.hivemq.com/mqtt-cloud-broker/
2. Create a free cluster
3. Note down your connection details:
   - Broker URL
   - Port (typically 8883 for secure connections)
   - Username and Password
4. Configure your DVR devices to publish to topics:
   - `devices/{device_id}/telemetry` - for telemetry data
   - `devices/{device_id}/status` - for status updates
   - `devices/{device_id}/stream` - for stream URL updates

### Option 2: Self-Hosted Mosquitto
```bash
# Install Mosquitto
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients

# Configure Mosquitto
sudo nano /etc/mosquitto/mosquitto.conf

# Add these lines:
listener 1883
allow_anonymous false
password_file /etc/mosquitto/passwd

# Create user
sudo mosquitto_passwd -c /etc/mosquitto/passwd admin

# Restart Mosquitto
sudo systemctl restart mosquitto
```

### MQTT Message Format

**Telemetry Message** (`devices/{device_id}/telemetry`):
```json
{
  "battery_level": 85,
  "signal_strength": -70,
  "gps_lat": 40.7128,
  "gps_lon": -74.0060,
  "storage_free_mb": 15000,
  "data_usage_mb": 250
}
```

**Status Message** (`devices/{device_id}/status`):
```json
{
  "status": "online"
}
```

**Stream Message** (`devices/{device_id}/stream`):
```json
{
  "stream_url": "rtsp://192.168.1.100:8554/stream",
  "stream_type": "rtsp"
}
```

### Forwarding MQTT to Supabase
Use a bridge script to forward MQTT messages to the edge function:

```python
import paho.mqtt.client as mqtt
import requests
import json

SUPABASE_URL = "https://jlvoebgwzsoghycumjuj.supabase.co"
FUNCTION_URL = f"{SUPABASE_URL}/functions/v1/mqtt-handler"

def on_message(client, userdata, msg):
    # Extract device_id from topic
    topic_parts = msg.topic.split('/')
    device_id = topic_parts[1]
    
    # Prepare payload
    payload = {
        "device_id": device_id,
        "topic": msg.topic,
        "payload": json.loads(msg.payload.decode())
    }
    
    # Forward to Supabase
    try:
        response = requests.post(FUNCTION_URL, json=payload)
        print(f"Forwarded {msg.topic}: {response.status_code}")
    except Exception as e:
        print(f"Error forwarding message: {e}")

# MQTT Client Setup
client = mqtt.Client()
client.username_pw_set("your_username", "your_password")
client.on_message = on_message
client.connect("your_broker_url", 1883, 60)
client.subscribe("devices/#")
client.loop_forever()
```

## Media Server Setup with Transcoding

### Option 1: MediaMTX (Recommended)
MediaMTX is a modern, easy-to-use media server that supports RTSP, WebRTC, and HLS.

```bash
# Download MediaMTX
wget https://github.com/bluenviron/mediamtx/releases/latest/download/mediamtx_linux_amd64.tar.gz
tar -xzf mediamtx_linux_amd64.tar.gz

# Create config
cat > mediamtx.yml <<EOF
paths:
  all:
    # Enable authentication
    readUser: viewer
    readPass: viewer123
    publishUser: publisher
    publishPass: publisher123
    
    # Enable HLS for browser playback
    readTimeout: 20s
    
    # Enable recording
    record: yes
    recordPath: ./recordings/%path/%Y-%m-%d_%H-%M-%S-%f
    recordFormat: fmp4
    recordSegmentDuration: 1h
    
    # Enable WebRTC
    webrtcEnable: yes

# HLS Server
hls: yes
hlsAddress: :8888
hlsEncryption: no
hlsServerKey: server.key
hlsServerCert: server.crt
hlsAlwaysRemux: no
hlsVariant: lowLatency
hlsSegmentCount: 7
hlsSegmentDuration: 1s
hlsPartDuration: 200ms
hlsSegmentMaxSize: 50M

# WebRTC
webrtcAddress: :8889
webrtcServerKey: server.key
webrtcServerCert: server.crt
EOF

# Run MediaMTX
./mediamtx mediamtx.yml
```

**Stream URLs:**
- RTSP Input: `rtsp://publisher:publisher123@your-server:8554/stream1`
- HLS Output: `http://your-server:8888/stream1/index.m3u8`
- WebRTC: Available through the web interface at `:8889`

### Option 2: FFmpeg-based Transcoding
For custom transcoding, use FFmpeg:

```bash
# Install FFmpeg
sudo apt-get install ffmpeg

# Transcode RTSP to HLS
ffmpeg -rtsp_transport tcp \
  -i rtsp://camera-ip:554/stream \
  -c:v libx264 -preset veryfast -tune zerolatency \
  -c:a aac -b:a 128k \
  -f hls -hls_time 2 -hls_list_size 5 -hls_flags delete_segments \
  /var/www/html/streams/stream1.m3u8
```

### Option 3: Wowza Streaming Engine (Enterprise)
For production deployments with advanced features:
1. Visit https://www.wowza.com/
2. Download Wowza Streaming Engine
3. Follow installation instructions
4. Configure live application for RTSP ingestion
5. Enable HLS and recording modules

## Nginx Configuration for HLS Streaming

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /streams/ {
        alias /var/www/html/streams/;
        
        # CORS headers for HLS
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, OPTIONS';
        add_header Access-Control-Allow-Headers 'Range';
        
        # HLS specific
        types {
            application/vnd.apple.mpegurl m3u8;
            video/mp2t ts;
        }
        
        # Cache control
        expires 1s;
    }
}
```

## Connecting DVR Devices

Configure your DVR devices to:
1. **Publish MQTT messages** to the broker on the topics mentioned above
2. **Stream video** to the MediaMTX server using RTSP
3. **Use HLS URLs** in the database for browser-compatible playback

Example stream URLs to store in database:
- `http://your-media-server:8888/camera1/index.m3u8` (HLS)
- `https://your-domain.com/streams/camera1.m3u8` (HLS via Nginx)

## Security Considerations

1. **Use HTTPS/WSS** for production deployments
2. **Enable authentication** on all services
3. **Use firewall rules** to restrict access
4. **Implement rate limiting** on the MQTT bridge
5. **Use VPN** for device communication in sensitive deployments

## Testing

Test the MQTT handler:
```bash
curl -X POST https://jlvoebgwzsoghycumjuj.supabase.co/functions/v1/mqtt-handler \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "your-device-uuid",
    "topic": "devices/your-device-uuid/telemetry",
    "payload": {
      "battery_level": 85,
      "signal_strength": -70
    }
  }'
```
