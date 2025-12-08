import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Download, Printer, Eye, Calendar, User, Phone, Mail } from "lucide-react";

const AdminFilePrinting = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [printRequests, setPrintRequests] = useState([
    {
      id: 1,
      requesterName: "Juan Dela Cruz",
      contactNumber: "+63 912 345 6789",
      email: "juan.delacruz@email.com",
      files: [
        { name: "resume.pdf", size: "2.1 MB" },
        { name: "application_letter.doc", size: "1.5 MB" }
      ],
      copies: 2,
      notes: "Please print in A4 paper",
      status: "pending",
      submittedAt: "2024-01-15T10:30:00",
      printedAt: null,
      printedBy: null
    },
    {
      id: 2,
      requesterName: "Maria Santos",
      contactNumber: "+63 998 765 4321",
      email: "maria.santos@email.com",
      files: [
        { name: "birth_certificate.pdf", size: "3.2 MB" }
      ],
      copies: 1,
      notes: "Urgent - for employment application",
      status: "printed",
      submittedAt: "2024-01-14T14:20:00",
      printedAt: "2024-01-15T09:15:00",
      printedBy: "Admin User"
    },
    {
      id: 3,
      requesterName: "Carlos Reyes",
      contactNumber: "+63 905 555 1234",
      email: "carlos.reyes@email.com",
      files: [
        { name: "business_permit.pdf", size: "4.5 MB" },
        { name: "brgy_clearance.pdf", size: "2.8 MB" }
      ],
      copies: 3,
      notes: "",
      status: "ready",
      submittedAt: "2024-01-16T08:45:00",
      printedAt: null,
      printedBy: null
    }
  ]);

  const filteredRequests = printRequests.filter((request) => {
    const matchesSearch =
      request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contactNumber.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ready":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "printed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Pending";
      case "ready": return "Ready for Pickup";
      case "printed": return "Printed";
      default: return status;
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setPrintRequests(prev => prev.map(request => 
      request.id === id ? { 
        ...request, 
        status: newStatus,
        printedAt: newStatus === 'printed' ? new Date().toISOString() : request.printedAt,
        printedBy: newStatus === 'printed' ? 'Current Admin' : request.printedBy
      } : request
    ));
  };

  const handlePrint = (request) => {
    // Simulate printing process
    alert(`Printing ${request.files.length} file(s) for ${request.requesterName}`);
    handleStatusChange(request.id, 'printed');
  };

  const handleDownload = (fileName) => {
    // Simulate file download
    alert(`Downloading ${fileName}`);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Printer className="h-8 w-8 text-primary" />
            <span>Printing Requests</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and process document printing requests from residents
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or contact number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="ready">Ready for Pickup</SelectItem>
            <SelectItem value="printed">Printed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {printRequests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {printRequests.filter(r => r.status === 'ready').length}
            </div>
            <div className="text-sm text-muted-foreground">Ready</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {printRequests.filter(r => r.status === 'printed').length}
            </div>
            <div className="text-sm text-muted-foreground">Printed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {printRequests.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Print Request #{request.id}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted on {new Date(request.submittedAt).toLocaleDateString()}</span>
                  </CardDescription>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusText(request.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Requester Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{request.requesterName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{request.contactNumber}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{request.email}</span>
                </div>
              </div>

              {/* Files */}
              <div className="space-y-2">
                <h4 className="font-medium">Files to Print ({request.files.length})</h4>
                <div className="space-y-2">
                  {request.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">({file.size})</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file.name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Copies:</span> {request.copies}
                </div>
                {request.notes && (
                  <div className="col-span-2">
                    <span className="font-medium">Notes:</span> {request.notes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <Select value={request.status} onValueChange={(value) => handleStatusChange(request.id, value)}>
                    <SelectTrigger className="w-40 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="ready">Ready for Pickup</SelectItem>
                      <SelectItem value="printed">Printed</SelectItem>
                    </SelectContent>
                  </Select>

                  {request.status !== 'printed' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handlePrint(request)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Mark as Printed
                    </Button>
                  )}
                </div>

                <Button variant="outline" size="sm" onClick={() => handleViewDetails(request)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>

              {request.printedAt && (
                <div className="text-xs text-muted-foreground">
                  Printed on {new Date(request.printedAt).toLocaleString()} by {request.printedBy}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Printer className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No printing requests found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No printing requests have been submitted yet"}
          </p>
        </div>
      )}

      {/* Request Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Print Request Details #{selectedRequest.id}
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Requester Information */}
              <div>
                <h3 className="font-semibold mb-3">Requester Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {selectedRequest.requesterName}
                  </div>
                  <div>
                    <span className="font-medium">Contact:</span> {selectedRequest.contactNumber}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedRequest.email}
                  </div>
                  <div>
                    <span className="font-medium">Submitted:</span> {new Date(selectedRequest.submittedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Printing Details */}
              <div>
                <h3 className="font-semibold mb-3">Printing Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Copies:</span> {selectedRequest.copies}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <Badge className={`ml-2 ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusText(selectedRequest.status)}
                    </Badge>
                  </div>
                  {selectedRequest.notes && (
                    <div className="col-span-2">
                      <span className="font-medium">Notes:</span> 
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedRequest.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Files */}
              <div>
                <h3 className="font-semibold mb-3">Files to Print</h3>
                <div className="space-y-2">
                  {selectedRequest.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(file.name)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            alert(`Printing: ${file.name}`);
                            handleStatusChange(selectedRequest.id, 'printed');
                          }}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Actions */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Close
                </Button>
                {selectedRequest.status !== 'printed' && (
                  <Button
                    onClick={() => {
                      handlePrint(selectedRequest);
                      setShowDetails(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Mark All as Printed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFilePrinting;