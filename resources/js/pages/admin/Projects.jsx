import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Search, Calendar, MapPin, Users, Plus, Edit, Trash2, X, Hammer, Wrench } from "lucide-react";

const AdminProjects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingProject, setViewingProject] = useState(null);
  const userRole = localStorage.getItem('userRole') || 'resident';
  const authToken = localStorage.getItem('authToken');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    full_description: '',
    start_date: '',
    end_date: '',
    status: 'planning',
    location: '',
    beneficiaries: '',
    progress: '0',
    category: 'Infrastructure'
  });

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/projects', {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        let data = await response.json();

        const now = new Date();
        for (let project of data) {
          // Check if project has passed end date and is not completed
          if (project.status !== 'completed' && new Date(project.end_date) < now) {
            // Update status and progress locally
            project.status = 'completed';
            project.progress = 100;

            // Update in backend
            try {
              await fetch(`http://localhost:8000/api/projects/${project.id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
                body: JSON.stringify({ ...project, status: 'completed', progress: 100 }),
              });
            } catch (err) {
              console.error(`Failed to auto-complete project ${project.id}:`, err);
            }
          }
        }

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

  const getPlaceholderImage = (category, title) => {
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
      <div className={`w-full h-full ${color} flex items-center justify-center`}>
        <div className="text-center p-4">
          <IconComponent className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <span className="text-gray-500 text-sm">Project Image</span>
        </div>
      </div>
    );
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          beneficiaries: parseInt(formData.beneficiaries),
          progress: parseInt(formData.progress),
        }),
      });

      if (response.ok) {
        await fetchProjects();
        setShowProjectForm(false);
        resetForm();
        alert('Project created successfully!');
      } else {
        const errorText = await response.text();
        console.error('Failed to create project:', response.status, errorText);
        alert('Failed to create project: ' + errorText);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project: ' + error.message);
    }
  };

  const handleEditProject = (project) => {
  setEditingProject(project);
  setFormData({
    title: project.title,
    description: project.description,
    full_description: project.full_description || '',
    start_date: project.start_date,
    end_date: project.end_date,    
    status: project.status,
    location: project.location,
    beneficiaries: project.beneficiaries.toString(),
    progress: project.progress.toString(),
    category: project.category
  });
  setShowProjectForm(true);
};


  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          beneficiaries: parseInt(formData.beneficiaries),
          progress: parseInt(formData.progress),
        }),
      });

      if (response.ok) {
        await fetchProjects();
        setShowProjectForm(false);
        setEditingProject(null);
        resetForm();
        alert('Project updated successfully!');
      } else {
        const errorText = await response.text();
        console.error('Failed to update project:', response.status, errorText);
        alert('Failed to update project: ' + errorText);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project: ' + error.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchProjects();
        alert('Project deleted successfully!');
      } else {
        const errorText = await response.text();
        console.error('Failed to delete project:', response.status, errorText);
        alert('Failed to delete project: ' + errorText);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project: ' + error.message);
    }
  };

  const handleProgressChange = async (id, newProgress) => {
    try {
      const project = projects.find(p => p.id === id);
      const response = await fetch(`http://localhost:8000/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...project,
          progress: parseInt(newProgress),
        }),
      });

      if (response.ok) {
        await fetchProjects();
      } else {
        const errorText = await response.text();
        console.error('Failed to update project progress:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error updating project progress:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const project = projects.find(p => p.id === id);
      const response = await fetch(`http://localhost:8000/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...project,
          status: newStatus,
        }),
      });

      if (response.ok) {
        await fetchProjects();
      } else {
        const errorText = await response.text();
        console.error('Failed to update project status:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      full_description: '',
      start_date: '',
      end_date: '',
      status: 'planning',
      location: '',
      beneficiaries: '',
      progress: '0',
      category: 'Infrastructure'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
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
            <Building className="h-8 w-8 text-primary" />
            <span>Manage Projects</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Add, edit, and track community development projects
          </p>
        </div>

        {(userRole === 'admin' || userRole === 'staff') && (
          <Button 
            onClick={() => {
              setEditingProject(null);
              setShowProjectForm(true);
              resetForm();
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
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
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {projects.filter(p => p.status === 'ongoing').length}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {projects.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {projects.reduce((sum, p) => sum + p.beneficiaries, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Beneficiaries</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-all duration-300 group">
            <div className="relative overflow-hidden rounded-t-lg aspect-video">
              {project.image ? (
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <div className={`w-full h-full ${!project.image ? 'block' : 'hidden'}`}>
                {getPlaceholderImage(project.category, project.title)}
              </div>
              
              <Badge className={`absolute top-3 right-3 border ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </Badge>
            </div>

            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                  <Badge variant="outline">{project.category}</Badge>
                </div>

                {(userRole === 'admin' || userRole === 'staff') && (
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditProject(project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDeleteProject(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <CardDescription>{project.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress Bar with Edit */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Project Progress</span>
                  {(userRole === 'admin' || userRole === 'staff') ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={project.progress}
                        onChange={(e) => handleProgressChange(project.id, e.target.value)}
                        className="w-16 h-8 text-sm text-center"
                      />
                      <span>%</span>
                    </div>
                  ) : (
                    <span>{project.progress}%</span>
                  )}
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
                  <span>{new Date(project.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{project.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(project.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{project.beneficiaries} beneficiaries</span>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="grid grid-cols-2 gap-2">
                {(userRole === 'admin' || userRole === 'staff') ? (
                  <Select value={project.status} onValueChange={(value) => handleStatusChange(project.id, value)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusText(project.status)}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setViewingProject(project)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No projects have been added yet"}
          </p>
        </div>
      )}

      {/* View Project Details Modal */}
      {viewingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
              <button
                onClick={() => setViewingProject(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800">Title</h3>
                <p className="text-gray-700">{viewingProject.title}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">Full Description</h3>
                <p className="text-gray-700">{viewingProject.full_description || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Start Date:</strong> {new Date(viewingProject.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div>
                  <strong>End Date:</strong> {new Date(viewingProject.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div>
                  <strong>Location:</strong> {viewingProject.location}
                </div>
                <div>
                  <strong>Beneficiaries:</strong> {viewingProject.beneficiaries}
                </div>
                <div>
                  <strong>Category:</strong> {viewingProject.category}
                </div>
                <div>
                  <strong>Status:</strong> {getStatusText(viewingProject.status)}
                </div>
                <div className="col-span-2">
                  <strong>Progress:</strong> {viewingProject.progress}%
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                    <div
                      className={`h-3 rounded-full ${getProgressColor(viewingProject.progress)}`}
                      style={{ width: `${viewingProject.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setViewingProject(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Project Form */}
      {showProjectForm && (userRole === 'admin' || userRole === 'staff') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button
                onClick={() => setShowProjectForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={editingProject ? handleUpdateProject : handleAddProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="Enter project title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  required
                  placeholder="Brief project description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Description
                </label>
                <Textarea
                  value={formData.full_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_description: e.target.value }))}
                  rows="4"
                  placeholder="Detailed project description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                    placeholder="Project location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beneficiaries *
                  </label>
                  <Input
                    type="number"
                    value={formData.beneficiaries}
                    onChange={(e) => setFormData(prev => ({ ...prev, beneficiaries: e.target.value }))}
                    required
                    placeholder="Number of beneficiaries"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Environment">Environment</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Social Services">Social Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData(prev => ({ ...prev, progress: e.target.value }))}
                  placeholder="0-100"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  {editingProject ? 'Update Project' : 'Add Project'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProjectForm(false)}
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
  );
};

export default AdminProjects;