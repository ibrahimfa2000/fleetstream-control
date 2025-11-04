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
    devIdno: "",
    protocol: "1",
    devType: "5",
    companyName: "",
    factoryType: "0",
    account: "",
    channelNum: "",
    model: "",
    factory: "",
    audioCodec: ""
  });
  const [vehicleData, setVehicleData] = useState({
    plate: "",
    companyId: "",
    carType: ""
  });
  const [installData, setInstallData] = useState({
    vehiIdno: "",
    devIdno: ""
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
      let body: any = { jsession, action };
      
      if (action === 'addVehicle' || action === 'deleteVehicle') {
        body = { ...body, ...vehicleData };
      } else {
        body = { ...body, ...deviceData };
      }

      const { data, error } = await supabase.functions.invoke('cmsv6-device-management', {
        body
      });

      if (error) throw error;
      toast.success(`${action} completed successfully`);
      
      if (action.includes('Vehicle')) {
        setVehicleData({ plate: "", companyId: "", carType: "" });
      } else {
        setDeviceData({
          devIdno: "",
          protocol: "1",
          devType: "5",
          companyName: "",
          factoryType: "0",
          account: "",
          channelNum: "",
          model: "",
          factory: "",
          audioCodec: ""
        });
      }
    } catch (error: any) {
      toast.error(`${action} failed: ` + error.message);
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
            <TabsList className="grid w-full grid-cols-4 max-w-3xl">
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="install">Install Device</TabsTrigger>
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
                      <Label htmlFor="devIdno">Device Number *</Label>
                      <Input
                        id="devIdno"
                        value={deviceData.devIdno}
                        onChange={(e) => setDeviceData({ ...deviceData, devIdno: e.target.value })}
                        placeholder="Device number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="protocol">Protocol *</Label>
                      <select
                        id="protocol"
                        value={deviceData.protocol}
                        onChange={(e) => setDeviceData({ ...deviceData, protocol: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="0">Unknown</option>
                        <option value="1">Standard (2011)</option>
                        <option value="2">Compass</option>
                        <option value="3">Standard 1078 (Video)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="devType">Device Type *</Label>
                      <select
                        id="devType"
                        value={deviceData.devType}
                        onChange={(e) => setDeviceData({ ...deviceData, devType: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="5">GPS Device</option>
                        <option value="7">Video Device</option>
                        <option value="-7">Main Defense Terminal</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={deviceData.companyName}
                        onChange={(e) => setDeviceData({ ...deviceData, companyName: e.target.value })}
                        placeholder="Company name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="factoryType">Factory Type *</Label>
                      <select
                        id="factoryType"
                        value={deviceData.factoryType}
                        onChange={(e) => setDeviceData({ ...deviceData, factoryType: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="0">Unknown</option>
                        <option value="17">GM</option>
                        <option value="20">HD</option>
                        <option value="21">FZE</option>
                        <option value="23">HB</option>
                        <option value="24">BSJ</option>
                        <option value="26">HK</option>
                        <option value="28">YX</option>
                        <option value="29">RM</option>
                        <option value="44">DW-N</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account">Account</Label>
                      <Input
                        id="account"
                        value={deviceData.account}
                        onChange={(e) => setDeviceData({ ...deviceData, account: e.target.value })}
                        placeholder="Master account (optional)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="channelNum">Channels</Label>
                      <Input
                        id="channelNum"
                        type="number"
                        value={deviceData.channelNum}
                        onChange={(e) => setDeviceData({ ...deviceData, channelNum: e.target.value })}
                        placeholder="Number of channels"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={deviceData.model}
                        onChange={(e) => setDeviceData({ ...deviceData, model: e.target.value })}
                        placeholder="Product model"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="factory">Factory</Label>
                      <Input
                        id="factory"
                        value={deviceData.factory}
                        onChange={(e) => setDeviceData({ ...deviceData, factory: e.target.value })}
                        placeholder="Product manufacturer"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => handleDeviceAction('addDevice')} disabled={loading || !jsession}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Device
                    </Button>
                    <Button onClick={() => handleDeviceAction('editDevice')} disabled={loading || !jsession} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Device
                    </Button>
                    <Button onClick={() => handleDeviceAction('getDeviceInfo')} disabled={loading || !jsession} variant="outline">
                      Get Info
                    </Button>
                    <Button onClick={() => handleDeviceAction('deleteDevice')} disabled={loading || !jsession} variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vehicles">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Vehicle Management
                  </CardTitle>
                  <CardDescription>Add and manage vehicles in CMSV6</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plate">License Plate *</Label>
                      <Input
                        id="plate"
                        value={vehicleData.plate}
                        onChange={(e) => setVehicleData({ ...vehicleData, plate: e.target.value })}
                        placeholder="Vehicle license plate"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyId">Company ID *</Label>
                      <Input
                        id="companyId"
                        value={vehicleData.companyId}
                        onChange={(e) => setVehicleData({ ...vehicleData, companyId: e.target.value })}
                        placeholder="Company ID"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carType">Vehicle Type</Label>
                      <Input
                        id="carType"
                        value={vehicleData.carType}
                        onChange={(e) => setVehicleData({ ...vehicleData, carType: e.target.value })}
                        placeholder="Vehicle type"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleDeviceAction('addVehicle')} disabled={loading || !jsession}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vehicle
                    </Button>
                    <Button onClick={() => handleDeviceAction('deleteVehicle')} disabled={loading || !jsession} variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Vehicle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="install">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Install Device to Vehicle
                  </CardTitle>
                  <CardDescription>Link a device to a vehicle</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehiIdno">Vehicle ID *</Label>
                      <Input
                        id="vehiIdno"
                        value={installData.vehiIdno}
                        onChange={(e) => setInstallData({ ...installData, vehiIdno: e.target.value })}
                        placeholder="Vehicle ID number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="installDevIdno">Device Number *</Label>
                      <Input
                        id="installDevIdno"
                        value={installData.devIdno}
                        onChange={(e) => setInstallData({ ...installData, devIdno: e.target.value })}
                        placeholder="Device number"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={async () => {
                        if (!jsession) {
                          toast.error("CMSV6 session not available");
                          return;
                        }
                        setLoading(true);
                        try {
                          const { data, error } = await supabase.functions.invoke('cmsv6-device-management', {
                            body: { jsession, action: 'installVehicle', ...installData }
                          });
                          if (error) throw error;
                          toast.success("Device installed to vehicle successfully");
                          setInstallData({ vehiIdno: "", devIdno: "" });
                        } catch (error: any) {
                          toast.error("Install failed: " + error.message);
                        } finally {
                          setLoading(false);
                        }
                      }} 
                      disabled={loading || !jsession}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Install Device
                    </Button>
                    <Button 
                      onClick={async () => {
                        if (!jsession) {
                          toast.error("CMSV6 session not available");
                          return;
                        }
                        setLoading(true);
                        try {
                          const { data, error } = await supabase.functions.invoke('cmsv6-device-management', {
                            body: { jsession, action: 'uninstallDevice', devIdno: installData.devIdno }
                          });
                          if (error) throw error;
                          toast.success("Device uninstalled successfully");
                          setInstallData({ vehiIdno: "", devIdno: "" });
                        } catch (error: any) {
                          toast.error("Uninstall failed: " + error.message);
                        } finally {
                          setLoading(false);
                        }
                      }} 
                      disabled={loading || !jsession} 
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Uninstall Device
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
