import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Hls from "hls.js";

interface StreamPlayerProps {
  streamUrl: string;
  streamType?: string;
}

const StreamPlayer = ({ streamUrl, streamType }: StreamPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isHLS = streamUrl?.toLowerCase().includes(".m3u8");

  const setupHls = () => {
    if (!videoRef.current || !isHLS) return;

    // Clean up existing instance
    hlsRef.current?.destroy();
    hlsRef.current = null;

    const hls = new Hls({
      liveSyncDuration: 2,
      liveMaxLatencyDuration: 4,
      maxLiveSyncPlaybackRate: 1.2,
      maxBufferLength: 5,
      maxBufferSize: 30 * 1000 * 1000,
      backBufferLength: 5,
      lowLatencyMode: true,
      enableWorker: true,
      fragLoadingTimeOut: 10000,
      manifestLoadingTimeOut: 10000,
      fragLoadingMaxRetry: 3,
      manifestLoadingMaxRetry: 3,
      startFragPrefetch: true,
    });

    hls.loadSource(streamUrl);
    hls.attachMedia(videoRef.current);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log("HLS manifest parsed, ready to play.");
      setError(null);
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      console.error("HLS error:", data);
      if (!data.fatal) return;

      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          reconnect("Network error, retrying...");
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          reconnect("Media error, recovering...", () => hls.recoverMediaError());
          break;
        default:
          reconnect("Critical error, reloading stream...", setupHls);
          break;
      }
    });

    hlsRef.current = hls;
  };

  const reconnect = (msg: string, action?: () => void) => {
    setIsReconnecting(true);
    setError(msg);

    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);

    retryTimeoutRef.current = setTimeout(() => {
      action ? action() : setupHls();
      setIsReconnecting(false);
    }, 2000);
  };

  useEffect(() => {
    if (isHLS && Hls.isSupported()) {
      setupHls();
    } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      // Native Safari support
      videoRef.current.src = streamUrl;
    } else {
      setError("This browser does not support HLS playback.");
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [streamUrl]);

  const handlePlay = async () => {
    if (!videoRef.current) return;
    try {
      setError(null);
      await videoRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Playback error:", err);
      setError("Failed to play stream. Please check the stream URL.");
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        <video
          ref={videoRef}
          className="w-full h-full"
          type="application/x-mpegURL"
          controls
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {!isPlaying && !isReconnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Button size="lg" onClick={handlePlay} className="gap-2">
              <PlayCircle className="w-6 h-6" />
              Start Stream
            </Button>
          </div>
        )}

        {isReconnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-sm gap-2">
            <RefreshCw className="animate-spin h-5 w-5" />
            Reconnecting to stream...
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>Stream URL: {streamUrl}</p>
        <p>
          Type: {isHLS ? "HLS" : "HTTP"} {streamType ? `(${streamType})` : ""}
        </p>
      </div>
    </div>
  );
};

export default StreamPlayer;
