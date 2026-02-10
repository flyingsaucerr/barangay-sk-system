import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  BarChart3,
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
  Star,
  TrendingUp,
  Plus,
  Facebook,
  Instagram
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/sk-hero-banner.jpg";
import barangayHall from "@/assets/barangayHall.jpg";


// StatsCard Component
const StatsCard = ({ title, value, icon: Icon, description, trend }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="p-3 rounded-full bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// KagawadSpotlight Component
const KagawadSpotlight = ({ kagawad }) => (
  <Card className="lg:col-span-1">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Users className="h-5 w-5 text-primary" />
        <span>Featured Kagawad</span>
      </CardTitle>
      <CardDescription>Meet your dedicated public servant</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold">{kagawad.name}</h4>
          <p className="text-sm text-primary">{kagawad.position}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{kagawad.bio}</p>
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{kagawad.contact}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{kagawad.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{kagawad.address}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function CombinedHome() {
  const { user } = useAuth?.() || {};

  // Services for public section
  const services = [

    { title: "Document Requests", description: "Solicitation, suggestions", icon: <FileText className="h-6 w-6" />, link: "/admin/requests" },
    { title: "Facility Viewing", description: "Track facility status", icon: <Building className="h-6 w-6" />, link: "/admin/facilities" },
    { title: "Project Updates", description: "Stay informed about community development projects", icon: <Award className="h-6 w-6" />, link: "/admin/projects" },
    { title: "Announcements", description: "Latest news and updates from your barangay", icon: <Megaphone className="h-6 w-6" />, link: "/admin/announcements" },
  ];

  const features = [
    { title: "24/7 Online Services", description: "Submit requests anytime, anywhere", icon: <Clock className="h-5 w-5 text-primary" /> },
    { title: "Real-time Updates", description: "Track your request status in real-time", icon: <CheckCircle className="h-5 w-5 text-primary" /> },
    { title: "Transparent Process", description: "Clear and transparent service delivery", icon: <Star className="h-5 w-5 text-primary" /> },
  ];

 const publicStats = [
    { label: "Active Projects", value: "23", icon: <Building className="h-5 w-5" /> },
    { label: "Completed Requests", value: "890", icon: <CheckCircle className="h-5 w-5" /> },
    { label: "Accomplishmentys", value: "15", icon: <Award className="h-5 w-5" /> },
    { label: "Reports", value: "Monthly", icon: <BarChart3 className="h-5 w-5" /> },
  ];

  // Dashboard data
  const dashboardStats = {
    pendingRequests: 12,
    approvedRequests: 156,
    completedRequests: 142,
    totalProjects: 23,
    activeAnnouncements: 5
  };

  const featuredKagawad = {
    id: '1',
    name: 'Maria Santos',
    position: 'SK Chairman',
    avatar: '/placeholder.svg',
    bio: 'Dedicated to serving the youth of our barangay with passion and commitment. Leading various community programs and youth development initiatives.',
    contact: '+63 912 345 6789',
    email: 'maria.santos@skbarangay.gov.ph',
    address: 'Barangay San Jose, Quezon City',
    dateStarted: 'January 2023'
  };

  const recentAnnouncements = [
    {
      id: 1,
      title: 'Community Basketball Tournament 2024',
      date: '2024-01-15',
      preview: 'Join us for the annual basketball tournament...'
    },
    {
      id: 2,
      title: 'Youth Leadership Seminar',
      date: '2024-01-12',
      preview: 'Empowering the next generation of leaders...'
    },
    {
      id: 3,
      title: 'Barangay Cleanup Drive',
      date: '2024-01-10',
      preview: 'Let\'s work together to keep our community clean...'
    }
  ];

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
                  SK Tumana
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Your digital gateway to barangay services. Submit requests, book facilities, stay updated with community announcements, and connect with your local government.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Button size="lg" asChild className="bg-gradient-to-r from-government-blue to-primary">
                    <Link to="/dashboard">Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                ) : (
                  <Button size="lg" asChild className="bg-gradient-to-r from-government-blue to-primary">
                    <Link to="/admin/Dashboard">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                )}
                <Button variant="outline" size="lg" asChild><Link to="/admin/About">Learn More</Link></Button>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>+63 912 345 6789</span></div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>sktumana.marikina@gmail.com</span></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>Barangay Marikina, Marikina City</span></div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {/* Resized image - added max height and object-cover */}
                <img 
                  src={barangayHall} 
                  alt="Barangay Hall" 
                  className="w-full  object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Section (Only for logged-in users) */}
      {user && (
        <section className="py-8 bg-muted/20">
          <div className="container mx-auto px-4 space-y-8">
            {/* Dashboard Hero */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-government-blue via-primary to-government-red p-8 text-white">
              <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Welcome to SK Tumana
                </h1>
                <p className="text-lg mb-6 opacity-90">
                  Your digital gateway to barangay services and community engagement
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" size="lg" asChild>
                    <Link to="/requests">
                      <Plus className="mr-2 h-4 w-4" />
                      Submit Request
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Schedule
                  </Button>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/20 z-0"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatsCard
                title="Pending Requests"
                value={dashboardStats.pendingRequests}
                icon={Clock}
                description="+2 from yesterday"
                trend="up"
              />
              <StatsCard
                title="Approved Requests"
                value={dashboardStats.approvedRequests}
                icon={CheckCircle}
                description="+12 this month"
                trend="up"
              />
              <StatsCard
                title="Completed Projects"
                value={dashboardStats.completedRequests}
                icon={Award}
                description="85% completion rate"
                trend="up"
              />
              <StatsCard
                title="Active Projects"
                value={dashboardStats.totalProjects}
                icon={Building}
                description="3 new this quarter"
                trend="neutral"
              />
              <StatsCard
                title="Announcements"
                value={dashboardStats.activeAnnouncements}
                icon={Megaphone}
                description="2 posted today"
                trend="up"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Kagawad Spotlight */}
              <KagawadSpotlight kagawad={featuredKagawad} />

              {/* Recent Announcements */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Megaphone className="h-5 w-5 text-primary" />
                      <span>Recent Announcements</span>
                    </CardTitle>
                    <CardDescription>Latest community updates</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/announcements">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-primary pl-4 py-2">
                      <h4 className="font-medium text-sm mb-1">{announcement.title}</h4>
                      <p className="text-xs text-muted-foreground mb-1">{announcement.date}</p>
                      <p className="text-sm text-muted-foreground">{announcement.preview}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>Frequently used features and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                    <Link to="/requests">
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">New Request</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                    <Link to="/facilities">
                      <Building className="h-6 w-6" />
                      <span className="text-sm">Book Facility</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                    <Link to="/reports">
                      <Award className="h-6 w-6" />
                      <span className="text-sm">View Reports</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                    <Link to="/About">
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Contact Us</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Public Stats (Only for non-logged-in users) */}
      {!user && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {publicStats.map((s, i) => (
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
      )}

      {/* Services Section (For all users) */}
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

      {/* Features Section (For all users) */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose Digital Services?</h2>
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
    </div>
  );
}