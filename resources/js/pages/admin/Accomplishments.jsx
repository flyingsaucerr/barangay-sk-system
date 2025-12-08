import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Loader2, Plus, X, Megaphone, Edit, Trash2, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const AdminAccomplishments = () => {
  const [accomplishments, setAccomplishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date_completed: "",
    photo: null,
    is_published: true
  });

  // Hardcoded announcements for admin view
  const announcements = [
    {
      id: 1,
      title: "Community Clean-up Drive Success",
      content: "Our recent community clean-up drive collected over 500kg of waste. Thank you to all volunteers!",
      date: "2024-01-15",
      type: "success"
    },
    {
      id: 2,
      title: "New Basketball Court Installation",
      content: "The new basketball court in Zone 5 will be completed by next month. Stay tuned for the opening ceremony!",
      date: "2024-01-10",
      type: "info"
    }
  ];

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || '';
  };

  // Get CSRF token from meta tag
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  };

  // Fetch accomplishments from API
  const fetchAccomplishments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/accomplishments', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch accomplishments');
      }

      const data = await response.json();
      setAccomplishments(data);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching accomplishments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccomplishments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      photo: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('location', formData.location);
      submitData.append('date_completed', formData.date_completed);
      submitData.append('is_published', formData.is_published);
      if (formData.photo) {
        submitData.append('photo', formData.photo);
      }

      const authToken = getAuthToken();
      const csrfToken = getCsrfToken();
      
      let url = '/api/accomplishments';
      let method = 'POST';

      if (editingId) {
        url = `/api/accomplishments/${editingId}`;
        method = 'POST';
        submitData.append('_method', 'PUT');
      }

      const headers = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
      }

      const response = await fetch(url, {
        method: method,
        body: submitData,
        headers: headers,
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          
          if (response.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            window.location.href = '/admin/login';
          }
        } catch (parseError) {
          console.log('Could not parse submit error response');
        }
        
        throw new Error(errorMessage);
      }

      const savedAccomplishment = await response.json();
      
      if (editingId) {
        setAccomplishments(prev => 
          prev.map(item => item.id === editingId ? savedAccomplishment : item)
        );
      } else {
        setAccomplishments(prev => [savedAccomplishment, ...prev]);
      }
      
      resetForm();
      alert(`Accomplishment ${editingId ? 'updated' : 'added'} successfully!`);
      
    } catch (err) {
      console.error('Error saving accomplishment:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (accomplishment) => {
    setEditingId(accomplishment.id);
    setFormData({
      title: accomplishment.title,
      description: accomplishment.description || "",
      location: accomplishment.location || "",
      date_completed: accomplishment.date_completed?.split('T')[0] || "",
      photo: null,
      is_published: accomplishment.is_published !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this accomplishment? This action cannot be undone.')) {
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

      const response = await fetch(`/api/accomplishments/${id}`, {
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

      setAccomplishments(prev => prev.filter(item => item.id !== id));
      alert('Accomplishment deleted successfully!');
    } catch (err) {
      console.error('Error deleting accomplishment:', err);
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

      const response = await fetch(`/api/accomplishments/${id}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          is_published: !currentStatus,
          _method: 'PUT'
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

      const updatedAccomplishment = await response.json();
      setAccomplishments(prev => 
        prev.map(item => item.id === id ? updatedAccomplishment : item)
      );
      
      alert(`Accomplishment ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
    } catch (err) {
      console.error('Error updating publication status:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      date_completed: "",
      photo: null,
      is_published: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get placeholder image based on title
  const getPlaceholderImage = (title) => {
    const colors = [
      'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 
      'bg-purple-100', 'bg-pink-100', 'bg-indigo-100'
    ];
    const color = colors[title.length % colors.length];
    
    return (
      <div className={`w-full h-full ${color} flex items-center justify-center`}>
        <div className="text-center p-4">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <span className="text-gray-500 text-sm">Project Image</span>
        </div>
      </div>
    );
  };

  // Get badge color based on announcement type
  const getAnnouncementBadge = (type) => {
    const styles = {
      success: "bg-green-100 text-green-800 border-green-200",
      info: "bg-blue-100 text-blue-800 border-blue-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      default: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return styles[type] || styles.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading accomplishments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                Temporary Information Display
              </h3>
              <p className="text-yellow-700">
                Showing sample accomplishments while we update our live data.
              </p>
              <Button 
                className="mt-4"
                onClick={fetchAccomplishments}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block bg-primary/10 text-primary px-6 py-2 rounded-full text-sm font-medium mb-4 border border-primary/20">
            Manage Accomplishments
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Admin Accomplishments
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Create, edit, and manage barangay accomplishments and projects. 
            Published items will be visible to the public.
          </p>

          {/* Add New Accomplishment Button */}
          <div className="mt-8">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors shadow-lg"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Add New Accomplishment
            </Button>
          </div>
        </div>

        {/* Recent Announcements Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Megaphone className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Recent Announcements</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={getAnnouncementBadge(announcement.type)}>
                      {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDate(announcement.date)}
                    </span>
                  </div>
                  <CardTitle className="text-lg text-gray-900">{announcement.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {accomplishments.length}
              </div>
              <div className="text-gray-600 font-medium">
                Total Projects
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {accomplishments.filter(a => a.is_published !== false).length}
              </div>
              <div className="text-gray-600 font-medium">
                Published
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-yellow-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {accomplishments.filter(a => a.is_published === false).length}
              </div>
              <div className="text-gray-600 font-medium">
                Draft
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {new Set(accomplishments.map(a => a.location).filter(Boolean)).size}
              </div>
              <div className="text-gray-600 font-medium">
                Locations
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Accomplishment' : 'Add New Accomplishment'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter accomplishment title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Completed *
                      </label>
                      <input
                        type="date"
                        name="date_completed"
                        value={formData.date_completed}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="is_published"
                        checked={formData.is_published}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Publish immediately
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="12"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter detailed description of the accomplishment..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {formLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {editingId ? 'Updating...' : 'Saving...'}
                      </span>
                    ) : (
                      editingId ? 'Update Accomplishment' : 'Save Accomplishment'
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Accomplishments Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Manage Projects
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Review and manage all accomplishments. Use the action buttons to edit, delete, or change publication status.
            </p>
          </div>

          {accomplishments.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md mx-auto">
                <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-800 mb-2">
                  No Accomplishments Yet
                </h3>
                <p className="text-blue-700 mb-4">
                  Get started by adding your first barangay accomplishment.
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={18} className="mr-2" />
                  Add First Accomplishment
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {accomplishments.map((accomplishment) => (
                <Card 
                  key={accomplishment.id}
                  className="group bg-white/90 backdrop-blur-sm border-gray-200 hover:border-primary/30 hover:shadow-2xl transition-all duration-300 overflow-hidden shadow-lg"
                >
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {accomplishment.photo ? (
                      <img
                        src={`/storage/${accomplishment.photo}`}
                        alt={accomplishment.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full ${!accomplishment.photo ? 'block' : 'hidden'}`}>
                      {getPlaceholderImage(accomplishment.title)}
                    </div>
                    
                    {/* Status Badge */}
                    <Badge className={`absolute top-3 left-3 ${
                      accomplishment.is_published !== false 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-yellow-500 hover:bg-yellow-600'
                    } text-white border-0 cursor-pointer`}>
                      {accomplishment.is_published !== false ? 'Published' : 'Draft'}
                    </Badge>

                    {/* Location Badge */}
                    <Badge className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-700 border-0 shadow-lg font-medium">
                      {accomplishment.location || "Various Locations"}
                    </Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                      {accomplishment.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-600 leading-relaxed line-clamp-3">
                      {accomplishment.description || "No description available for this project."}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{formatDate(accomplishment.date_completed)}</span>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <Button
                        onClick={() => handlePublishToggle(accomplishment.id, accomplishment.is_published !== false)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          accomplishment.is_published !== false
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } transition-colors`}
                      >
                        {accomplishment.is_published !== false ? 'Unpublish' : 'Publish'}
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(accomplishment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(accomplishment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Manage accomplishments carefully as they represent our barangay's achievements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAccomplishments;