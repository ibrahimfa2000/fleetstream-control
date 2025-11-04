import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building, Users, Car, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCMSV6Session } from "@/hooks/useCMSV6";
import { Textarea } from "@/components/ui/textarea";

const FleetManagement = () => {
  const { jsession } = useCMSV6Session();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    licenseNumber: "",
    phone: ""
  });

  const handleOrganizationAction = async (action: string) => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-organization-management', {
        body: {
          jsession,
          action,
          ...formData
        }
      });

      if (error) throw error;
      toast.success(`Organization ${action} completed successfully`);
      setFormData({ name: "", description: "", parentId: "", licenseNumber: "", phone: "" });
    } catch (error: any) {
      toast.error(`Organization ${action} failed: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDriverAction = async (action: string) => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-driver-management', {
        body: {
          jsession,
          action,
          ...formData
        }
      });

      if (error) throw error;
      toast.success(`Driver ${action} completed successfully`);
      setFormData({ name: "", description: "", parentId: "", licenseNumber: "", phone: "" });
    } catch (error: any) {
      toast.error(`Driver ${action} failed: ` + error.message);
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
            <Car className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Fleet Management</h1>
              <p className="text-muted-foreground">Manage organizations, drivers, and vehicles</p>
            </div>
          </div>

          <Tabs defaultValue="organizations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            </TabsList>

            <TabsContent value="organizations">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Organization Management
                  </CardTitle>
                  <CardDescription>Create and manage organizational units</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input
                        id="orgName"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter organization name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentId">Parent ID (Optional)</Label>
                      <Input
                        id="parentId"
                        value={formData.parentId}
                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                        placeholder="Leave empty for root"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="orgDescription">Description</Label>
                      <Textarea
                        id="orgDescription"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleOrganizationAction('create')} disabled={loading || !jsession}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create
                    </Button>
                    <Button onClick={() => handleOrganizationAction('update')} disabled={loading || !jsession} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                    <Button onClick={() => handleOrganizationAction('list')} disabled={loading || !jsession} variant="outline">
                      List All
                    </Button>
                    <Button onClick={() => handleOrganizationAction('delete')} disabled={loading || !jsession} variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="drivers">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Driver Management
                  </CardTitle>
                  <CardDescription>Add and manage driver information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="driverName">Driver Name</Label>
                      <Input
                        id="driverName"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter driver name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        placeholder="Enter license number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driverOrg">Organization ID</Label>
                      <Input
                        id="driverOrg"
                        value={formData.parentId}
                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                        placeholder="Enter organization ID"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleDriverAction('create')} disabled={loading || !jsession}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Driver
                    </Button>
                    <Button onClick={() => handleDriverAction('update')} disabled={loading || !jsession} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                    <Button onClick={() => handleDriverAction('list')} disabled={loading || !jsession} variant="outline">
                      List All
                    </Button>
                    <Button onClick={() => handleDriverAction('delete')} disabled={loading || !jsession} variant="destructive">
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
                    <Car className="w-5 h-5" />
                    Vehicle Management
                  </CardTitle>
                  <CardDescription>Manage vehicle information and assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Vehicle management is handled through the main Dashboard and Device Management pages.
                    Use those pages to add, edit, and assign vehicles to drivers and organizations.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
                      Go to Dashboard
                    </Button>
                    <Button onClick={() => window.location.href = '/device-management'} variant="outline">
                      Device Management
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

export default FleetManagement;
