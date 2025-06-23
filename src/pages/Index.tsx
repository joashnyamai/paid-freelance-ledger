import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoiceList } from "@/components/InvoiceList";
import { InvoiceFilter, FilterState } from "@/components/InvoiceFilter";
import { ClientList } from "@/components/ClientList";
import { InvoicePreview } from "@/components/InvoicePreview";
import { Sidebar } from "@/components/Sidebar";
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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Invoices</h2>
                <p className="text-gray-600">Manage your invoices and track payments</p>
              </div>
              <Button 
                onClick={handleNewInvoice}
                className="bg-blue-600 hover:bg-blue-700"
              >
                New Invoice
              </Button>
            </div>
            
            <InvoiceFilter onFilterChange={setFilters} />
            
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-6">
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
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Clients</h2>
              <p className="text-gray-600">Manage your client information</p>
            </div>
            <ClientList clients={clients} onAddClient={handleAddClient} />
          </div>
        );
      
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600">Configure your invoice portal</p>
            </div>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Business Profile</TabsTrigger>
                <TabsTrigger value="invoice">Invoice Settings</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="mt-6">
                <SettingsProfile />
              </TabsContent>
              <TabsContent value="invoice" className="mt-6">
                <SettingsInvoice />
              </TabsContent>
              <TabsContent value="preferences" className="mt-6">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your invoice portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${preferences.compactMode ? 'text-sm' : ''} ${
      preferences.darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
    } flex`}>
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewInvoice={handleNewInvoice}
        invoiceCount={invoices.length}
        clientCount={clients.length}
      />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderContent()}
      </div>

      {/* Show business info in header if configured */}
      {profile.businessName && (
        <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 text-sm">
          <div className="font-semibold">{profile.businessName}</div>
          {profile.ownerName && <div className="text-gray-600 dark:text-gray-400">{profile.ownerName}</div>}
        </div>
      )}

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
