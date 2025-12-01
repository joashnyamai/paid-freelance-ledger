import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Users as UsersIcon, FileText as FileTextIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminUserView() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState({ clientCount: 0, invoiceCount: 0, totalRevenue: 0 });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Verify admin status
        const rolesRef = collection(db, 'user_roles');
        const q = query(rolesRef, where('userId', '==', user.id), where('role', '==', 'admin'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          toast.error('Access denied. Admin privileges required.');
          navigate('/');
          return;
        }

        setIsAdmin(true);

        // Get user's data
        if (userId) {
          const clientsRef = collection(db, 'clients');
          const clientQuery = query(clientsRef, where('userId', '==', userId));
          const clientSnapshot = await getDocs(clientQuery);
          
          const clientsData = clientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setClients(clientsData);
          
          if (!clientSnapshot.empty) {
            const email = clientSnapshot.docs[0].data().userEmail || 'Unknown User';
            setUserEmail(email);
          }

          // Get invoices
          const invoicesRef = collection(db, 'invoices');
          const invoiceQuery = query(invoicesRef, where('userId', '==', userId));
          const invoiceSnapshot = await getDocs(invoiceQuery);
          
          const invoicesData = invoiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setInvoices(invoicesData);

          // Calculate stats
          const totalRevenue = invoicesData
            .filter((inv: any) => inv.status === 'paid')
            .reduce((sum: number, inv: any) => sum + (inv.amountPaid || inv.total || 0), 0);

          setStats({
            clientCount: clientsData.length,
            invoiceCount: invoicesData.length,
            totalRevenue
          });
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error('Error verifying permissions');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, userId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Admin Navbar */}
      <nav className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Admin Portal</h1>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 p-6 max-w-7xl mx-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Viewing: {userEmail}</h1>
                <p className="text-muted-foreground">Admin view of user portal</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.clientCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                  <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.invoiceCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KSH {stats.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="clients" className="space-y-4">
              <TabsList>
                <TabsTrigger value="clients">Clients</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
              </TabsList>

              <TabsContent value="clients" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Clients</CardTitle>
                    <CardDescription>All clients for this user</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {clients.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No clients found</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clients.map((client: any) => (
                            <TableRow key={client.id}>
                              <TableCell className="font-medium">{client.name}</TableCell>
                              <TableCell>{client.company || '-'}</TableCell>
                              <TableCell>{client.email}</TableCell>
                              <TableCell>{client.phone || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invoices" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>All invoices for this user</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {invoices.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No invoices found</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.map((invoice: any) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                              <TableCell>{invoice.clientName}</TableCell>
                              <TableCell>KSH {invoice.total?.toFixed(2)}</TableCell>
                              <TableCell>KSH {(invoice.amountPaid || 0).toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                  {invoice.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
    </div>
  );
}
