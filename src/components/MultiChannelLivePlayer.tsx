import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

export interface StreamInfo {
  deviceId: string;
  deviceName: string;
  channel: number;
  channelName: string;
  hlsUrl: string;
  liveHttpUrl: string;
  liveUrl: string;
  rtspUrl: string;
  directStreamUrl: string;
}

interface MultiChannelProps {
  streams: StreamInfo[];
}

const MultiChannelLivePlayer: React.FC<MultiChannelProps> = ({ streams }) => {
  if (!streams || streams.length === 0) {
    return <div>No channels available</div>;
  }

  return (
    <div style={styles.container}>
      {streams.map((stream, idx) => (
        <ChannelPlayer
          key={idx}
          name={stream.channelName || `CH${idx + 1}`}
          hlsUrl={stream.hlsUrl}
        />
      ))}
    </div>
  );
};

interface ChannelPlayerProps {
  name: string;
  hlsUrl: string;
}

const ChannelPlayer: React.FC<ChannelPlayerProps> = ({ name, hlsUrl }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Safari iOS plays HLS natively
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        liveSyncDurationCount: 3,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    }
  }, [hlsUrl]);

  return (
    <div style={styles.playerCard}>
      <h3 style={styles.title}>{name}</h3>
      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        playsInline
        style={styles.video}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    padding: "20px",
    width: "100%",
  },
  playerCard: {
    background: "#111",
    padding: "10px",
    borderRadius: "12px",
    boxShadow: "0 0 10px rgba(0,0,0,0.4)",
  },
  title: {
    color: "#fff",
    fontSize: "16px",
    marginBottom: "10px",
    textAlign: "center",
  },
  video: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    background: "#000",
    borderRadius: "8px",
  },
};

export default MultiChannelLivePlayer;
