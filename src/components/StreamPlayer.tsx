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
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const hlsRef = useRef<Hls | null>(null);

  const isHLS = streamUrl?.toLowerCase().includes(".m3u8");

  const setupHls = () => {
    if (!videoRef.current || !isHLS) return;
    const hls = new Hls({
      maxBufferLength: 10,
      liveSyncDurationCount: 3,
      fragLoadingMaxRetry: 5,
      manifestLoadingMaxRetry: 5,
      enableWorker: true,
    });

    hls.loadSource(streamUrl);
    hls.attachMedia(videoRef.current);

    hls.on(Hls.Events.ERROR, (_, data) => {
      console.error("HLS error:", data);

      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            setIsReconnecting(true);
            hls.startLoad();
            setTimeout(() => setIsReconnecting(false), 1500);
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            setIsReconnecting(true);
            hls.recoverMediaError();
            setTimeout(() => setIsReconnecting(false), 1500);
            break;
          default:
            setIsReconnecting(true);
            setError("Stream interrupted, reconnecting...");
            hls.destroy();
            setTimeout(() => {
              setupHls();
              setIsReconnecting(false);
            }, 2000);
            break;
        }
      } else {
        // Non-fatal: mediaError, levelLoadTimeOut, etc.
        if (data.details?.includes("fragParsingError")) {
          console.warn("Skipping bad fragment, continuing...");
        }
      }
    });

    hlsRef.current = hls;
  };

  useEffect(() => {
    if (isHLS && Hls.isSupported()) {
      setupHls();
    } else if (videoRef.current && videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = streamUrl;
    } else {
      setError("This browser does not support HLS playback.");
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [streamUrl]);

  const handlePlay = async () => {
    if (!videoRef.current) return;
    try {
      setError(null);
      await videoRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      setError("Failed to play stream. Please check the stream URL.");
      console.error("Playback error:", err);
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
          controls
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
        <p>Type: {isHLS ? "HLS" : "HTTP"} {streamType ? `(${streamType})` : ""}</p>
      </div>
    </div>
  );
};

export default StreamPlayer;
