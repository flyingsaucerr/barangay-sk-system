import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Users, 
  Calendar,
  Megaphone,
  Building,
  Award,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";

import heroImage from "@/assets/sk-hero-banner.jpg";
import barangayHall from "@/assets/barangayHall.jpg";

export default function PublicHome() {
  const services = [
    { title: "Document Requests", description: "Solication, suggestions", icon: <FileText className="h-6 w-6" />, link: "/services" },
    { title: "Facility Viewing", description: "Track facility status", icon: <Building className="h-6 w-6" />, link: "/facilities" },
    { title: "Project Updates", description: "Stay informed about community development projects", icon: <Award className="h-6 w-6" />, link: "/projects" },
    { title: "Announcements", description: "Latest news and updates from your barangay", icon: <Megaphone className="h-6 w-6" />, link: "/announcements" },
  ];

  const features = [
    { title: "24/7 Online Services", description: "Submit requests anytime, anywhere", icon: <Clock className="h-5 w-5 text-primary" /> },
    { title: "Real-time Updates", description: "Track your request status in real-time", icon: <CheckCircle className="h-5 w-5 text-primary" /> },
    { title: "Transparent Process", description: "Clear and transparent service delivery", icon: <Star className="h-5 w-5 text-primary" /> },
  ];

  const stats = [
    { label: "Active Projects", value: "23", icon: <Building className="h-5 w-5" /> },
    { label: "Served Residents", value: "1,250+", icon: <Users className="h-5 w-5" /> },
    { label: "Completed Requests", value: "890", icon: <CheckCircle className="h-5 w-5" /> },
    { label: "Community Programs", value: "15", icon: <Award className="h-5 w-5" /> },
  ];

  const recentAccomplishments = [
    {
      id: 1,
      title: "Road Rehabilitation Project",
      description: "Completed the rehabilitation of 2km main road with proper drainage system",
      location: "Zone 1 - Main Road",
      date: "2024-01-10",
      category: "Infrastructure"
    },
    {
      id: 2,
      title: "Street Light Installation",
      description: "Installed 50 new LED street lights in dark areas of the barangay",
      location: "Various Locations",
      date: "2023-12-15",
      category: "Public Safety"
    },
    {
      id: 3,
      title: "Drainage System Improvement",
      description: "Improved drainage system in flood-prone areas to prevent flooding during rainy season",
      location: "Zone 3 & 4",
      date: "2023-11-20",
      category: "Infrastructure"
    }
  ];

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

  // Get badge color based on announcement type
  const getAnnouncementBadge = (type) => {
    const styles = {
      success: "bg-green-100 text-green-800",
      info: "bg-blue-100 text-blue-800",
      warning: "bg-yellow-100 text-yellow-800",
      default: "bg-gray-100 text-gray-800"
    };
    return styles[type] || styles.default;
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
                  <Link to="/services">Explore Services <ArrowRight className="ml-2 h-5 w-5" /></Link>
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
          {stats.map((s, i) => (
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

      {/* Announcements Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Megaphone className="h-6 w-6 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">Latest Announcements</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getAnnouncementBadge(announcement.type)}>
                      {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDate(announcement.date)}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button asChild variant="outline">
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
            {recentAccomplishments.map((accomplishment) => (
              <Card key={accomplishment.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{accomplishment.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(accomplishment.date)}
                    </span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {accomplishment.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600 leading-relaxed">
                    {accomplishment.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{accomplishment.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
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

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose Our Services?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Experience modern, efficient, and transparent barangay services.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i}>
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-background shadow-lg">{f.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 bg-gradient-to-r from-government-blue to-government-red">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Need Assistance?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get in touch with our barangay officials for any inquiries or assistance you may need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contact">
                Contact Us <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link to="/visit">Visit Barangay Hall</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}