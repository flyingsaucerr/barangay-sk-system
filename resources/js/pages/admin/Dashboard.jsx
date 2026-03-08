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
  Plus,
  Facebook,
  Instagram,
  Edit,
  Camera,
  CalendarDays,
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/sk-hero-banner.jpg";
import barangayHall from "@/assets/barangayHall.jpg";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import sk1_cj from "@/assets/sk1_cj.jpg";
import sk2_melody from "@/assets/sk2_melody.jpg";
import sk3_moana from "@/assets/sk3_moana.jpg";
import sk4_dollar from "@/assets/sk4_dollar.jpg";
import sk5_paul from "@/assets/sk5_paul.jpg";
import sk6_danilo from "@/assets/sk6_danilo.jpg";
import sk7_rie from "@/assets/sk7_rie.jpg";
import sk8_jemimah from "@/assets/sk8_jemimah.jpg";

// StatsCard Component (keep for dashboard stats if needed)
const StatsCard = ({ title, value, icon: Icon, description }) => (
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

// Edit Kagawad Modal
const EditKagawadModal = ({ isOpen, onClose, kagawad, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    contact: '',
    email: '',
    address: '',
    dateStarted: '',
    photo: null,
    photoFile: null // Add this for file uploads
  });

  useEffect(() => {
    if (kagawad) {
      setFormData({
        name: kagawad.name || '',
        position: kagawad.position || '',
        bio: kagawad.bio || '',
        contact: kagawad.contact || '',
        email: kagawad.email || '',
        address: kagawad.address || '',
        dateStarted: kagawad.dateStarted || '',
        photo: kagawad.photo || null,
        photoFile: null
      });
    }
  }, [kagawad]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ 
          ...formData, 
          photo: reader.result,
          photoFile: file 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    // If a new photo was uploaded, use it; otherwise keep the original
    const updatedKagawad = {
      ...kagawad,
      ...formData,
      photo: formData.photo // This will be either the original imported image or the new uploaded one
    };
    onSave(updatedKagawad);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Kagawad Information</DialogTitle>
          <DialogDescription>
            Update the kagawad's details and photo. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted">
                {formData.photo ? (
                  <img 
                    src={formData.photo} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load');
                      e.target.src = ''; // Clear on error
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <Users className="h-8 w-8 text-primary/50" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: Square image, max 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Rest of the form remains the same */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g., SK Chairman"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Description</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief description about the kagawad"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="+63 XXX XXX XXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Complete address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateStarted">Date Started</Label>
            <Input
              id="dateStarted"
              value={formData.dateStarted}
              onChange={(e) => setFormData({ ...formData, dateStarted: e.target.value })}
              placeholder="e.g., January 2023"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add Activity Modal
const AddActivityModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleSubmit = () => {
    if (formData.title && formData.description) {
      onSave(formData);
      setFormData({ title: '', date: new Date().toISOString().split('T')[0], description: '' });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Recent Activity</DialogTitle>
          <DialogDescription>
            Add a new activity that the kagawad has recently accomplished.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="activityTitle">Activity Title</Label>
            <Input
              id="activityTitle"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Community Youth Summit"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityDate">Date</Label>
            <Input
              id="activityDate"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityDescription">Description</Label>
            <Textarea
              id="activityDescription"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the activity"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Activity</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SelectKagawadModal = ({ isOpen, onClose, kagawads, onSelect }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Kagawad of the Day</DialogTitle>
          <DialogDescription>
            Choose a kagawad to feature as the "Kagawad of the Day".
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {kagawads.map((k) => (
            <Card 
              key={k.id} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => {
                onSelect(k);
                onClose();
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                    {k.photo ? (
                      <img 
                        src={k.photo} 
                        alt={k.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load image for', k.name);
                          e.target.src = ''; // Clear on error
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Users className="h-6 w-6 text-primary/50" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{k.name}</h4>
                    <p className="text-xs text-muted-foreground">{k.position}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// KagawadManagement Component
const KagawadManagement = ({ 
  kagawad, 
  onEdit, 
  onAddActivity, 
  onDeleteActivity,
  onSelectNewKagawad 
}) => (
  <Card className="w-full">
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <span>Kagawad of the Day Management</span>
        </CardTitle>
        <CardDescription>Manage featured kagawad and their activities</CardDescription>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onSelectNewKagawad}>
          <CalendarDays className="h-4 w-4 mr-2" />
          Change Featured
        </Button>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Kagawad
        </Button>
        <Button size="sm" onClick={onAddActivity}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kagawad Photo */}
        <div className="space-y-4">
          <div className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {kagawad.photo ? (
                <img 
                  src={kagawad.photo} 
                  alt={kagawad.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <Users className="h-12 w-12 text-primary/50" />
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <h4 className="font-semibold text-lg">{kagawad.name}</h4>
            <p className="text-sm text-primary">{kagawad.position}</p>
            <Badge variant="outline" className="mt-2">
              <CalendarDays className="h-3 w-3 mr-1" />
              Featured Today
            </Badge>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h5 className="font-medium">Contact Information</h5>
          <div className="space-y-3 text-sm">
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
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">Started: {kagawad.dateStarted}</p>
            <p className="text-sm text-muted-foreground mt-1">{kagawad.bio}</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">Recent Activities</h5>
            <Button variant="ghost" size="sm" onClick={onAddActivity}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {kagawad.recentActivities?.map((activity, index) => (
              <div key={index} className="border-l-2 border-primary pl-3 py-1 group relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-2 -top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteActivity(index)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.date}</p>
                <p className="text-xs mt-1">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  // Check authentication from localStorage directly
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showSelectKagawadModal, setShowSelectKagawadModal] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    
    if (token && (role === 'admin' || role === 'staff')) {
      setIsAuthenticated(true);
      setUser({
        name: name || 'Admin User',
        role: role,
        isAuthenticated: true
      });
    }
  }, []);

  // All kagawads list
const [allKagawads, setAllKagawads] = useState([
  {
    id: '1',
    name: 'CJ Ancheta',
    position: 'SK Chairman',
    photo: sk1_cj, // Use imported image directly
    bio: 'Dedicated to serving the youth of our barangay with passion and commitment. Leads various community programs and youth development initiatives.',
    contact: '+63 912 345 6789',
    email: 'cj.ancheta@skbarangay.gov.ph',
    address: 'Barangay Tumana, Marikina City',
    dateStarted: 'January 2023',
    recentActivities: [
      {
        title: 'Community Youth Summit',
        date: '2024-01-15',
        description: 'Organized and led the annual youth leadership summit with 200+ attendees.'
      },
      {
        title: 'Basketball Tournament',
        date: '2024-01-10',
        description: 'Spearheaded the inter-barangay basketball competition.'
      }
    ]
  },
  {
    id: '2',
    name: 'Melody Acuin', // Fixed: Changed from Dollar Cristal to Melody
    position: 'SK Kagawad',
    photo: sk2_melody, // Use imported image
    bio: 'Passionate about health programs and youth engagement. Regularly conducts seminars and workshops for teens.',
    contact: '+63 915 678 2345',
    email: 'melody.acuin@skbarangay.gov.ph', // Fixed email
    address: 'Barangay Tumana, Marikina City',
    dateStarted: 'February 2023',
    recentActivities: [
      {
        title: 'Youth Health Workshop',
        date: '2024-02-20',
        description: 'Conducted a workshop on mental and physical health awareness.'
      }
    ]
  },
  {
    id: '3',
    name: 'Moanna Maye Calanda', // Fixed: Changed from Jemimah to Moanna
    position: 'SK Kagawad',
    photo: sk3_moana, // Use imported image
    bio: 'Environmental advocate and youth community organizer. Leads disaster preparedness and eco-awareness campaigns.',
    contact: '+63 921 234 5679',
    email: 'moanna.calanda@skbarangay.gov.ph', // Fixed email
    address: 'Barangay Tumana, Marikina City',
    dateStarted: 'July 2023',
    recentActivities: [
      {
        title: 'Barangay Tree Planting',
        date: '2024-02-15',
        description: 'Led a tree planting activity in the barangay park with volunteers from the youth council.'
      }
    ]
  },
  {
    id: '4',
    name: 'Dollar Cristal', // Fixed: Changed from Paul to Dollar
    position: 'SK Kagawad',
    photo: sk4_dollar, // Use imported image
    bio: 'Sports enthusiast and youth advocate. Organizes sports tournaments and promotes healthy lifestyles.',
    contact: '+63 918 234 5678',
    email: 'dollar.cristal@skbarangay.gov.ph', // Fixed email
    address: 'Barangay Tumana, Marikina City',
    dateStarted: 'April 2023',
    recentActivities: [
      {
        title: 'Barangay Sports Festival',
        date: '2024-03-10',
        description: 'Organized the annual youth sports festival with basketball and volleyball tournaments.'
      }
    ]
  },
  {
    id: '5',
    name: 'Paul Michael Bandril', // Fixed: Changed from Rie to Paul
    position: 'SK Kagawad',
    photo: sk5_paul, // Use imported image
    bio: 'Champion of cultural and educational activities for the youth. Coordinates community arts and literacy programs.',
    contact: '+63 919 876 5432',
    email: 'paul.bandril@skbarangay.gov.ph', // Fixed email
    address: 'Barangay Tumana, Marikina City',
    dateStarted: 'May 2023',
    recentActivities: [
      {
        title: 'Youth Arts Program',
        date: '2024-02-25',
        description: 'Hosted an art workshop for high school students.'
      }
    ]
  },
  {
    id: '6',
    name: 'Danilo Cervantes', // Fixed: Changed from Melody to Danilo
    position: 'SK Kagawad',
    photo: sk6_danilo, // Use imported image
    bio: 'Passionate about livelihood projects and environmental protection. Helps youth with career guidance and eco-initiatives.',
    contact: '+63 920 567 8912',
    email: 'danilo.cervantes@skbarangay.gov.ph', // Fixed email
    address: 'Barangay Tumana, Marikina City',
    dateStarted: 'June 2023',
    recentActivities: [
      {
        title: 'Youth Livelihood Fair',
        date: '2024-01-30',
        description: 'Organized a fair introducing livelihood opportunities for young residents.'
      }
    ]
  },
  {
    id: '7',
    name: 'Rie Alden Borlongan', // Fixed: Changed from Moanna to Rie
    position: 'SK Kagawad',
    photo: sk7_rie, // Use imported image
    bio: 'Focused on anti-drug programs and social protection initiatives. Engages with youth in community awareness campaigns.',
    contact: '+63 922 345 6781',
    email: 'rie.borlongan@skbarangay.gov.ph', // Fixed email
    address: 'Barangay Tumana, Marikina City',
    dateStarted: 'August 2023',
    recentActivities: [
      {
        title: 'Anti-Drug Awareness Campaign',
        date: '2024-03-05',
        description: 'Conducted seminars and street campaigns educating youth on anti-drug awareness.'
      }
    ]
  },
  {
    id: '8',
    name: 'Jemimah Keziah Isipin', // Fixed: Changed from Danilo to Jemimah
    position: 'SK Kagawad',
    photo: sk8_jemimah, // Use imported image
    bio: 'Focuses on education and gender development programs for the youth. Actively participates in community learning events.',
    contact: '+63 917 345 6780',
    email: 'jemimah.isipin@skbarangay.gov.ph', // Fixed email
    address: 'Barangay Tumana, Marikina City',
    dateStarted: 'March 2023',
    recentActivities: [
      {
        title: 'Women Empowerment Seminar',
        date: '2024-01-18',
        description: 'Led a seminar promoting leadership and empowerment among young women.'
      }
    ]
  }
]);

  // Featured kagawad (Kagawad of the Day)
  const [featuredKagawad, setFeaturedKagawad] = useState(allKagawads[0]);

  // Services
  const services = [
    { title: "Document Requests", description: "Solicitation, suggestions", icon: <FileText className="h-6 w-6" />, link: "/admin/requests" },
    { title: "Facility Viewing", description: "Track facility status", icon: <Building className="h-6 w-6" />, link: "/admin/facilities" },
    { title: "Project Updates", description: "Stay informed about community development projects", icon: <Award className="h-6 w-6" />, link: "/admin/projects" },
    { title: "Announcements", description: "Latest news and updates from your barangay", icon: <Megaphone className="h-6 w-6" />, link: "/admin/announcements" },
  ];

  const dashboardStats = {
    pendingRequests: 12,
    approvedRequests: 156,
    completedRequests: 142,
    totalProjects: 23,
    activeAnnouncements: 5
  };

  // CRUD Operations
  const handleEditKagawad = () => {
    setShowEditModal(true);
  };

const handleSaveKagawad = (updatedKagawad) => {
  setFeaturedKagawad(updatedKagawad);
  
  // Update in allKagawads list - preserve the photo
  setAllKagawads(prevKagawads => 
    prevKagawads.map(k => 
      k.id === updatedKagawad.id ? updatedKagawad : k
    )
  );

  // Save to localStorage - store only metadata
  const kagawadForStorage = {
    ...updatedKagawad,
    photo: updatedKagawad.id // Store ID reference instead of actual image
  };
  
  localStorage.setItem('featuredKagawad', JSON.stringify(kagawadForStorage));
};

  const handleAddActivity = (newActivity) => {
    const updatedKagawad = {
      ...featuredKagawad,
      recentActivities: [newActivity, ...(featuredKagawad.recentActivities || [])]
    };
    setFeaturedKagawad(updatedKagawad);
    
    // Update in allKagawads list
    setAllKagawads(allKagawads.map(k => 
      k.id === updatedKagawad.id ? updatedKagawad : k
    ));

    // Save to localStorage
    localStorage.setItem('featuredKagawad', JSON.stringify(updatedKagawad));
  };

  const handleDeleteActivity = (index) => {
    const updatedActivities = featuredKagawad.recentActivities.filter((_, i) => i !== index);
    const updatedKagawad = {
      ...featuredKagawad,
      recentActivities: updatedActivities
    };
    setFeaturedKagawad(updatedKagawad);
    
    // Update in allKagawads list
    setAllKagawads(allKagawads.map(k => 
      k.id === updatedKagawad.id ? updatedKagawad : k
    ));

    // Save to localStorage
    localStorage.setItem('featuredKagawad', JSON.stringify(updatedKagawad));
  };

const handleSelectNewKagawad = (selectedKagawad) => {
  const kagawadForStorage = {
    ...selectedKagawad,

    photo: selectedKagawad.id 
  };
  
  localStorage.setItem('featuredKagawad', JSON.stringify(kagawadForStorage));
};

  // Load featured kagawad from localStorage on component mount
useEffect(() => {
  const savedKagawad = localStorage.getItem('featuredKagawad');
  if (savedKagawad) {
    try {
      const parsed = JSON.parse(savedKagawad);
      
      // Find the full kagawad object from allKagawads using the stored ID
      const fullKagawad = allKagawads.find(k => k.id === parsed.id);
      
      if (fullKagawad) {
        // Use the full kagawad object which includes the actual image
        setFeaturedKagawad(fullKagawad);
      } else {
        // Fallback to first kagawad
        setFeaturedKagawad(allKagawads[0]);
      }
    } catch (error) {
      console.error('Error loading featured kagawad:', error);
      setFeaturedKagawad(allKagawads[0]);
    }
  } else {
    // Set default featured kagawad
    setFeaturedKagawad(allKagawads[0]);
  }
}, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Modals */}
      <EditKagawadModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        kagawad={featuredKagawad}
        onSave={handleSaveKagawad}
      />

      <AddActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSave={handleAddActivity}
      />

      <SelectKagawadModal
        isOpen={showSelectKagawadModal}
        onClose={() => setShowSelectKagawadModal(false)}
        kagawads={allKagawads}
        onSelect={handleSelectNewKagawad}
      />

      {/* Hero Section - Original with barangay hall image */}
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
                <Button size="lg" asChild className="bg-gradient-to-r from-government-blue to-primary">
                  <Link to="/admin/dashboard">Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button variant="outline" size="lg" asChild><Link to="/admin/about">Learn More</Link></Button>
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

      {/* Dashboard Section (Only for logged-in users) */}
      {isAuthenticated && (
        <section className="py-8 bg-muted/20">
          <div className="container mx-auto px-4 space-y-8">

            {/* Kagawad Management Panel */}
            <KagawadManagement 
              kagawad={featuredKagawad}
              onEdit={handleEditKagawad}
              onAddActivity={() => setShowActivityModal(true)}
              onDeleteActivity={handleDeleteActivity}
              onSelectNewKagawad={() => setShowSelectKagawadModal(true)}
            />

            {/* Services Section */}
            <section className="py-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our Services</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Discover the digital services we offer to make your barangay experience seamless and efficient.
                </p>
              </div>

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
            </section>
          </div>
        </section>
      )}

      {/* Footer / Social Media Section - Original */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4 text-center text-gray-300">
          <h3 className="text-lg font-semibold text-white mb-6">
            SK Tumana 2023
          </h3>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm">
            <a
              href="https://www.facebook.com/p/SK-Tumana-2023-61553850061537/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition"
            >
              <Facebook size={18} />
              <span>SK Tumana 2023</span>
            </a>
            <a
              href="https://www.instagram.com/sktumana/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition"
            >
              <Instagram size={18} />
              <span>@sktumana</span>
            </a>
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
};

export default AdminDashboard;