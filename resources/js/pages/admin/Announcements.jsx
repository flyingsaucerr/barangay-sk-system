import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, Search, Calendar, Plus, Edit, Trash2, X, User, Trophy, GraduationCap, Leaf, Users, Image as ImageIcon } from 'lucide-react';

const AdminAnnouncements = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Get user info from your authentication
  const userRole = localStorage.getItem('userRole') || 'resident';
  const userId = localStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken');

  console.log('User Role:', userRole);
  console.log('Auth Token:', authToken ? 'Exists' : 'Missing');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    full_content: '',
    priority: 'medium',
    tags: ''
  });

  // Fetch announcements from Laravel API
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/announcements', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      } else {
        console.error('Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (announcement.tags && announcement.tags.some(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

const getAnnouncementImage = (announcement) => {
  if (announcement.image) {
    const timestamp = new Date().getTime();
    const imageUrl = `/storage/${announcement.image}?t=${timestamp}`;
    
    return (
      <img
        src={imageUrl}
        alt={announcement.title}
        className="w-full h-48 object-cover"
        onError={(e) => {
          console.error('Image failed to load:', imageUrl);
          e.target.onerror = null;
          e.target.style.display = 'none';
          const parent = e.target.parentNode;
          const placeholder = getPlaceholderContent(announcement);
          if (parent && !parent.querySelector('.placeholder-div')) {
            const div = document.createElement('div');
            div.className = `w-full h-48 ${getPlaceholderColor(announcement)} flex items-center justify-center placeholder-div`;
            div.innerHTML = `<div class="text-center p-4"><div class="text-gray-500 text-sm">${announcement.title}</div></div>`;
            parent.appendChild(div);
          }
        }}
      />
    );
  }
  return getPlaceholderContent(announcement);
};

const getPlaceholderColor = (announcement) => {
  const colors = [
    'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 
    'bg-purple-100', 'bg-pink-100', 'bg-indigo-100'
  ];
  return colors[announcement.title.length % colors.length];
};

const getPlaceholderContent = (announcement) => {
  const colors = [
    'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 
    'bg-purple-100', 'bg-pink-100', 'bg-indigo-100'
  ];
  const color = colors[announcement.title.length % colors.length];
  
  let IconComponent = Megaphone;
  if (announcement.tags && announcement.tags.some(tag => 
    tag.name.toLowerCase().includes('sports'))) {
    IconComponent = Trophy;
  } else if (announcement.tags && announcement.tags.some(tag => 
    tag.name.toLowerCase().includes('education') || tag.name.toLowerCase().includes('leadership'))) {
    IconComponent = GraduationCap;
  } else if (announcement.tags && announcement.tags.some(tag => 
    tag.name.toLowerCase().includes('environment') || tag.name.toLowerCase().includes('cleanup'))) {
    IconComponent = Leaf;
  } else if (announcement.tags && announcement.tags.some(tag => 
    tag.name.toLowerCase().includes('community'))) {
    IconComponent = Users;
  }
  
  return (
    <div className={`w-full h-48 ${color} flex items-center justify-center`}>
      <div className="text-center p-4">
        <IconComponent className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <span className="text-gray-500 text-sm">{announcement.title}</span>
      </div>
    </div>
  );
};
const handleImageChange = (e) => {
  const file = e.target.files[0];
  
  // Check if file exists
  if (!file) {
    setImageFile(null);
    setImagePreview(null);
    return;
  }
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    // Show error message
    alert(`File size exceeds the 5MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
    
    // Clear the file input
    e.target.value = '';
    
    // Reset state
    setImageFile(null);
    setImagePreview(null);
    return;
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    alert('Please upload only image files (JPG, PNG, GIF, WEBP)');
    e.target.value = '';
    setImageFile(null);
    setImagePreview(null);
    return;
  }

  setImageFile(file);
  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(null); 
    setTimeout(() => {
      setImagePreview(reader.result);
    }, 10);
  };
  reader.readAsDataURL(file);
};

  const handleReadMore = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowReadMore(true);
  };

const handleAddAnnouncement = async (e) => {
  e.preventDefault();
  
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      alert('Please login first to create announcements');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('full_content', formData.full_content);
    formDataToSend.append('priority', formData.priority);
    
    // Handle tags - send as JSON string
    if (formData.tags) {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      formDataToSend.append('tags', JSON.stringify(tagsArray));
    }
    
    // Append image if exists - make sure it's the last field
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    // Log what we're sending
    console.log('Sending FormData:');
    for (let pair of formDataToSend.entries()) {
      if (pair[0] === 'image') {
        console.log(`- ${pair[0]}: File (${pair[1].name}, ${pair[1].type}, ${pair[1].size} bytes)`);
      } else {
        console.log(`- ${pair[0]}: ${pair[1]}`);
      }
    }

    const response = await fetch('http://localhost:8000/api/announcements', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        // DO NOT set Content-Type header
      },
      body: formDataToSend,
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Success:', responseData);
      
      await fetchAnnouncements();
      setShowAddForm(false);
      resetForm();
      alert('Announcement created successfully!');
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        alert('Failed to create announcement: ' + (errorJson.message || JSON.stringify(errorJson.errors)));
      } catch {
        alert('Failed to create announcement: ' + errorText);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error creating announcement: ' + error.message);
  }
};

const handleEditAnnouncement = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('authToken');
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('full_content', formData.full_content);
    formDataToSend.append('priority', formData.priority);
    formDataToSend.append('_method', 'PUT');
    
    if (formData.tags) {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      formDataToSend.append('tags', JSON.stringify(tagsArray));
    }
    
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    const response = await fetch(`http://localhost:8000/api/announcements/${selectedAnnouncement.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formDataToSend,
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Update success:', responseData);
      
      await fetchAnnouncements();
      
      if (responseData.announcement) {
        setSelectedAnnouncement(responseData.announcement);
      } else {
        setSelectedAnnouncement(responseData);
      }
      
      setShowEditForm(false);
      setShowReadMore(false);
      resetForm();
      alert('Announcement updated successfully!');
    } else {
      const errorText = await response.text();
      console.error('Update error:', errorText);
      alert('Failed to update announcement: ' + errorText);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error updating announcement: ' + error.message);
  }
};

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:8000/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchAnnouncements();
        alert('Announcement deleted successfully!');
      } else {
        const errorText = await response.text();
        console.error('Failed to delete announcement:', response.status, errorText);
        alert('Failed to delete announcement: ' + errorText);
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Error deleting announcement: ' + error.message);
    }
  };

