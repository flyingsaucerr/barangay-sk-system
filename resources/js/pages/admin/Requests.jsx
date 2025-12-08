import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Calendar, User, Phone, MapPin, Eye, X, Loader2, RefreshCw } from "lucide-react";

const API = {
  REQUESTS: '/api/admin/requests',
  REQUEST_STATISTICS: '/api/admin/requests/statistics',
  UPDATE_STATUS: (id) => `/api/admin/requests/${id}/status`,
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
      console.log('No authentication token found');
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
        const data = await response.json();
        console.log('Authentication valid');
        setAuthChecked(true);
        return true;
      } else {
        console.warn('Auth check failed');
        setAuthChecked(true);
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthChecked(true);
      return false;
    }
  };

  // Helper: authorization header
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

  // Fetch requests from API
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
        fetchRequests();
        fetchStatistics();
        
        setRequests(prev => prev.map(request => 
          request.id === id ? data.data : request
        ));
        
        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest(data.data);
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

  // Manual refresh
  const handleRefresh = () => {
    fetchRequests(true);
    fetchStatistics();
  };

  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      if (isLikelyLoggedIn()) {
        fetchRequests();
        fetchStatistics();
        checkAuthentication();
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

  const handleStatusChange = (id, newStatus) => {
    updateRequestStatus(id, { status: newStatus });
  };

  const handleAddNote = (id, note) => {
    updateRequestStatus(id, { notes: note });
  };

  const handleAssignTo = (id, assignedTo) => {
    updateRequestStatus(id, { assigned_to: assignedTo });
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search requests..."
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
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {request.title}
                      <Badge variant="outline">{getTypeText(request.request_type)}</Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted on {formatDate(request.created_at)}</span>
                    </CardDescription>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusText(request.status)}
                    </Badge>
                    {request.assigned_user && (
                      <Badge variant="secondary">
                        Assigned to: {request.assigned_user.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{request.contact_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{request.contact_number}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{request.address}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Request Details:</h4>
                  <p className="text-muted-foreground text-sm line-clamp-2">{request.description}</p>
                </div>

                {request.notes && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Admin Notes:</h4>
                    <p className="text-muted-foreground text-sm italic bg-yellow-50 p-2 rounded">
                      {request.notes}
                    </p>
                  </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Select 
                      value={request.status} 
                      onValueChange={(value) => handleStatusChange(request.id, value)}
                      disabled={updating === request.id || !isLikelyLoggedIn()}
                    >
                      <SelectTrigger className="w-32 text-xs">
                        {updating === request.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewDetails(request)}
                    disabled={updating === request.id || !isLikelyLoggedIn()}
                  >
                    {updating === request.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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

      {/* Request Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.title}</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={updating === selectedRequest.id}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{selectedRequest.contact_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{selectedRequest.contact_number}</span>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{selectedRequest.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Submitted: {formatDate(selectedRequest.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    Status: {getStatusText(selectedRequest.status)}
                  </Badge>
                </div>
              </div>

              {/* Request Type */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">
                  Request Type: {getTypeText(selectedRequest.request_type)}
                </p>
              </div>

              {/* Full Description */}
              <div>
                <h3 className="font-semibold mb-2">Request Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{selectedRequest.description}</p>
                </div>
              </div>

              {/* Admin Actions */}
              {isLikelyLoggedIn() && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Manage Request</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <Select 
                        value={selectedRequest.status} 
                        onValueChange={(value) => handleStatusChange(selectedRequest.id, { status: value })}
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
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned To
                      </label>
                      <Select 
                        value={selectedRequest.assigned_to || ''} 
                        onValueChange={(value) => handleAssignTo(selectedRequest.id, { assigned_to: value })}
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
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes
                    </label>
                    <Textarea
                      value={selectedRequest.notes || ''}
                      onChange={(e) => {
                        setSelectedRequest({...selectedRequest, notes: e.target.value});
                      }}
                      onBlur={() => handleAddNote(selectedRequest.id, selectedRequest.notes)}
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Add notes or comments about this request..."
                      disabled={updating === selectedRequest.id}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  disabled={updating === selectedRequest.id}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;