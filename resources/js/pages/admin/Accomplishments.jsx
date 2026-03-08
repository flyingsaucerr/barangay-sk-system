import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Loader2, Plus, X, Edit, Trash2, CheckCircle, RefreshCw, FileText, Image as ImageIcon } from "lucide-react";

const API_BASE_URL = 'http://localhost:8000/api';

const AdminAccomplishments = () => {
  const [accomplishments, setAccomplishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date_completed: "",
    photo: null,
    photo_preview: null,
    project_id: null
  });

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || '';
  };

  // Get CSRF token from meta tag
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  };

  const toggleReadMore = (id) => {
  setExpandedCards(prev => ({
    ...prev,
    [id]: !prev[id]
  }));
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
    
    // Listen for real-time updates (if using Pusher/Echo)
    if (window.Echo) {
      window.Echo.channel('accomplishments')
        .listen('.accomplishment.updated', () => {
          fetchAccomplishments();
        });
    }
    
    return () => {
      if (window.Echo) {
        window.Echo.leaveChannel('accomplishments');
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo: file,
          photo_preview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccomplishment = async (id, silent = false) => {
    if (!silent && !confirm('Are you sure you want to delete this accomplishment? This action cannot be undone.')) {
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
      
      if (!silent) {
        alert('Accomplishment deleted successfully!');
      }
    } catch (err) {
      console.error('Error deleting accomplishment:', err);
      if (!silent) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description || '');
      submitData.append('location', formData.location || '');
      submitData.append('date_completed', formData.date_completed);
      
      if (formData.photo && typeof formData.photo !== 'string') {
        submitData.append('photo', formData.photo);
      }
      
      if (formData.project_id) {
        submitData.append('project_id', formData.project_id);
      }

      const authToken = getAuthToken();
      const csrfToken = getCsrfToken();
      
      let url = `${API_BASE_URL}/accomplishments`;
      let method = 'POST';

      if (editingId) {
        url = `${API_BASE_URL}/accomplishments/${editingId}`;
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
        method: 'POST',
        body: submitData,
        headers: headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const savedAccomplishment = await response.json();
      
      if (editingId) {
        setAccomplishments(prev => 
          prev.map(item => item.id === editingId ? savedAccomplishment : item)
        );
        alert('Accomplishment updated successfully!');
      } else {
        setAccomplishments(prev => [savedAccomplishment, ...prev]);
        alert('Accomplishment added successfully!');
      }
      
      resetForm();
      
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
      photo_preview: accomplishment.photo ? `${API_BASE_URL.replace('/api', '')}/storage/${accomplishment.photo}?t=${new Date().getTime()}` : null,
      project_id: accomplishment.project_id || null
    });
    setShowForm(true);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      date_completed: "",
      photo: null,
      photo_preview: null,
      project_id: null
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
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <span className="text-gray-500 text-sm">No Image</span>
        </div>
      </div>
    );
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
                Error Loading Data
              </h3>
              <p className="text-yellow-700">
                {error}
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Admin Accomplishments
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Create, edit, and manage barangay accomplishments. 
            Accomplishments from completed projects are automatically added and synced.
          </p>

          {/* Action Buttons */}
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
                Total Accomplishments
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {accomplishments.length}
              </div>
              <div className="text-gray-600 font-medium">
                All Published
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-yellow-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {accomplishments.filter(a => a.project_id).length}
              </div>
              <div className="text-gray-600 font-medium">
                From Projects
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
                      <div className="flex items-center space-x-4">
                        {formData.photo_preview && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden border">
                            <img 
                              src={formData.photo_preview} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                              }}
                            />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {formData.project_id && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-700 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          This accomplishment was automatically created from a completed project
                        </p>
                      </div>
                    )}
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
              Manage Accomplishments
            </h2>
            <div className="text-lg text-gray-600 max-w-2xl mx-auto">
              Review and manage all accomplishments. Items marked with{' '}
              <Badge className="bg-purple-100 text-purple-800 mx-1 inline-flex items-center">
                From Project
              </Badge>{' '}
              are automatically synced with projects.
            </div>
          </div>

          {accomplishments.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md mx-auto">
                <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-800 mb-2">
                  No Accomplishments Yet
                </h3>
                <p className="text-blue-700 mb-4">
                  Get started by adding your first barangay accomplishment or completing a project.
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
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentNode.querySelector('.placeholder')?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full ${!accomplishment.photo ? 'block' : 'hidden'} placeholder`}>
                      {getPlaceholderImage(accomplishment.title)}
                    </div>

                    {/* Location Badge */}
                    <Badge className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-700 border-0 shadow-lg font-medium">
                      {accomplishment.location || "Various Locations"}
                    </Badge>

                    {/* Project Source Badge */}
                    {accomplishment.project_id && (
                      <Badge className="absolute bottom-3 left-3 bg-purple-500 text-white border-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        From Project
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                      {accomplishment.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                        <div>
                          <p className={`text-gray-600 leading-relaxed ${!expandedCards[accomplishment.id] ? 'line-clamp-3' : ''}`}>
                            {accomplishment.description || "No description available."}
                          </p>
                          
                          {/* Read More button - only show if description exists and is longer than 150 chars (adjust as needed) */}
                          {accomplishment.description && accomplishment.description.length > 150 && (
                            <button
                              onClick={() => toggleReadMore(accomplishment.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 focus:outline-none transition-colors"
                            >
                              {expandedCards[accomplishment.id] ? 'Show less' : 'Read more'}
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{formatDate(accomplishment.date_completed)}</span>
                          </div>
                        </div>

                    {/* Admin Actions */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                      <Button
                        onClick={() => handleEdit(accomplishment)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteAccomplishment(accomplishment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Show warning if this is from a project */}
                    {accomplishment.project_id && (
                      <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        <p className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          This accomplishment is synced with a project. Changes made here won't affect the original project.
                        </p>
                      </div>
                    )}
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
            Accomplishments from projects are automatically synced - when a project is marked as completed, an accomplishment is created; when a completed project is deleted, its accomplishment is also deleted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAccomplishments;