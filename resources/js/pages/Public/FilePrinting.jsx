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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Trash2, AlertCircle, CheckCircle, Search, X } from "lucide-react";
import { toast } from "sonner";

const FilePrinting = () => {
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState("");
  const [copies, setCopies] = useState(1);
  const [requesterName, setRequesterName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Status check state
  const [showStatusCheck, setShowStatusCheck] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [statusContactInfo, setStatusContactInfo] = useState("");
  const [statusData, setStatusData] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Validate file size (10MB max)
    const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Some files exceed 10MB limit");
      return;
    }
    
    // Validate total files (max 10)
    if (files.length + newFiles.length > 10) {
      toast.error("Maximum 10 files allowed per request");
      return;
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (files.length === 0) {
    toast.error("Please select at least one file to print");
    return;
  }
  if (!requesterName.trim()) {
    toast.error("Please provide your name");
    return;
  }
  if (!contactInfo.trim()) {
    toast.error("Please provide your contact information");
    return;
  }

  setSubmitting(true);

  try {
    // Use FormData to send everything
    const formData = new FormData();
    
    // Add text fields
    formData.append('requester_name', requesterName);
    formData.append('contact_number', contactInfo);
    formData.append('copies', copies.toString());
    if (email) formData.append('email', email);
    if (notes) formData.append('notes', notes);
    
    // Add files
    files.forEach(file => {
      formData.append('files[]', file);
    });

    // Use the existing endpoint
    const response = await fetch('/api/printing/submit', {
      method: 'POST',
      body: formData, // Don't set Content-Type header for FormData
    });

    const data = await response.json();
    
    if (data.success) {
      toast.success(
        <div className="space-y-2">
          <div className="font-semibold">Printing request submitted successfully!</div>
          <div className="text-sm">Tracking Number: <span className="font-mono font-bold">{data.tracking_number}</span></div>
          <div className="text-sm">Save this number to check your request status.</div>
        </div>
      );

      // Reset form
      setFiles([]);
      setNotes("");
      setCopies(1);
      setRequesterName("");
      setContactInfo("");
      setEmail("");

      const fileInput = document.getElementById("file-input");
      if (fileInput) fileInput.value = "";
      
      // Show the status check section
      setTrackingNumber(data.tracking_number);
      setStatusContactInfo(contactInfo);
      setShowStatusCheck(true);
    } else {
      toast.error(data.message || 'Failed to submit printing request');
      if (data.errors) {
        Object.values(data.errors).flat().forEach(error => {
          toast.error(error);
        });
      }
    }
  } catch (error) {
    console.error('Submission error:', error);
    toast.error('Failed to submit printing request. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    
    if (!trackingNumber.trim() || !statusContactInfo.trim()) {
      toast.error("Please provide both tracking number and contact number");
      return;
    }

    setCheckingStatus(true);

    try {
      const response = await fetch('/api/printing/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          contact_number: statusContactInfo
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStatusData(data.data);
        toast.success("Status retrieved successfully");
      } else {
        setStatusData(null);
        toast.error(data.message || 'Failed to check status');
      }
    } catch (error) {
      console.error('Status check error:', error);
      toast.error('Failed to check status. Please try again.');
      setStatusData(null);
    } finally {
      setCheckingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'processing': return 'Processing';
      case 'ready': return 'Ready for Pickup';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Free Document Printing Service
          </h1>
          <p className="text-muted-foreground">
            Submit your documents for free printing. We'll notify you when they're ready for pickup at the barangay office.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Important Notice */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-yellow-800">Important Notice</h3>
                    <p className="text-yellow-700 text-sm">
                      <strong>Only one print attempt will be made per file.</strong> Please ensure your documents are 
                      correctly formatted and contain no errors before submission. We cannot re-print files due to 
                      formatting issues or mistakes in the content.
                    </p>
                    <div className="text-yellow-600 text-xs space-y-1">
                      <p>• Double-check spelling, formatting, and content</p>
                      <p>• Ensure proper page layout and margins</p>
                      <p>• Verify all information is correct and complete</p>
                      <p>• No re-prints will be provided for user errors</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Check Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Check Printing Status
                </CardTitle>
                <CardDescription>
                  Enter your tracking number and contact number to check your request status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckStatus} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="trackingNumber">Tracking Number</Label>
                      <Input
                        id="trackingNumber"
                        type="text"
                        placeholder="e.g. PRINT-202412-ABCD1234"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="statusContact">Contact Number</Label>
                      <Input
                        id="statusContact"
                        type="tel"
                        placeholder="Your registered contact number"
                        value={statusContactInfo}
                        onChange={(e) => setStatusContactInfo(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={checkingStatus}>
                    {checkingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Checking...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Check Status
                      </>
                    )}
                  </Button>
                </form>

                {/* Status Results */}
                {statusData && (
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">Printing Request Status</h3>
                        <p className="text-sm text-muted-foreground">
                          Tracking: <span className="font-mono font-bold">{statusData.tracking_number}</span>
                        </p>
                      </div>
                      <Badge className={getStatusColor(statusData.status)}>
                        {getStatusText(statusData.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="font-medium">Requester:</span> {statusData.requester_name}</p>
                        <p><span className="font-medium">Contact:</span> {statusData.contact_number}</p>
                        <p><span className="font-medium">Copies:</span> {statusData.copies}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Submitted:</span> {formatDate(statusData.submitted_at)}</p>
                        {statusData.processed_at && (
                          <p><span className="font-medium">Processed:</span> {formatDate(statusData.processed_at)}</p>
                        )}
                        {statusData.ready_at && (
                          <p><span className="font-medium">Ready:</span> {formatDate(statusData.ready_at)}</p>
                        )}
                        {statusData.completed_at && (
                          <p><span className="font-medium">Completed:</span> {formatDate(statusData.completed_at)}</p>
                        )}
                      </div>
                    </div>
                    
                    {statusData.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="font-medium mb-1">Your Notes:</p>
                        <p className="text-sm">{statusData.notes}</p>
                      </div>
                    )}
                    
                    {statusData.admin_notes && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="font-medium mb-1">Admin Notes:</p>
                        <p className="text-sm">{statusData.admin_notes}</p>
                      </div>
                    )}
                    
                    {statusData.files && statusData.files.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="font-medium mb-2">Files:</p>
                        <div className="space-y-1">
                          {statusData.files.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{file.original_name || file.name}</span>
                              <span className="text-muted-foreground">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submission Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Submit New Printing Request
                </CardTitle>
                <CardDescription>
                  Upload your documents and provide printing instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="file-input">Select Files to Print *</Label>
                    <Input
                      id="file-input"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground">
                      Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB per file, Max 10 files)
                    </p>
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Files ({files.length}/10)</Label>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm truncate">{file.name}</span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requester Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requesterName">Your Name *</Label>
                      <Input
                        id="requesterName"
                        type="text"
                        placeholder="Enter your full name"
                        value={requesterName}
                        onChange={(e) => setRequesterName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact Number *</Label>
                      <Input
                        id="contact"
                        type="tel"
                        placeholder="Your phone number"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Copies */}
                  <div className="space-y-2">
                    <Label htmlFor="copies">Number of Copies (1-10)</Label>
                    <Input
                      id="copies"
                      type="number"
                      min="1"
                      max="10"
                      value={copies}
                      onChange={(e) =>
                        setCopies(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))
                      }
                      className="w-32"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Instructions (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special printing instructions (color, paper size, stapling, etc.)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit for Printing
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    Free Printing Service
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    This service is provided free of charge to barangay residents for official documents and important paperwork.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Pickup Location</h4>
                  <p className="text-sm text-muted-foreground">
                    Barangay Tumana Office
                    <br />
                    Marikina, 1800 Metro Manila
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Office Hours</h4>
                  <p className="text-sm text-muted-foreground">
                    Monday - Friday: 8:00 AM - 5:00 PM
                    <br />
                    Saturday: 8:00 AM - 12:00 PM
                    <br />
                    Closed on Sundays and Holidays
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Printing Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Maximum 10 files per submission</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>File size limit: 10MB per file</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Maximum 10 copies per document</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Processing time: 1-2 business days</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>You'll be notified when ready</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Bring valid ID for pickup</span>
                  </p>
                  <p className="flex items-start gap-2 text-red-600 font-medium">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Only one print attempt per file</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  If you have any questions or issues with your printing request, please contact:
                </p>
                <div className="text-sm">
                  <p className="font-medium">Barangay Office</p>
                  <p>Contact: (02) 123-4567</p>
                  <p>Email: barangay.tumana@email.com</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePrinting;