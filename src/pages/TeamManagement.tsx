import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Users, Mail, Clock, CheckCircle, XCircle, Send, Search, Filter, RotateCcw } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  department: string;
  designation: string;
  status: string;
  created_at: string;
  expires_at: string;
}

const PREDEFINED_DESIGNATIONS = [
  'Manager',
  'Senior Manager',
  'Team Lead',
  'Senior Developer',
  'Developer',
  'Junior Developer',
  'Sales Executive',
  'Sales Manager',
  'Marketing Executive',
  'HR Executive',
  'Analyst',
  'Senior Analyst',
  'Consultant',
  'Other'
];

const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Support',
  'Product',
  'Design',
  'Other'
];

export default function TeamManagement() {
  const { isAdmin, loading, user } = useAuth();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [filteredInvitations, setFilteredInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'user',
    department: '',
    designation: '',
    customDesignation: '',
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    department: '',
    designation: '',
  });

  // Redirect if not admin
  if (!loading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchInvitations();
  }, []);

  useEffect(() => {
    filterInvitations();
  }, [invitations, searchTerm, statusFilter]);

  const filterInvitations = () => {
    let filtered = invitations;

    if (searchTerm) {
      filtered = filtered.filter(invitation => 
        invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invitation.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invitation.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invitation.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invitation => {
        if (statusFilter === 'expired') {
          return invitation.status === 'pending' && new Date(invitation.expires_at) < new Date();
        }
        return invitation.status === statusFilter;
      });
    }

    setFilteredInvitations(filtered);
  };

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
      setFilteredInvitations(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch team invitations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = { email: '', department: '', designation: '' };
    let isValid = true;

    if (!inviteForm.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(inviteForm.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!inviteForm.department) {
      errors.department = 'Department is required';
      isValid = false;
    }

    if (!inviteForm.designation && !inviteForm.customDesignation) {
      errors.designation = 'Designation is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const sendInvitation = async () => {
    if (!user || !validateForm()) return;

    try {
      // Check if email already exists in invitations
      const { data: existingInvitation } = await supabase
        .from('team_invitations')
        .select('id, status')
        .eq('email', inviteForm.email)
        .eq('status', 'pending')
        .single();

      if (existingInvitation) {
        toast({
          title: 'Error',
          description: 'An invitation is already pending for this email address',
          variant: 'destructive',
        });
        return;
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const finalDesignation = inviteForm.designation === 'Other' 
        ? inviteForm.customDesignation 
        : inviteForm.designation;

      const { error } = await supabase
        .from('team_invitations')
        .insert({
          email: inviteForm.email,
          role: inviteForm.role,
          department: inviteForm.department,
          designation: finalDesignation,
          invited_by: user.id,
          token,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Invitation Sent Successfully!',
        description: `Team invitation sent to ${inviteForm.email} for ${finalDesignation} role`,
      });

      resetForm();
      setIsDialogOpen(false);
      fetchInvitations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setInviteForm({ 
      email: '', 
      role: 'user', 
      department: '', 
      designation: '',
      customDesignation: ''
    });
    setFormErrors({ email: '', department: '', designation: '' });
  };

  const resendInvitation = async (invitationId: string) => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('team_invitations')
        .update({
          expires_at: expiresAt.toISOString(),
          status: 'pending',
        })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: 'Invitation Resent',
        description: 'Team invitation has been resent successfully',
      });

      fetchInvitations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to resend invitation',
        variant: 'destructive',
      });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: 'Invitation Cancelled',
        description: 'Team invitation has been cancelled',
      });

      fetchInvitations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to cancel invitation',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'pending' && isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    const variants = {
      pending: 'secondary',
      accepted: 'default',
      cancelled: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Team Management
          </h1>
        </div>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="h-64 flex items-center justify-center">
              <div className="text-muted-foreground">Loading team data...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Team Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Invite and manage team members
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-glow">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your team with specific role and department.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={inviteForm.email}
                  onChange={(e) => {
                    setInviteForm(prev => ({ ...prev, email: e.target.value }));
                    setFormErrors(prev => ({ ...prev, email: '' }));
                  }}
                  className={formErrors.email ? 'border-destructive' : ''}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={inviteForm.department}
                  onValueChange={(value) => {
                    setInviteForm(prev => ({ ...prev, department: value }));
                    setFormErrors(prev => ({ ...prev, department: '' }));
                  }}
                >
                  <SelectTrigger className={formErrors.department ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.department && (
                  <p className="text-sm text-destructive">{formErrors.department}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Select
                  value={inviteForm.designation}
                  onValueChange={(value) => {
                    setInviteForm(prev => ({ ...prev, designation: value }));
                    setFormErrors(prev => ({ ...prev, designation: '' }));
                  }}
                >
                  <SelectTrigger className={formErrors.designation ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_DESIGNATIONS.map((designation) => (
                      <SelectItem key={designation} value={designation}>{designation}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.designation && (
                  <p className="text-sm text-destructive">{formErrors.designation}</p>
                )}
              </div>
              
              {inviteForm.designation === 'Other' && (
                <div className="space-y-2">
                  <Label htmlFor="customDesignation">Custom Designation *</Label>
                  <Input
                    id="customDesignation"
                    placeholder="Enter custom designation"
                    value={inviteForm.customDesignation}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, customDesignation: e.target.value }))}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="button" onClick={sendInvitation} className="btn-glow">
                <Send className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Total Invitations</p>
              <p className="text-2xl font-bold">{invitations.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold">{invitations.filter(i => i.status === 'pending').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invitations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredInvitations.length} of {invitations.length} invitations
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Invitations
          </CardTitle>
          <CardDescription>
            Manage team invitations and track their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {invitation.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{invitation.role}</Badge>
                  </TableCell>
                  <TableCell>{invitation.department}</TableCell>
                  <TableCell>{invitation.designation}</TableCell>
                  <TableCell>
                    {getStatusBadge(invitation.status, invitation.expires_at)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(invitation.expires_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {invitation.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resendInvitation(invitation.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelInvitation(invitation.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvitations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No invitations match your search criteria'
                        : 'No team invitations found. Start by inviting your first team member!'
                      }
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}