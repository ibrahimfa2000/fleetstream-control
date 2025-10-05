# M.Z DVR Management Platform

A comprehensive web-based platform for managing and monitoring DVR (Digital Video Recorder) devices with real-time telemetry, live streaming, and subscription management.

## Features

### Device Management
- Add and manage DVR devices with IMEI and SIM card tracking
- Real-time device status monitoring (online/offline)
- Device telemetry including GPS location, battery level, signal strength, and data usage
- Firmware version tracking

### Live Streaming
- View live streams from connected DVR devices
- Support for RTSP and HLS streaming protocols
- Real-time stream status monitoring

### Subscription Management
- Track device subscriptions and plans
- Monitor subscription status and expiration dates
- Automatic subscription renewal tracking

### Role-Based Access Control
- **Customer Role**: View and manage own devices
- **Admin Role**: Monitor and manage all devices across all customers
- Secure authentication with email/password

### Real-Time Data
- MQTT integration for device telemetry updates
- Live device status updates
- Real-time location tracking

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn-ui** - UI component library
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Edge Functions for serverless logic
  - Authentication

### Integration
- **MQTT** - Device communication protocol
- **Media Servers** - Stream transcoding and recording (MediaMTX, FFmpeg, Wowza)

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Supabase account and project

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies
```bash
npm install
# or
bun install
```

3. Configure environment variables
Create a `.env` file with your Supabase credentials (already configured for this project)

4. Start the development server
```bash
npm run dev
# or
bun dev
```

5. Open your browser at `http://localhost:5173`

### First-Time Setup

1. **Create an account** - Sign up with email/password
2. **Assign admin role** (if needed) - Insert a row in the `user_roles` table via Supabase SQL Editor
3. **Add devices** - Use the "Add Device" button to register DVR devices
4. **Configure MQTT** - See `SETUP_GUIDE.md` for MQTT broker setup
5. **Setup media server** - See `SETUP_GUIDE.md` for streaming configuration

## Project Structure

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn-ui components
│   │   ├── DeviceCard.tsx  # Device display card
│   │   ├── StreamPlayer.tsx # Video stream player
│   │   └── Navbar.tsx      # Navigation bar
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx   # Customer dashboard
│   │   ├── AdminDashboard.tsx # Admin dashboard
│   │   ├── DeviceDetail.tsx   # Device details page
│   │   └── Auth.tsx        # Authentication page
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── integrations/       # Supabase client
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── mqtt-handler/   # MQTT message processor
│   │   └── send-device-command/ # Device command sender
│   └── migrations/         # Database migrations
└── SETUP_GUIDE.md         # Detailed setup instructions
```

## Database Schema

### Main Tables
- **devices** - DVR device information (IMEI, SIM, owner)
- **profiles** - User profiles linked to auth
- **telemetry** - Device telemetry data (GPS, battery, signal)
- **streams** - Live stream information
- **subscriptions** - Device subscription tracking
- **user_roles** - Role assignments (admin/customer)

## Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication
- Role-based access control
- Secure credential management via Supabase secrets

## Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed MQTT and media server setup
- [Supabase Dashboard](https://supabase.com/dashboard/project/jlvoebgwzsoghycumjuj)

## License

All rights reserved.
