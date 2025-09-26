
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, FileText, Users, Settings, PlusCircle } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewInvoice: () => void;
  invoiceCount: number;
  clientCount: number;
}

export const Sidebar = ({ activeTab, onTabChange, onNewInvoice, invoiceCount, clientCount }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'invoices', label: 'Invoices', icon: FileText, count: invoiceCount },
    { id: 'clients', label: 'Clients', icon: Users, count: clientCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 h-full">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-black">Invoice Portal</h1>
        <p className="text-sm text-gray-600">Freelance Management</p>
      </div>
      
      <div className="p-4">
        <Button 
          onClick={onNewInvoice}
          className="w-full bg-purple-600 hover:bg-purple-700 mb-6"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-black hover:bg-secondary'
              }`}
            >
              <div className="flex items-center">
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.count !== undefined && (
                <Badge variant="secondary" className="bg-secondary text-black">
                  {item.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
