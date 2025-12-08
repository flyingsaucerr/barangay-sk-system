import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, Search, Calendar, Plus, Edit, Trash2, X, User, Trophy, GraduationCap, Leaf, Users } from 'lucide-react';

const Announcements = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const getPlaceholderImage = (announcement) => {
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
          <span className="text-gray-500 text-sm">Announcement Image</span>
        </div>
      </div>
    );
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
      console.error('No authentication token found. Please login first.');
      alert('Please login first to create announcements');
      return;
    }

    console.log('🔍 DEBUG - Before fetch:');
    console.log('Token:', token);
    console.log('Form data:', formData);
    
    const requestBody = {
      title: formData.title,
      content: formData.content,
      full_content: formData.full_content,
      priority: formData.priority,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };
    
    console.log('Request body:', requestBody);
    console.log('Request body JSON:', JSON.stringify(requestBody));

    const response = await fetch('http://localhost:8000/api/announcements', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('Success:', result);
      await fetchAnnouncements();
      setShowAddForm(false);
      resetForm();
      alert('Announcement created successfully!');
    } else {
      const errorText = await response.text();
      console.error('Failed to create announcement:', response.status, errorText);
      alert('Failed to create announcement: ' + errorText);
    }
  } catch (error) {
    console.error('Error creating announcement:', error);
    alert('Error creating announcement: ' + error.message);
  }
};

const handleEditAnnouncement = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`http://localhost:8000/api/announcements/${selectedAnnouncement.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }),
    });

    if (response.ok) {
      await fetchAnnouncements();
      setShowEditForm(false);
      setShowReadMore(false);
      resetForm();
      alert('Announcement updated successfully!');
    } else {
      const errorText = await response.text();
      console.error('Failed to update announcement:', response.status, errorText);
      alert('Failed to update announcement: ' + errorText);
    }
  } catch (error) {
    console.error('Error updating announcement:', error);
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
          <Card key={announcement.id} className="hover:shadow-lg transition-all duration-300 group">
            <div className="relative overflow-hidden rounded-t-lg">
              <div className="w-full">
                {getPlaceholderImage(announcement)}
              </div>
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

export default Announcements;