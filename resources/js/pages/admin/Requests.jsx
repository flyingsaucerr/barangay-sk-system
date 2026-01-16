import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Search, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Eye, 
  X, 
  Loader2, 
  RefreshCw, 
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  FileQuestion,
  Users,
  Shield,
  UserCog,
  AlertTriangle,
  Filter,
  UserCheck,
  UserX
} from "lucide-react";

const API = {
  REQUESTS: '/api/admin/requests',
  REQUEST_STATISTICS: '/api/admin/requests/statistics',
  UPDATE_STATUS: (id) => `/api/admin/requests/${id}/status`,
  GET_REQUEST: (id) => `/api/admin/requests/${id}`,
  GET_STAFF: '/api/admin/staff',
  GET_CURRENT_USER: '/api/user',
};

const AdminRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [requests, setRequests] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // Store user role separately
  const [statistics, setStatistics] = useState({
    total_requests: 0,
    pending_requests: 0,
    in_progress_requests: 0,
    completed_requests: 0,
    requests_by_type: {
      solicitation: 0,
      suggestion: 0,
      change_request: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [assignmentFilter, setAssignmentFilter] = useState("all"); // New filter: all, assigned, unassigned

  const getToken = () => {
    return localStorage.getItem('authToken');
  };

  const isLikelyLoggedIn = () => {
    const token = getToken();
    return !!token;
  };

  const getAuthHeaders = (extra = {}) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...extra
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  // Fetch current user info
  const fetchCurrentUser = async () => {
    setUserLoading(true);
    setUserError(null);
    
    try {
      const response = await fetch(API.GET_CURRENT_USER, {
        headers: getAuthHeaders()
      });

      console.log('Current user response status:', response.status);

      if (response.status === 401) {
        console.warn('User not authenticated');
        setCurrentUser(null);
        setUserError('Not authenticated');
        return;
      }

      if (!response.ok) {
        console.warn('Failed to fetch current user:', response.status);
        setUserError(`HTTP Error: ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log('Current user response data:', data);
      
      if (data && data.success && data.data) {
        setCurrentUser(data.data);
        setUserRole(data.data.role);
      } else if (data && data.id) {
        setCurrentUser(data);
        setUserRole(data.role);
      } else {
        console.warn('Unexpected user data structure:', data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setUserError(`Network error: ${error.message}`);
    } finally {
      setUserLoading(false);
    }
  };

  // Check if current user is admin
  const isAdmin = () => {
    return userRole === 'admin';
  };

  // Check if current user is staff
  const isStaff = () => {
    return userRole === 'staff';
  };

  // Check if user can edit (admin or staff)
  const canEdit = () => {
    return isAdmin() || isStaff();
  };

  // Check if user can see admin notes
  const canSeeAdminNotes = () => {
    return isAdmin() || isStaff();
  };

  // Check if user can see assignment controls
  const canSeeAssignment = () => {
    return isAdmin();
  };

  // Check if user can assign requests
  const canAssignRequests = () => {
    return isAdmin();
  };

  // Fetch all staff users (only for admins)
  const fetchStaffUsers = async () => {
    setStaffLoading(true);
    try {
      const response = await fetch(API.GET_STAFF, {
        headers: getAuthHeaders()
      });

      console.log('Staff users response status:', response.status);

      if (response.status === 403) {
        console.log('User is not authorized to fetch staff users (not admin)');
        setStaffUsers([]);
        return;
      }

      if (!response.ok) {
        console.warn('Failed to fetch staff users:', response.status);
        return;
      }

      const data = await response.json();
      console.log('Staff users data:', data);
      
      if (data && data.success) {
        setStaffUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching staff users:', error);
    } finally {
      setStaffLoading(false);
    }
  };

  // Fetch all requests
  const fetchRequests = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (assignmentFilter !== 'all') params.append('assigned', assignmentFilter);

      const query = params.toString() ? `?${params.toString()}` : '';
      const url = `${API.REQUESTS}${query}`;
      
      const headers = getAuthHeaders();
      const response = await fetch(url, { headers });

      if (response.status === 401) {
        console.warn('Authentication required');
        setRequests([]);
        return;
      }

      if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setRequests([]);
        return;
      }

      const data = await response.json();
      console.log('Requests data:', data);

      if (data && data.success) {
        setRequests(data.data || []);
        // Update user role from response if available
        if (data.user_role && !userRole) {
          setUserRole(data.user_role);
        }
      } else {
        console.warn('API response not successful');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch single request details
  const fetchRequestDetails = async (id) => {
    setDetailLoading(true);
    try {
      const response = await fetch(API.GET_REQUEST(id), {
        headers: getAuthHeaders()
      });

      console.log('Details response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Details error response:', errorText);
        throw new Error(`Failed to fetch request details: ${response.status}`);
      }

      const data = await response.json();
      console.log('Details data:', data);
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error('API response not successful');
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      return null;
    } finally {
      setDetailLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(API.REQUEST_STATISTICS, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        console.warn('Statistics fetch failed');
        return;
      }

      const data = await response.json();
      console.log('Statistics data:', data);
      if (data.success) {
        setStatistics(data.data || {});
        // Update user role from statistics if available
        if (data.data.user_role && !userRole) {
          setUserRole(data.data.user_role);
        }
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Update request - with role-based permissions
  const updateRequest = async (id, updateData) => {
    setUpdating(id);
    try {
      console.log('Updating request:', { id, updateData });
      
      const response = await fetch(API.UPDATE_STATUS(id), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update failed with response:', errorData);
        throw new Error(`Failed to update request: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('Update success data:', data);
      
      if (data.success) {
        // Refresh the list
        fetchRequests();
        fetchStatistics();
        
        // Update the selected request if it's open
        if (selectedRequest && selectedRequest.id === id) {
          const updatedDetails = await fetchRequestDetails(id);
          if (updatedDetails) {
            setSelectedRequest(updatedDetails);
          }
        }
        
        return { success: true, message: 'Request updated successfully' };
      } else {
        return { success: false, message: data.message || 'Failed to update request' };
      }
    } catch (error) {
      console.error('Error updating request:', error);
      return { success: false, message: `Failed to update request: ${error.message}` };
    } finally {
      setUpdating(null);
    }
  };

  // Update request status (available for admin and staff)
  const updateStatus = async (id, status) => {
    if (!canEdit()) {
      alert('You do not have permission to update status');
      return;
    }
    
    const result = await updateRequest(id, { status });
    if (result.success) {
      alert('Status updated successfully');
    } else {
      alert(result.message);
    }
  };

  // Update admin notes (admin only, but staff can view)
  const updateNotes = async (id, notes) => {
    if (!isAdmin()) {
      alert('Only admins can update notes');
      return;
    }
    
    const result = await updateRequest(id, { notes });
    if (result.success) {
      alert('Notes updated successfully');
    } else {
      alert(result.message);
    }
  };

  // Assign request (admin only)
  const assignRequest = async (id, assigned_to) => {
    if (!isAdmin()) {
      alert('Only admins can assign requests');
      return;
    }
    
    const result = await updateRequest(id, { assigned_to });
    if (result.success) {
      alert('Request assigned successfully');
    } else {
      alert(result.message);
    }
  };

  // Handle view details
  const handleViewDetails = async (request) => {
    console.log('Viewing details for request:', request);
    setSelectedRequest(request);
    setShowDetails(true);
    
    // Fetch full details in background
    const fullDetails = await fetchRequestDetails(request.id);
    if (fullDetails) {
      setSelectedRequest(fullDetails);
    }
  };

  // Close details modal
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedRequest(null);
  };

  // Manual refresh
  const handleRefresh = () => {
    fetchRequests(true);
    fetchStatistics();
  };

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      if (isLikelyLoggedIn()) {
        await fetchCurrentUser();
        fetchRequests();
        fetchStatistics();
        fetchStaffUsers();
      }
    };

    initialize();
  }, []);

  // Load data when filters change
  useEffect(() => {
    if (isLikelyLoggedIn()) {
      fetchRequests();
      fetchStatistics();
    }
  }, [searchTerm, statusFilter, typeFilter, assignmentFilter]);

  // Debug user state
  useEffect(() => {
    console.log('User state updated:', {
      userRole,
      isAdmin: isAdmin(),
      isStaff: isStaff(),
      canEdit: canEdit(),
      canSeeAdminNotes: canSeeAdminNotes(),
      canAssignRequests: canAssignRequests()
    });
  }, [userRole]);

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return Clock;
      case "in_progress":
        return AlertCircle;
      case "completed":
        return CheckCircle;
      case "rejected":
        return AlertCircle;
      default:
        return FileQuestion;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Pending";
      case "in_progress": return "In Progress";
      case "completed": return "Completed";
      case "rejected": return "Rejected";
      default: return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case "solicitation": return "Solicitation";
      case "suggestion": return "Suggestion";
      case "change_request": return "Change Request";
      default: return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "solicitation": return "bg-purple-100 text-purple-800 border-purple-200";
      case "suggestion": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "change_request": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUserRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-100 text-red-800 border-red-200"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case "staff":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><UserCog className="h-3 w-3 mr-1" />Staff</Badge>;
      case "resident":
        return <Badge className="bg-green-100 text-green-800 border-green-200"><User className="h-3 w-3 mr-1" />Resident</Badge>;
      default:
        return <Badge variant="outline">{role || 'Unknown'}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get filtered requests based on assignment
  const getFilteredRequests = () => {
    let filtered = [...requests];
    
    // Staff can only see their assigned requests (handled by backend)
    // Additional frontend filtering for assignment status (admin only)
    if (isAdmin() && assignmentFilter !== 'all') {
      if (assignmentFilter === 'assigned') {
        filtered = filtered.filter(req => req.assigned_to);
      } else if (assignmentFilter === 'unassigned') {
        filtered = filtered.filter(req => !req.assigned_to);
      }
    }
    
    return filtered;
  };

  const filteredRequests = getFilteredRequests();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header with user info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <span>
              {isStaff() ? 'My Assigned Requests' : 'Manage Requests'}
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {isStaff() 
              ? 'View and manage requests assigned to you' 
              : 'Review and manage community requests, suggestions, and solicitations'
            }
          </p>
          {userRole && (
            <div className="flex items-center gap-2 mt-2">
              {getUserRoleBadge(userRole)}
              <span className="text-sm text-gray-600">
                {isStaff() ? `Assigned to you: ${statistics.total_requests} requests` : ''}
              </span>
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleRefresh}
          variant="outline"
          disabled={refreshing || loading}
          className="flex items-center gap-2"
        >
          {refreshing || loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {refreshing || loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={
              isStaff() 
                ? "Search your assigned requests..." 
                : "Search requests by title, description, or contact name..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Request Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="solicitation">Solicitation</SelectItem>
            <SelectItem value="suggestion">Suggestion</SelectItem>
            <SelectItem value="change_request">Change Request</SelectItem>
          </SelectContent>
        </Select>

        {/* Assignment filter (admin only) */}
        {isAdmin() && (
          <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Assignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="assigned">Assigned Only</SelectItem>
              <SelectItem value="unassigned">Unassigned Only</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Statistics with role-based info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {statistics.total_requests}
            </div>
            <div className="text-sm text-muted-foreground">
              {isStaff() ? 'My Requests' : 'Total Requests'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {statistics.in_progress_requests}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {statistics.completed_requests}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {statistics.pending_requests}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Role-based information banner */}
      {isStaff() && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Staff View:</strong> You can only see requests assigned to you. 
                You can view admin notes but only admins can edit them.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login reminder */}
      {!isLikelyLoggedIn() && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Authentication Required
            </h3>
            <p className="text-yellow-700 mb-4">
              Please log in to view and manage requests
            </p>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRequests.map((request) => {
            const StatusIcon = getStatusIcon(request.status);
            const isAssignedToCurrentStaff = isStaff() && request.assigned_to === currentUser?.id;
            
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1 mr-4">
                      <CardTitle className="text-lg line-clamp-1">
                        {request.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">{formatDateShort(request.created_at)}</span>
                        {isStaff() && isAssignedToCurrentStaff && (
                          <Badge variant="outline" className="text-xs">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Assigned to you
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getTypeColor(request.request_type)}>
                        {getTypeText(request.request_type)}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {getStatusText(request.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Basic contact info - minimal */}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{request.contact_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{request.contact_number}</span>
                    </div>
                  </div>

                  {/* Short preview of description */}
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {request.description}
                  </div>

                  {/* Assignment info for admin */}
                  {isAdmin() && request.assigned_user && (
                    <div className="flex items-center gap-2 text-sm">
                      <UserCog className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Assigned to: <strong>{request.assigned_user.name}</strong>
                      </span>
                    </div>
                  )}

                  {/* Quick actions */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-gray-500">
                      ID: {request.id}
                      {isAdmin() && !request.assigned_to && (
                        <span className="ml-2 text-yellow-600">
                          <UserX className="h-3 w-3 inline mr-1" />
                          Unassigned
                        </span>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewDetails(request)}
                      disabled={updating === request.id || !isLikelyLoggedIn()}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredRequests.length === 0 && !loading && isLikelyLoggedIn() && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No requests found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" || typeFilter !== "all" || assignmentFilter !== "all"
              ? "Try adjusting your search or filters"
              : isStaff() 
                ? "No requests have been assigned to you yet"
                : "No requests have been submitted yet"}
          </p>
        </div>
      )}

      {/* Floating Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={handleCloseDetails}
          />
          
          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedRequest.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Request ID: {selectedRequest.id}
                      {isStaff() && (
                        <span className="ml-2 text-blue-600">
                          <UserCheck className="h-3 w-3 inline mr-1" />
                          Assigned to you
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={detailLoading || updating === selectedRequest.id}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                {detailLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p className="text-gray-500">Loading request details...</p>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {/* Status and Type Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`text-sm px-3 py-1 ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusText(selectedRequest.status)}
                      </Badge>
                      <Badge className={`text-sm px-3 py-1 ${getTypeColor(selectedRequest.request_type)}`}>
                        {getTypeText(selectedRequest.request_type)}
                      </Badge>
                      {selectedRequest.assigned_user && (
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          <UserCog className="h-3 w-3 mr-1" />
                          Assigned to: {selectedRequest.assigned_user.name}
                        </Badge>
                      )}
                      {isStaff() && selectedRequest.assigned_to === currentUser?.id && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm px-3 py-1">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Your Responsibility
                        </Badge>
                      )}
                    </div>

                    {/* Grid Layout for Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Contact Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">{selectedRequest.contact_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Contact Number</p>
                            <p className="font-medium">{selectedRequest.contact_number}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium">{selectedRequest.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Request Information */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Request Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Submitted Date</p>
                            <p className="font-medium">{formatDate(selectedRequest.created_at)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Last Updated</p>
                            <p className="font-medium">{formatDate(selectedRequest.updated_at)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Current Status</p>
                            <p className="font-medium">{getStatusText(selectedRequest.status)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Full Description */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Request Description
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-line">
                          {selectedRequest.description}
                        </p>
                      </div>
                    </div>

                    {/* Admin Notes - Viewable by both admin and staff, editable only by admin */}
                    {(canSeeAdminNotes() && (selectedRequest.notes || isAdmin())) && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Admin Notes
                          {isStaff() && (
                            <span className="text-sm text-gray-500">(View Only)</span>
                          )}
                        </h3>
                        {isAdmin() ? (
                          <>
                            <Textarea
                              value={selectedRequest.notes || ''}
                              onChange={(e) => {
                                setSelectedRequest({...selectedRequest, notes: e.target.value});
                              }}
                              onBlur={() => {
                                if (selectedRequest.notes !== (selectedRequest.originalNotes || '')) {
                                  updateNotes(selectedRequest.id, selectedRequest.notes || '');
                                }
                              }}
                              rows="4"
                              className="w-full"
                              placeholder="Add notes or comments about this request..."
                              disabled={updating === selectedRequest.id}
                            />
                            {selectedRequest.notes && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-yellow-800 text-sm whitespace-pre-line">
                                  {selectedRequest.notes}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          // Staff view (read-only)
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            {selectedRequest.notes ? (
                              <p className="text-yellow-800 text-sm whitespace-pre-line">
                                {selectedRequest.notes}
                              </p>
                            ) : (
                              <p className="text-yellow-600 text-sm italic">
                                No admin notes for this request.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Management Actions */}
                    {canEdit() && (
                      <div className="space-y-4 border-t pt-6">
                        <h3 className="font-semibold text-lg">Manage Request</h3>
                        
                        <div className={`grid ${canAssignRequests() ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                          {/* Status Update (Available for admin and staff) */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Update Status
                            </label>
                            <Select 
                              value={selectedRequest.status} 
                              onValueChange={(value) => updateStatus(selectedRequest.id, value)}
                              disabled={updating === selectedRequest.id}
                            >
                              <SelectTrigger>
                                {updating === selectedRequest.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Pending</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="in_progress">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>In Progress</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="completed">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Completed</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="rejected">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Rejected</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Assignment - Show only for admins */}
                          {canAssignRequests() && (
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Assign To
                              </label>
                              {staffLoading ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="text-sm text-gray-500">Loading staff...</span>
                                </div>
                              ) : (
                                <Select 
                                  value={selectedRequest.assigned_to?.toString() || "unassigned"} 
                                  onValueChange={(value) => {
                                    const assignedValue = value === "unassigned" ? null : parseInt(value);
                                    assignRequest(selectedRequest.id, assignedValue);
                                  }}
                                  disabled={updating === selectedRequest.id}
                                >
                                  <SelectTrigger>
                                    {updating === selectedRequest.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <SelectValue placeholder="Select staff member" />
                                    )}
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {staffUsers.map((staff) => (
                                      <SelectItem key={staff.id} value={staff.id.toString()}>
                                        <div className="flex items-center gap-2">
                                          <User className="h-4 w-4" />
                                          <span>{staff.name} ({staff.role})</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Created: {formatDate(selectedRequest?.created_at)}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleCloseDetails}
                      disabled={updating === selectedRequest?.id}
                    >
                      Close
                    </Button>
                    {isLikelyLoggedIn() && (
                      <Button
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                      >
                        {refreshing || loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Refresh
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;