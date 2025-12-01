import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button as NavButton } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Users, FileText, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  userId: string;
  email: string;
  clientCount: number;
  invoiceCount: number;
  totalRevenue: number;
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [usersData, setUsersData] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Check if user has admin role
        const rolesRef = collection(db, 'user_roles');
        const q = query(rolesRef, where('userId', '==', user.id), where('role', '==', 'admin'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          toast.error('Access denied. Admin privileges required.');
          navigate('/');
          return;
        }

        setIsAdmin(true);
        await loadUsersData();
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error('Error verifying permissions');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  const loadUsersData = async () => {
    try {
      // Get all clients grouped by userId
      const clientsSnapshot = await getDocs(collection(db, 'clients'));
      const invoicesSnapshot = await getDocs(collection(db, 'invoices'));

      const userMap = new Map<string, UserData>();

      // Process clients
      clientsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        const email = data.userEmail || 'Unknown';

        if (!userMap.has(userId)) {
          userMap.set(userId, {
            userId,
            email,
            clientCount: 0,
            invoiceCount: 0,
            totalRevenue: 0
          });
        }

        const userData = userMap.get(userId)!;
        userData.clientCount++;
      });

      // Process invoices
      invoicesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;

        if (userMap.has(userId)) {
          const userData = userMap.get(userId)!;
          userData.invoiceCount++;
          userData.totalRevenue += Number(data.total) || 0;
        }
      });

      setUsersData(Array.from(userMap.values()));
    } catch (error) {
      console.error('Error loading users data:', error);
      toast.error('Failed to load users data');
    }
  };

  const viewUserPortal = (userId: string) => {
    // Store selected user in sessionStorage for admin view
    sessionStorage.setItem('adminViewingUser', userId);
    navigate(`/admin/user/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleLogout = async () => {
    try {
      const { logout } = useAuth();
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
            <NavButton
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Exit Admin
            </NavButton>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 p-6 max-w-7xl mx-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">View and manage all user accounts</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usersData.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usersData.reduce((sum, u) => sum + u.clientCount, 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${usersData.reduce((sum, u) => sum + u.totalRevenue, 0).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View detailed information for each user account</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Clients</TableHead>
                      <TableHead>Invoices</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData.map((userData) => (
                      <TableRow key={userData.userId}>
                        <TableCell className="font-medium">{userData.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{userData.clientCount}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{userData.invoiceCount}</Badge>
                        </TableCell>
                        <TableCell>${userData.totalRevenue.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewUserPortal(userData.userId)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Portal
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {usersData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
    </div>
  );
}
