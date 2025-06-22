
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface ProfileData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  taxId: string;
}

export const SettingsProfile = () => {
  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem('invoiceApp_profile');
    return saved ? JSON.parse(saved) : {
      businessName: "",
      ownerName: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      taxId: ""
    };
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('invoiceApp_profile', JSON.stringify(profile));
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
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Profile</CardTitle>
        <CardDescription>Manage your business information that appears on invoices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={profile.businessName}
              onChange={(e) => handleChange("businessName", e.target.value)}
              placeholder="Your Business Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input
              id="ownerName"
              value={profile.ownerName}
              onChange={(e) => handleChange("ownerName", e.target.value)}
              placeholder="Your Full Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="business@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+254 xxx xxx xxx"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={profile.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID / PIN</Label>
            <Input
              id="taxId"
              value={profile.taxId}
              onChange={(e) => handleChange("taxId", e.target.value)}
              placeholder="Your Tax ID or PIN"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Business Address</Label>
          <Textarea
            id="address"
            value={profile.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Your complete business address"
            rows={3}
          />
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </CardContent>
    </Card>
  );
};
