
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoiceList } from "@/components/InvoiceList";
import { ClientList } from "@/components/ClientList";
import { InvoicePreview } from "@/components/InvoicePreview";
import { Sidebar } from "@/components/Sidebar";
import { DashboardOverview } from "@/components/DashboardOverview";
import { toast } from "@/hooks/use-toast";

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
  status: 'pending' | 'paid' | 'overdue';
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    const savedClients = localStorage.getItem('clients');
    
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    }
  }, []);

  // Save data to localStorage whenever invoices or clients change
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  const handleCreateInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Date.now().toString(),
      invoiceNumber: `INV-${String(invoices.length + 1).padStart(4, '0')}`,
    };
    
    setInvoices(prev => [...prev, newInvoice]);
    setShowInvoiceForm(false);
    setEditingInvoice(null);
    
    toast({
      title: "Invoice Created",
      description: `Invoice ${newInvoice.invoiceNumber} has been created successfully.`,
    });
  };

  const handleUpdateInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    if (!editingInvoice) return;
    
    const updatedInvoice: Invoice = {
      ...invoiceData,
      id: editingInvoice.id,
      invoiceNumber: editingInvoice.invoiceNumber,
    };
    
    setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? updatedInvoice : inv));
    setShowInvoiceForm(false);
    setEditingInvoice(null);
    
    toast({
      title: "Invoice Updated",
      description: `Invoice ${updatedInvoice.invoiceNumber} has been updated successfully.`,
    });
  };

  const handleAddClient = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
    };
    
    setClients(prev => [...prev, newClient]);
    
    toast({
      title: "Client Added",
      description: `${newClient.name} has been added to your client list.`,
    });
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowInvoiceForm(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoicePreview(true);
  };

  const handleUpdateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { ...inv, status } : inv
    ));
    
    toast({
      title: "Status Updated",
      description: `Invoice status has been updated to ${status}.`,
    });
  };

  const handleNewInvoice = () => {
    setEditingInvoice(null);
    setShowInvoiceForm(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview invoices={invoices} />;
      
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
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-6">
                <InvoiceList 
                  invoices={invoices}
                  onEditInvoice={handleEditInvoice}
                  onViewInvoice={handleViewInvoice}
                  onUpdateStatus={handleUpdateInvoiceStatus}
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
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle>Portal Settings</CardTitle>
                <CardDescription>Customize your invoice management experience</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return <DashboardOverview invoices={invoices} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
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
        />
      )}
    </div>
  );
};

export default Index;
