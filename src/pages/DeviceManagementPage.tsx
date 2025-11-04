import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Smartphone, CreditCard, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCMSV6Session } from "@/hooks/useCMSV6";

const DeviceManagementPage = () => {
  const { jsession } = useCMSV6Session();
  const [loading, setLoading] = useState(false);
  const [deviceData, setDeviceData] = useState({
    deviceId: "",
    imei: "",
    simIccid: "",
    model: "",
    channels: ""
  });
  const [trafficCardData, setTrafficCardData] = useState({
    iccid: "",
    cardNumber: "",
    operator: "",
    dataLimit: ""
  });

  const handleDeviceAction = async (action: string) => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-device-management', {
        body: {
          jsession,
          action,
          ...deviceData
        }
      });

      if (error) throw error;
      toast.success(`Device ${action} completed successfully`);
      setDeviceData({ deviceId: "", imei: "", simIccid: "", model: "", channels: "" });
    } catch (error: any) {
      toast.error(`Device ${action} failed: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrafficCardAction = async (action: string) => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-traffic-card', {
        body: {
          jsession,
          action,
          ...trafficCardData
        }
      });

      if (error) throw error;
      toast.success(`Traffic card ${action} completed successfully`);
      setTrafficCardData({ iccid: "", cardNumber: "", operator: "", dataLimit: "" });
    } catch (error: any) {
      toast.error(`Traffic card ${action} failed: ` + error.message);
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
            <Smartphone className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Device Management</h1>
              <p className="text-muted-foreground">Manage devices and traffic cards</p>
            </div>
          </div>

          <Tabs defaultValue="devices" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="traffic">Traffic Cards</TabsTrigger>
            </TabsList>

            <TabsContent value="devices">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Device Management
                  </CardTitle>
                  <CardDescription>Add, update, and manage devices in CMSV6</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deviceId">Device ID</Label>
                      <Input
                        id="deviceId"
                        value={deviceData.deviceId}
                        onChange={(e) => setDeviceData({ ...deviceData, deviceId: e.target.value })}
                        placeholder="Enter device ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imei">IMEI</Label>
                      <Input
                        id="imei"
                        value={deviceData.imei}
                        onChange={(e) => setDeviceData({ ...deviceData, imei: e.target.value })}
                        placeholder="Enter IMEI"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="simIccid">SIM ICCID</Label>
                      <Input
                        id="simIccid"
                        value={deviceData.simIccid}
                        onChange={(e) => setDeviceData({ ...deviceData, simIccid: e.target.value })}
                        placeholder="Enter SIM ICCID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={deviceData.model}
                        onChange={(e) => setDeviceData({ ...deviceData, model: e.target.value })}
                        placeholder="Enter device model"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="channels">Channels</Label>
                      <Input
                        id="channels"
                        value={deviceData.channels}
                        onChange={(e) => setDeviceData({ ...deviceData, channels: e.target.value })}
                        placeholder="Number of channels"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleDeviceAction('create')} disabled={loading || !jsession}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Device
                    </Button>
                    <Button onClick={() => handleDeviceAction('update')} disabled={loading || !jsession} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                    <Button onClick={() => handleDeviceAction('list')} disabled={loading || !jsession} variant="outline">
                      List All
                    </Button>
                    <Button onClick={() => handleDeviceAction('delete')} disabled={loading || !jsession} variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="traffic">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Traffic Card Management
                  </CardTitle>
                  <CardDescription>Manage data plans and traffic cards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="iccid">ICCID</Label>
                      <Input
                        id="iccid"
                        value={trafficCardData.iccid}
                        onChange={(e) => setTrafficCardData({ ...trafficCardData, iccid: e.target.value })}
                        placeholder="Enter ICCID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={trafficCardData.cardNumber}
                        onChange={(e) => setTrafficCardData({ ...trafficCardData, cardNumber: e.target.value })}
                        placeholder="Enter card number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="operator">Operator</Label>
                      <Input
                        id="operator"
                        value={trafficCardData.operator}
                        onChange={(e) => setTrafficCardData({ ...trafficCardData, operator: e.target.value })}
                        placeholder="Enter operator name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataLimit">Data Limit (MB)</Label>
                      <Input
                        id="dataLimit"
                        value={trafficCardData.dataLimit}
                        onChange={(e) => setTrafficCardData({ ...trafficCardData, dataLimit: e.target.value })}
                        placeholder="Enter data limit"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleTrafficCardAction('create')} disabled={loading || !jsession}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Card
                    </Button>
                    <Button onClick={() => handleTrafficCardAction('update')} disabled={loading || !jsession} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                    <Button onClick={() => handleTrafficCardAction('list')} disabled={loading || !jsession} variant="outline">
                      List All
                    </Button>
                    <Button onClick={() => handleTrafficCardAction('query_usage')} disabled={loading || !jsession} variant="outline">
                      Query Usage
                    </Button>
                    <Button onClick={() => handleTrafficCardAction('delete')} disabled={loading || !jsession} variant="destructive">
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

export default DeviceManagementPage;
