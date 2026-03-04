import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Search, Calendar, MapPin, Users, ArrowRight, X, Hammer, Wrench } from "lucide-react";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from Laravel API
  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/projects', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "ongoing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "planning":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed": return "Completed";
      case "ongoing": return "In Progress";
      case "planning": return "Planning Phase";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  const getProjectImage = (project) => {
    // Check if project has an image
    if (project.image) {
      const imageUrl = `http://localhost:8000/storage/${project.image}`;
      return (
        <img
          src={imageUrl}
          alt={project.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            // Show placeholder on error
            const parent = e.target.parentNode;
            const placeholder = getPlaceholderContent(project.category, project.title);
            parent.innerHTML = placeholder.props.children;
          }}
        />
      );
    }
    
    // Otherwise show placeholder
    return getPlaceholderContent(project.category, project.title);
  };

  const getPlaceholderContent = (category, title) => {
    const colors = [
      'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 
      'bg-purple-100', 'bg-pink-100', 'bg-indigo-100'
    ];
    const color = colors[title.length % colors.length];
    
    let IconComponent = Building;
    
    if (category === 'Infrastructure') {
      IconComponent = Hammer;
    } else if (category === 'Environment') {
      IconComponent = Wrench;
    } else if (category === 'Education') {
      IconComponent = Users;
    } else if (category === 'Sports') {
      IconComponent = MapPin;
    } else if (category === 'Health') {
      IconComponent = Users;
    }
    
    return (
      <div className={`w-full h-48 ${color} flex items-center justify-center`}>
        <div className="text-center p-4">
          <IconComponent className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <span className="text-gray-500 text-sm">{title}</span>
        </div>
      </div>
    );
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetails(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  const totalBeneficiaries = projects.reduce((sum, p) => sum + p.beneficiaries, 0);
  const ongoingCount = projects.filter(p => p.status === 'ongoing').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const planningCount = projects.filter(p => p.status === 'planning').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-indigo-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Building className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Community Projects</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Track the progress of ongoing community development projects and initiatives in our barangay
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Counter */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length} projects • 
            <span className="text-green-600 font-semibold"> {ongoingCount} in progress</span>
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{projects.length}</div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{ongoingCount}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{completedCount}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">{totalBeneficiaries}</div>
              <div className="text-sm text-muted-foreground">Total Beneficiaries</div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-all duration-300 group border-0 shadow-md overflow-hidden">
              <div className="relative overflow-hidden rounded-t-lg h-48 bg-gray-100">
                {getProjectImage(project)}
                <Badge className={`absolute top-3 right-3 border ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </Badge>
              </div>

              <CardHeader className="pb-3">
                <div className="space-y-2">
                  <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                    {project.title}
                  </CardTitle>
                  <Badge variant="outline">{project.category}</Badge>
                  <CardDescription className="text-sm leading-relaxed">
                    {project.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Project Progress</span>
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Start: {formatDate(project.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>End: {formatDate(project.end_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{project.beneficiaries} beneficiaries</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 group"
                  onClick={() => handleViewDetails(project)}
                >
                  View Project Details
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search terms or filters"
                : "No community projects are currently listed"}
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

        {/* Project Details Modal */}
        {showDetails && selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Project Image in Modal */}
                {selectedProject.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={`http://localhost:8000/storage/${selectedProject.image}`}
                      alt={selectedProject.title}
                      className="w-full max-h-96 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Header Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedProject.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedProject.status)}>
                      {getStatusText(selectedProject.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium">Start:</span>
                    <span>{formatDate(selectedProject.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium">End:</span>
                    <span>{formatDate(selectedProject.end_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium">Location:</span>
                    <span>{selectedProject.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium">Beneficiaries:</span>
                    <span>{selectedProject.beneficiaries}</span>
                  </div>
                </div>

                {/* Progress Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Project Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Completion Status</span>
                      <span className="font-semibold">{selectedProject.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all duration-300 ${getProgressColor(selectedProject.progress)}`}
                        style={{ width: `${selectedProject.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Full Description */}
                {selectedProject.full_description && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Project Details</h3>
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {selectedProject.full_description}
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Impact */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2 text-indigo-800">Community Impact</h3>
                  <p className="text-indigo-700 text-sm">
                    This project will benefit {selectedProject.beneficiaries} residents and contribute to the 
                    overall development of our community. The {selectedProject.category.toLowerCase()} improvements 
                    will enhance the quality of life and provide better opportunities for all residents.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
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
          <p className="text-gray-400 mt-2">Stay updated with our community development initiatives</p>
        </div>
      </footer>
    </div>
  );
};

export default Projects;