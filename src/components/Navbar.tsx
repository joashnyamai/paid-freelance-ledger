import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, FileText, Users, Settings, PlusCircle, Building2, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'invoices', label: 'Invoices', icon: FileText, count: invoiceCount },
    { id: 'clients', label: 'Clients', icon: Users, count: clientCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  {businessName || 'Invoice Portal'}
                </h1>
                {businessName && ownerName && (
                  <p className="text-xs text-gray-500 font-medium">{ownerName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                onClick={() => onTabChange(item.id)}
                className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <Badge 
                    variant="secondary" 
                    className={`absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center text-xs ${
                      activeTab === item.id 
                        ? 'bg-white text-blue-600' 
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Right Section - User Info & Actions */}
          <div className="flex items-center space-x-3">
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2">
              <div className="bg-blue-100 p-1.5 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button 
                onClick={onNewInvoice}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 group"
                size="sm"
              >
                <PlusCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">New Invoice</span>
                <span className="sm:hidden">New</span>
              </Button>

              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-600 hover:text-gray-700 hover:border-gray-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => {/* Mobile menu toggle logic */}}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-gray-200 bg-white">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              onClick={() => onTabChange(item.id)}
              className={`w-full justify-start px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== undefined && (
                <Badge 
                  variant="secondary" 
                  className={`ml-2 ${
                    activeTab === item.id 
                      ? 'bg-white text-blue-600' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {item.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        
        {/* Mobile User Info */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};