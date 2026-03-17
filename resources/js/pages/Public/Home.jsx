import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeedbackModal } from "@/components/FeedbackModal";
import { FeedbackButton } from "@/components/FeedbackButton";
import { 
  FileText, 
  BarChart3,
  Megaphone,
  Building,
  Award,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Users,
  CalendarDays,
  Facebook,
  Instagram
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import heroImage from "@/assets/sk-hero-banner.jpg";
import barangayHall from "@/assets/barangayHall.jpg";

const API_URL = 'http://localhost:8000/api';

import sk1_cj from "@/assets/sk1_cj.jpg";
import sk2_melody from "@/assets/sk2_melody.jpg";
import sk3_moana from "@/assets/sk3_moana.jpg";
import sk4_dollar from "@/assets/sk4_dollar.jpg";
import sk5_paul from "@/assets/sk5_paul.jpg";
import sk6_danilo from "@/assets/sk6_danilo.jpg";
import sk7_rie from "@/assets/sk7_rie.jpg";
import sk8_jemimah from "@/assets/sk8_jemimah.jpg";

const kagawadImages = {
  '1': sk1_cj,
  '2': sk2_melody,
  '3': sk3_moana,
  '4': sk4_dollar,
  '5': sk5_paul,
  '6': sk6_danilo,
  '7': sk7_rie,
  '8': sk8_jemimah,
};

const KagawadOfTheDay = ({ kagawad }) => {
  const getImageSource = () => {
    if (!kagawad) return null;
    
    if (kagawad.image && typeof kagawad.image === 'object' && kagawad.image.src) {
      return kagawad.image.src;
    }

    if (typeof kagawad.image === 'string') {
      if (kagawad.image.includes('/storage/')) {
        return `${API_URL.replace('/api', '')}${kagawad.image}`;
      }
      if (kagawad.image.startsWith('data:') || kagawad.image.startsWith('http')) {
        return kagawad.image;
      }
      return kagawad.image;
    }

    if (kagawad.id && kagawadImages[kagawad.id]) {
      return kagawadImages[kagawad.id];
    }
    
    return null;
  };

  return (
    <Card className="mb-12 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Kagawad of the Day</CardTitle>
            <CardDescription>Meet your dedicated public servant for today</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Photo Section */}
          <div className="md:col-span-1">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {getImageSource() ? (
                <img 
                  src={getImageSource()} 
                  alt={kagawad.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(kagawad.name)}&size=200&background=random`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <Users className="h-16 w-16 text-primary/50" />
                </div>
              )}
            </div>
            <div className="mt-3 text-center">
              <Badge variant="outline" className="bg-primary/5">
                <CalendarDays className="h-3 w-3 mr-1" />
                Featured Today
              </Badge>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-1">{kagawad.name}</h3>
            <p className="text-primary font-medium mb-3">{kagawad.position}</p>
            <p className="text-muted-foreground mb-4">{kagawad.bio}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{kagawad.contact || 'Not available'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{kagawad.email || 'Not available'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{kagawad.address || 'Barangay Tumana, Marikina City'}</span>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="md:col-span-1">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Recent Activities
            </h4>
            <div className="space-y-3">
              {kagawad.recentActivities?.length > 0 ? (
                kagawad.recentActivities.map((activity, index) => (
                  <div key={index} className="border-l-2 border-primary pl-3 py-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs mt-1 line-clamp-2">{activity.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activities</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function PublicHome() {
  const [featuredKagawad, setFeaturedKagawad] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [accomplishments, setAccomplishments] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState([]);
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedRequests: 0,
    accomplishments: 0,
    reports: "Monthly"
  });
  const [loading, setLoading] = useState(true);
    
  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        alert('Thank you for your feedback!');
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    }
  };


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        const savedKagawad = localStorage.getItem('featuredKagawad');
        if (savedKagawad) {
          const parsedKagawad = JSON.parse(savedKagawad);
          const fullKagawad = {
            ...parsedKagawad,
            image: parsedKagawad.id && kagawadImages[parsedKagawad.id] 
              ? kagawadImages[parsedKagawad.id] 
              : parsedKagawad.image || null
          };
          setFeaturedKagawad(fullKagawad);
        } else {
          setFeaturedKagawad({
            id: '1',
            name: 'CJ Ancheta',
            position: 'SK Chairman',
            image: sk1_cj,
            bio: 'Dedicated to serving the youth of our barangay with passion and commitment.',
            contact: '+63 912 345 6789',
            email: 'cj.ancheta@skbarangay.gov.ph',
            address: 'Barangay Tumana, Marikina City',
            recentActivities: []
          });
        }

        // Fetch announcements
        try {
          const announcementsResponse = await fetch(`${API_URL}/announcements`);
          if (announcementsResponse.ok) {
            const announcementsData = await announcementsResponse.json();
            setAnnouncements(announcementsData.slice(0, 3));
          }
        } catch (error) {
          console.error('Error fetching announcements:', error);
        }

        // Fetch accomplishments and projects in parallel
        const [accomplishmentsRes, projectsRes, statsRes] = await Promise.allSettled([
          fetch(`${API_URL}/accomplishments`),
          fetch(`${API_URL}/projects`),
          fetch(`${API_URL}/public/stats`) 
        ]);

        // Handle accomplishments
        if (accomplishmentsRes.status === 'fulfilled' && accomplishmentsRes.value.ok) {
          const accomplishmentsData = await accomplishmentsRes.value.json();
          setAccomplishments(accomplishmentsData.slice(0, 3));
          setStats(prev => ({ ...prev, accomplishments: accomplishmentsData.length || 0 }));
        }

        // Handle projects
        if (projectsRes.status === 'fulfilled' && projectsRes.value.ok) {
          const projectsData = await projectsRes.value.json();
          setStats(prev => ({ ...prev, activeProjects: Array.isArray(projectsData) ? projectsData.length : 0 }));
        }

  try {
    // Use your new public endpoint instead of the admin endpoint
    const statsResponse = await fetch(`${API_URL}/public/stats`);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('Public stats response:', statsData); // Debug log
      
      // Update stats based on your API response structure
      setStats(prev => ({
        ...prev,
        completedRequests: statsData.completed_requests || 0,
        activeProjects: statsData.active_projects || prev.activeProjects,
        accomplishments: statsData.accomplishments || prev.accomplishments
      }));
    } else {
      console.error('Failed to fetch public stats:', statsResponse.status);
      // Fallback to manual counting if needed
      await fetchRequestsManually();
    }
  } catch (error) {
    console.error('Error fetching public stats:', error);
    // Fallback to manual counting
    await fetchRequestsManually();
  }

  // Helper function for manual counting as fallback
  async function fetchRequestsManually() {
    try {
      const token = localStorage.getItem('authToken');
      const requestsResponse = await fetch(`${API_URL}/admin/requests`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (requestsResponse.ok) {
        const responseData = await requestsResponse.json();
        
        // Extract requests array
        let requestsArray = [];
        if (Array.isArray(responseData)) {
          requestsArray = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          requestsArray = responseData.data;
        } else if (responseData.requests && Array.isArray(responseData.requests)) {
          requestsArray = responseData.requests;
        }
        
        // Count completed requests
        const completedCount = requestsArray.filter(req => 
          req.status?.toLowerCase() === 'completed' || 
          req.status?.toLowerCase() === 'approved'
        ).length;
        
        setStats(prev => ({
          ...prev,
          completedRequests: completedCount
        }));
      }
    } catch (error) {
      console.error('Error in manual fetch:', error);
    }
  }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const services = [
    { title: "Document Requests", description: "Submit and track document requests", icon: <FileText className="h-6 w-6" />, link: "/services" },
    { title: "Facility Viewing", description: "Check facility availability", icon: <Building className="h-6 w-6" />, link: "/facilities" },
    { title: "Project Updates", description: "Stay informed about community projects", icon: <Award className="h-6 w-6" />, link: "/projects" },
    { title: "Announcements", description: "Latest news and updates", icon: <Megaphone className="h-6 w-6" />, link: "/announcements" },
  ];

  const displayStats = [
    { label: "Active Projects", value: stats.activeProjects.toString(), icon: <Building className="h-5 w-5" /> },
    { label: "Completed Requests", value: stats.completedRequests.toString(), icon: <CheckCircle className="h-5 w-5" /> },
    { label: "Accomplishments", value: stats.accomplishments.toString(), icon: <Award className="h-5 w-5" /> },
    { label: "Reports", value: stats.reports, icon: <BarChart3 className="h-5 w-5" /> },
  ];

  const getAnnouncementBadge = (priority) => {
    const styles = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
      default: "bg-blue-100 text-blue-800"
    };
    return styles[priority] || styles.default;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-government-blue/20 via-primary/10 to-government-red/20">
        <div className="absolute inset-0">
          <img src={heroImage} alt="SK Hero Banner" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/70"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="w-fit">Digital Barangay Services</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Welcome to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-government-blue to-government-red">
                  Barangay Tumana
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Your digital gateway to barangay services. Submit requests, book facilities, stay updated with community announcements, and connect with your local government.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="bg-gradient-to-r from-government-blue to-primary">
                  <Link to="/projects">Explore Services <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+63 912 345 6789</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>sktumana.marikina@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Barangay Tumana, Marikina City</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={barangayHall} 
                  alt="Barangay Hall" 
                  className="w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {displayStats.map((s, i) => (
            <div key={i}>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">{s.icon}</div>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold">{s.value}</h3>
              <p className="text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kagawad of the Day Section */}
      {featuredKagawad && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <KagawadOfTheDay kagawad={featuredKagawad} />
          </div>
        </section>
      )}

      {/* Announcements Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Megaphone className="h-6 w-6 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">Latest Announcements</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getAnnouncementBadge(announcement.priority)}>
                        {(announcement.priority || 'info').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(announcement.created_at)}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3">{announcement.content}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground">No announcements available</p>
            )}
          </div>
          <div className="text-center mt-8">
            <Button asChild>
              <Link to="/announcements">View All Announcements</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Accomplishments */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Recent Accomplishments</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the impactful projects and initiatives we've completed to enhance our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {accomplishments.length > 0 ? (
              accomplishments.map((accomplishment) => (
                <Card key={accomplishment.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{accomplishment.category || 'General'}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(accomplishment.created_at)}
                      </span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {accomplishment.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-600 leading-relaxed line-clamp-3">
                      {accomplishment.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{accomplishment.location || 'Barangay Tumana'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground">No accomplishments available</p>
            )}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild>
              <Link to="/accomplishments">View All Accomplishments</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Discover the digital services we offer to make your barangay experience seamless and efficient.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <Link to={service.link}>
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      {service.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardTitle className="mb-2 group-hover:text-primary">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      

      {/* Footer / Social Media Section */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4 text-center text-gray-300">
          <h3 className="text-lg font-semibold text-white mb-6">
            SK Tumana 2023
          </h3>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/p/SK-Tumana-2023-61553850061537/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition"
            >
              <Facebook size={18} />
              <span>SK Tumana 2023</span>
            </a>
            {/* Instagram */}
            <a
              href="https://www.instagram.com/sktumana/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition"
            >
              <Instagram size={18} />
              <span>@sktumana</span>
            </a>
            {/* Email */}
            <a
              href="mailto:sktumana.marikina@gmail.com"
              className="flex items-center gap-2 hover:text-white transition"
            >
              <Mail size={18} />
              <span>sktumana.marikina@gmail.com</span>
            </a>
          </div>
          <p className="mt-8 text-xs text-gray-500">
            © {new Date().getFullYear()} SK Tumana. All rights reserved.
          </p>
        </div>           
      </section>
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedbackSubmit}
      />
      <FeedbackButton onClick={() => setShowFeedback(true)} />
    </div>
  );
}