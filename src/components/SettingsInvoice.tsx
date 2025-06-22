
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface InvoiceSettings {
  defaultTax: number;
  currency: string;
  paymentTerms: number;
  defaultNotes: string;
  includeSignature: boolean;
  logoUrl: string;
  invoicePrefix: string;
}

export const SettingsInvoice = () => {
  const [settings, setSettings] = useState<InvoiceSettings>(() => {
    const saved = localStorage.getItem('invoiceApp_invoiceSettings');
    return saved ? JSON.parse(saved) : {
      defaultTax: 16,
      currency: "KSH",
      paymentTerms: 30,
      defaultNotes: "Thank you for your business!",
      includeSignature: false,
      logoUrl: "",
      invoicePrefix: "INV"
    };
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('invoiceApp_invoiceSettings', JSON.stringify(settings));
      toast({
        title: "Invoice Settings Updated",
        description: "Your invoice preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save invoice settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof InvoiceSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Settings</CardTitle>
        <CardDescription>Customize your invoice defaults and appearance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="defaultTax">Default Tax Rate (%)</Label>
            <Input
              id="defaultTax"
              type="number"
              value={settings.defaultTax}
              onChange={(e) => handleChange("defaultTax", parseFloat(e.target.value) || 0)}
              placeholder="16"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={settings.currency}
              onValueChange={(value) => handleChange("currency", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KSH">KSH (Kenyan Shilling)</SelectItem>
                <SelectItem value="USD">USD (US Dollar)</SelectItem>
                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                <SelectItem value="GBP">GBP (British Pound)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Default Payment Terms (Days)</Label>
            <Input
              id="paymentTerms"
              type="number"
              value={settings.paymentTerms}
              onChange={(e) => handleChange("paymentTerms", parseInt(e.target.value) || 30)}
              placeholder="30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
            <Input
              id="invoicePrefix"
              value={settings.invoicePrefix}
              onChange={(e) => handleChange("invoicePrefix", e.target.value)}
              placeholder="INV"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
          <Input
            id="logoUrl"
            value={settings.logoUrl}
            onChange={(e) => handleChange("logoUrl", e.target.value)}
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultNotes">Default Invoice Notes</Label>
          <Textarea
            id="defaultNotes"
            value={settings.defaultNotes}
            onChange={(e) => handleChange("defaultNotes", e.target.value)}
            placeholder="Thank you for your business!"
            rows={3}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="includeSignature"
            checked={settings.includeSignature}
            onCheckedChange={(checked) => handleChange("includeSignature", checked)}
          />
          <Label htmlFor="includeSignature">Include digital signature space on invoices</Label>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};
