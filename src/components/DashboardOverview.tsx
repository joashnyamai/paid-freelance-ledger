
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Clock, CheckCircle, AlertTriangle, TrendingUp, Calendar, Receipt, Plus, Users, FileText, Settings, AlertCircle } from "lucide-react";
import { Invoice } from "@/pages/Index";

interface DashboardOverviewProps {
  invoices: Invoice[];
  onNewInvoice: () => void;
  onNavigate: (tab: string) => void;
}

export const DashboardOverview = ({ invoices, onNewInvoice, onNavigate }: DashboardOverviewProps) => {
  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const pendingRevenue = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total, 0);
  const partialRevenue = invoices.filter(inv => inv.status === 'partially_paid').reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const overdueRevenue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0);
  
  const paidCount = invoices.filter(inv => inv.status === 'paid').length;
  const pendingCount = invoices.filter(inv => inv.status === 'pending').length;
  const partialCount = invoices.filter(inv => inv.status === 'partially_paid').length;
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

  // Calculate totals
  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalAmountPaid = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalOutstanding = totalInvoiceAmount - totalAmountPaid;

  const recentInvoices = invoices
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'partially_paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Dynamic quick actions based on current state
  const getQuickActions = () => {
    const actions = [];

    // Always show create invoice
    actions.push({
      title: "Create New Invoice",
      description: "Generate a new invoice for your clients",
      icon: Plus,
      action: onNewInvoice,
      variant: "primary" as const
    });

    // Show manage clients if no invoices or few clients
    if (invoices.length < 3) {
      actions.push({
        title: "Add Clients",
        description: "Build your client database",
        icon: Users,
        action: () => onNavigate('clients'),
        variant: "secondary" as const
      });
    }

    // Show overdue actions if there are overdue invoices
    if (overdueCount > 0) {
      actions.push({
        title: "Review Overdue Invoices",
        description: `${overdueCount} invoice${overdueCount > 1 ? 's' : ''} need attention`,
        icon: AlertCircle,
        action: () => onNavigate('invoices'),
        variant: "destructive" as const
      });
    }

    // Show pending payments if there are pending invoices
    if (pendingCount > 0) {
      actions.push({
        title: "Follow Up Payments",
        description: `${pendingCount} pending payment${pendingCount > 1 ? 's' : ''}`,
        icon: Clock,
        action: () => onNavigate('invoices'),
        variant: "secondary" as const
      });
    }

    // Show settings if no business profile is set up
    const hasProfile = localStorage.getItem('invoiceApp_profile');
    if (!hasProfile || !JSON.parse(hasProfile || '{}').businessName) {
      actions.push({
        title: "Complete Business Profile",
        description: "Set up your business information",
        icon: Settings,
        action: () => onNavigate('settings'),
        variant: "outline" as const
      });
    }

    // Show analytics if there are enough invoices
    if (invoices.length >= 5) {
      actions.push({
        title: "View Invoice Reports",
        description: "Analyze your billing performance",
        icon: TrendingUp,
        action: () => onNavigate('invoices'),
        variant: "secondary" as const
      });
    }

    return actions.slice(0, 4); // Limit to 4 actions
  };

  const quickActions = getQuickActions();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Welcome back! Here's your business overview.</p>
      </div>

      {/* Totals Summary Card */}
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <Receipt className="h-5 w-5" />
            Financial Summary
          </CardTitle>
          <CardDescription className="text-indigo-600">Overall business financial overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-700">KSH {totalInvoiceAmount.toFixed(2)}</div>
              <p className="text-sm text-indigo-600">Total Invoiced</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">KSH {totalAmountPaid.toFixed(2)}</div>
              <p className="text-sm text-green-600">Total Collected</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700">KSH {totalOutstanding.toFixed(2)}</div>
              <p className="text-sm text-orange-600">Total Outstanding</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">KSH {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-green-600">{paidCount} paid invoices</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">KSH {pendingRevenue.toFixed(2)}</div>
            <p className="text-xs text-yellow-600">{pendingCount} pending invoices</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Partial Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">KSH {partialRevenue.toFixed(2)}</div>
            <p className="text-xs text-blue-600">{partialCount} partially paid</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">KSH {overdueRevenue.toFixed(2)}</div>
            <p className="text-xs text-red-600">{overdueCount} overdue invoices</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{invoices.length}</div>
            <p className="text-xs text-purple-600">Total invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Invoices
            </CardTitle>
            <CardDescription>Your latest invoice activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No invoices yet</p>
                <Button onClick={onNewInvoice} className="bg-blue-600 hover:bg-blue-700">
                  Create Your First Invoice
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-600">{invoice.clientName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">KSH {invoice.total.toFixed(2)}</div>
                      <Badge className={`${getStatusColor(invoice.status)} text-xs`}>
                        {invoice.status === 'partially_paid' ? 'Partial' : 
                         invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Smart suggestions based on your current needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-md">
                      <action.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">{action.title}</p>
                      <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                      <Button 
                        size="sm" 
                        variant={action.variant}
                        onClick={action.action}
                        className="w-full"
                      >
                        {action.title.split(' ')[0]} Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
