import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoiceList } from "@/components/InvoiceList";
import { InvoiceFilter, FilterState } from "@/components/InvoiceFilter";
import { ClientList } from "@/components/ClientList";
import { InvoicePreview } from "@/components/InvoicePreview";
import { Navbar } from "@/components/Navbar";
import { DashboardOverview } from "@/components/DashboardOverview";
import { SettingsProfile } from "@/components/SettingsProfile";
import { SettingsInvoice } from "@/components/SettingsInvoice";
import { SettingsPreferences } from "@/components/SettingsPreferences";
import { toast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { DatabaseService } from "@/services/database";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  address: string;
  phone?: string;
}

const Index = () => {
  const { preferences, invoiceSettings, profile } = useSettings();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    clientName: "",
    dateRange: "all"
  });

  // Load data from Supabase on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [invoicesData, clientsData] = await Promise.all([
          DatabaseService.getInvoices(),
          DatabaseService.getClients()
        ]);
        setInvoices(invoicesData);
        setClients(clientsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load data from database.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Set initial tab based on preferences
  useEffect(() => {
    if (preferences.defaultView && activeTab === 'dashboard') {
      setActiveTab(preferences.defaultView);
    }
  }, [preferences.defaultView]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      // Status filter
      if (filters.status !== "all" && invoice.status !== filters.status) {
        return false;
      }

      // Client name filter
      if (filters.clientName && !invoice.clientName.toLowerCase().includes(filters.clientName.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== "all") {
        const invoiceDate = new Date(invoice.issueDate);
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        switch (filters.dateRange) {
          case "this_month":
            if (invoiceDate.getMonth() !== currentMonth || invoiceDate.getFullYear() !== currentYear) {
              return false;
            }
            break;
          case "last_month":
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            if (invoiceDate.getMonth() !== lastMonth || invoiceDate.getFullYear() !== lastMonthYear) {
              return false;
            }
            break;
          case "last_3_months":
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            if (invoiceDate < threeMonthsAgo) {
              return false;
            }
            break;
        }
      }

      return true;
    });
  }, [invoices, filters]);

  const handleCreateInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    try {
      const newInvoice = await DatabaseService.addInvoice(invoiceData);
      setInvoices(prev => [newInvoice, ...prev]);
      setShowInvoiceForm(false);
      setEditingInvoice(null);
      
      toast({
        title: "Invoice Created",
        description: `Invoice ${newInvoice.invoiceNumber} has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    if (!editingInvoice) return;
    
    try {
      const updatedInvoice = await DatabaseService.updateInvoice(editingInvoice.id, invoiceData);
      setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? updatedInvoice : inv));
      setShowInvoiceForm(false);
      setEditingInvoice(null);
      
      toast({
        title: "Invoice Updated",
        description: `Invoice ${updatedInvoice.invoiceNumber} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice.",
        variant: "destructive",
      });
    }
  };

  const handleAddClient = async (clientData: Omit<Client, 'id'>) => {
    try {
      const newClient = await DatabaseService.addClient(clientData);
      setClients(prev => [newClient, ...prev]);
      
      toast({
        title: "Client Added",
        description: `${newClient.name} has been added to your client list.`,
      });
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client.",
        variant: "destructive",
      });
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowInvoiceForm(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoicePreview(true);
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    try {
      await DatabaseService.updateInvoiceStatus(invoiceId, status);
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId ? { ...inv, status } : inv
      ));
      
      toast({
        title: "Status Updated",
        description: `Invoice status has been updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await DatabaseService.deleteInvoice(invoiceId);
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      
      toast({
        title: "Invoice Deleted",
        description: "Invoice has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error",
        description: "Failed to delete invoice.",
        variant: "destructive",
      });
    }
  };

  const handleAddPayment = async (invoiceId: string, paymentAmount: number) => {
    try {
      await DatabaseService.addPayment(invoiceId, paymentAmount);
      const updatedInvoices = await DatabaseService.getInvoices();
      setInvoices(updatedInvoices);
      
      toast({
        title: "Payment Added",
        description: `Payment of KSH ${paymentAmount.toFixed(2)} has been recorded.`,
      });
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to add payment.",
        variant: "destructive",
      });
    }
  };

  const handleNewInvoice = () => {
    setEditingInvoice(null);
    setShowInvoiceForm(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            invoices={invoices} 
            onNewInvoice={handleNewInvoice}
            onNavigate={setActiveTab}
          />
        );
      
      case 'invoices':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Invoice Management</h1>
                <p className="text-lg text-slate-600">Create, manage, and track your professional invoices</p>
              </div>
              <Button 
                onClick={handleNewInvoice}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                Create New Invoice
              </Button>
            </div>
            
            <InvoiceFilter onFilterChange={setFilters} />
            
            <Card className="bg-white shadow-lg border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="text-xl font-semibold text-slate-900">All Invoices</CardTitle>
                <CardDescription className="text-slate-600">
                  Manage and track all your business invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <InvoiceList 
                  invoices={filteredInvoices}
                  onEditInvoice={handleEditInvoice}
                  onViewInvoice={handleViewInvoice}
                  onUpdateStatus={handleUpdateInvoiceStatus}
                  onDeleteInvoice={handleDeleteInvoice}
                />
              </CardContent>
            </Card>
          </div>
        );
      
      case 'clients':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Client Management</h1>
              <p className="text-lg text-slate-600">Manage your client relationships and information</p>
            </div>
            <ClientList clients={clients} onAddClient={handleAddClient} />
          </div>
        );
      
      case 'settings':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">System Settings</h1>
              <p className="text-lg text-slate-600">Configure your invoice portal preferences and business information</p>
            </div>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1">
                <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">Business Profile</TabsTrigger>
                <TabsTrigger value="invoice" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">Invoice Settings</TabsTrigger>
                <TabsTrigger value="preferences" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">Preferences</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="mt-8">
                <SettingsProfile />
              </TabsContent>
              <TabsContent value="invoice" className="mt-8">
                <SettingsInvoice />
              </TabsContent>
              <TabsContent value="preferences" className="mt-8">
                <SettingsPreferences />
              </TabsContent>
            </Tabs>
          </div>
        );
      
      default:
        return (
          <DashboardOverview 
            invoices={invoices} 
            onNewInvoice={handleNewInvoice}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-slate-900 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Invoice Portal</h2>
          <p className="text-slate-600">Please wait while we prepare your professional dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${preferences.compactMode ? 'text-sm' : ''} ${
      preferences.darkMode ? 'dark bg-gray-900' : 'bg-slate-50'
    }`}>
      {/* Navbar */}
      <Navbar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewInvoice={handleNewInvoice}
        invoiceCount={invoices.length}
        clientCount={clients.length}
        businessName={profile.businessName}
        ownerName={profile.ownerName}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {renderContent()}
      </div>

      {/* Invoice Form Modal */}
      {showInvoiceForm && (
        <InvoiceForm
          clients={clients}
          editingInvoice={editingInvoice}
          onSubmit={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}
          onClose={() => {
            setShowInvoiceForm(false);
            setEditingInvoice(null);
          }}
        />
      )}

      {/* Invoice Preview Modal */}
      {showInvoicePreview && selectedInvoice && (
        <InvoicePreview
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoicePreview(false);
            setSelectedInvoice(null);
          }}
          onAddPayment={handleAddPayment}
        />
      )}
    </div>
  );
};

export default Index;
