import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button as NavButton } from '@/components/ui/button';
import { LogOut, Shield, Search, User, UserCheck, UserX, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Users, FileText, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

interface UserData {
  userId: string;
  email: string;
  clientCount: number;
  invoiceCount: number;
  totalRevenue: number;
  lastActive?: Date;
  isActive?: boolean;
  createdAt?: Date;
}

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [usersData, setUsersData] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const filteredUsers = usersData.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
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
      setIsRefreshing(true);
      const [clientsSnapshot, invoicesSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, 'clients')),
        getDocs(collection(db, 'invoices')),
        getDocs(collection(db, 'users'))
      ]);

      const userMap = new Map<string, UserData>();
      const userDataMap = new Map<string, { lastActive?: Date; isActive?: boolean; createdAt?: Date }>();

      // Process users data
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        userDataMap.set(doc.id, {
          lastActive: data.lastActive?.toDate(),
          isActive: data.isActive !== false, // Default to true if not set
          createdAt: data.createdAt?.toDate()
        });
      });

      // Process clients
      clientsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        const email = data.userEmail || 'Unknown';

        if (!userMap.has(userId)) {
          const userData = userDataMap.get(userId) || {};
          userMap.set(userId, {
            userId,
            email,
            clientCount: 0,
            invoiceCount: 0,
            totalRevenue: 0,
            ...userData
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
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, { isActive: !currentStatus });
      
      setUsersData(prev => 
        prev.map(user => 
          user.userId === userId 
            ? { ...user, isActive: !currentStatus } 
            : user
        )
      );
      
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const exportToExcel = () => {
    try {
      setIsExporting(true);
      const data = usersData.map(user => ({
        'User ID': user.userId,
        'Email': user.email,
        'Status': user.isActive ? 'Active' : 'Inactive',
        'Clients': user.clientCount,
        'Invoices': user.invoiceCount,
        'Total Revenue': user.totalRevenue,
        'Last Active': user.lastActive ? format(user.lastActive, 'PPpp') : 'Never',
        'Created At': user.createdAt ? format(user.createdAt, 'PPpp') : 'Unknown'
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
      XLSX.writeFile(workbook, `users_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const viewUserPortal = (userId: string) => {
    sessionStorage.setItem('adminViewingUser', userId);
    navigate(`/admin/user/${userId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
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

  const totalUsers = usersData.length;
  const activeUsers = usersData.filter(u => u.isActive !== false).length;
  const totalClients = usersData.reduce((sum, u) => sum + u.clientCount, 0);
  const totalInvoices = usersData.reduce((sum, u) => sum + u.invoiceCount, 0);
  const totalRevenue = usersData.reduce((sum, u) => sum + u.totalRevenue, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navbar */}
      <nav className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/', '_blank')}
                className="hidden sm:flex"
              >
                <User className="h-4 w-4 mr-2" />
                View Main Site
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users and monitor system metrics</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadUsersData}
                  disabled={isRefreshing}
                  className="w-full sm:w-auto"
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToExcel}
                  disabled={isExporting || usersData.length === 0}
                  className="w-full sm:w-auto"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {activeUsers} active • {totalUsers - activeUsers} inactive
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  {totalUsers > 0 ? Math.round(totalClients / totalUsers) : 0} per user on average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  {totalUsers > 0 ? Math.round(totalInvoices / totalUsers) : 0} per user on average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KSH {totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {totalUsers > 0 ? `KSH ${(totalRevenue / totalUsers).toLocaleString(undefined, { maximumFractionDigits: 2 })} per user` : ''}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage all user accounts and their permissions</CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredUsers.length} of {usersData.length} users
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Clients</TableHead>
                      <TableHead className="hidden md:table-cell">Invoices</TableHead>
                      <TableHead className="hidden lg:table-cell">Revenue</TableHead>
                      <TableHead className="hidden xl:table-cell">Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? 'No users match your search' : 'No users found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((userData) => (
                        <TableRow key={userData.userId}>
                          <TableCell>
                            <div className="font-medium">{userData.email}</div>
                            <div className="text-xs text-muted-foreground">{userData.userId}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={userData.isActive !== false ? 'default' : 'secondary'}>
                              {userData.isActive !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="font-medium">{userData.clientCount}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="font-medium">{userData.invoiceCount}</div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="font-medium">KSH {userData.totalRevenue.toLocaleString()}</div>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <div className="text-sm text-muted-foreground">
                              {userData.lastActive 
                                ? format(userData.lastActive, 'PPpp')
                                : 'Never'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleUserStatus(userData.userId, userData.isActive !== false)}
                                className="h-8 w-8 p-0"
                                title={userData.isActive !== false ? 'Deactivate user' : 'Activate user'}
                              >
                                {userData.isActive !== false ? (
                                  <UserX className="h-4 w-4 text-red-500" />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-green-500" />
                                )}
                                <span className="sr-only">
                                  {userData.isActive !== false ? 'Deactivate' : 'Activate'}
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => viewUserPortal(userData.userId)}
                                className="h-8 w-8 p-0"
                                title="View user details"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
