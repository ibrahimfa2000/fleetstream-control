import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Settings, UserCog, Shield, CreditCard, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCMSV6Session } from "@/hooks/useCMSV6";
import { useUserRole } from "@/hooks/useUserRole";

const SystemManagement = () => {
  const { jsession } = useCMSV6Session();
  const { isAdmin } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    roleName: "",
    iccid: "",
    operator: "",
    planType: ""
  });

  const handleUserAction = async (action: string) => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-user-management', {
        body: {
          jsession,
          action,
          username: formData.username,
          password: formData.password,
          email: formData.email,
          roleName: formData.roleName
        }
      });

      if (error) throw error;
      toast.success(`User ${action} completed successfully`);
      setFormData({ ...formData, username: "", password: "", email: "" });
    } catch (error: any) {
      toast.error(`User ${action} failed: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleAction = async (action: string) => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-role-management', {
        body: {
          jsession,
          action,
          roleName: formData.roleName,
          permissions: []
        }
      });

      if (error) throw error;
      toast.success(`Role ${action} completed successfully`);
      setFormData({ ...formData, roleName: "" });
    } catch (error: any) {
      toast.error(`Role ${action} failed: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimAction = async (action: string) => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-sim-management', {
        body: {
          jsession,
          action,
          iccid: formData.iccid,
          operator: formData.operator,
          planType: formData.planType
        }
      });

      if (error) throw error;
      toast.success(`SIM ${action} completed successfully`);
      setFormData({ ...formData, iccid: "", operator: "", planType: "" });
    } catch (error: any) {
      toast.error(`SIM ${action} failed: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Access denied. Admin privileges required.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(213,175,55,0.08),transparent_60%)]" />
      <div className="relative">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">System Management</h1>
              <p className="text-muted-foreground">Manage users, roles, and SIM cards</p>
            </div>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="sims">SIM Cards</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="w-5 h-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>Create and manage system users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Enter username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userRole">Role</Label>
                      <Input
                        id="userRole"
                        value={formData.roleName}
                        onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                        placeholder="Enter role name"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleUserAction('create')} disabled={loading || !jsession}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create User
                    </Button>
                    <Button onClick={() => handleUserAction('update')} disabled={loading || !jsession} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                    <Button onClick={() => handleUserAction('list')} disabled={loading || !jsession} variant="outline">
                      List All
                    </Button>
                    <Button onClick={() => handleUserAction('delete')} disabled={loading || !jsession} variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Role Management
                  </CardTitle>
                  <CardDescription>Define and manage user roles and permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      value={formData.roleName}
                      onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                      placeholder="Enter role name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleRoleAction('create')} disabled={loading || !jsession}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Role
                    </Button>
                    <Button onClick={() => handleRoleAction('update')} disabled={loading || !jsession} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                    <Button onClick={() => handleRoleAction('list')} disabled={loading || !jsession} variant="outline">
                      List All
                    </Button>
                    <Button onClick={() => handleRoleAction('delete')} disabled={loading || !jsession} variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sims">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    SIM Card Management
                  </CardTitle>
                  <CardDescription>Manage SIM cards and data plans</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="iccid">ICCID</Label>
                      <Input
                        id="iccid"
                        value={formData.iccid}
                        onChange={(e) => setFormData({ ...formData, iccid: e.target.value })}
                        placeholder="Enter SIM ICCID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="operator">Operator</Label>
                      <Input
                        id="operator"
                        value={formData.operator}
                        onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                        placeholder="Enter operator name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="planType">Plan Type</Label>
                      <Input
                        id="planType"
                        value={formData.planType}
                        onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                        placeholder="Enter plan type"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSimAction('create')} disabled={loading || !jsession}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add SIM
                    </Button>
                    <Button onClick={() => handleSimAction('update')} disabled={loading || !jsession} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                    <Button onClick={() => handleSimAction('list')} disabled={loading || !jsession} variant="outline">
                      List All
                    </Button>
                    <Button onClick={() => handleSimAction('delete')} disabled={loading || !jsession} variant="destructive">
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

export default SystemManagement;
