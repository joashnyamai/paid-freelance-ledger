
import { useState, useEffect } from 'react';

export interface ProfileData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  taxId: string;
}

export interface InvoiceSettings {
  defaultTax: number;
  currency: string;
  paymentTerms: number;
  defaultNotes: string;
  includeSignature: boolean;
  logoUrl: string;
  invoicePrefix: string;
}

export interface Preferences {
  darkMode: boolean;
  emailNotifications: boolean;
  autoSave: boolean;
  defaultView: string;
  compactMode: boolean;
  showTutorials: boolean;
}

export const useSettings = () => {
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

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(() => {
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

  const [preferences, setPreferences] = useState<Preferences>(() => {
    const saved = localStorage.getItem('invoiceApp_preferences');
    return saved ? JSON.parse(saved) : {
      darkMode: false,
      emailNotifications: true,
      autoSave: true,
      defaultView: "dashboard",
      compactMode: false,
      showTutorials: true
    };
  });

  const updateProfile = (newProfile: ProfileData) => {
    setProfile(newProfile);
    localStorage.setItem('invoiceApp_profile', JSON.stringify(newProfile));
  };

  const updateInvoiceSettings = (newSettings: InvoiceSettings) => {
    setInvoiceSettings(newSettings);
    localStorage.setItem('invoiceApp_invoiceSettings', JSON.stringify(newSettings));
  };

  const updatePreferences = (newPreferences: Preferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('invoiceApp_preferences', JSON.stringify(newPreferences));
    
    // Apply dark mode
    if (newPreferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply dark mode on mount
  useEffect(() => {
    if (preferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.darkMode]);

  return {
    profile,
    invoiceSettings,
    preferences,
    updateProfile,
    updateInvoiceSettings,
    updatePreferences
  };
};
