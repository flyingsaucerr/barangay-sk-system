import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Users, Clock, Wrench, CalendarCheck, CalendarX, Plus, Edit, Trash2, X, Building, Home, Heart, Dumbbell, Image as ImageIcon } from "lucide-react";

const Facilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const userRole = localStorage.getItem('userRole') || 'resident';
  const authToken = localStorage.getItem('authToken');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    location: '',
    hours: '',
    status: 'available',
    amenities: ''
  });

  // Fetch facilities from API
  const fetchFacilities = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/facilities', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFacilities(data);
      } else {
        console.error('Failed to fetch facilities');
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Under Maintenance</Badge>;
      case 'reserved':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Reserved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CalendarCheck className="h-4 w-4 text-green-600" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-yellow-600" />;
      case 'reserved':
        return <CalendarX className="h-4 w-4 text-purple-600" />;
      default:
        return <CalendarCheck className="h-4 w-4 text-gray-600" />;
    }
  };

const getFacilityImage = (facility) => {
  // The column name in your database is 'image'
  const imageUrl = facility.image;
  
  // If facility has an image URL, use it
  if (imageUrl) {
    // The image is stored in storage/app/public/facilities/
    // and accessed via the public/storage symlink
    const fullImageUrl = `http://localhost:8000/storage/${imageUrl}`;
    
    return (
      <img
        src={fullImageUrl}
        alt={facility.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('Image failed to load:', fullImageUrl);
          e.target.onerror = null;
          e.target.style.display = 'none';
          // Show placeholder on error
          const parent = e.target.parentNode;
          const placeholder = document.createElement('div');
          placeholder.className = 'w-full h-full bg-gray-200 flex items-center justify-center';
          placeholder.innerHTML = '<div class="text-gray-400">Image not found</div>';
          parent.appendChild(placeholder);
        }}
      />
    );
  }
  
  // Otherwise show placeholder with icon
  const colors = [
    'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 
    'bg-purple-100', 'bg-pink-100', 'bg-indigo-100'
  ];
  const color = colors[facility.name.length % colors.length];
  
  let IconComponent = Building;
  const nameLower = facility.name.toLowerCase();
  
  if (nameLower.includes('hall') || nameLower.includes('multi-purpose')) {
    IconComponent = Building;
  } else if (nameLower.includes('sports') || nameLower.includes('gym') || nameLower.includes('court')) {
    IconComponent = Dumbbell;
  } else if (nameLower.includes('health') || nameLower.includes('medical') || nameLower.includes('clinic')) {
    IconComponent = Heart;
  } else if (nameLower.includes('senior') || nameLower.includes('center')) {
    IconComponent = Home;
  }
  
  return (
    <div className={`w-full h-full ${color} flex items-center justify-center`}>
      <div className="text-center p-4">
        <IconComponent className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <span className="text-gray-500 text-sm">{facility.name}</span>
      </div>
    </div>
  );
};

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

const handleAddFacility = async (e) => {
  e.preventDefault();
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('capacity', formData.capacity);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('hours', formData.hours);
    formDataToSend.append('status', formData.status);
    
    // Send amenities as individual form fields with the same name
    const amenitiesArray = formData.amenities.split(',').map(a => a.trim()).filter(a => a);
    amenitiesArray.forEach(amenity => {
      formDataToSend.append('amenities[]', amenity);
    });
    
    if (imageFile) {
      console.log('Image file being uploaded:', imageFile.name, imageFile.type, imageFile.size);
      formDataToSend.append('image', imageFile);
    } else {
      console.log('No image file selected');
    }

    // Log FormData contents (for debugging)
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    const response = await fetch('http://localhost:8000/api/facilities', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json',
      },
      body: formDataToSend,
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Response data:', responseData); // Check what the backend returns
      await fetchFacilities();
      setShowAddForm(false);
      resetForm();
      alert('Facility created successfully!');
    } else {
      const errorText = await response.text();
      console.error('Failed to create facility:', response.status, errorText);
      alert('Failed to create facility: ' + errorText);
    }
  } catch (error) {
    console.error('Error creating facility:', error);
    alert('Error creating facility: ' + error.message);
  }
};

const handleEditFacility = (facility) => {
  setEditingFacility(facility);
  setFormData({
    name: facility.name,
    description: facility.description,
    capacity: facility.capacity.toString(),
    location: facility.location,
    hours: facility.hours,
    status: facility.status,
    amenities: facility.amenities ? facility.amenities.join(', ') : ''
  });
  
  // Set image preview if exists
  if (facility.image) {
    const fullImageUrl = `http://localhost:8000/storage/${facility.image}`;
    setImagePreview(fullImageUrl);
  }
  setShowAddForm(true);
};

