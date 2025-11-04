import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCMSV6Session } from "@/hooks/useCMSV6";

const ReportsPage = () => {
  const { jsession } = useCMSV6Session();
  const [loading, setLoading] = useState(false);
  const [reportParams, setReportParams] = useState({
    reportType: "mileage",
    deviceId: "",
    startDate: "",
    endDate: "",
    format: "pdf"
  });

  const handleGenerateReport = async () => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-reports', {
        body: {
          jsession,
          action: 'generate',
          reportType: reportParams.reportType,
          deviceId: reportParams.deviceId,
          startDate: reportParams.startDate,
          endDate: reportParams.endDate,
          format: reportParams.format
        }
      });

      if (error) throw error;
      toast.success("Report generated successfully");
      console.log("Report data:", data);
    } catch (error: any) {
      toast.error("Failed to generate report: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceMileage = async () => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-device-mileage', {
        body: {
          jsession,
          deviceId: reportParams.deviceId,
          startTime: reportParams.startDate,
          endTime: reportParams.endDate
        }
      });

      if (error) throw error;
      toast.success("Mileage data retrieved successfully");
      console.log("Mileage data:", data);
    } catch (error: any) {
      toast.error("Failed to retrieve mileage: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceTrack = async () => {
    if (!jsession) {
      toast.error("CMSV6 session not available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-device-track', {
        body: {
          jsession,
          deviceId: reportParams.deviceId,
          startTime: reportParams.startDate,
          endTime: reportParams.endDate
        }
      });

      if (error) throw error;
      toast.success("Track data retrieved successfully");
      console.log("Track data:", data);
    } catch (error: any) {
      toast.error("Failed to retrieve track: " + error.message);
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
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Reports & Analytics</h1>
              <p className="text-muted-foreground">Generate reports and view device analytics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Report Generator
                </CardTitle>
                <CardDescription>Generate comprehensive reports for your fleet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportParams.reportType} onValueChange={(v) => setReportParams({ ...reportParams, reportType: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mileage">Mileage Report</SelectItem>
                      <SelectItem value="track">Track Report</SelectItem>
                      <SelectItem value="alarms">Alarms Report</SelectItem>
                      <SelectItem value="usage">Usage Report</SelectItem>
                      <SelectItem value="maintenance">Maintenance Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceIdReport">Device ID / IMEI</Label>
                  <Input
                    id="deviceIdReport"
                    value={reportParams.deviceId}
                    onChange={(e) => setReportParams({ ...reportParams, deviceId: e.target.value })}
                    placeholder="Enter device ID or IMEI"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={reportParams.startDate}
                      onChange={(e) => setReportParams({ ...reportParams, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={reportParams.endDate}
                      onChange={(e) => setReportParams({ ...reportParams, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={reportParams.format} onValueChange={(v) => setReportParams({ ...reportParams, format: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerateReport} disabled={loading || !jsession} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quick Analytics
                </CardTitle>
                <CardDescription>View quick analytics for devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceIdAnalytics">Device ID / IMEI</Label>
                  <Input
                    id="deviceIdAnalytics"
                    value={reportParams.deviceId}
                    onChange={(e) => setReportParams({ ...reportParams, deviceId: e.target.value })}
                    placeholder="Enter device ID or IMEI"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDateAnalytics">Start Date</Label>
                    <Input
                      id="startDateAnalytics"
                      type="date"
                      value={reportParams.startDate}
                      onChange={(e) => setReportParams({ ...reportParams, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDateAnalytics">End Date</Label>
                    <Input
                      id="endDateAnalytics"
                      type="date"
                      value={reportParams.endDate}
                      onChange={(e) => setReportParams({ ...reportParams, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Button onClick={handleDeviceMileage} disabled={loading || !jsession} className="w-full" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Get Mileage Data
                  </Button>
                  <Button onClick={handleDeviceTrack} disabled={loading || !jsession} className="w-full" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Get Track Data
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">
                    Results will be displayed in the browser console. Check the developer tools for detailed data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
