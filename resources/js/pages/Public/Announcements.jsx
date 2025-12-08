import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Megaphone, Search, Calendar, User, Trophy, GraduationCap, Leaf, Users, X } from 'lucide-react';

const Announcements = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showReadMore, setShowReadMore] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Megaphone className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Community Announcements</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Stay informed about the latest news, events, and updates from our community
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search announcements by title, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
        </div>

        {/* Announcements Counter */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Showing {filteredAnnouncements.length} of {announcements.length} announcements
          </p>
        </div>

        {/* Announcements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-lg transition-all duration-300 group border-0 shadow-md">
              <div className="relative overflow-hidden rounded-t-lg">
                <div className="w-full">
                  {getPlaceholderImage(announcement)}
                </div>
                <Badge className={`absolute top-3 right-3 border ${getPriorityColor(announcement.priority)}`}>
                  {(announcement.priority || 'medium').toUpperCase()}
                </Badge>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                  {announcement.title}
                </CardTitle>
                
                <CardDescription className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <User className="h-4 w-4" />
                  <span>{announcement.author || (announcement.user && announcement.user.name) || 'Barangay Official'}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed line-clamp-3">
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
                  className="w-full bg-primary text-white hover:bg-primary-dark border-primary"
                  onClick={() => handleReadMore(announcement)}
                >
                  Read Full Announcement
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results State */}
        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No announcements found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new announcements'}
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
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
                    <span>{selectedAnnouncement.author || (selectedAnnouncement.user && selectedAnnouncement.user.name) || 'Barangay Official'}</span>
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
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed text-lg">
                    {selectedAnnouncement.full_content || selectedAnnouncement.content}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t">
                  <button
                    onClick={() => setShowReadMore(false)}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Barangay Community. All rights reserved.</p>
          <p className="text-gray-400 mt-2">Stay connected with your community</p>
        </div>
      </footer>
    </div>
  );
};

export default Announcements;