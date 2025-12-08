import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Send, FileText, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const SubmitRequestForm = ({ onSubmitSuccess }) => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [requestType, setRequestType] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [specificType, setSpecificType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName:
      userProfile?.first_name && userProfile?.last_name
        ? `${userProfile.first_name} ${userProfile.last_name}`
        : "",
    email: user?.email || "",
    phone: userProfile?.contact_number || "",
    address: userProfile?.address || "",
    organization: "",
    purpose: "",
    description: "",
    priority: "normal",
    attachments: [],
  });

  // Handle pre-filled data from navigation state
  useEffect(() => {
    if (location.state?.type && location.state?.facilityName) {
      setRequestType("facility");
      setSpecificType(location.state.facilityName);
    }
  }, [location.state]);

  const requestTypes = [
    {
      id: "document",
      label: "Document Request",
      description: "Barangay clearance, certificates, permits",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: "facility",
      label: "Facility Viewing",
      description: "Multi-purpose hall, sports complex, community center",
      icon: <User className="h-5 w-5" />,
    },
    {
      id: "service",
      label: "Service Request",
      description: "Maintenance, repairs, infrastructure concerns",
      icon: <Clock className="h-5 w-5" />,
    },
  ];

  const documentTypes = [
    "Barangay Clearance",
    "Certificate of Residency",
    "Certificate of Indigency",
    "Business Permit",
    "Building Permit",
    "Fencing Permit",
  ];

  const facilities = [
    "Multi-purpose Hall",
    "Sports Complex",
    "Community Center",
    "Senior Citizens Center",
    "Youth Development Center",
    "Public Park",
  ];

  const serviceTypes = [
    "Street Light Repair",
    "Road Maintenance",
    "Drainage Cleaning",
    "Garbage Collection",
    "Water System Issues",
    "Other Infrastructure",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to submit a request");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        requester_id: user.id,
        title: `${
          requestType === "document"
            ? "Document Request"
            : requestType === "facility"
            ? "Facility Viewing"
            : "Service Request"
        }: ${specificType || formData.purpose}`,
        description: formData.description,
        type: requestType,
        status: "pending",
        priority: formData.priority,
        contact_info: {
          phone: formData.phone,
          address: formData.address,
          organization: formData.organization,
          specificType: specificType,
          preferredDate: selectedDate ? selectedDate.toISOString() : null,
        },
        notes: `Purpose: ${formData.purpose}\n\nContact: ${formData.phone}\nAddress: ${
          formData.address
        }${formData.organization ? `\nOrganization: ${formData.organization}` : ""}`,
      };

      const response = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to submit request");
    }

      toast.success("Request submitted successfully!");
      onSubmitSuccess ? onSubmitSuccess() : navigate("/requests");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(error.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Submit a Request</h1>
          <p className="text-muted-foreground">
            Fill out the form below to submit your request.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Request Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>1. Select Request Type</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={requestType} onValueChange={setRequestType}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {requestTypes.map((type) => (
                    <div key={type.id} className="relative">
                      <RadioGroupItem value={type.id} id={type.id} className="sr-only" />
                      <Label
                        htmlFor={type.id}
                        className={cn(
                          "flex flex-col items-center p-6 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50",
                          requestType === type.id
                            ? "border-primary bg-primary/5"
                            : "border-muted"
                        )}
                      >
                        <div className="mb-3 text-primary">{type.icon}</div>
                        <h3 className="font-semibold mb-2">{type.label}</h3>
                        <p className="text-sm text-muted-foreground text-center">
                          {type.description}
                        </p>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Specific Request Details */}
          {requestType && (
            <Card>
              <CardHeader>
                <CardTitle>2. Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {requestType === "document" && (
                  <div>
                    <Label>Document Type</Label>
                    <Select value={specificType} onValueChange={setSpecificType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((doc) => (
                          <SelectItem key={doc} value={doc}>
                            {doc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {requestType === "facility" && (
                  <>
                    <div>
                      <Label>Facility</Label>
                      <Select value={specificType} onValueChange={setSpecificType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select facility" />
                        </SelectTrigger>
                        <SelectContent>
                          {facilities.map((facility) => (
                            <SelectItem key={facility} value={facility}>
                              {facility}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Preferred Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                )}

                {requestType === "service" && (
                  <div>
                    <Label>Service Type</Label>
                    <Select value={specificType} onValueChange={setSpecificType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Purpose/Reason</Label>
                  <Input
                    placeholder="Brief description of purpose"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange("purpose", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Detailed Description</Label>
                  <Textarea
                    placeholder="Provide additional details about your request"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>3. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="+63 123 456 7890"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Organization (Optional)</Label>
                  <Input
                    placeholder="Company or organization name"
                    value={formData.organization}
                    onChange={(e) => handleInputChange("organization", e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label>Complete Address</Label>
                <Textarea
                  placeholder="House/Block number, Street, Barangay, City, Province"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Priority */}
          <Card>
            <CardHeader>
              <CardTitle>4. Request Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="flex items-center gap-2">
                    <Badge variant="outline">Low</Badge>
                    Standard processing time
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <Label htmlFor="normal" className="flex items-center gap-2">
                    <Badge variant="default">Normal</Badge>
                    Regular priority processing
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="flex items-center gap-2">
                    <Badge variant="destructive">High</Badge>
                    Urgent processing required
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto px-8"
              disabled={
                !requestType ||
                !formData.fullName ||
                !formData.email ||
                !formData.phone ||
                isSubmitting
              }
            >
              <Send className="mr-2 h-5 w-5" />
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitRequestForm;
