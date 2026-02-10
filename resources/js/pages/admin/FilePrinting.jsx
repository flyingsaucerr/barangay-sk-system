import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Download, Eye, Trash2, Calendar, User, Phone, Mail, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

const AdminPrintingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    ready: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusIcons = {
    pending: Clock,
    processing: AlertCircle,
    ready: CheckCircle,
    completed: CheckCircle,
    cancelled: AlertCircle,
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

const fetchRequests = async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (statusFilter !== 'all') params.append('status', statusFilter);

    console.log('Fetching from:', `/api/admin/printing?${params}`);
    
    const response = await fetch(`/api/admin/printing?${params}`, {
      headers: getAuthHeaders()
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Full API response:', data);
      
      if (data.success) {
        // Check the structure
        console.log('Data structure:', {
          hasData: !!data.data,
          isArray: Array.isArray(data.data),
          firstItem: data.data && data.data[0] ? data.data[0] : 'none',
          firstItemFiles: data.data && data.data[0] ? data.data[0].files : 'none'
        });
        
        // Handle the data
        const requestsData = Array.isArray(data.data) ? data.data : [];
        console.log('Setting requests:', requestsData);
        setRequests(requestsData);
      }
    } else {
      console.error('Failed to fetch:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Error fetching requests:', error);
  } finally {
    setLoading(false);
  }
};

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/admin/printing/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchRequests();
          if (selectedRequest?.id === id) {
            setSelectedRequest(data.data);
          }
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteRequest = async (id) => {
    if (!confirm('Are you sure you want to delete this printing request?')) return;
    
    try {
      const response = await fetch(`/api/admin/printing/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchRequests();
          if (selectedRequest?.id === id) {
            setShowDetails(false);
            setSelectedRequest(null);
          }
        }
      }
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

const testFileDownload = async (requestId, file) => {
  console.log('=== FILE DOWNLOAD DEBUG ===');
  console.log('Request ID:', requestId);
  console.log('File object:', file);
  
  if (!file || !file.filename) {
    console.error('Invalid file object');
    return;
  }
  
  // Test direct URL first
  if (file.path) {
    const url = `/storage/${file.path}`;
    console.log('Direct URL:', url);
    
    // Test with fetch
    try {
      const test = await fetch(url, { method: 'HEAD' });
      console.log('Direct URL test:', {
        ok: test.ok,
        status: test.status,
        statusText: test.statusText
      });
    } catch (error) {
      console.error('Direct URL fetch error:', error);
    }
  }
  
  // Test API endpoint
  const apiUrl = `/api/admin/printing/${requestId}/download/${file.filename}`;
  console.log('API URL:', apiUrl);
  
  try {
    const test = await fetch(apiUrl, { method: 'HEAD', headers: getAuthHeaders() });
    console.log('API URL test:', {
      ok: test.ok,
      status: test.status,
      statusText: test.statusText,
      contentType: test.headers.get('content-type'),
      contentLength: test.headers.get('content-length')
    });
  } catch (error) {
    console.error('API URL fetch error:', error);
  }
  
  console.log('=== END DEBUG ===');
};

// Then call this in your download handler before attempting download



const handleDownloadFile = async (requestId, file) => {
  console.log('Downloading file:', file);
  
  if (!file || !file.filename) {
    console.error('File is undefined or missing filename');
    alert('File information is missing');
    return;
  }
  
  try {
    console.log('File details:', {
      filename: file.filename,
      original_name: file.original_name,
      path: file.path,
      size: file.size
    });
    
    // Always use the API endpoint - don't try direct URL
    console.log('Using API download endpoint');
    const response = await fetch(`/api/admin/printing/${requestId}/download/${file.filename}`, {
      headers: getAuthHeaders()
    });
    
    console.log('Download response status:', response.status);
    console.log('Download response headers:', {
      contentType: response.headers.get('content-type'),
      contentDisposition: response.headers.get('content-disposition'),
      contentLength: response.headers.get('content-length')
    });
    
    if (response.ok) {
      // Check if response is JSON (error) or a file
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        // It's an error response
        const errorData = await response.json();
        console.error('Download API returned JSON error:', errorData);
        alert(`Download failed: ${errorData.message || 'Unknown error'}`);
        return;
      }
      
      // Get filename from content-disposition header or use original name
      const contentDisposition = response.headers.get('content-disposition');
      let filename = file.original_name || file.filename || 'download';
      
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename\*?=["']?([^"';]+)["']?/);
        if (matches && matches[1]) {
          filename = decodeURIComponent(matches[1]);
        } else {
          const simpleMatches = contentDisposition.match(/filename=["']?([^"';]+)["']?/);
          if (simpleMatches && simpleMatches[1]) {
            filename = simpleMatches[1];
          }
        }
      }
      
      console.log('Downloading as filename:', filename);
      
      // Get the blob
      const blob = await response.blob();
      console.log('Blob created:', {
        size: blob.size,
        type: blob.type,
        blobUrl: URL.createObjectURL(blob).substring(0, 50) + '...'
      });
      
      // Check if blob is valid
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty (0 bytes)');
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      
      // Trigger download
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
    } else {
      // Handle HTTP errors
      let errorMessage = `Download failed: ${response.status} ${response.statusText}`;
      try {
        const errorText = await response.text();
        console.error('Download failed with response:', errorText);
        
        // Try to parse as JSON
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage += ` - ${errorText}`;
        }
      } catch (e) {
        console.error('Error reading error response:', e);
      }
      
      alert(errorMessage);
    }
    
  } catch (error) {
    console.error('Download error:', error);
    alert('Error downloading file: ' + error.message);
  }
};

  useEffect(() => {
    fetchRequests();
  }, [searchTerm, statusFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Safely get files array
  const getFiles = (request) => {
    if (!request.files) return [];
    if (Array.isArray(request.files)) return request.files;
    try {
      return JSON.parse(request.files) || [];
    } catch {
      return [];
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const mb = bytes / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Printing Requests</h1>
          <p className="text-muted-foreground">Manage document printing requests from residents</p>
        </div>
        <Button onClick={fetchRequests} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{requests.length}</div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {requests.filter(r => r.status === 'ready' || r.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Ready/Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {requests.reduce((total, r) => total + (getFiles(r).length || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Files</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by tracking number, name, or contact..."
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
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading requests...</p>
        </div>
      ) : requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((request) => {
            const StatusIcon = statusIcons[request.status] || Clock;
            const files = getFiles(request);
            
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[request.status]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                        <span className="font-mono text-sm font-semibold">
                          {request.tracking_number}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{request.requester_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{request.contact_number}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(request.submitted_at)}</span>
                        </div>
                        {files.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{files.length} file(s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteRequest(request.id)}
                        disabled={ !['pending', 'cancelled'].includes(request.status) }
                        title={ !['pending', 'cancelled'].includes(request.status)
                                  ? "Cannot delete requests that are Processing, Ready, or Completed"
                                  : "" }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No printing requests found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search terms or filters'
              : 'No printing requests have been submitted yet'}
          </p>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold">Printing Request Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Requester Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedRequest.requester_name}</p>
                    <p><span className="font-medium">Contact:</span> {selectedRequest.contact_number}</p>
                    {selectedRequest.email && (
                      <p><span className="font-medium">Email:</span> {selectedRequest.email}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Request Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Tracking:</span> 
                      <span className="font-mono ml-2">{selectedRequest.tracking_number}</span>
                    </p>
                    <p><span className="font-medium">Copies:</span> {selectedRequest.copies || 1}</p>
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${statusColors[selectedRequest.status]}`}>
                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Submitted:</span> {formatDate(selectedRequest.submitted_at)}</p>
                    {selectedRequest.processed_at && (
                      <p><span className="font-medium">Processed:</span> {formatDate(selectedRequest.processed_at)}</p>
                    )}
                    {selectedRequest.ready_at && (
                      <p><span className="font-medium">Ready:</span> {formatDate(selectedRequest.ready_at)}</p>
                    )}
                    {selectedRequest.completed_at && (
                      <p><span className="font-medium">Completed:</span> {formatDate(selectedRequest.completed_at)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Files Section */}
              {(() => {
                const files = getFiles(selectedRequest);
                if (files.length > 0) {
                  return (
                    <div>
                      <h3 className="font-semibold mb-3">Files to Print ({files.length})</h3>
                      <div className="space-y-3">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{file.original_name || file.filename || `File ${index + 1}`}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatFileSize(file.size)} • {file.mime_type || file.type || 'Unknown type'}
                                </p>
                                {file.uploaded_at && (
                                  <p className="text-xs text-muted-foreground">
                                    Uploaded: {formatDate(file.uploaded_at)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadFile(selectedRequest.id, file)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="text-center py-4">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No files attached to this request</p>
                  </div>
                );
              })()}

              {/* Notes */}
              {(selectedRequest.notes || selectedRequest.admin_notes) && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  {selectedRequest.notes && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Requester Notes:</p>
                      <div className="p-3 bg-gray-50 rounded border">
                        {selectedRequest.notes}
                      </div>
                    </div>
                  )}
                  {selectedRequest.admin_notes && (
                    <div>
                      <p className="text-sm font-medium mb-1">Admin Notes:</p>
                      <div className="p-3 bg-blue-50 rounded border">
                        {selectedRequest.admin_notes}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Actions */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    // Define allowed transitions
                    const allowedTransitions = {
                      pending: ['pending', 'processing', 'ready', 'completed', 'cancelled'], // can go anywhere
                      processing: ['processing', 'ready', 'completed', 'cancelled'],         // cannot go back to pending
                      ready: ['ready', 'completed', 'processing'],                           // cannot cancel
                      completed: ['completed'],                                              // cannot change
                      cancelled: ['cancelled'],                                              // cannot change
                    };
                    const currentStatus = selectedRequest.status;

                    return ['pending', 'processing', 'ready', 'completed', 'cancelled'].map((status) => {
                      const isAllowed = allowedTransitions[currentStatus].includes(status);

                      return (
                        <Button
                          key={status}
                          variant={currentStatus === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateStatus(selectedRequest.id, status)}
                          disabled={!isAllowed || currentStatus === status}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowDetails(false);
                    deleteRequest(selectedRequest.id);
                  }}
                  disabled={ !['pending', 'cancelled'].includes(selectedRequest.status) }
                  title={ !['pending', 'cancelled'].includes(selectedRequest.status) 
                            ? "Cannot delete requests that are Processing, Ready, or Completed" 
                            : "" }
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrintingRequests;