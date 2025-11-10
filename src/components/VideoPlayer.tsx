import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Loader2, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  streamUrl?: string; // this will be your liveUrl
  vehicleName: string;
  isLoading?: boolean;
  error?: string;
  channelName?: string;
}

export const VideoPlayer = ({
  streamUrl,
  vehicleName,
  isLoading = false,
  error,
  channelName = "Camera 1",
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    // Always reset the source before assigning a new one
    video.pause();
    video.removeAttribute("src");
    video.load();

    video.src = streamUrl;
    video.load();

    video
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.error("Error playing stream:", err);
        setIsPlaying(false);
      });

    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [streamUrl]);
useEffect(() => {
  const interval = setInterval(() => {
    if (videoRef.current && streamUrl) {
      videoRef.current.src = streamUrl + `?t=${Date.now()}`; // force reload
      videoRef.current.play().catch(() => {});
    }
  }, 30000); // refresh every 30s

  return () => clearInterval(interval);
}, [streamUrl]);
  return (
    <Card className="overflow-hidden bg-card border-border">
      {/* Header */}
      <div className="p-3 bg-sidebar border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-sidebar-foreground">
            {vehicleName}
          </h3>
          <p className="text-xs text-muted-foreground">{channelName}</p>
        </div>
        {isPlaying && (
          <Badge variant="secondary" className="bg-accent/20 text-accent">
            <span className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse" />
            Live
          </Badge>
        )}
      </div>

      {/* Player Area */}
      <div className="aspect-video bg-muted relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-center text-muted-foreground">{error}</p>
          </div>
        )}

        {!isLoading && !error && streamUrl ? (
          <video
            key={streamUrl}
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            controls
          />
        ) : (
          !isLoading &&
          !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Video className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No stream available</p>
            </div>
          )
        )}
      </div>
    </Card>
  );
};
