
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
  Calendar,
  Shield,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { enhancedAuditService } from '@/services/enhanced-audit-service';
import { enhancedEmailService } from '@/services/enhanced-email-service';

interface PendingUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone_number?: string;
  approval_status: string;
  created_at: string;
}

export const EnhancedUserApprovalPanel = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
    enhancedEmailService.initialize();
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

  const fetchAuditLogs = async () => {
    try {
      const logs = await enhancedAuditService.getAuditLogs({
        resource: 'profiles',
        limit: 50
      });
      setAuditLogs(logs);
      setShowAuditLogs(true);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    }
  };

  const approveUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { data, error } = await supabase.rpc('approve_user_enhanced', {
        user_id_param: selectedUser.id,
        notes_param: approvalNotes || null
      });

      if (error) throw error;
      
      if (!data.success) {
        toast.error(data.error || 'Failed to approve user');
        return;
      }

      // Send approval email
      await enhancedEmailService.sendApprovalEmail(
        selectedUser.email,
        selectedUser.name,
        selectedUser.role,
        `${window.location.origin}/auth`
      );
      
      toast.success('User approved successfully and notification email sent');
      setIsApproveDialogOpen(false);
      setApprovalNotes('');
      setSelectedUser(null);
      fetchPendingUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    }
  };

  const rejectUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { data, error } = await supabase.rpc('reject_user_enhanced', {
        user_id_param: selectedUser.id,
        reason_param: rejectionReason || 'No reason provided',
        notes_param: approvalNotes || null
      });

      if (error) throw error;
      
      if (!data.success) {
        toast.error(data.error || 'Failed to reject user');
        return;
      }

      // Send rejection email
      await enhancedEmailService.sendRejectionEmail(
        selectedUser.email,
        selectedUser.name,
        rejectionReason || 'No specific reason provided'
      );
      
      toast.success('User rejected and notification email sent');
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setApprovalNotes('');
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
      case 'dispatcher': return 'default';
      case 'responder': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Enhanced User Approval Queue ({pendingUsers.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAuditLogs}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Audit Logs
            </Button>
          </div>
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
                          <Shield className="h-3 w-3 mr-1" />
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
                          <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Approve User Registration</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>
                                  Are you sure you want to approve the registration for{' '}
                                  <strong>{selectedUser?.name || selectedUser?.email}</strong>?
                                </p>
                                <div>
                                  <Label htmlFor="approval-notes">Approval Notes (Optional)</Label>
                                  <Textarea
                                    id="approval-notes"
                                    value={approvalNotes}
                                    onChange={(e) => setApprovalNotes(e.target.value)}
                                    placeholder="Add any notes about this approval..."
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setIsApproveDialogOpen(false);
                                      setApprovalNotes('');
                                      setSelectedUser(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={approveUser}
                                  >
                                    Approve User
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
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
                                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                  <Textarea
                                    id="rejection-reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Provide a reason for rejection..."
                                    rows={3}
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="rejection-notes">Additional Notes (Optional)</Label>
                                  <Textarea
                                    id="rejection-notes"
                                    value={approvalNotes}
                                    onChange={(e) => setApprovalNotes(e.target.value)}
                                    placeholder="Add any internal notes..."
                                    rows={2}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setIsRejectDialogOpen(false);
                                      setRejectionReason('');
                                      setApprovalNotes('');
                                      setSelectedUser(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={rejectUser}
                                    disabled={!rejectionReason.trim()}
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

      {/* Audit Logs Dialog */}
      <Dialog open={showAuditLogs} onOpenChange={setShowAuditLogs}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recent Admin Actions</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No audit logs found</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{log.action}</span>
                      <span className="text-muted-foreground"> on {log.resource}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
