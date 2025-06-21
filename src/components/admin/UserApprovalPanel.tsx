
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone_number?: string;
  approval_status: string;
  created_at: string;
}

export const UserApprovalPanel = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingUsers(data || []);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast.error('Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('approve_user', {
        user_id_param: userId
      });

      if (error) throw error;
      
      toast.success('User approved successfully');
      fetchPendingUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    }
  };

  const rejectUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase.rpc('reject_user', {
        user_id_param: selectedUser.id,
        reason_param: rejectionReason || 'No reason provided'
      });

      if (error) throw error;
      
      toast.success('User rejected');
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedUser(null);
      fetchPendingUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'responder': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Approval Queue ({pendingUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading pending users...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              No pending user approvals
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Details</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{user.name || 'No name provided'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.phone_number && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {user.phone_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-yellow-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveUser(user.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setSelectedUser(user)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject User Registration</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>
                                  Are you sure you want to reject the registration for{' '}
                                  <strong>{selectedUser?.name || selectedUser?.email}</strong>?
                                </p>
                                <div>
                                  <Label htmlFor="rejection-reason">Rejection Reason (Optional)</Label>
                                  <Textarea
                                    id="rejection-reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Provide a reason for rejection..."
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setIsRejectDialogOpen(false);
                                      setRejectionReason('');
                                      setSelectedUser(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={rejectUser}
                                  >
                                    Reject User
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