const handleEditClick = (announcement) => {
  setSelectedAnnouncement(announcement);
  setFormData({
    title: announcement.title,
    content: announcement.content,
    full_content: announcement.full_content || announcement.content,
    priority: announcement.priority || 'medium',
    tags: announcement.tags ? announcement.tags.map(tag => tag.name).join(', ') : ''
  });
  
  setImageFile(null);
  setImagePreview(null);
  
  if (announcement.image) {
    const timestamp = new Date().getTime();
    setImagePreview(`http://localhost:8000/storage/${announcement.image}?t=${timestamp}`);
  }
  
  setShowEditForm(true);
  setShowReadMore(false);
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      full_content: '',
      priority: 'medium',
      tags: ''
    });
    setImageFile(null);
    setImagePreview(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Megaphone className="h-8 w-8 text-primary" />
            <span>Announcements</span>
          </h1>
          <p className="text-muted-foreground mt-2">Stay updated with the latest community news and events</p>
        </div>
        
        {(userRole === 'admin' || userRole === 'staff') && (
          <Button 
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id} className="hover:shadow-lg transition-all duration-300 group overflow-hidden">
            <div className="relative overflow-hidden rounded-t-lg bg-gray-100">
              {getAnnouncementImage(announcement)}
              <Badge className={`absolute top-3 right-3 border ${getPriorityColor(announcement.priority)}`}>
                {(announcement.priority || 'medium').toUpperCase()}
              </Badge>
            </div>
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                  {announcement.title}
                </CardTitle>
                
                {(userRole === 'admin' || userRole === 'staff') && (
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEditClick(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-600"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <CardDescription className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <User className="h-4 w-4" />
                <span>{announcement.author || (announcement.user && announcement.user.name) || 'Unknown'}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                {announcement.content}
              </p>
              
              <div className="flex flex-wrap gap-1">
                {announcement.tags && announcement.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleReadMore(announcement)}
              >
                Read More
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12">
          <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No announcements found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms' : 'No announcements have been posted yet'}
          </p>
        </div>
      )}

      {/* Add/Edit Announcement Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {showAddForm ? 'Create New Announcement' : 'Edit Announcement'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={showAddForm ? handleAddAnnouncement : handleEditAnnouncement} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Announcement Image
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
                      Upload an image for the announcement (JPG, PNG, GIF)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <Textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  placeholder="Brief description for the card view"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Content *
                </label>
                <Textarea
                  name="full_content"
                  value={formData.full_content}
                  onChange={handleInputChange}
                  rows="6"
                  required
                  placeholder="Detailed content for the read more view"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <Input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Sports, Community, Youth"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  {showAddForm ? 'Publish Announcement' : 'Update Announcement'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setShowEditForm(false);
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

      {/* Read More Modal */}
      {showReadMore && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{selectedAnnouncement.title}</h2>
              <button
                onClick={() => setShowReadMore(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
            {/* Announcement Image in Modal */}
              {selectedAnnouncement.image && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={`/storage/${selectedAnnouncement.image}?t=${new Date().getTime()}`}
                    alt={selectedAnnouncement.title}
                    className="w-full max-h-96 object-cover"
                    onError={(e) => {
                      console.error('Modal image failed to load:', `/storage/${selectedAnnouncement.image}`);
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Header Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(selectedAnnouncement.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{selectedAnnouncement.author || (selectedAnnouncement.user && selectedAnnouncement.user.name) || 'Unknown'}</span>
                </div>
                <Badge className={getPriorityColor(selectedAnnouncement.priority)}>
                  {(selectedAnnouncement.priority || 'medium').toUpperCase()} PRIORITY
                </Badge>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedAnnouncement.tags && selectedAnnouncement.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-sm">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              {/* Full Content */}
              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {selectedAnnouncement.full_content || selectedAnnouncement.content}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={() => setShowReadMore(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
                {(userRole === 'admin' || userRole === 'staff') && (
                  <button 
                    onClick={() => handleEditClick(selectedAnnouncement)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Edit Announcement
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;