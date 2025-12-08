import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Calendar, Eye, Users, Building, Plus, Edit, Trash2, X, Loader2, RefreshCw } from "lucide-react";

const AdminDisclosure = () => {
  const [disclosures, setDisclosures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDisclosureForm, setShowDisclosureForm] = useState(false);
  const [editingDisclosure, setEditingDisclosure] = useState(null);
  const [selectedDisclosure, setSelectedDisclosure] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: 'Governance',
    full_details: '',
    is_published: true
  });

  const categories = [
    "Governance",
    "Operations", 
    "Youth Development",
    "Projects",
    "Announcements",
    "Financial",
    "Health & Safety",
    "Environment"
  ];

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || '';
  };

  // Get CSRF token from meta tag
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  };

  // Fetch disclosures from API
const fetchDisclosures = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('Fetching disclosures from API...');
    
    const response = await fetch('/api/disclosures', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      // Try to get detailed error message
      let errorMessage = `Server error: ${response.status}`;
      try {
        const errorData = await response.json();
        console.log('Error response data:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.log('Could not parse error response');
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Fetched disclosures:', data);
    setDisclosures(data);
    
  } catch (err) {
    console.error('Error fetching disclosures:', err);
    setError(err.message);
    
    // Fallback to sample data for development
    const sampleDisclosures = [
      {
        id: 1,
        title: "Annual Barangay Development Plan 2024",
        description: "Comprehensive plan outlining barangay programs and activities for the fiscal year.",
        date: "January 2024",
        category: "Governance",
        full_details: "Annual development plan details...",
        is_published: true
      },
      {
        id: 2,
        title: "Monthly Activity Reports",
        description: "Detailed reports of barangay activities, programs, and accomplishments each month.",
        date: "Updated Monthly",
        category: "Operations",
        full_details: "Monthly activity reports details...",
        is_published: true
      }
    ];
    
    setDisclosures(sampleDisclosures);
    setError('Using sample data. ' + err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchDisclosures();
  }, []);

const handleAddDisclosure = async (e) => {
  e.preventDefault();
  
  try {
    setFormLoading(true);
    
    const authToken = getAuthToken();
    const csrfToken = getCsrfToken();
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json', // ADD THIS LINE
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken;
    }

    console.log('Submitting form data:', formData); // Debug log

    const response = await fetch('/api/disclosures', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(formData),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        window.location.href = '/admin/login';
        return;
      }
      
      // Handle 422 validation errors specifically
      if (response.status === 422) {
        const errorData = await response.json();
        console.log('Validation errors:', errorData);
        throw new Error(`Validation failed: ${JSON.stringify(errorData.messages)}`);
      }
      
      throw new Error(`Server error: ${response.status}`);
    }

    const newDisclosure = await response.json();
    setDisclosures(prev => [...prev, newDisclosure]);
    setShowDisclosureForm(false);
    resetForm();
    alert('Disclosure added successfully!');
    
  } catch (err) {
    console.error('Error adding disclosure:', err);
    alert(`Error: ${err.message}`);
  } finally {
    setFormLoading(false);
  }
};

  const handleEditDisclosure = (disclosure) => {
    setEditingDisclosure(disclosure);
    setFormData({
      title: disclosure.title,
      description: disclosure.description,
      date: disclosure.date,
      category: disclosure.category,
      full_details: disclosure.full_details,
      is_published: disclosure.is_published !== false
    });
    setShowDisclosureForm(true);
  };

  const handleUpdateDisclosure = async (e) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      
      const authToken = getAuthToken();
      const csrfToken = getCsrfToken();
      
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
      }

      const response = await fetch(`/api/disclosures/${editingDisclosure.id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          window.location.href = '/admin/login';
          return;
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const updatedDisclosure = await response.json();
      setDisclosures(prev => prev.map(d => 
        d.id === editingDisclosure.id ? updatedDisclosure : d
      ));
      
      setShowDisclosureForm(false);
      setEditingDisclosure(null);
      resetForm();
      alert('Disclosure updated successfully!');
      
    } catch (err) {
      console.error('Error updating disclosure:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteDisclosure = async (id) => {
    if (!window.confirm('Are you sure you want to delete this disclosure?')) {
      return;
    }

    try {
      const authToken = getAuthToken();
      const csrfToken = getCsrfToken();
      
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
      }

      const response = await fetch(`/api/disclosures/${id}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          window.location.href = '/admin/login';
          return;
        }
        throw new Error(`Server error: ${response.status}`);
      }

      setDisclosures(prev => prev.filter(d => d.id !== id));
      alert('Disclosure deleted successfully!');
    } catch (err) {
      console.error('Error deleting disclosure:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handlePublishToggle = async (id, currentStatus) => {
    try {
      const authToken = getAuthToken();
      const csrfToken = getCsrfToken();
      
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
      }

      const response = await fetch(`/api/disclosures/${id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          is_published: !currentStatus
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          window.location.href = '/admin/login';
          return;
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const updatedDisclosure = await response.json();
      setDisclosures(prev => 
        prev.map(d => d.id === id ? updatedDisclosure : d)
      );
      
      alert(`Disclosure ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
    } catch (err) {
      console.error('Error updating publication status:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleViewDetails = (disclosure) => {
    setSelectedDisclosure(disclosure);
    setShowDetails(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      category: 'Governance',
      full_details: '',
      is_published: true
    });
  };

  const DisclosureCard = ({ disclosure }) => (
    <Card className="hover:shadow-md transition-shadow group border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {disclosure.title}
              </CardTitle>
              <Badge className={disclosure.is_published !== false ? "bg-green-500" : "bg-yellow-500"}>
                {disclosure.is_published !== false ? "Published" : "Draft"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {disclosure.date}
              </div>
              <Badge variant="outline" className="text-xs">
                {disclosure.category}
              </Badge>
            </div>
          </div>
          <FileText className="h-8 w-8 text-blue-600" />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{disclosure.description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleViewDetails(disclosure)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handlePublishToggle(disclosure.id, disclosure.is_published !== false)}
              className={disclosure.is_published !== false ? "text-yellow-600" : "text-green-600"}
            >
              {disclosure.is_published !== false ? 'Unpublish' : 'Publish'}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditDisclosure(disclosure)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDeleteDisclosure(disclosure.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading disclosures...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">
              Error Loading Disclosures
            </h3>
            <p className="text-yellow-700 mb-4">{error}</p>
            <Button onClick={fetchDisclosures}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Building className="h-8 w-8 text-primary" />
              <span>Manage Disclosures</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Add and manage barangay transparency documents and announcements
            </p>
          </div>

          <Button 
            onClick={() => {
              setEditingDisclosure(null);
              setShowDisclosureForm(true);
              resetForm();
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Disclosure
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Building className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground mb-1">{disclosures.length}</div>
              <div className="text-sm text-muted-foreground">Total Disclosures</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground mb-1">
                {disclosures.filter(d => d.is_published !== false).length}
              </div>
              <div className="text-sm text-muted-foreground">Published</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground mb-1">
                {disclosures.filter(d => d.is_published === false).length}
              </div>
              <div className="text-sm text-muted-foreground">Draft</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground mb-1">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </CardContent>
          </Card>
        </div>

        {/* Disclosures Grid */}
        <div className="grid gap-6">
          {disclosures.map((disclosure) => (
            <DisclosureCard key={disclosure.id} disclosure={disclosure} />
          ))}
        </div>

        {disclosures.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No disclosures found</h3>
            <p className="text-muted-foreground mb-4">
              Add your first disclosure to start sharing information with the community
            </p>
            <Button 
              onClick={() => {
                setEditingDisclosure(null);
                setShowDisclosureForm(true);
                resetForm();
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Disclosure
            </Button>
          </div>
        )}

        {/* Add/Edit Disclosure Form */}
        {showDisclosureForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingDisclosure ? 'Edit Disclosure' : 'Add New Disclosure'}
                </h2>
                <button
                  onClick={() => setShowDisclosureForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={editingDisclosure ? handleUpdateDisclosure : handleAddDisclosure} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Enter disclosure title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    required
                    placeholder="Brief description for the card view"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Details *
                  </label>
                  <Textarea
                    value={formData.full_details}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_details: e.target.value }))}
                    rows="6"
                    required
                    placeholder="Detailed information for the view details modal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date/Period *
                    </label>
                    <Input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                      placeholder="e.g., January 2024, Updated Monthly"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                    Publish immediately
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {formLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {editingDisclosure ? 'Update Disclosure' : 'Add Disclosure'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowDisclosureForm(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Details Floating Form */}
        {showDetails && selectedDisclosure && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDisclosure.title}</h2>
                  <Badge className={selectedDisclosure.is_published !== false ? "bg-green-500" : "bg-yellow-500"}>
                    {selectedDisclosure.is_published !== false ? "Published" : "Draft"}
                  </Badge>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Header Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedDisclosure.date}</span>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {selectedDisclosure.category}
                  </Badge>
                </div>

                {/* Short Description */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium">{selectedDisclosure.description}</p>
                </div>

                {/* Full Content */}
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {selectedDisclosure.full_details}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetails(false);
                      handleEditDisclosure(selectedDisclosure);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Edit Disclosure
                  </Button>
                  <Button
                    onClick={() => handlePublishToggle(selectedDisclosure.id, selectedDisclosure.is_published !== false)}
                    className={selectedDisclosure.is_published !== false ? 
                      "flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors" :
                      "flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                    }
                  >
                    {selectedDisclosure.is_published !== false ? 'Unpublish' : 'Publish'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDisclosure;