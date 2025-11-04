import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Video, FileVideo, Search, Download, Play, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCMSV6Session } from "@/hooks/useCMSV6";

const VideoManagement = () => {
  const navigate = useNavigate();
  const { jsession } = useCMSV6Session();
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState({
    deviceId: "",
    startTime: "",
    endTime: "",
    channel: "0",
    streamType: "0",
    alarmType: ""
  });

  const handleVideoQuery = async () => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-video-query', {
        body: {
          jsession,
          ...queryParams
        }
      });

      if (error) throw error;
      toast.success("Video query completed successfully");
      console.log("Video query result:", data);
    } catch (error: any) {
      toast.error("Video query failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handle1078Business = async (action: string) => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-1078-business', {
        body: {
          jsession,
          action,
          deviceId: queryParams.deviceId,
          params: {}
        }
      });

      if (error) throw error;
      toast.success(`1078 action '${action}' completed successfully`);
      console.log("1078 business result:", data);
    } catch (error: any) {
      toast.error("1078 business failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(213,175,55,0.08),transparent_60%)]" />
      <div className="relative">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Video className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Video Management</h1>
              <p className="text-muted-foreground">Query and manage video recordings</p>
            </div>
          </div>

          <Tabs defaultValue="query" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="query">Video Query</TabsTrigger>
              <TabsTrigger value="1078">1078 Business</TabsTrigger>
            </TabsList>

            <TabsContent value="query">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Query Video Files
                  </CardTitle>
                  <CardDescription>Search for recorded video files by device and time range</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deviceId">Device ID / IMEI</Label>
                      <Input
                        id="deviceId"
                        value={queryParams.deviceId}
                        onChange={(e) => setQueryParams({ ...queryParams, deviceId: e.target.value })}
                        placeholder="Enter device ID or IMEI"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="channel">Channel</Label>
                      <Select value={queryParams.channel} onValueChange={(v) => setQueryParams({ ...queryParams, channel: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Channel 0</SelectItem>
                          <SelectItem value="1">Channel 1</SelectItem>
                          <SelectItem value="2">Channel 2</SelectItem>
                          <SelectItem value="3">Channel 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        value={queryParams.startTime}
                        onChange={(e) => setQueryParams({ ...queryParams, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="datetime-local"
                        value={queryParams.endTime}
                        onChange={(e) => setQueryParams({ ...queryParams, endTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="streamType">Stream Type</Label>
                      <Select value={queryParams.streamType} onValueChange={(v) => setQueryParams({ ...queryParams, streamType: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Main Stream</SelectItem>
                          <SelectItem value="1">Sub Stream</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alarmType">Alarm Type (Optional)</Label>
                      <Input
                        id="alarmType"
                        value={queryParams.alarmType}
                        onChange={(e) => setQueryParams({ ...queryParams, alarmType: e.target.value })}
                        placeholder="Leave empty for all"
                      />
                    </div>
                  </div>
                  <Button onClick={handleVideoQuery} disabled={loading || !jsession} className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Query Videos
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="1078">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileVideo className="w-5 h-5" />
                    1078 Video Business
                  </CardTitle>
                  <CardDescription>Manage video streaming and control operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceId1078">Device ID / IMEI</Label>
                    <Input
                      id="deviceId1078"
                      value={queryParams.deviceId}
                      onChange={(e) => setQueryParams({ ...queryParams, deviceId: e.target.value })}
                      placeholder="Enter device ID or IMEI"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button onClick={() => handle1078Business('start_stream')} disabled={loading || !jsession} variant="outline">
                      <Play className="w-4 h-4 mr-2" />
                      Start Stream
                    </Button>
                    <Button onClick={() => handle1078Business('stop_stream')} disabled={loading || !jsession} variant="outline">
                      Stop Stream
                    </Button>
                    <Button onClick={() => handle1078Business('get_stream_url')} disabled={loading || !jsession} variant="outline">
                      Get URL
                    </Button>
                    <Button onClick={() => handle1078Business('download_file')} disabled={loading || !jsession} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default VideoManagement;
