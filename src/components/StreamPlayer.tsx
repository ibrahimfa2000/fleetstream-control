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
    // Try to embed using VLC web plugin or provide direct stream access
    const vlcEmbedUrl = streamUrl.replace('rtsp://', 'http://'); // Attempt HTTP fallback
    
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            RTSP streams require server-side transcoding to HLS/WebRTC for browser playback. 
            Configure your DVR to provide an HLS (.m3u8) stream URL for best compatibility.
          </AlertDescription>
        </Alert>
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
          <iframe
            src={streamUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            title="RTSP Stream"
            onError={() => setError("Unable to load RTSP stream directly. Please configure HLS streaming on your DVR.")}
          />
          <div className="absolute bottom-4 left-4 right-4 bg-black/70 p-3 rounded text-xs text-white">
            <p className="font-mono break-all">{streamUrl}</p>
            <p className="mt-1 text-white/70">Configure your camera/DVR to output HLS for browser playback</p>
          </div>
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