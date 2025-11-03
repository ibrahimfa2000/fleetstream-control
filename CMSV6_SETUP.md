# CMSV6 Integration Setup Guide

## Overview
This platform integrates with CMSV6 server API to provide vehicle tracking, live video streaming, and device control features.

## Required Secrets

You need to configure these Supabase secrets:

### 1. CMSV6_API_URL
The base URL of your CMSV6 server installation.

**Format Examples:**
- `http://192.168.1.100:8080` (Local network)
- `http://your-vps-ip:8080` (VPS with IP)
- `https://cmsv6.yourdomain.com` (VPS with domain)

**⚠️ Important:**
- Must include protocol (`http://` or `https://`)
- Must include port if not using standard ports
- Do NOT include trailing slash
- Do NOT include `/808gps` or other paths

### 2. CMSV6_API_ACCOUNT
Your CMSV6 admin account username.

### 3. CMSV6_API_PASSWORD
Your CMSV6 admin account password.

### 4. CMSV6_STREAM_PORT (Optional)
The streaming media server port for HLS video streams.
- **Default:** `6604`
- Only set this if your CMSV6 installation uses a different port

## How to Update Secrets

1. Go to your Supabase Dashboard
2. Navigate to: Project Settings > Edge Functions > Secrets
3. Update the following secrets:
   - `CMSV6_API_URL` → Your VPS URL
   - `CMSV6_API_ACCOUNT` → Your admin username
   - `CMSV6_API_PASSWORD` → Your admin password

## Verify Connection

After updating the secrets, the platform will:
1. Automatically log in to CMSV6 on page load
2. Sync vehicle/device data from CMSV6
3. Enable live video streaming via HLS
4. Allow device control commands

## Edge Functions

The integration includes these Supabase Edge Functions:

- **cmsv6-login**: Authenticates with CMSV6 API
- **cmsv6-vehicles**: Fetches and syncs vehicle data
- **cmsv6-live-video**: Generates HLS stream URLs
- **cmsv6-telemetry**: Retrieves real-time GPS and device status
- **cmsv6-control**: Sends commands (PTZ, TTS, vehicle control)
- **cmsv6-alarms**: Fetches device alarms

## API Reference

The integration follows CMSV6 Standard API v6/v7/v8:
- Documentation: https://v7.cmsv8.com/808gps/open/webApi.html

## Troubleshooting

### Error: "Invalid URL"
- Check that `CMSV6_API_URL` includes protocol (`http://` or `https://`)
- Verify the URL is accessible from the internet (for Supabase Edge Functions)

### Error: "Username or password incorrect"
- Verify `CMSV6_API_ACCOUNT` and `CMSV6_API_PASSWORD` are correct
- Check that the account has API access permissions

### Live Video Not Working
- Verify streaming port (default 6604) is open and accessible
- Check that your CMSV6 installation has the streaming media server enabled
- Ensure devices are online and have active video streams

### No Vehicles Showing
- Wait for initial sync after login
- Check that your CMSV6 account has vehicle permissions
- Verify devices are properly registered in CMSV6

## Testing

You can test the CMSV6 connection by:
1. Opening the Dashboard page
2. Looking for "CMSV6 Status" indicator
3. Clicking "Sync with CMSV6" button
4. Checking browser console for detailed logs
