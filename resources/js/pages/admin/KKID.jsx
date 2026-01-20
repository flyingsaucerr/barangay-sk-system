import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, Search, Plus, Edit, Trash2, X, Eye, Calendar, Phone, MapPin, Mail, 
  Loader2, Printer, Download, Camera, QrCode, Barcode, Signature, Clock
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


const AdminKKID = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showIDModal, setShowIDModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedIDProfile, setSelectedIDProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  // Initialize formData with proper default values
  const initialFormData = {
    full_name: '',
    address: '',
    birthday: '',
    gender: '',
    emergency_contact_name: '',
    emergency_contact_address: '',
    emergency_contact_birthday: '',
    emergency_contact_number: '',
    emergency_contact_relationship: '',
    civil_status: '',
    kkid_number: '',
    validity_date: '',
    youth_organization: '',
    email: '',
    facebook_account: '',
    contact_number: '',
    is_voter: false,
    precinct_number: '',
    status: 'pending'
  };

    const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      
      #id-card-template, #id-card-template * {
        visibility: visible;
      }
      
      #id-card-template {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 3.375in !important;
        height: 2.125in !important;
        box-shadow: none !important;
        border: 1px solid #000 !important;
      }
      
      * {
        -webkit-print-color-adjust: exact;
      }
      
      @page {
        margin: 0;
        size: 3.375in 2.125in;
      }
    }
  `;


  const [formData, setFormData] = useState(initialFormData);

  // Fetch profiles
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      let url = '/api/kkid-profiles';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const headers = {
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        headers: headers,
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setProfiles(data.data.data || data.data || []);
        setStatistics(data.statistics || {
          total: data.data?.total || 0,
          approved: data.data?.approved || 0,
          pending: data.data?.pending || 0,
          rejected: data.data?.rejected || 0
        });
      } else {
        let errorMessage = data.message || 'Failed to fetch profiles';
        
        if (data.error) {
          errorMessage += `: ${data.error}`;
        }
        
        if (data.errors) {
          errorMessage += ' - ' + Object.values(data.errors).flat().join(', ');
        }
        
        toast.error(errorMessage);
        
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          navigate('/admin/login');
        }
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to load KKID profiles. Please check your connection.');
      
      setProfiles([]);
      setStatistics({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Load profiles on component mount and when filters change
  useEffect(() => {
    fetchProfiles();
  }, [searchTerm, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleViewProfile = (profile) => {
    setSelectedProfile(profile);
    setShowViewModal(true);
  };

  const handleViewID = (profile) => {
    setSelectedIDProfile(profile);
    setShowIDModal(true);
  };

  const handleAddProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/kkid-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success("KKID profile added successfully!");
        setShowForm(false);
        resetForm();
        fetchProfiles();
      } else {
        if (data.errors) {
          Object.entries(data.errors).forEach(([field, messages]) => {
            toast.error(`${field}: ${messages[0]}`);
          });
        } else {
          toast.error(data.message || 'Failed to add profile');
        }
      }
    } catch (error) {
      console.error('Error adding profile:', error);
      toast.error('Failed to add KKID profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
    setFormData({
      full_name: profile.full_name || '',
      address: profile.address || '',
      birthday: profile.birthday ? profile.birthday.split('T')[0] : '',
      gender: profile.gender || '',
      emergency_contact_name: profile.emergency_contact_name || '',
      emergency_contact_address: profile.emergency_contact_address || '',
      emergency_contact_birthday: profile.emergency_contact_birthday ? profile.emergency_contact_birthday.split('T')[0] : '',
      emergency_contact_number: profile.emergency_contact_number || '',
      emergency_contact_relationship: profile.emergency_contact_relationship || '',
      civil_status: profile.civil_status || '',
      kkid_number: profile.kkid_number || '',
      validity_date: profile.validity_date ? profile.validity_date.split('T')[0] : '',
      youth_organization: profile.youth_organization || '',
      email: profile.email || '',
      facebook_account: profile.facebook_account || '',
      contact_number: profile.contact_number || '',
      is_voter: profile.is_voter || false,
      precinct_number: profile.precinct_number || '',
      status: profile.status || 'pending'
    });
    setShowForm(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/kkid-profiles/${editingProfile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success("KKID profile updated successfully!");
        setShowForm(false);
        setEditingProfile(null);
        resetForm();
        fetchProfiles();
      } else {
        if (data.errors) {
          Object.entries(data.errors).forEach(([field, messages]) => {
            toast.error(`${field}: ${messages[0]}`);
          });
        } else {
          toast.error(data.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update KKID profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProfile = async (id) => {
    if (!window.confirm('Are you sure you want to delete this KKID profile?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/kkid-profiles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success("KKID profile deleted successfully!");
        fetchProfiles();
      } else {
        toast.error(data.message || 'Failed to delete profile');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete KKID profile');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === undefined || value === null ? '' : value
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/kkid-profiles/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success(`Profile status updated to ${newStatus}`);
        fetchProfiles();
        if (selectedProfile) {
          setSelectedProfile(data.data);
        }
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update profile status');
    }
  };

  // ID Card Functions
const handlePrintID = async () => {
    setPrinting(true);
    try {
      const idCard = document.getElementById('id-card-template');
      const canvas = await html2canvas(idCard, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        imageTimeout: 0,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>KKID Card - ${selectedIDProfile.full_name}</title>
            <style>
              body { 
                margin: 0; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh;
                background: white;
              }
              img { 
                max-width: 100%; 
                height: auto;
                image-rendering: crisp-edges;
                width: 3.375in;
                height: 2.125in;
              }
              @media print {
                @page { 
                  margin: 0; 
                  size: 3.375in 2.125in;
                }
                body { 
                  margin: 0;
                  min-height: 0;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="KKID Card" />
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  setTimeout(() => window.close(), 500);
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (error) {
      console.error('Error printing ID:', error);
      toast.error('Failed to print ID card');
    } finally {
      setPrinting(false);
    }
  };

  const handleDownloadPDF = async () => {
    setPrinting(true);
    try {
      const idCard = document.getElementById('id-card-template');
      const canvas = await html2canvas(idCard, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [86, 54]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 86, 54);
      pdf.save(`KKID-${selectedIDProfile.kkid_number}.pdf`);
      toast.success('ID card downloaded successfully!');
    } catch (error) {
      console.error('Error downloading ID:', error);
      toast.error('Failed to download ID card');
    } finally {
      setPrinting(false);
    }
  };

  const handleDownloadImage = async () => {
    setPrinting(true);
    try {
      const idCard = document.getElementById('id-card-template');
      const canvas = await html2canvas(idCard, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `KKID-${selectedIDProfile.kkid_number}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('ID card image downloaded!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    } finally {
      setPrinting(false);
    }
  };

  // ID Card Layout Component
  const IDCardLayout = ({ profile }) => (
    <div className="bg-white p-8 flex flex-col items-center">
      <div 
        id="id-card-template"
        className="w-[345px] h-[217px] bg-gradient-to-br from-blue-50 to-white border-4 border-blue-600 rounded-2xl shadow-2xl relative overflow-hidden"
      >
        {/* ID Card Design */}
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-blue-600"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4 text-6xl font-bold text-blue-400">KKID</div>
          <div className="absolute bottom-4 left-4 text-4xl font-bold text-blue-300 rotate-12">YOUTH</div>
        </div>
        
        <div className="p-4 h-full flex">
          {/* Left Section - Logo and Main Info */}
          <div className="w-1/3 pr-3 border-r border-blue-200">
            <div className="mb-3">
              <div className="text-center">
                <div className="inline-block p-2 bg-blue-600 rounded-lg">
                  <User className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="mt-2 text-center">
                <div className="text-xs text-gray-500">KKID No.</div>
                <div className="font-bold text-sm text-blue-700">{profile.kkid_number}</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="relative w-24 h-24 mx-auto border-2 border-blue-500 rounded-lg bg-gray-100 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
                <div className="absolute bottom-0 w-full bg-blue-600 text-white text-xs py-1 text-center">
                  PHOTO
                </div>
              </div>
            </div>
            
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-500">Valid Until</div>
              <div className="font-bold text-xs text-red-600">
                {new Date(profile.validity_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: '2-digit',
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
          
          {/* Right Section - Personal Details */}
          <div className="w-2/3 pl-3">
            <div className="mb-2">
              <h2 className="font-bold text-lg truncate">{profile.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-green-100 text-green-800 text-xs">
                  {profile.status === 'approved' ? 'ACTIVE' : profile.status.toUpperCase()}
                </Badge>
                <span className="text-xs text-gray-600">{profile.gender}</span>
              </div>
            </div>
            
            <div className="space-y-1.5 text-xs">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-gray-500">Birthday:</div>
                <div className="font-medium">
                  {new Date(profile.birthday).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: '2-digit',
                    year: 'numeric' 
                  })}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <div className="text-gray-500">Civil Status:</div>
                <div className="font-medium">{profile.civil_status}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <div className="text-gray-500">Contact:</div>
                <div className="font-medium">{profile.contact_number}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <div className="text-gray-500">Address:</div>
                <div className="font-medium truncate">{profile.address.split(',')[0]}</div>
              </div>
              
              {profile.youth_organization && (
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-gray-500">Organization:</div>
                  <div className="font-medium truncate">{profile.youth_organization}</div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-1">
                <div className="text-gray-500">Voter:</div>
                <div className="font-medium">{profile.is_voter ? 'YES' : 'NO'}</div>
              </div>
            </div>
            
            {/* Signature Section */}
            <div className="mt-3 pt-2 border-t border-dashed border-gray-300">
              <div className="text-center">
                <div className="text-xs text-gray-500">Authorized Signature</div>
                <div className="h-6 border-b border-gray-400 w-3/4 mx-auto"></div>
                <div className="text-[10px] text-gray-500 mt-1">Katipunan ng Kabataan</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Watermark */}
        <div className="absolute bottom-1 right-2 text-[8px] text-gray-400">
          ID: {profile.id.toString().padStart(6, '0')}
        </div>
      </div>
      
      {/* Print & Download Buttons */}
      <div className="mt-6 flex gap-3">
        <Button
          onClick={handlePrintID}
          disabled={printing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {printing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Printer className="h-4 w-4 mr-2" />
          )}
          Print ID Card
        </Button>
        
        <Button
          onClick={handleDownloadPDF}
          disabled={printing}
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        
        <Button
          onClick={handleDownloadImage}
          disabled={printing}
          variant="outline"
        >
          <Camera className="h-4 w-4 mr-2" />
          Save as Image
        </Button>
      </div>
    </div>
  );

  // Form rendering function
  const renderForm = () => (
    <form onSubmit={editingProfile ? handleUpdateProfile : handleAddProfile} className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <Input
            type="text"
            value={formData.full_name}
            onChange={(e) => handleInputChange("full_name", e.target.value)}
            required
            placeholder="Enter full name"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Birthday *
          </label>
          <Input
            type="date"
            value={formData.birthday}
            onChange={(e) => handleInputChange("birthday", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender *
          </label>
          <Select
            value={formData.gender}
            onValueChange={(value) => handleInputChange("gender", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Civil Status *
          </label>
          <Select
            value={formData.civil_status}
            onValueChange={(value) => handleInputChange("civil_status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select civil status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Single">Single</SelectItem>
              <SelectItem value="Married">Married</SelectItem>
              <SelectItem value="Widowed">Widowed</SelectItem>
              <SelectItem value="Separated">Separated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Complete Address *
        </label>
        <Textarea
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          rows={3}
          required
          placeholder="Enter complete address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number *
          </label>
          <Input
            value={formData.contact_number}
            onChange={(e) => handleInputChange("contact_number", e.target.value)}
            required
            placeholder="Enter contact number"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter email address"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            KKID Number *
          </label>
          <Input
            value={formData.kkid_number}
            onChange={(e) => handleInputChange("kkid_number", e.target.value)}
            required
            placeholder="Enter KKID number"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Validity Date *
          </label>
          <Input
            type="date"
            value={formData.validity_date}
            onChange={(e) => handleInputChange("validity_date", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Youth Organization
        </label>
        <Input
          value={formData.youth_organization}
          onChange={(e) => handleInputChange("youth_organization", e.target.value)}
          placeholder="Enter youth organization"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Facebook Account
        </label>
        <Input
          value={formData.facebook_account}
          onChange={(e) => handleInputChange("facebook_account", e.target.value)}
          placeholder="Enter Facebook account"
        />
      </div>

      {/* Emergency Contact Fields */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-4">Emergency Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Name *
            </label>
            <Input
              value={formData.emergency_contact_name}
              onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
              required
              placeholder="Enter emergency contact name"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship *
            </label>
            <Select
              value={formData.emergency_contact_relationship}
              onValueChange={(value) => handleInputChange("emergency_contact_relationship", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Father">Father</SelectItem>
                <SelectItem value="Mother">Mother</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Guardian">Guardian</SelectItem>
                <SelectItem value="Relative">Relative</SelectItem>
                <SelectItem value="Friend">Friend</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Birthday *
            </label>
            <Input
              type="date"
              value={formData.emergency_contact_birthday}
              onChange={(e) => handleInputChange("emergency_contact_birthday", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Number *
            </label>
            <Input
              value={formData.emergency_contact_number}
              onChange={(e) => handleInputChange("emergency_contact_number", e.target.value)}
              required
              placeholder="Enter emergency contact number"
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact Address *
          </label>
          <Textarea
            value={formData.emergency_contact_address}
            onChange={(e) => handleInputChange("emergency_contact_address", e.target.value)}
            rows={2}
            required
            placeholder="Enter emergency contact address"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_voter"
            checked={formData.is_voter}
            onCheckedChange={(checked) => handleInputChange("is_voter", checked)}
          />
          <label htmlFor="is_voter" className="text-sm font-medium text-gray-700">
            Registered Voter
          </label>
        </div>
        {formData.is_voter && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precinct Number
            </label>
            <Input
              value={formData.precinct_number}
              onChange={(e) => handleInputChange("precinct_number", e.target.value)}
              placeholder="Enter precinct number"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleInputChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              {editingProfile ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            editingProfile ? 'Update Profile' : 'Add Profile'
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          disabled={submitting}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Add the print styles as a style tag */}
      <style>{printStyles}</style>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <User className="h-8 w-8 text-primary" />
            <span>Manage KKID Profiles</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage Katipunan ng Kabataan ID applications and profiles
          </p>
        </div>
        
        <Button 
          onClick={() => {
            setEditingProfile(null);
            setShowForm(true);
            resetForm();
          }}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add KKID Profile
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, KKID number, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{statistics.total}</div>
            <div className="text-sm text-muted-foreground">Total Profiles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{statistics.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{statistics.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{statistics.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading KKID profiles...</p>
        </div>
      )}

      {/* KKID Profiles Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-all duration-300 group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {profile.full_name}
                      </CardTitle>
                      <Badge className={getStatusColor(profile.status)}>
                        {getStatusText(profile.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditProfile(profile)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDeleteProfile(profile.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardDescription className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{profile.birthday ? new Date(profile.birthday).toLocaleDateString() : 'N/A'}</span>
                    <span>•</span>
                    <span>{profile.gender || 'N/A'}</span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">KKID:</span>
                      <span>{profile.kkid_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.contact_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="line-clamp-2">{profile.address || 'N/A'}</span>
                    </div>
                    {profile.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{profile.email}</span>
                      </div>
                    )}
                  </div>

                  {profile.youth_organization && (
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {profile.youth_organization}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewProfile(profile)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewID(profile)}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      View ID
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {profiles.length === 0 && (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No KKID profiles found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search terms or filters"
                  : "No KKID profiles have been added yet"}
              </p>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Profile Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProfile ? 'Edit KKID Profile' : 'Add New KKID Profile'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={submitting}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {renderForm()}
          </div>
        </div>
      )}

      {/* View Profile Details Modal */}
      {showViewModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">{selectedProfile.full_name}</h2>
              <button
                onClick={() => setShowViewModal(false)}
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
                  <span>Birthday: {selectedProfile.birthday ? new Date(selectedProfile.birthday).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Gender: {selectedProfile.gender || 'N/A'}</span>
                </div>
                <Badge className={getStatusColor(selectedProfile.status)}>
                  {getStatusText(selectedProfile.status)}
                </Badge>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Applied: {selectedProfile.application_date ? new Date(selectedProfile.application_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">KKID Number:</span>
                      <span>{selectedProfile.kkid_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Civil Status:</span>
                      <span>{selectedProfile.civil_status || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Contact:</span>
                      <span>{selectedProfile.contact_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{selectedProfile.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Facebook:</span>
                      <span>{selectedProfile.facebook_account || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Youth Org:</span>
                      <span>{selectedProfile.youth_organization || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Registered Voter:</span>
                      <span>{selectedProfile.is_voter ? 'Yes' : 'No'}</span>
                    </div>
                    {selectedProfile.is_voter && selectedProfile.precinct_number && (
                      <div className="flex justify-between">
                        <span className="font-medium">Precinct Number:</span>
                        <span>{selectedProfile.precinct_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Emergency Contact</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{selectedProfile.emergency_contact_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Relationship:</span>
                      <span>{selectedProfile.emergency_contact_relationship || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Contact Number:</span>
                      <span>{selectedProfile.emergency_contact_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Birthday:</span>
                      <span>{selectedProfile.emergency_contact_birthday ? new Date(selectedProfile.emergency_contact_birthday).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Address</h3>
                <p className="text-gray-700">{selectedProfile.address || 'N/A'}</p>
              </div>

              {/* Emergency Contact Address */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Emergency Contact Address</h3>
                <p className="text-gray-700">{selectedProfile.emergency_contact_address || 'N/A'}</p>
              </div>

              {/* Validity */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-800">KKID Validity</h4>
                    <p className="text-blue-700">Valid until: {selectedProfile.validity_date ? new Date(selectedProfile.validity_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  {selectedProfile.approved_date && (
                    <div className="text-right">
                      <p className="text-sm text-blue-600">Approved on: {new Date(selectedProfile.approved_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditProfile(selectedProfile);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  <Edit className="mr-2 h-4 w-4 inline" />
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleViewID(selectedProfile);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  <Printer className="mr-2 h-4 w-4 inline" />
                  View ID Card
                </button>
                <select 
                  value={selectedProfile.status}
                  onChange={(e) => handleStatusChange(selectedProfile.id, e.target.value)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors border-none cursor-pointer text-center"
                >
                  <option value="pending">Mark as Pending</option>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

{/* ID Card Modal */}
{showIDModal && selectedIDProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                KKID Card - {selectedIDProfile.full_name}
              </h2>
              <button
                onClick={() => setShowIDModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={printing}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* ID Card Display Section */}
            <div className="bg-white p-8 flex flex-col items-center">
              <div 
                id="id-card-template"
                className="w-[345px] h-[217px] bg-gradient-to-br from-blue-50 to-white border-4 border-blue-600 rounded-2xl shadow-2xl relative overflow-hidden"
                style={{
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact'
                }}
              >
          {/* ID Card Design */}
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-blue-600"></div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 text-6xl font-bold text-blue-400">KKID</div>
            <div className="absolute bottom-4 left-4 text-4xl font-bold text-blue-300 rotate-12">YOUTH</div>
          </div>
          
          <div className="p-4 h-full flex">
            {/* Left Section - Logo and Main Info */}
            <div className="w-1/3 pr-3 border-r border-blue-200">
              <div className="mb-3">
                <div className="text-center">
                  <div className="inline-block p-2 bg-blue-600 rounded-lg">
                    <User className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs text-gray-500">KKID No.</div>
                  <div className="font-bold text-sm text-blue-700">{selectedIDProfile.kkid_number}</div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="relative w-24 h-24 mx-auto border-2 border-blue-500 rounded-lg bg-gray-100 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="absolute bottom-0 w-full bg-blue-600 text-white text-xs py-1 text-center">
                    PHOTO
                  </div>
                </div>
              </div>
              
              <div className="mt-2 text-center">
                <div className="text-xs text-gray-500">Valid Until</div>
                <div className="font-bold text-xs text-red-600">
                  {new Date(selectedIDProfile.validity_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: '2-digit',
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
            
            {/* Right Section - Personal Details */}
            <div className="w-2/3 pl-3">
              <div className="mb-2">
                <h2 className="font-bold text-lg truncate">{selectedIDProfile.full_name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {selectedIDProfile.status === 'approved' ? 'ACTIVE' : selectedIDProfile.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-gray-600">{selectedIDProfile.gender}</span>
                </div>
              </div>
              
              <div className="space-y-1.5 text-xs">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-gray-500">Birthday:</div>
                  <div className="font-medium">
                    {new Date(selectedIDProfile.birthday).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: '2-digit',
                      year: 'numeric' 
                    })}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-gray-500">Civil Status:</div>
                  <div className="font-medium">{selectedIDProfile.civil_status}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-gray-500">Contact:</div>
                  <div className="font-medium">{selectedIDProfile.contact_number}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-gray-500">Address:</div>
                  <div className="font-medium truncate">{selectedIDProfile.address?.split(',')[0] || ''}</div>
                </div>
                
                {selectedIDProfile.youth_organization && (
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-gray-500">Organization:</div>
                    <div className="font-medium truncate">{selectedIDProfile.youth_organization}</div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-gray-500">Voter:</div>
                  <div className="font-medium">{selectedIDProfile.is_voter ? 'YES' : 'NO'}</div>
                </div>
              </div>
              
              {/* Signature Section */}
              <div className="mt-3 pt-2 border-t border-dashed border-gray-300">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Authorized Signature</div>
                  <div className="h-6 border-b border-gray-400 w-3/4 mx-auto"></div>
                  <div className="text-[10px] text-gray-500 mt-1">Katipunan ng Kabataan</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Watermark */}
          <div className="absolute bottom-1 right-2 text-[8px] text-gray-400">
            ID: {selectedIDProfile.id?.toString().padStart(6, '0') || '000000'}
          </div>
        </div>
        
        {/* Print & Download Buttons */}
        <div className="mt-6 flex gap-3">
                <Button
                  onClick={handlePrintID}
                  disabled={printing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {printing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Printer className="h-4 w-4 mr-2" />
                  )}
                  Print ID Card
                </Button>
                
                <Button
                  onClick={handleDownloadPDF}
                  disabled={printing}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                
                <Button
                  onClick={handleDownloadImage}
                  disabled={printing}
                  variant="outline"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Save as Image
                </Button>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                <p className="mb-2 font-medium">Printing Instructions:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use standard ID card paper (PVC recommended for durability)</li>
                  <li>Print at 100% scale for correct dimensions</li>
                  <li>Standard ID size: 3.375" × 2.125" (85.6 × 54 mm)</li>
                  <li>For best results, use a color printer with high resolution</li>
                  <li>Laminate the printed ID for water resistance</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-800 font-medium">Note:</p>
                  <p className="text-blue-700 text-sm">This ID is only valid when signed and accompanied by an official stamp.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKKID;