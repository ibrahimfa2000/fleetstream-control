import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddDeviceDialogProps {
  onDeviceAdded: () => void;
}

const AddDeviceDialog = ({ onDeviceAdded }: AddDeviceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    imei: "",
    sim_iccid: "",
    model: "",
    firmware_version: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // @ts-ignore - Types will be generated after migration
      const { data: device, error: deviceError} = await (supabase as any)
        .from("devices")
        .insert({
          ...formData,
          owner_id: user.id,
          status: 'offline',
          last_seen: new Date().toISOString()
        })
        .select()
        .single();

      if (deviceError) throw deviceError;

      // Create initial subscription
      // @ts-ignore - Types will be generated after migration
      await (supabase as any)
        .from("subscriptions")
        .insert({
          device_id: device.id,
          sim_iccid: formData.sim_iccid,
          status: 'suspended',
          plan_id: 'basic'
        });

      // Create initial telemetry entry
      // @ts-ignore - Types will be generated after migration
      await (supabase as any)
        .from("telemetry")
        .insert({
          device_id: device.id,
          signal_strength: 0,
          battery_level: 100,
          storage_free_mb: 10240
        });

      toast.success("Device added successfully!");
      setOpen(false);
      setFormData({
        name: "",
        imei: "",
        sim_iccid: "",
        model: "",
        firmware_version: "",
      });
      onDeviceAdded();
    } catch (error: any) {
      toast.error("Failed to add device: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-glow">
          <Plus className="w-4 h-4" />
          Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Device Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Fleet Vehicle 001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imei">IMEI *</Label>
            <Input
              id="imei"
              value={formData.imei}
              onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
              placeholder="123456789012345"
              required
              maxLength={15}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sim_iccid">SIM ICCID *</Label>
            <Input
              id="sim_iccid"
              value={formData.sim_iccid}
              onChange={(e) => setFormData({ ...formData, sim_iccid: e.target.value })}
              placeholder="8901234567890123456"
              required
              maxLength={22}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="DVR-X100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firmware">Firmware Version</Label>
              <Input
                id="firmware"
                value={formData.firmware_version}
                onChange={(e) => setFormData({ ...formData, firmware_version: e.target.value })}
                placeholder="v2.1.0"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Adding..." : "Add Device"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDeviceDialog;
