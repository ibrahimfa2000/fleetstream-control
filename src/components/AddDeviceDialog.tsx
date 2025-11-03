import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Validation schema
const deviceSchema = z.object({
  // Basic Information
  name: z.string().trim().min(1, "Device name is required").max(100, "Name must be less than 100 characters"),
  imei: z.string().trim().min(15, "IMEI must be 15 digits").max(15, "IMEI must be 15 digits").regex(/^\d+$/, "IMEI must contain only digits"),
  sim_iccid: z.string().trim().min(19, "SIM ICCID must be 19-22 characters").max(22, "SIM ICCID must be 19-22 characters"),
  
  // Device Details
  model: z.string().trim().max(50, "Model must be less than 50 characters").optional().or(z.literal("")),
  firmware_version: z.string().trim().max(20, "Firmware version must be less than 20 characters").optional().or(z.literal("")),
  
  // Vehicle Details (CMSV6 specific)
  vehicle_type: z.string().trim().max(50, "Vehicle type must be less than 50 characters").optional().or(z.literal("")),
  plate_number: z.string().trim().max(20, "Plate number must be less than 20 characters").optional().or(z.literal("")),
  vin: z.string().trim().max(17, "VIN must be 17 characters or less").optional().or(z.literal("")),
  
  // Configuration
  channels: z.coerce.number().int().min(1).max(8).default(4),
  status: z.enum(["online", "offline", "maintenance"]).default("offline"),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

interface AddDeviceDialogProps {
  onDeviceAdded: () => void;
}

const AddDeviceDialog = ({ onDeviceAdded }: AddDeviceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: "",
      imei: "",
      sim_iccid: "",
      model: "",
      firmware_version: "",
      vehicle_type: "",
      plate_number: "",
      vin: "",
      channels: 4,
      status: "offline",
    },
  });

  const handleSubmit = async (values: DeviceFormData) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("[AddDevice] Creating device with data:", values);

      // Create device
      // @ts-ignore - Types will be generated after migration
      const { data: device, error: deviceError } = await (supabase as any)
        .from("devices")
        .insert({
          name: values.name,
          imei: values.imei,
          sim_iccid: values.sim_iccid,
          model: values.model || values.vehicle_type || "GISION MDVR",
          firmware_version: values.firmware_version || null,
          owner_id: user.id,
          status: values.status,
          last_seen: values.status === "online" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (deviceError) {
        console.error("[AddDevice] Device creation error:", deviceError);
        throw deviceError;
      }

      console.log("[AddDevice] Device created successfully:", device.id);

      // Create initial subscription
      // @ts-ignore
      const { error: subscriptionError } = await (supabase as any)
        .from("subscriptions")
        .insert({
          device_id: device.id,
          sim_iccid: values.sim_iccid,
          status: "suspended",
          plan_id: "basic",
        });

      if (subscriptionError) {
        console.error("[AddDevice] Subscription creation error:", subscriptionError);
      }

      // Create initial telemetry entry
      // @ts-ignore
      const { error: telemetryError } = await (supabase as any)
        .from("telemetry")
        .insert({
          device_id: device.id,
          signal_strength: 0,
          battery_level: 100,
          storage_free_mb: 10240,
        });

      if (telemetryError) {
        console.error("[AddDevice] Telemetry creation error:", telemetryError);
      }

      toast.success(`Device "${values.name}" added successfully!`);
      setOpen(false);
      form.reset();
      onDeviceAdded();
    } catch (error: any) {
      console.error("[AddDevice] Error:", error);
      toast.error("Failed to add device: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2 shadow-glow">
        <Plus className="w-4 h-4" />
        Add Device
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>
              Configure a new MDVR/GPS device for your fleet. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="vehicle">Vehicle Details</TabsTrigger>
                  <TabsTrigger value="config">Configuration</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Fleet Vehicle 001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imei"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IMEI *</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789012345" maxLength={15} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sim_iccid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SIM ICCID *</FormLabel>
                        <FormControl>
                          <Input placeholder="8901234567890123456" maxLength={22} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="vehicle" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="vehicle_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Truck, Bus, Van, Car, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="plate_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plate Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VIN (Vehicle Identification Number)</FormLabel>
                        <FormControl>
                          <Input placeholder="1HGBH41JXMN109186" maxLength={17} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Model</FormLabel>
                        <FormControl>
                          <Input placeholder="GISION MDVR, DVR-X100, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="config" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="firmware_version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Firmware Version</FormLabel>
                        <FormControl>
                          <Input placeholder="v2.1.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="channels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Channels</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select channels" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 Channel</SelectItem>
                            <SelectItem value="2">2 Channels</SelectItem>
                            <SelectItem value="4">4 Channels</SelectItem>
                            <SelectItem value="8">8 Channels</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="offline">Offline</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    form.reset();
                  }}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Adding Device..." : "Add Device"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddDeviceDialog;
