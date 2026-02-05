import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Award, Users, Loader2, X} from "lucide-react";
import { Link } from "react-router-dom";

const PublicAccomplishments = () => {
  const [accomplishments, setAccomplishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReadMore, setShowReadMore] = useState(false);
  const [selectedAccomplishment, setSelectedAccomplishment] = useState(null);


  // Hardcoded announcements for public view
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
    },
    {
      id: 3,
      title: "Medical Mission Schedule",
      content: "Free medical check-ups will be available every Saturday this month at the barangay hall.",
      date: "2024-01-05",
      type: "warning"
    }
  ];

  useEffect(() => {
    // Fetch accomplishments from API - public endpoint
    const fetchAccomplishments = async () => {
      try {
        setLoading(true);
        // Using your existing public API endpoint
        const response = await fetch('/api/accomplishments');
        
        if (!response.ok) {
          throw new Error('Failed to fetch accomplishments');
        }
        
        const data = await response.json();
        setAccomplishments(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching accomplishments:', err);
        
        // Fallback to sample data if API fails
        const sampleAccomplishments = [
          {
            id: 1,
            title: "Road Rehabilitation Project",
            description: "Completed the rehabilitation of 2km main road with proper drainage system. This project has significantly improved transportation and reduced flooding in the area.",
            location: "Zone 1 - Main Road",
            date_completed: "2024-01-10",
            photo: null
          },
          {
            id: 2,
            title: "Street Light Installation",
            description: "Installed 50 new LED street lights in dark areas of the barangay, enhancing safety and security for residents during nighttime.",
            location: "Various Locations",
            date_completed: "2023-12-15",
            photo: null
          },
          {
            id: 3,
            title: "Drainage System Improvement",
            description: "Improved drainage system in flood-prone areas to prevent flooding during rainy season. This project has helped protect homes and properties from water damage.",
            location: "Zone 3 & 4",
            date_completed: "2023-11-20",
            photo: null
          },
          {
            id: 4,
            title: "Community Health Center Upgrade",
            description: "Renovated and equipped the community health center with modern medical equipment to better serve residents' healthcare needs.",
            location: "Barangay Hall Compound",
            date_completed: "2023-10-05",
            photo: null
          },
          {
            id: 5,
            title: "Public Park Development",
            description: "Transformed vacant lot into a beautiful public park with benches, playground equipment, and green spaces for family recreation.",
            location: "Zone 2 Central Area",
            date_completed: "2023-09-12",
            photo: null
          },
          {
            id: 6,
            title: "Waste Management Program",
            description: "Implemented comprehensive waste segregation and recycling program, reducing landfill waste by 40% in the first quarter.",
            location: "All Zones",
            date_completed: "2023-08-20",
            photo: null
          }
        ];
        
        setAccomplishments(sampleAccomplishments);
      } finally {
        setLoading(false);
      }
    };

    fetchAccomplishments();
  }, []);

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

  // Filter to show only recent announcements (last 30 days)
  const recentAnnouncements = announcements.filter(announcement => {
    const announcementDate = new Date(announcement.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return announcementDate >= thirtyDaysAgo;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading our accomplishments...</p>
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      
        {/* Header Section */}
        <div className="bg-primary text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-4">
              <Award className="h-12 w-12 text-white" />
            </div>
          <h1 className="text-4xl font-bold mb-2">
            SK Accomplishments
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Celebrating the successful projects and initiatives that have enhanced 
            our community's infrastructure, services, and quality of life for all residents.
          </p>
          </div>
        </div>
               
        <div className="container mx-auto px-4 py-12">

        {/* Impact Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {accomplishments.length}+
              </div>
              <div className="text-gray-600 font-medium">
                Completed Projects
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Serving our community
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {new Set(accomplishments.map(a => a.date_completed?.split('-')[0]).filter(Boolean)).size}
              </div>
              <div className="text-gray-600 font-medium">
                Years of Service
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Continuous improvement
              </p>
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
                Areas Served
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Across the barangay
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Accomplishments Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Completed Projects
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore the various infrastructure and community development projects 
              that have been successfully implemented to serve you better.
            </p>
          </div>

          {accomplishments.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md mx-auto">
                <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-800 mb-2">
                  Projects in Progress
                </h3>
                <p className="text-blue-700 mb-4">
                  We're currently working on new initiatives to serve our community better.
                </p>
                <p className="text-sm text-blue-600">
                  Check back soon for updates on our latest accomplishments!
                </p>
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
                    <p className="text-gray-600 leading-relaxed line-clamp-4">
                      {accomplishment.description || "No description available for this project."}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{formatDate(accomplishment.date_completed)}</span>
                      </div>
                      
                      {accomplishment.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span className="max-w-[120px] truncate font-medium">{accomplishment.location}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAccomplishment(accomplishment);
                        setShowReadMore(true);
                      }}
                      className="text-primary font-semibold text-sm hover:underline"
                    >
                      Read more
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Accomplishment Read More Modal */}
        {showReadMore && selectedAccomplishment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedAccomplishment.title}
                </h2>
                <button
                  onClick={() => setShowReadMore(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">

                {/* Image */}
                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  {selectedAccomplishment.photo ? (
                    <img
                      src={`/storage/${selectedAccomplishment.photo}`}
                      alt={selectedAccomplishment.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getPlaceholderImage(selectedAccomplishment.title)
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(selectedAccomplishment.date_completed)}</span>
                  </div>

                  {selectedAccomplishment.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedAccomplishment.location}</span>
                    </div>
                  )}

                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Accomplishment
                  </Badge>
                </div>

                {/* Full Description */}
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line text-gray-700 leading-relaxed text-lg">
                    {selectedAccomplishment.description}
                  </p>
                </div>

                {/* Action */}
                <div className="flex gap-4 pt-6 border-t">
                  <button
                    onClick={() => setShowReadMore(false)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Community Engagement Section */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-2xl border-0">
          <CardContent className="p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">
                Together We Build a Better Community
              </h3>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                Every project completed is a step toward a more vibrant, safe, and 
                prosperous barangay. Your support and cooperation make these accomplishments possible.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg">
                  <Link to="/Requests">Provide Feedback</Link>
                </button>
                <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  <Link to="/Projects">Join Our Programs</Link>
                </button>
              </div>
              <p className="text-sm text-blue-200 mt-6">
                Have suggestions for future projects? We'd love to hear from you!
              </p>
            </div>
          </CardContent>
        </Card>
        

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
            Accomplishments are updated regularly as new projects are completed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicAccomplishments;