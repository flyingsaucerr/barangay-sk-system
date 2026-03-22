import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, X, User, Phone, Calendar } from "lucide-react";

const SubmitRequest = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    request_type: '',
    title: '',
    description: '',
    contact_name: '',
    contact_number: '',
    address: ''
  });

  const requestTypes = [
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'change_request', label: 'Request for Change' }
  ];

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    console.log('Submitting request data:', formData);

    const response = await fetch('/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    console.log('Response status:', response.status);
    
    // Check if response is HTML (error page)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response received:', text.substring(0, 200));
      throw new Error(`Server returned HTML error page (Status: ${response.status}). Check Laravel logs.`);
    }

    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (data.success) {
      setShowForm(false);
      setFormData({
        request_type: '',
        title: '',
        description: '',
        contact_name: '',
        contact_number: '',
        address: ''
      });
      alert(data.message || 'Your request has been submitted successfully!');
    } else {
      // Handle validation errors
      if (data.errors) {
        const errorMessages = Object.values(data.errors).flat().join('\n');
        alert(`Please fix the following errors:\n${errorMessages}`);
      } else {
        alert(data.message || 'Failed to submit request. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error submitting request:', error);
    
    if (error.message.includes('HTML error page')) {
      alert('Server error occurred. Please check if the API endpoint is working correctly.');
    } else {
      alert(error.message || 'Failed to submit request. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getRequestTypeDescription = (type) => {
    switch (type) {
      case 'suggestion':
        return 'Share your ideas and recommendations to improve barangay services and community welfare';
      case 'change_request':
        return 'Request for changes in barangay policies, procedures, or community facilities';
      default:
        return 'Select a request type to continue';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-primary text-white py-12">
          <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <FileText className="h-12 w-12 text-white" />
          </div>
            <h1 className="text-4xl font-bold mb-4">Submit a Request</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Share your suggestions or requests for changes to help improve our barangay community
            </p>
            </div>
          </div>
        <div className="max-w-4xl mx-auto">

        {/* Request Types Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6  mb-8 mt-10 ">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Suggestion</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Share your ideas and recommendations to improve barangay services and community welfare
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Request for Change</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Request for changes in barangay policies, procedures, or community facilities
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="text-center mb-12 ">
          <Button 
            onClick={() => setShowForm(true)}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          >
            <Plus className="mr-2 h-5 w-5" />
            Submit New Request
          </Button>
        </div>

        {/* Process Info */}
        <Card className="bg-blue-50 border-blue-200 mb-5">
          <CardHeader>
            <CardTitle className="text-center text-blue-800">Request Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2 text-blue-800">Submit Request</h3>
                <p className="text-sm text-blue-700">
                  Fill out the request form with your details and specific needs
                </p>
              </div>
              <div>
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2 text-blue-800">Under Review</h3>
                <p className="text-sm text-blue-700">
                  Barangay officials will review your request and assess feasibility
                </p>
              </div>
              <div>
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2 text-blue-800">Status Update</h3>
                <p className="text-sm text-blue-700">
                  You will receive updates on the status and outcome of your request
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Request Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">Submit New Request</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type *
                  </label>
                  <Select 
                    value={formData.request_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, request_type: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      {requestTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.request_type && (
                    <p className="text-sm text-gray-600 mt-2">
                      {getRequestTypeDescription(formData.request_type)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Title *
                  </label>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief title for your request"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    required
                    placeholder="Please provide detailed information about your request..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <Input
                      type="text"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <Input
                      type="tel"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      required
                      placeholder="+63 XXX XXX XXXX"
                      maxLength={11} 
                      pattern="\d{11}" 
                      title="Contact number must be exactly 11 digits"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Address *
                  </label>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Complete barangay address"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={loading}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitRequest;