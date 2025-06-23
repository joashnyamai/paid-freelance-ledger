
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, FileText, Users, Settings, PlusCircle, Building2 } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewInvoice: () => void;
  invoiceCount: number;
  clientCount: number;
  businessName?: string;
  ownerName?: string;
}

export const Navbar = ({ 
  activeTab, 
  onTabChange, 
  onNewInvoice, 
  invoiceCount, 
  clientCount,
  businessName,
  ownerName 
}: NavbarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'invoices', label: 'Invoices', icon: FileText, count: invoiceCount },
    { id: 'clients', label: 'Clients', icon: Users, count: clientCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-lg border-b-2 border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className="bg-slate-900 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {businessName || 'Professional Invoice Portal'}
              </h1>
              {businessName && ownerName && (
                <p className="text-sm text-slate-600 font-medium">{ownerName}</p>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <Badge variant="secondary" className="ml-2 bg-slate-200 text-slate-800 font-medium">
                      {item.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Button 
              onClick={onNewInvoice}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Invoice</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="bg-slate-100 inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              onClick={() => {/* Mobile menu toggle logic can be added here */}}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-4 pt-2 pb-3 space-y-1 bg-slate-50 border-t">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-base font-semibold transition-colors ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center">
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <Badge variant="secondary" className="bg-slate-200 text-slate-800">
                  {item.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
