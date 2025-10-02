import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StreamPlayerProps {
  streamUrl: string;
  streamType?: string;
}

const StreamPlayer = ({ streamUrl, streamType }: StreamPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const isRTSP = streamUrl?.toLowerCase().startsWith('rtsp://');
  const isHTTP = streamUrl?.toLowerCase().startsWith('http://') || 
                 streamUrl?.toLowerCase().startsWith('https://');
  const isHLS = streamUrl?.toLowerCase().includes('.m3u8');

  useEffect(() => {
    if (!videoRef.current || !streamUrl) return;

    // For HLS streams, use native HLS support or hls.js
    if (isHLS && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = streamUrl;
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, [streamUrl, isHLS]);

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

  if (isRTSP) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            RTSP streams cannot be played directly in browsers. Please convert to HLS (HTTP Live Streaming) 
            format or use a media server like Wowza, nginx-rtmp, or ffmpeg to transcode the stream.
          </AlertDescription>
        </Alert>
        <div className="aspect-video bg-secondary/30 rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground text-sm">RTSP: {streamUrl}</p>
        </div>
      </div>
    );
  }

  if (!isHTTP && !isHLS) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid stream URL. Please configure a valid HTTP or HLS stream URL.
        </AlertDescription>
      </Alert>
    );
  }

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
          onError={() => setError("Stream playback error. Check URL and format.")}
        >
          {isHLS && <source src={streamUrl} type="application/x-mpegURL" />}
          {!isHLS && isHTTP && <source src={streamUrl} />}
        </video>
        
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Button
              size="lg"
              onClick={handlePlay}
              className="gap-2"
            >
              <PlayCircle className="w-6 h-6" />
              Start Stream
            </Button>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>Stream URL: {streamUrl}</p>
        <p>Type: {isHLS ? 'HLS' : 'HTTP'} {streamType ? `(${streamType})` : ''}</p>
      </div>
    </div>
  );
};

export default StreamPlayer;