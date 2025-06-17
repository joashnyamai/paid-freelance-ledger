
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Users, Download, Eye, Edit, DollarSign, Clock, CheckCircle } from "lucide-react";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoiceList } from "@/components/InvoiceList";
import { ClientList } from "@/components/ClientList";
import { InvoicePreview } from "@/components/InvoicePreview";
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

  // Calculate dashboard stats
  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const pendingRevenue = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total, 0);
  const overdueRevenue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Invoice Manager</h1>
          <p className="text-gray-600">Manage your freelance invoices and track payments</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-500">{invoices.filter(inv => inv.status === 'paid').length} paid invoices</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">${pendingRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-500">{invoices.filter(inv => inv.status === 'pending').length} pending invoices</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${overdueRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-500">{invoices.filter(inv => inv.status === 'overdue').length} overdue invoices</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Clients</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{clients.length}</div>
              <p className="text-xs text-gray-500">Total clients</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>Manage your invoices and track payments</CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingInvoice(null);
                      setShowInvoiceForm(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Invoice
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <InvoiceList 
                  invoices={invoices}
                  onEditInvoice={handleEditInvoice}
                  onViewInvoice={handleViewInvoice}
                  onUpdateStatus={handleUpdateInvoiceStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <ClientList clients={clients} onAddClient={handleAddClient} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure your invoice settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
