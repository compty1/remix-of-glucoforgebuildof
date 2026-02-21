import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserPlus, Edit, Trash2, Mail, Calendar, Shield, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePageMeta } from '@/hooks/usePageMeta';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  display_name?: string;
  role?: string;
  email_confirmed_at?: string;
  phone?: string;
}

export default function AdminUsers() {
  usePageMeta('Admin - Users', 'GlucoForge admin panel.');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const usersPerPage = 20;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'GET'
      });

      if (error) throw error;
      setUsers(data.users || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.email_confirmed_at) ||
      (statusFilter === 'inactive' && !user.email_confirmed_at);
    
    return matchesSearch && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleResetPassword = async (user: User) => {
    try {
      setActionLoading(`reset-${user.id}`);
      const { error } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        body: { action: 'reset_password', userId: user.id, userData: { email: user.email } }
      });
      
      if (error) throw error;
      toast.success('Password reset email sent successfully');
    } catch (error) {
      toast.error('Failed to send password reset email');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivateUser = async (user: User) => {
    try {
      setActionLoading(`deactivate-${user.id}`);
      const { error } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        body: { action: 'deactivate_user', userId: user.id, userData: { user_metadata: user } }
      });
      
      if (error) throw error;
      toast.success('User deactivated successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to deactivate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleInviteUser = async () => {
    try {
      setActionLoading('invite');
      const { error } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        body: { 
          action: 'invite_user', 
          userData: { 
            email: inviteEmail, 
            display_name: inviteName,
            role: inviteRole 
          } 
        }
      });
      
      if (error) throw error;
      toast.success('User invited successfully');
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('user');
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to invite user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateRole = async (user: User, newRole: string) => {
    try {
      setActionLoading(`role-${user.id}`);
      const { error } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        body: { action: 'update_role', userId: user.id, userData: { role: newRole } }
      });
      
      if (error) throw error;
      toast.success('User role updated successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground">
              User Management
            </h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="invite-name">Display Name</Label>
                      <Input
                        id="invite-name"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="invite-role">Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleInviteUser} 
                      disabled={!inviteEmail || actionLoading === 'invite'}
                      className="w-full"
                    >
                      {actionLoading === 'invite' ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={statusFilter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    All Users ({users.length})
                  </Button>
                  <Button 
                    variant={statusFilter === 'active' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setStatusFilter('active')}
                  >
                    Active ({users.filter(u => u.email_confirmed_at).length})
                  </Button>
                  <Button 
                    variant={statusFilter === 'inactive' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setStatusFilter('inactive')}
                  >
                    Inactive ({users.filter(u => !u.email_confirmed_at).length})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {user.display_name || 'Anonymous User'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {user.id.substring(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role || 'user'}
                          onValueChange={(newRole) => handleUpdateRole(user, newRole)}
                          disabled={actionLoading === `role-${user.id}`}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.last_sign_in_at ? 
                          new Date(user.last_sign_in_at).toLocaleDateString() :
                          'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.email_confirmed_at ? 'default' : 'secondary'}
                          className={user.email_confirmed_at ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}
                        >
                          {user.email_confirmed_at ? 'Active' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleResetPassword(user)}
                            disabled={actionLoading === `reset-${user.id}`}
                            title="Reset Password"
                          >
                            {actionLoading === `reset-${user.id}` ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Shield className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeactivateUser(user)}
                            disabled={actionLoading === `deactivate-${user.id}`}
                            title="Deactivate User"
                          >
                            {actionLoading === `deactivate-${user.id}` ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * usersPerPage + 1} to{' '}
                    {Math.min(currentPage * usersPerPage, filteredUsers.length)} of{' '}
                    {filteredUsers.length} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}