const handleUpdateFacility = async (e) => {
  e.preventDefault();
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('capacity', formData.capacity);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('hours', formData.hours);
    formDataToSend.append('status', formData.status);
    
    // Send amenities as individual form fields with the same name
    const amenitiesArray = formData.amenities.split(',').map(a => a.trim()).filter(a => a);
    amenitiesArray.forEach(amenity => {
      formDataToSend.append('amenities[]', amenity);
    });
    
    formDataToSend.append('_method', 'PUT');
    
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    const response = await fetch(`http://localhost:8000/api/facilities/${editingFacility.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json',
      },
      body: formDataToSend,
    });
      if (response.ok) {
        await fetchFacilities();
        setShowAddForm(false);
        setEditingFacility(null);
        resetForm();
        alert('Facility updated successfully!');
      } else {
        const errorText = await response.text();
        console.error('Failed to update facility:', response.status, errorText);
        alert('Failed to update facility: ' + errorText);
      }
    } catch (error) {
      console.error('Error updating facility:', error);
      alert('Error updating facility: ' + error.message);
    }
  };

  const handleDeleteFacility = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/facilities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchFacilities();
        alert('Facility deleted successfully!');
      } else {
        const errorText = await response.text();
        console.error('Failed to delete facility:', response.status, errorText);
        alert('Failed to delete facility: ' + errorText);
      }
    } catch (error) {
      console.error('Error deleting facility:', error);
      alert('Error deleting facility: ' + error.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const facility = facilities.find(f => f.id === id);
      const response = await fetch(`http://localhost:8000/api/facilities/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...facility,
          status: newStatus,
        }),
      });

      if (response.ok) {
        await fetchFacilities();
      } else {
        const errorText = await response.text();
        console.error('Failed to update facility status:', response.status, errorText);
        alert('Failed to update facility status: ' + errorText);
      }
    } catch (error) {
      console.error('Error updating facility status:', error);
      alert('Error updating facility status: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      capacity: '',
      location: '',
      hours: '',
      status: 'available',
      amenities: ''
    });
    setImageFile(null);
    setImagePreview(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading facilities...</p>
        </div>
      </div>
    );
  }

  const availableCount = facilities.filter(f => f.status === 'available').length;
  const maintenanceCount = facilities.filter(f => f.status === 'maintenance').length;
  const reservedCount = facilities.filter(f => f.status === 'reserved').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Manage Facilities
            </h1>
            <p className="text-muted-foreground">
              Add, edit, and manage barangay facilities
            </p>
          </div>
          {(userRole === 'admin' || userRole === 'staff') && (
            <Button 
              onClick={() => {
                setEditingFacility(null);
                setShowAddForm(true);
                resetForm();
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Facility
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card className="h-full">
            <CardContent className="p-8 flex flex-col justify-center items-center text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{availableCount}</div>
              <div className="text-lg text-muted-foreground">Available</div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="p-8 flex flex-col justify-center items-center text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">{maintenanceCount}</div>
              <div className="text-lg text-muted-foreground">Maintenance</div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="p-8 flex flex-col justify-center items-center text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{reservedCount}</div>
              <div className="text-lg text-muted-foreground">Reserved</div>
            </CardContent>
          </Card>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <Card key={facility.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative bg-gray-100">
                {getFacilityImage(facility)}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-1 shadow-md">
                  {getStatusIcon(facility.status)}
                </div>
              </div>

              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{facility.name}</CardTitle>
                  {getStatusBadge(facility.status)}
                </div>
                <p className="text-sm text-muted-foreground">{facility.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{facility.capacity} capacity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{facility.location}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{facility.hours}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-sm">Amenities</h4>
                  <div className="flex flex-wrap gap-1">
                    {facility.amenities && facility.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                {(userRole === 'admin' || userRole === 'staff') && (
                  <>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditFacility(facility)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteFacility(facility.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        value={facility.status}
                        onChange={(e) => handleStatusChange(facility.id, e.target.value)}
                        className="text-xs p-2 border rounded"
                      >
                        <option value="available">Available</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="reserved">Reserved</option>
                      </select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Facility Form */}
        {showAddForm && (userRole === 'admin' || userRole === 'staff') && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingFacility ? 'Edit Facility' : 'Add New Facility'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={editingFacility ? handleUpdateFacility : handleAddFacility} className="p-6 space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facility Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload an image for the facility (JPG, PNG, GIF)
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facility Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Enter facility name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    required
                    placeholder="Enter facility description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity *
                    </label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      required
                      placeholder="Enter capacity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <Input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      required
                      placeholder="Enter location"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operating Hours *
                    </label>
                    <Input
                      type="text"
                      value={formData.hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                      required
                      placeholder="e.g., 6:00 AM - 10:00 PM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">Under Maintenance</option>
                      <option value="reserved">Reserved</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
                  </label>
                  <Input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => setFormData(prev => ({ ...prev, amenities: e.target.value }))}
                    placeholder="Sound System, Air Conditioning, Kitchen (comma separated)"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    {editingFacility ? 'Update Facility' : 'Add Facility'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
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

export default Facilities;