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
  FileQuestion
} from "lucide-react";

const API = {
  REQUESTS: '/api/admin/requests',
  REQUEST_STATISTICS: '/api/admin/requests/statistics',
  UPDATE_STATUS: (id) => `/api/admin/requests/${id}/status`,
  GET_REQUEST: (id) => `/api/admin/requests/${id}`,
  CHECK_AUTH: '/api/check-auth'
};

const AdminRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [requests, setRequests] = useState([]);
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
  const [authChecked, setAuthChecked] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const getToken = () => {
    return localStorage.getItem('authToken');
  };

  const isLikelyLoggedIn = () => {
    const token = getToken();
    return !!token;
  };

  const checkAuthentication = async () => {
    const token = getToken();
    
    if (!token) {
      setAuthChecked(true);
      return false;
    }

    try {
      const response = await fetch(API.CHECK_AUTH, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setAuthChecked(true);
        return true;
      } else {
        setAuthChecked(true);
        return false;
      }
    } catch (error) {
      setAuthChecked(true);
      return false;
    }
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
        console.error('HTTP error:', response.status);
        setRequests([]);
        return;
      }

      const data = await response.json();

      if (data && data.success) {
        setRequests(data.data || []);
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

      if (!response.ok) {
        throw new Error(`Failed to fetch request details: ${response.status}`);
      }

      const data = await response.json();
      
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
      if (data.success) {
        setStatistics(data.data || {});
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Update request status
  const updateRequestStatus = async (id, statusData) => {
    setUpdating(id);
    try {
      const response = await fetch(API.UPDATE_STATUS(id), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(statusData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update request`);
      }

      const data = await response.json();
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
      } else {
        alert(data.message || 'Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request');
    } finally {
      setUpdating(null);
    }
  };

  // Handle view details
  const handleViewDetails = async (request) => {
    setSelectedRequest(request); // Show basic info immediately
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
        await checkAuthentication();
        fetchRequests();
        fetchStatistics();
      } else {
        setAuthChecked(true);
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
  }, [searchTerm, statusFilter, typeFilter]);

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

  // Show loading while checking auth
  if (!authChecked && isLikelyLoggedIn()) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <span>Manage Requests</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and manage community requests, suggestions, and solicitations
          </p>
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
            placeholder="Search requests by title, description, or contact name..."
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
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {statistics.pending_requests}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
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
              {statistics.total_requests}
            </div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </CardContent>
        </Card>
      </div>

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
          {requests.map((request) => {
            const StatusIcon = getStatusIcon(request.status);
            
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

                  {/* Quick actions */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-gray-500">
                      ID: {request.id}
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

      {requests.length === 0 && !loading && isLikelyLoggedIn() && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No requests found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No requests have been submitted yet"}
          </p>
        </div>
      )}

      {/* Floating Details Modal */}
      {showDetails && (
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
                      {selectedRequest?.title || 'Request Details'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Request ID: {selectedRequest?.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={detailLoading || updating === selectedRequest?.id}
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
                ) : selectedRequest ? (
                  <div className="p-6 space-y-6">
                    {/* Status and Type Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`text-sm px-3 py-1 ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusText(selectedRequest.status)}
                      </Badge>
                      <Badge className={`text-sm px-3 py-1 ${getTypeColor(selectedRequest.request_type)}`}>
                        {getTypeText(selectedRequest.request_type)}
                      </Badge>
                      {selectedRequest.assignedUser && (
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          Assigned to: {selectedRequest.assignedUser.name}
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
                            <p className="text-sm text-gray-500">Status Updated</p>
                            <p className="font-medium">
                              {selectedRequest.status_updated_at 
                                ? formatDate(selectedRequest.status_updated_at)
                                : 'N/A'}
                            </p>
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

                    {/* Admin Notes */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Admin Notes</h3>
                      <Textarea
                        value={selectedRequest.notes || ''}
                        onChange={(e) => {
                          setSelectedRequest({...selectedRequest, notes: e.target.value});
                        }}
                        onBlur={() => updateRequestStatus(selectedRequest.id, { 
                          notes: selectedRequest.notes 
                        })}
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
                    </div>

                    {/* Management Actions */}
                    {isLikelyLoggedIn() && (
                      <div className="space-y-4 border-t pt-6">
                        <h3 className="font-semibold text-lg">Manage Request</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Status Update */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Update Status
                            </label>
                            <Select 
                              value={selectedRequest.status} 
                              onValueChange={(value) => updateRequestStatus(selectedRequest.id, { 
                                status: value 
                              })}
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

                          {/* Assignment */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Assign To
                            </label>
                            <Select 
                              value={selectedRequest.assigned_to || ''} 
                              onValueChange={(value) => updateRequestStatus(selectedRequest.id, { 
                                assigned_to: value 
                              })}
                              disabled={updating === selectedRequest.id}
                            >
                              <SelectTrigger>
                                {updating === selectedRequest.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <SelectValue placeholder="Unassigned" />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Unassigned</SelectItem>
                                <SelectItem value="1">Admin User 1</SelectItem>
                                <SelectItem value="2">Admin User 2</SelectItem>
                                <SelectItem value="3">Admin User 3</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Request details not available
                    </h3>
                    <p className="text-gray-500">
                      Unable to load request details. Please try again.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {selectedRequest && (
                      <>
                        Created: {formatDate(selectedRequest.created_at)}
                      </>
                    )}
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
                        Refresh Data
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