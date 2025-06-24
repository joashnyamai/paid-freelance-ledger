
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useSettings, Preferences } from "@/hooks/useSettings";

export const SettingsPreferences = () => {
  const { preferences, updatePreferences } = useSettings();
  const [formData, setFormData] = useState<Preferences>(preferences);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      updatePreferences(formData);
      toast({
        title: "Preferences Updated",
        description: "Your application preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof Preferences, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExportData = () => {
    try {
      const invoices = localStorage.getItem('invoiceApp_invoices') || '[]';
      const clients = localStorage.getItem('invoiceApp_clients') || '[]';
      const profile = localStorage.getItem('invoiceApp_profile') || '{}';
      
      const exportData = {
        invoices: JSON.parse(invoices),
        clients: JSON.parse(clients),
        profile: JSON.parse(profile),
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-portal-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data Exported",
        description: "Your data has been successfully exported.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export your data.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="bg-white border-b border-gray-200">
          <CardTitle className="text-black">Application Preferences</CardTitle>
          <CardDescription className="text-gray-600">Customize your invoice portal experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-black font-medium">Dark Mode</Label>
              <p className="text-sm text-gray-500">Enable dark theme for the application</p>
            </div>
            <Switch
              checked={formData.darkMode}
              onCheckedChange={(checked) => handleChange("darkMode", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-black font-medium">Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications about overdue invoices</p>
            </div>
            <Switch
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-black font-medium">Auto Save</Label>
              <p className="text-sm text-gray-500">Automatically save changes as you type</p>
            </div>
            <Switch
              checked={formData.autoSave}
              onCheckedChange={(checked) => handleChange("autoSave", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-black font-medium">Compact Mode</Label>
              <p className="text-sm text-gray-500">Show more information in less space</p>
            </div>
            <Switch
              checked={formData.compactMode}
              onCheckedChange={(checked) => handleChange("compactMode", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-black font-medium">Show Tutorials</Label>
              <p className="text-sm text-gray-500">Display helpful tips and tutorials</p>
            </div>
            <Switch
              checked={formData.showTutorials}
              onCheckedChange={(checked) => handleChange("showTutorials", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-medium">Default Landing Page</Label>
            <Select
              value={formData.defaultView}
              onValueChange={(value) => handleChange("defaultView", value)}
            >
              <SelectTrigger className="border-gray-300 bg-white text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="invoices">Invoices</SelectItem>
                <SelectItem value="clients">Clients</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="bg-white border-b border-gray-200">
          <CardTitle className="text-black">Data Management</CardTitle>
          <CardDescription className="text-gray-600">Backup and manage your invoice data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-black font-medium">Export Data</Label>
              <p className="text-sm text-gray-500">Download a backup of all your invoices and clients</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleExportData}
              className="border-gray-300 text-black hover:bg-gray-50"
            >
              Export Backup
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-black font-medium">Storage Usage</Label>
              <p className="text-sm text-gray-500">Local storage is being used for data</p>
            </div>
            <span className="text-sm font-medium text-green-600">Local Storage</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
