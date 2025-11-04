import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCMSV6Session } from "@/hooks/useCMSV6";
import { Textarea } from "@/components/ui/textarea";

const RulesManagement = () => {
  const { jsession } = useCMSV6Session();
  const [loading, setLoading] = useState(false);
  const [ruleData, setRuleData] = useState({
    ruleName: "",
    ruleType: "speed",
    threshold: "",
    action: "alert",
    deviceId: ""
  });
  const [areaData, setAreaData] = useState({
    areaName: "",
    areaType: "circle",
    coordinates: "",
    radius: ""
  });

  const handleRuleAction = async (action: string) => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-rule-management', {
        body: {
          jsession,
          action,
          ...ruleData
        }
      });

      if (error) throw error;
      toast.success(`Rule ${action} completed successfully`);
      setRuleData({ ruleName: "", ruleType: "speed", threshold: "", action: "alert", deviceId: "" });
    } catch (error: any) {
      toast.error(`Rule ${action} failed: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaAction = async (action: string) => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-area-management', {
        body: {
          jsession,
          action,
          ...areaData
        }
      });

      if (error) throw error;
      toast.success(`Area ${action} completed successfully`);
      setAreaData({ areaName: "", areaType: "circle", coordinates: "", radius: "" });
    } catch (error: any) {
      toast.error(`Area ${action} failed: ` + error.message);
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
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Rules & Areas Management</h1>
              <p className="text-muted-foreground">Define rules and geofencing areas</p>
            </div>
          </div>

          <Tabs defaultValue="rules" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="areas">Areas</TabsTrigger>
            </TabsList>

            <TabsContent value="rules">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Rule Management
                  </CardTitle>
                  <CardDescription>Create and manage alert rules for your fleet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ruleName">Rule Name</Label>
                      <Input
                        id="ruleName"
                        value={ruleData.ruleName}
                        onChange={(e) => setRuleData({ ...ruleData, ruleName: e.target.value })}
                        placeholder="Enter rule name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ruleType">Rule Type</Label>
                      <Select value={ruleData.ruleType} onValueChange={(v) => setRuleData({ ...ruleData, ruleType: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="speed">Speed Limit</SelectItem>
                          <SelectItem value="geofence">Geofence</SelectItem>
                          <SelectItem value="idle">Idle Time</SelectItem>
                          <SelectItem value="fatigue">Fatigue Driving</SelectItem>
                          <SelectItem value="harsh">Harsh Driving</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="threshold">Threshold Value</Label>
                      <Input
                        id="threshold"
                        value={ruleData.threshold}
                        onChange={(e) => setRuleData({ ...ruleData, threshold: e.target.value })}
                        placeholder="e.g., 80 for speed limit"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="action">Action</Label>
                      <Select value={ruleData.action} onValueChange={(v) => setRuleData({ ...ruleData, action: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alert">Alert Only</SelectItem>
                          <SelectItem value="notify">Notify Driver</SelectItem>
                          <SelectItem value="disable">Disable Vehicle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="ruleDeviceId">Device ID (Optional)</Label>
                      <Input
                        id="ruleDeviceId"
                        value={ruleData.deviceId}
                        onChange={(e) => setRuleData({ ...ruleData, deviceId: e.target.value })}
                        placeholder="Leave empty for all devices"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleRuleAction('create')} disabled={loading || !jsession}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Rule
                    </Button>
                    <Button onClick={() => handleRuleAction('update')} disabled={loading || !jsession} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                    <Button onClick={() => handleRuleAction('list')} disabled={loading || !jsession} variant="outline">
                      List All
                    </Button>
                    <Button onClick={() => handleRuleAction('delete')} disabled={loading || !jsession} variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="areas">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Area Management
                  </CardTitle>
                  <CardDescription>Define geofencing areas for monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="areaName">Area Name</Label>
                      <Input
                        id="areaName"
                        value={areaData.areaName}
                        onChange={(e) => setAreaData({ ...areaData, areaName: e.target.value })}
                        placeholder="Enter area name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="areaType">Area Type</Label>
                      <Select value={areaData.areaType} onValueChange={(v) => setAreaData({ ...areaData, areaType: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="circle">Circle</SelectItem>
                          <SelectItem value="rectangle">Rectangle</SelectItem>
                          <SelectItem value="polygon">Polygon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="coordinates">Coordinates</Label>
                      <Textarea
                        id="coordinates"
                        value={areaData.coordinates}
                        onChange={(e) => setAreaData({ ...areaData, coordinates: e.target.value })}
                        placeholder="Enter coordinates (lat,lon format)"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="radius">Radius (meters) - For Circle</Label>
                      <Input
                        id="radius"
                        value={areaData.radius}
                        onChange={(e) => setAreaData({ ...areaData, radius: e.target.value })}
                        placeholder="Enter radius in meters"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleAreaAction('create')} disabled={loading || !jsession}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Area
                    </Button>
                    <Button onClick={() => handleAreaAction('update')} disabled={loading || !jsession} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                    <Button onClick={() => handleAreaAction('list')} disabled={loading || !jsession} variant="outline">
                      List All
                    </Button>
                    <Button onClick={() => handleAreaAction('delete')} disabled={loading || !jsession} variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
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

export default RulesManagement;
