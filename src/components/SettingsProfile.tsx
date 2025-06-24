
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useSettings, ProfileData } from "@/hooks/useSettings";

export const SettingsProfile = () => {
  const { profile, updateProfile } = useSettings();
  const [formData, setFormData] = useState<ProfileData>(profile);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      updateProfile(formData);
      toast({
        title: "Profile Updated",
        description: "Your business profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="bg-white border-b border-gray-200">
        <CardTitle className="text-black">Business Profile</CardTitle>
        <CardDescription className="text-gray-600">Manage your business information that appears on invoices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 bg-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-black font-medium">Business Name</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleChange("businessName", e.target.value)}
              placeholder="Your Business Name"
              className="border-gray-300 bg-white text-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerName" className="text-black font-medium">Owner Name</Label>
            <Input
              id="ownerName"
              value={formData.ownerName}
              onChange={(e) => handleChange("ownerName", e.target.value)}
              placeholder="Your Full Name"
              className="border-gray-300 bg-white text-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-black font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="business@example.com"
              className="border-gray-300 bg-white text-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-black font-medium">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+254 xxx xxx xxx"
              className="border-gray-300 bg-white text-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website" className="text-black font-medium">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://yourwebsite.com"
              className="border-gray-300 bg-white text-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxId" className="text-black font-medium">Tax ID / PIN</Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => handleChange("taxId", e.target.value)}
              placeholder="Your Tax ID or PIN"
              className="border-gray-300 bg-white text-black"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address" className="text-black font-medium">Business Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Your complete business address"
            rows={3}
            className="border-gray-300 bg-white text-black"
          />
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </CardContent>
    </Card>
  );
};
