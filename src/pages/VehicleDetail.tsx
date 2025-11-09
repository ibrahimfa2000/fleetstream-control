import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCMSV6Videos, useCMSV6Locations } from "@/hooks/useCMSV6Data";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const VehicleDetail = () => {
  const { data: videoData, isLoading: loadingVideos } = useCMSV6Videos();
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  if (loadingVideos) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Live Video Feeds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-video w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const streams = videoData?.streams || [];

  const openVideoStream = (url: string) => {
    window.open(url, '_blank', 'width=800,height=600');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Live Video Feeds</h2>
        {streams.length > 0 ? (
          <Badge variant="outline" className="text-success">
            {streams.length} streams available
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            No streams found
          </Badge>
        )}
      </div>
      
      {streams.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Video className="w-16 h-16 mx-auto mb-2 opacity-50" />
          <p>No video streams available</p>
          <p className="text-sm">Devices do not have video capability or are not configured</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {streams.map((stream: any) => {
            return (
              <div key={`${stream.deviceId}_${stream.channel}`} className="relative group">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                  {/* Video placeholder with HLS preview */}
                  
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
                      <Video className="w-16 h-16 text-muted-foreground opacity-50" />
                    </div>
                  
                  
                  {/* Status badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <Badge 
                      className="bg-destructive text-destructive-foreground"
                    >
                       {"● LIVE" }
                    </Badge>
                  </div>
                  
                  {/* Vehicle info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 z-10">
                    <p className="font-semibold text-white text-sm">{stream.deviceName}</p>
                    <p className="text-xs text-white/70">{stream.channelName}</p>
                  </div>
                  
                  {/* Controls overlay */}
                
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => openVideoStream(stream.hlsUrl)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Fullscreen
                      </Button>
                    </div>
                  
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
export default VehicleDetail;