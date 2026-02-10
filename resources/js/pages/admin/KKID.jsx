import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, Search, Plus, Edit, Trash2, X, Eye, Calendar, Phone, MapPin, Mail, 
  Loader2, Info, CheckCircle, Printer, Download, Camera,
  Upload, FlipHorizontal, Maximize2, Minimize2
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
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [showCardBack, setShowCardBack] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const photoInputRef = useRef(null);
  const idCardFrontRef = useRef(null);
  const idCardBackRef = useRef(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  const generateKKIDNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `KKID-${year}${month}${day}-${random}`;
  };

  const getDefaultValidityDate = () => {
    return '2028-12-31';
  };

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
    kkid_number: generateKKIDNumber(),
    validity_date: getDefaultValidityDate(),
    youth_organization: '',
    email: '',
    facebook_account: '',
    contact_number: '',
    is_voter: false,
    precinct_number: '',
    status: 'pending',
    photo_url: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  // Fetch profiles function
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
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        headers: headers,
        credentials: 'include'
      });
      
      const responseText = await response.text();
      
      if (!responseText.trim()) {
        throw new Error('Empty response from server');
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }
      
      if (response.ok) {
        if (data.success) {
          setProfiles(data.data?.data || data.data || []);
          setStatistics(data.statistics || {
            total: data.data?.total || data.data?.length || 0,
            approved: 0,
            pending: 0,
            rejected: 0
          });
        } else {
          let errorMessage = data.message || 'Failed to fetch profiles';
          if (data.error) errorMessage += `: ${data.error}`;
          if (data.errors) errorMessage += ' - ' + Object.values(data.errors).flat().join(', ');
          toast.error(errorMessage);
        }
      } else {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        if (data && data.message) errorMessage = data.message;
        if (data && data.error) errorMessage += `: ${data.error}`;
        toast.error(errorMessage);
        
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
        }
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      
      if (error.message.includes('Failed to fetch')) {
        toast.error('Network error. Please check your internet connection and server status.');
      } else if (error.message.includes('Empty response')) {
        toast.error('Server returned empty response. Check if API endpoint is working.');
      } else if (error.message.includes('Invalid JSON')) {
        toast.error('Server returned invalid data. Please check server logs.');
      } else {
        toast.error('Failed to load KKID profiles. Please try again.');
      }
      
      setProfiles([]);
      setStatistics({ total: 0, approved: 0, pending: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

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
    setPhotoPreview(profile.photo_url || null);
    setShowIDModal(true);
    setShowCardBack(false);
    setIsFullscreen(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setPhotoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== 'photo_url') {
          const value = formData[key];
          if (typeof value === 'boolean') {
            formDataToSend.append(key, value ? '1' : '0');
          } else {
            formDataToSend.append(key, value || '');
          }
        }
      });
      
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }
      
      const response = await fetch('/api/kkid-profiles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formDataToSend,
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== 'photo_url') {
          const value = formData[key];
          if (typeof value === 'boolean') {
            formDataToSend.append(key, value ? '1' : '0');
          } else {
            formDataToSend.append(key, value || '');
          }
        }
      });
      
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }
      
      formDataToSend.append('_method', 'PUT');
      
      const response = await fetch(`/api/kkid-profiles/${editingProfile.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formDataToSend,
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

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
    setPhotoPreview(profile.photo_url || null);
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
      kkid_number: profile.kkid_number || generateKKIDNumber(),
      validity_date: profile.validity_date ? profile.validity_date.split('T')[0] : getDefaultValidityDate(),
      youth_organization: profile.youth_organization || '',
      email: profile.email || '',
      facebook_account: profile.facebook_account || '',
      contact_number: profile.contact_number || '',
      is_voter: profile.is_voter || false,
      precinct_number: profile.precinct_number || '',
      status: profile.status || 'pending',
      photo_url: profile.photo_url || ''
    });
    setShowForm(true);
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
    setFormData({
      ...initialFormData,
      kkid_number: generateKKIDNumber(),
      validity_date: getDefaultValidityDate()
    });
    setPhotoPreview(null);
    setPhotoFile(null);
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

  const handlePrintBothSides = async () => {
    setPrinting(true);
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to print the ID card');
        return;
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>KKID - ${selectedIDProfile.full_name}</title>
          <style>
            @page { 
              size: 85.6mm 54mm; 
              margin: 0; 
            }
            body { 
              margin: 0; 
              padding: 0; 
              width: 85.6mm;
              height: 54mm;
              background: white;
              font-family: Arial, sans-serif;
            }
            .print-page { 
              width: 85.6mm;
              height: 54mm;
              position: relative;
              page-break-after: always;
              box-sizing: border-box;
            }
            @media print {
              body { margin: 0; }
              .print-page { 
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-page">
            ${createFixedIDCardHTML('front')}
          </div>
          <div class="print-page">
            ${createFixedIDCardHTML('back')}
          </div>
          <script>
            setTimeout(() => { 
              window.print(); 
              setTimeout(() => window.close(), 1000); 
            }, 500);
          </script>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      toast.success('Opening print dialog...');
      
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print. Please try downloading instead.');
    } finally {
      setPrinting(false);
    }
  };

  // Create fixed HTML for ID cards (for printing/downloading)
const createFixedIDCardHTML = (side = 'front') => {
  if (!selectedIDProfile) return '';
  
  const profile = selectedIDProfile;
  const isFront = side === 'front';
  
  // Helper to fix image URL
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${window.location.origin}${url}`;
    }
    return url;
  };
  
  let photoUrl = getImageUrl(profile.photo_url || '');
  
  // Update the img tag in the HTML to include onerror handler
  const photoHTML = photoUrl ? 
    `<img src="${photoUrl}" alt="${profile.full_name}" 
          style="width: 100%; height: 100%; object-fit: cover; display: block;" 
          crossOrigin="anonymous"
          onerror="this.onerror=null; this.src='data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
              <rect width="200" height="200" fill="#e0f2fe"/>
              <circle cx="100" cy="80" r="40" fill="#94a3b8"/>
              <rect x="60" y="130" width="80" height="40" rx="5" fill="#94a3b8"/>
            </svg>
          `)}';" />` :
    `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);">
      <svg width="12mm" height="12mm" viewBox="0 0 24 24" fill="#94a3b8"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
    </div>`;
  if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('data:')) {
    photoUrl = photoUrl.startsWith('/') ? `${window.location.origin}${photoUrl}` : photoUrl;
  }
  
  return `
    <div style="width: 85.6mm; height: 54mm; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 4mm; overflow: hidden; position: relative; font-family: Arial, sans-serif;">
      <!-- Watermark -->
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 20mm; font-weight: 900; color: rgba(255, 255, 255, 0.08); letter-spacing: 2mm; font-family: Arial Black, sans-serif; white-space: nowrap; z-index: 1;">
        KKID
      </div>
      
      <!-- Header -->
      <div style="background: rgba(255, 255, 255, 0.95); padding: 1.5mm 2mm; text-align: center; border-bottom: 0.5mm solid ${isFront ? '#fbbf24' : '#ef4444'}; position: absolute; top: 0; left: 0; right: 0; height: 6mm; z-index: 2; display: flex; flex-direction: column; justify-content: center;">
        <div style="font-size: 2.5mm; font-weight: bold; color: ${isFront ? '#1e40af' : '#dc2626'}; font-family: Arial Black, sans-serif; line-height: 1.1; letter-spacing: 0.05mm;">
          ${isFront ? 'KATIPUNAN NG KABATAAN' : 'IN CASE OF EMERGENCY'}
        </div>
        ${isFront ? '<div style="font-size: 1.8mm; color: #64748b; font-weight: 600; letter-spacing: 0.03mm;">OFFICIAL IDENTIFICATION CARD</div>' : ''}
      </div>
      
      <!-- Content -->
      <div style="position: absolute; top: 6mm; left: 2mm; right: 2mm; bottom: 2mm; z-index: 2;">
        ${isFront ? createFrontContentHTML(profile, photoUrl) : createBackContentHTML(profile)}
      </div>
      
      <!-- Footer -->
      <div style="position: absolute; bottom: 0.5mm; left: 50%; transform: translateX(-50%); font-size: 0.8mm; color: rgba(255,255,255,0.7); font-family: \'Courier New\', monospace; z-index: 2;">
        ${isFront ? `ID #${profile.id?.toString().padStart(6, '0') || '000000'}` : 'EMERGENCY CONTACT'}
      </div>
    </div>
  `;
};

const createFrontContentHTML = (profile, photoUrl) => {
  return `
    <div style="display: flex; gap: 2mm; height: 100%;">
      <!-- Left Column - Photo & ID Info -->
      <div style="width: 25.4mm; display: flex; flex-direction: column; gap: 1.2mm;">
        <!-- Photo Container -->
        <div style="width: 100%; height: 25.4mm; background: #ffffff; border-radius: 1mm; overflow: hidden; box-shadow: 0 0.3mm 1mm rgba(0,0,0,0.15); border: 0.3mm solid #fbbf24;">
          ${photoUrl ? 
            `<img src="${photoUrl}" alt="${profile.full_name}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />` :
            `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);">
              <svg width="12mm" height="12mm" viewBox="0 0 24 24" fill="#94a3b8"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>`
          }
        </div>

        <!-- KKID Number -->
        <div style="background: #ffffff; padding: 0.8mm; border-radius: 0.5mm; text-align: center; box-shadow: 0 0.2mm 0.5mm rgba(0,0,0,0.1); border: 0.1mm solid #e2e8f0;">
          <div style="font-size: 1.2mm; color: #64748b; font-weight: bold; margin-bottom: 0.3mm;">KKID NO.</div>
          <div style="font-size: 1.6mm; font-weight: bold; color: #1e40af; font-family: 'Courier New', monospace; letter-spacing: 0.1mm;">${profile.kkid_number}</div>
        </div>

        <!-- Validity -->
        <div style="background: #fef3c7; padding: 0.8mm; border-radius: 0.5mm; text-align: center; border: 0.2mm solid #fbbf24; margin-top: auto;">
          <div style="font-size: 1.1mm; color: #92400e; font-weight: bold; margin-bottom: 0.3mm;">VALID UNTIL</div>
          <div style="font-size: 1.5mm; font-weight: bold; color: #b45309;">${
            profile.validity_date ? 
              new Date(profile.validity_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric' 
              }).toUpperCase() : 'DEC 31, 2028'
          }</div>
        </div>
      </div>

      <!-- Right Column - Information -->
      <div style="flex: 1; background: rgba(255, 255, 255, 0.95); border-radius: 1mm; padding: 1.5mm; box-shadow: 0 0.3mm 1mm rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden;">
        <!-- Name -->
        <div style="font-size: 3mm; font-weight: bold; color: #1e293b; margin-bottom: 1mm; line-height: 1.1; text-transform: uppercase; border-bottom: 0.3mm solid #fbbf24; padding-bottom: 0.8mm; font-family: Arial Black, sans-serif; flex-shrink: 0; word-wrap: break-word;">
          ${profile.full_name || 'N/A'}
        </div>

        <!-- Status & Gender -->
        <div style="display: flex; gap: 1mm; margin-bottom: 1.2mm; flex-shrink: 0;">
          <div style="background: ${profile.status === 'approved' ? '#22c55e' : profile.status === 'pending' ? '#f59e0b' : profile.status === 'rejected' ? '#ef4444' : '#94a3b8'}; color: #ffffff; padding: 0.5mm 1mm; border-radius: 0.3mm; font-size: 1.2mm; font-weight: bold;">
            ${profile.status === 'approved' ? 'ACTIVE' : profile.status?.toUpperCase() || 'PENDING'}
          </div>
          <div style="background: #e0f2fe; color: #0c4a6e; padding: 0.5mm 1mm; border-radius: 0.3mm; font-size: 1.2mm; font-weight: bold;">
            ${profile.gender || 'N/A'}
          </div>
        </div>

        <!-- Personal Info -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 0.6mm; overflow-y: auto;">
          <!-- Birthday -->
          <div style="display: flex; align-items: flex-start;">
            <span style="color: #64748b; font-weight: bold; font-size: 1.2mm; width: 12mm; flex-shrink: 0;">Birthday:</span>
            <span style="color: #1e293b; font-weight: 600; font-size: 1.4mm; word-wrap: break-word; flex: 1;">
              ${profile.birthday ? 
                new Date(profile.birthday).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric' 
                }).toUpperCase() : 'N/A'
              }
            </span>
          </div>

          <!-- Contact -->
          <div style="display: flex; align-items: flex-start;">
            <span style="color: #64748b; font-weight: bold; font-size: 1.2mm; width: 12mm; flex-shrink: 0;">Contact:</span>
            <span style="color: #1e293b; font-weight: 600; font-size: 1.4mm; word-wrap: break-word; flex: 1;">
              ${profile.contact_number || 'N/A'}
            </span>
          </div>

          <!-- Address -->
          <div style="display: flex; align-items: flex-start;">
            <span style="color: #64748b; font-weight: bold; font-size: 1.2mm; width: 12mm; flex-shrink: 0;">Address:</span>
            <span style="color: #1e293b; font-weight: 600; font-size: 1.3mm; line-height: 1.2; word-wrap: break-word; flex: 1;">
              ${profile.address || 'N/A'}
            </span>
          </div>

          <!-- Youth Organization if exists -->
          ${profile.youth_organization ? `
            <div style="display: flex; align-items: flex-start;">
              <span style="color: #64748b; font-weight: bold; font-size: 1.2mm; width: 12mm; flex-shrink: 0;">Organization:</span>
              <span style="color: #1e293b; font-weight: 600; font-size: 1.4mm; word-wrap: break-word; flex: 1;">
                ${profile.youth_organization}
              </span>
            </div>
          ` : ''}
        </div>

        <!-- Signature Section -->
        <div style="margin-top: auto; padding-top: 1mm; border-top: 0.2mm dashed #cbd5e1; flex-shrink: 0;">
          <div style="text-align: center;">
            <div style="font-size: 0.9mm; color: #64748b; font-weight: bold; margin-bottom: 0.5mm;">AUTHORIZED SIGNATURE</div>
            <div style="width: 70%; margin: 0 auto; border-bottom: 0.2mm solid #1e293b; height: 1.5mm; margin-bottom: 0.3mm;"></div>
            <div style="font-size: 0.8mm; color: #64748b; font-style: italic;">Barangay Chairman</div>
          </div>
        </div>
      </div>
    </div>
  `;
};

const createBackContentHTML = (profile) => {
  return `
    <div style="height: 100%; display: flex; flex-direction: column;">
      <div style="background: rgba(255, 255, 255, 0.95); border-radius: 1mm; padding: 2mm; box-shadow: 0 0.3mm 1mm rgba(0,0,0,0.15); flex: 1; display: flex; flex-direction: column;">
        <div style="font-size: 1.8mm; font-weight: bold; color: #dc2626; margin-bottom: 1.5mm; text-align: center; padding-bottom: 0.8mm; border-bottom: 0.2mm solid #ef4444; font-family: Arial Black, sans-serif;">
          PLEASE CONTACT
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; gap: 1mm;">
          <!-- Contact Person -->
          <div>
            <div style="font-size: 1.1mm; color: #64748b; font-weight: bold; margin-bottom: 0.4mm;">Contact Person</div>
            <div style="font-size: 1.4mm; font-weight: 600; color: #475569; padding: 0.8mm; background: #f8fafc; border-radius: 0.5mm; border: 0.2mm solid #e2e8f0; text-align: center; word-wrap: break-word; line-height: 1.2;">
              ${profile.emergency_contact_name || 'N/A'}
            </div>
          </div>

          <!-- Relationship -->
          <div>
            <div style="font-size: 1.1mm; color: #64748b; font-weight: bold; margin-bottom: 0.4mm;">Relationship</div>
            <div style="font-size: 1.4mm; font-weight: 600; color: #475569; padding: 0.8mm; background: #f8fafc; border-radius: 0.5mm; border: 0.2mm solid #e2e8f0; text-align: center; word-wrap: break-word; line-height: 1.2;">
              ${profile.emergency_contact_relationship || 'N/A'}
            </div>
          </div>

          <!-- Contact Number -->
          <div>
            <div style="font-size: 1.1mm; color: #64748b; font-weight: bold; margin-bottom: 0.4mm;">Contact Number</div>
            <div style="font-size: 1.5mm; font-weight: bold; color: #dc2626; padding: 0.8mm; background: #fee2e2; border-radius: 0.5mm; border: 0.2mm solid #ef4444; font-family: 'Courier New', monospace; text-align: center; word-wrap: break-word; line-height: 1.2;">
              ${profile.emergency_contact_number || 'N/A'}
            </div>
          </div>

          <!-- Address -->
          <div>
            <div style="font-size: 1.1mm; color: #64748b; font-weight: bold; margin-bottom: 0.4mm;">Address</div>
            <div style="font-size: 1.3mm; font-weight: 600; color: #334155; padding: 0.8mm; background: #f8fafc; border-radius: 0.5mm; border: 0.2mm solid #e2e8f0; line-height: 1.2; word-wrap: break-word; max-height: 10mm; overflow: hidden;">
              ${profile.emergency_contact_address || 'N/A'}
            </div>
          </div>
        </div>

        <!-- Warning Notice -->
        <div style="margin-top: 1.5mm; padding: 0.8mm; background: #fef3c7; border-radius: 0.5mm; border: 0.2mm solid #fbbf24; text-align: center;">
          <div style="font-size: 0.9mm; color: #92400e; font-weight: bold; line-height: 1.2;">
            If found, please contact emergency person above or return to Barangay Hall.
          </div>
        </div>
      </div>
    </div>
  `;
};
const handleDownloadPDF = async () => {
  setPrinting(true);
  try {
    if (!selectedIDProfile) {
      toast.error('No profile selected for download');
      return;
    }

    // Function to create canvas for a side
    const createSideCanvas = async (side) => {
      // Create a temporary container
      const container = document.createElement('div');
      container.id = `temp-pdf-${side}-${Date.now()}`;
      
      // Get HTML content
      const htmlContent = side === 'front' 
        ? createFixedIDCardHTML('front') 
        : createFixedIDCardHTML('back');
      
      // Set container styles
      container.innerHTML = htmlContent;
      container.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 85.6mm !important;
        height: 54mm !important;
        background: white !important;
        z-index: 99999 !important;
        visibility: visible !important;
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      `;
      
      document.body.appendChild(container);
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // Use html2canvas with proper settings
        const canvas = await html2canvas(container, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: true,
          width: container.offsetWidth,
          height: container.offsetHeight,
          allowTaint: true,
          foreignObjectRendering: false,
          imageTimeout: 5000,
          onclone: (clonedDoc, clonedElement) => {
            // Fix image URLs to be absolute
            const images = clonedElement.querySelectorAll('img');
            images.forEach(img => {
              if (img.src && !img.src.startsWith('data:')) {
                // Make relative URLs absolute
                if (img.src.startsWith('/')) {
                  img.src = window.location.origin + img.src;
                }
                // Add cache busting
                img.src = img.src + (img.src.includes('?') ? '&' : '?') + 't=' + Date.now();
                img.crossOrigin = 'anonymous';
                
                // Set onerror handler
                img.onerror = function() {
                  console.warn('Failed to load image for PDF:', this.src);
                  // Use placeholder if image fails
                  this.src = 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                      <rect width="200" height="200" fill="#e0f2fe"/>
                      <circle cx="100" cy="80" r="40" fill="#94a3b8"/>
                      <rect x="60" y="130" width="80" height="40" rx="5" fill="#94a3b8"/>
                    </svg>
                  `);
                };
              }
            });
          }
        });
        
        // Clean up
        document.body.removeChild(container);
        
        return canvas;
      } catch (canvasError) {
        // Clean up on error
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        throw canvasError;
      }
    };

    // Create canvases for both sides
    console.log('Creating front side canvas...');
    const frontCanvas = await createSideCanvas('front');
    console.log('Front canvas created:', frontCanvas);
    
    console.log('Creating back side canvas...');
    const backCanvas = await createSideCanvas('back');
    console.log('Back canvas created:', backCanvas);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 54]
    });

    // Convert canvases to data URLs
    console.log('Converting canvases to data URLs...');
    const frontDataUrl = frontCanvas.toDataURL('image/jpeg', 0.95);
    const backDataUrl = backCanvas.toDataURL('image/jpeg', 0.95);

    // Add images to PDF
    console.log('Adding images to PDF...');
    pdf.addImage(frontDataUrl, 'JPEG', 0, 0, 85.6, 54, undefined, 'FAST');
    pdf.addPage([85.6, 54], 'landscape');
    pdf.addImage(backDataUrl, 'JPEG', 0, 0, 85.6, 54, undefined, 'FAST');

    // Save PDF
    const sanitizedName = selectedIDProfile.full_name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `KKID_${selectedIDProfile.kkid_number || selectedIDProfile.id}_${sanitizedName}.pdf`;
    
    console.log('Saving PDF:', fileName);
    pdf.save(fileName);

    toast.success('PDF downloaded successfully!');

  } catch (error) {
    console.error('PDF download error details:', error);
    
    // Fallback: Create a text-only PDF
    try {
      console.log('Attempting fallback PDF creation...');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add metadata
      pdf.setProperties({
        title: `KKID - ${selectedIDProfile.full_name}`,
        subject: 'Katipunan ng Kabataan ID Card',
        author: 'Barangay System',
        keywords: 'kkid, id, barangay',
        creator: 'KKID System'
      });

      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(30, 58, 138);
      pdf.text('KKID ID CARD', 105, 30, { align: 'center' });

      // Profile info section
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      
      const infoLines = [
        `NAME: ${selectedIDProfile.full_name}`,
        `KKID NUMBER: ${selectedIDProfile.kkid_number}`,
        `BIRTHDAY: ${selectedIDProfile.birthday ? new Date(selectedIDProfile.birthday).toLocaleDateString() : 'N/A'}`,
        `GENDER: ${selectedIDProfile.gender || 'N/A'}`,
        `ADDRESS: ${selectedIDProfile.address || 'N/A'}`,
        `CONTACT: ${selectedIDProfile.contact_number || 'N/A'}`,
        `EMAIL: ${selectedIDProfile.email || 'N/A'}`,
        `STATUS: ${selectedIDProfile.status?.toUpperCase() || 'PENDING'}`,
        `VALIDITY: ${selectedIDProfile.validity_date ? new Date(selectedIDProfile.validity_date).toLocaleDateString() : 'N/A'}`,
        '',
        '--- EMERGENCY CONTACT ---',
        `CONTACT PERSON: ${selectedIDProfile.emergency_contact_name || 'N/A'}`,
        `RELATIONSHIP: ${selectedIDProfile.emergency_contact_relationship || 'N/A'}`,
        `CONTACT NUMBER: ${selectedIDProfile.emergency_contact_number || 'N/A'}`,
        `ADDRESS: ${selectedIDProfile.emergency_contact_address || 'N/A'}`
      ];

      // Add lines with proper formatting
      let yPos = 50;
      infoLines.forEach(line => {
        if (line.length > 80) {
          // Split long lines
          const parts = [];
          for (let i = 0; i < line.length; i += 80) {
            parts.push(line.substring(i, i + 80));
          }
          parts.forEach(part => {
            pdf.text(part, 20, yPos);
            yPos += 7;
          });
        } else {
          pdf.text(line, 20, yPos);
          yPos += 7;
        }
      });

      // Add QR Code placeholder
      yPos += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Scan QR Code for Digital Verification', 105, yPos, { align: 'center' });
      
      // Add rectangle for QR code
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(80, yPos + 5, 50, 50);
      pdf.text('[QR Code Placeholder]', 105, yPos + 30, { align: 'center' });

      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 280, { align: 'center' });
      pdf.text('Official KKID Document - Do not duplicate without authorization', 105, 285, { align: 'center' });

      const fileName = `KKID_${selectedIDProfile.kkid_number || selectedIDProfile.id}_document.pdf`;
      pdf.save(fileName);
      
      toast.success('PDF downloaded (document version)!');
      
    } catch (fallbackError) {
      console.error('Fallback PDF error:', fallbackError);
      toast.error('Failed to generate PDF. Please try downloading PNG files instead.');
    }
  } finally {
    setPrinting(false);
  }
};

const handleDownloadPNG = async (downloadBothSides = false) => {
  setPrinting(true);
  try {
    if (!selectedIDProfile) {
      toast.error('No profile selected for download');
      return;
    }

    // Function to create and download a single side
    const downloadSide = async (side) => {
      // Create a temporary div for capturing
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 85.6mm;
        height: 54mm;
        visibility: hidden;
        z-index: -9999;
      `;
      
      // Get the HTML content
      const htmlContent = side === 'front' ? createFixedIDCardHTML('front') : createFixedIDCardHTML('back');
      
      // Create a temporary iframe for better rendering
      const iframe = document.createElement('iframe');
      iframe.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 85.6mm;
        height: 54mm;
        border: none;
        visibility: hidden;
        z-index: -9999;
      `;
      
      document.body.appendChild(iframe);
      
      // Write HTML content to iframe
      iframe.contentDocument.open();
      iframe.contentDocument.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              width: 85.6mm;
              height: 54mm;
              margin: 0;
              padding: 0;
              background: white;
              overflow: hidden;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `);
      iframe.contentDocument.close();
      
      // Wait for iframe to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture from iframe
      const canvas = await html2canvas(iframe.contentDocument.body, {
        scale: 4,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 85.6 * 3.78,
        height: 54 * 3.78,
        allowTaint: true,
        foreignObjectRendering: true,
        imageTimeout: 10000,
        onclone: (clonedDoc) => {
          // Force images to load
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            if (img.src) {
              img.crossOrigin = 'anonymous';
              const src = img.src;
              img.src = '';
              img.src = src;
            }
          });
        }
      });
      
      // Clean up
      document.body.removeChild(iframe);
      
      return canvas;
    };

    if (downloadBothSides) {
      // Download both sides as separate files
      const frontCanvas = await downloadSide('front');
      const backCanvas = await downloadSide('back');
      
      // Create download link for front
      const frontLink = document.createElement('a');
      frontLink.download = `KKID-${selectedIDProfile.kkid_number || selectedIDProfile.id}-FRONT.png`;
      frontLink.href = frontCanvas.toDataURL('image/png', 1.0);
      document.body.appendChild(frontLink);
      frontLink.click();
      document.body.removeChild(frontLink);
      
      // Small delay before downloading second file
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create download link for back
      const backLink = document.createElement('a');
      backLink.download = `KKID-${selectedIDProfile.kkid_number || selectedIDProfile.id}-BACK.png`;
      backLink.href = backCanvas.toDataURL('image/png', 1.0);
      document.body.appendChild(backLink);
      backLink.click();
      document.body.removeChild(backLink);
      
      toast.success('Both sides downloaded as PNG files!');
    } else {
      // Download current side only
      const side = showCardBack ? 'back' : 'front';
      const canvas = await downloadSide(side);
      
      const link = document.createElement('a');
      link.download = `KKID-${selectedIDProfile.kkid_number || selectedIDProfile.id}-${side.toUpperCase()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${side.toUpperCase()} side downloaded as PNG!`);
    }
    
  } catch (error) {
    console.error('PNG download error:', error);
    toast.error('Failed to download PNG. Please try again.');
  } finally {
    setPrinting(false);
  }
};

  const renderPhotoUpload = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        ID Photo (2x2 inches)
      </label>
      
      <div className="flex items-center gap-4">
        <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
          {photoPreview ? (
            <img 
              src={photoPreview} 
              alt="Photo preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <Camera className="h-8 w-8 mb-2" />
              <span className="text-xs">No photo</span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <input
            type="file"
            ref={photoInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            variant="outline"
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {photoPreview ? 'Change Photo' : 'Upload Photo'}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Upload a 2x2 inch photo. Max 5MB.
          </p>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={editingProfile ? handleUpdateProfile : handleAddProfile} className="p-6 space-y-4">
      {renderPhotoUpload()}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <Input
            type="text"
            value={formData.full_name}
            onChange={(e) => handleInputChange("full_name", e.target.value)}
            required
            placeholder="Enter full name"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Birthday *</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
          <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Civil Status *</label>
          <Select value={formData.civil_status} onValueChange={(value) => handleInputChange("civil_status", value)}>
            <SelectTrigger><SelectValue placeholder="Select civil status" /></SelectTrigger>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Complete Address *</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
          <Input
            value={formData.contact_number}
            onChange={(e) => handleInputChange("contact_number", e.target.value)}
            required
            placeholder="Enter contact number"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">KKID Number *</label>
          <Input
            value={formData.kkid_number}
            onChange={(e) => handleInputChange("kkid_number", e.target.value)}
            required
            readOnly={!editingProfile}
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Validity Date *</label>
          <Input
            type="date"
            value={formData.validity_date}
            onChange={(e) => handleInputChange("validity_date", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Youth Organization</label>
        <Input
          value={formData.youth_organization}
          onChange={(e) => handleInputChange("youth_organization", e.target.value)}
          placeholder="Enter youth organization"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Account</label>
        <Input
          value={formData.facebook_account}
          onChange={(e) => handleInputChange("facebook_account", e.target.value)}
          placeholder="Enter Facebook account"
        />
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-4">Emergency Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name *</label>
            <Input
              value={formData.emergency_contact_name}
              onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
              required
              placeholder="Enter emergency contact name"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Relationship *</label>
            <Select value={formData.emergency_contact_relationship} onValueChange={(value) => handleInputChange("emergency_contact_relationship", value)}>
              <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Birthday *</label>
            <Input
              type="date"
              value={formData.emergency_contact_birthday}
              onChange={(e) => handleInputChange("emergency_contact_birthday", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Number *</label>
            <Input
              value={formData.emergency_contact_number}
              onChange={(e) => handleInputChange("emergency_contact_number", e.target.value)}
              required
              placeholder="Enter emergency contact number"
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Address *</label>
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
          <label htmlFor="is_voter" className="text-sm font-medium text-gray-700">Registered Voter</label>
        </div>
        {formData.is_voter && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Precinct Number</label>
            <Input
              value={formData.precinct_number}
              onChange={(e) => handleInputChange("precinct_number", e.target.value)}
              placeholder="Enter precinct number"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
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
          onClick={() => {
            setShowForm(false);
            setEditingProfile(null);
            resetForm();
          }}
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

      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading KKID profiles...</p>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {profile.full_name}
                      </CardTitle>
                      <Badge className={getStatusColor(profile.status)}>
                        {getStatusText(profile.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteProfile(profile.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardDescription className="flex items-center flex-wrap gap-2 text-sm mt-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {profile.birthday ? new Date(profile.birthday).toLocaleDateString() : 'N/A'}
                    </span>
                    <span>•</span>
                    <span className="truncate">{profile.gender || 'N/A'}</span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="font-mono truncate max-w-[200px]">
                        ID: {profile.kkid_number || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{profile.contact_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2 break-words">{profile.address || 'N/A'}</span>
                    </div>
                    {profile.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{profile.email}</span>
                      </div>
                    )}
                  </div>

                  {profile.youth_organization && (
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs max-w-full truncate">
                        {profile.youth_organization}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-auto pt-2">
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
            <div className="text-center py-12 border rounded-lg bg-gray-50">
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold">
                {editingProfile ? 'Edit KKID Profile' : 'Add New KKID Profile'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProfile(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {renderForm()}
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Profile Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <div className="space-y-1">
                    <p><span className="font-medium">Full Name:</span> {selectedProfile.full_name}</p>
                    <p><span className="font-medium">Birthday:</span> {selectedProfile.birthday ? new Date(selectedProfile.birthday).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="font-medium">Gender:</span> {selectedProfile.gender || 'N/A'}</p>
                    <p><span className="font-medium">Civil Status:</span> {selectedProfile.civil_status || 'N/A'}</p>
                    <p><span className="font-medium">Contact:</span> {selectedProfile.contact_number || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {selectedProfile.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">ID Information</h3>
                  <div className="space-y-1">
                    <p><span className="font-medium">KKID Number:</span> {selectedProfile.kkid_number}</p>
                    <p><span className="font-medium">Validity Date:</span> {selectedProfile.validity_date ? new Date(selectedProfile.validity_date).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="font-medium">Status:</span> <Badge className={getStatusColor(selectedProfile.status)}>{getStatusText(selectedProfile.status)}</Badge></p>
                    <p><span className="font-medium">Youth Organization:</span> {selectedProfile.youth_organization || 'N/A'}</p>
                    <p><span className="font-medium">Facebook:</span> {selectedProfile.facebook_account || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                <p className="text-gray-700">{selectedProfile.address || 'N/A'}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Name:</span> {selectedProfile.emergency_contact_name || 'N/A'}</p>
                    <p><span className="font-medium">Relationship:</span> {selectedProfile.emergency_contact_relationship || 'N/A'}</p>
                    <p><span className="font-medium">Birthday:</span> {selectedProfile.emergency_contact_birthday ? new Date(selectedProfile.emergency_contact_birthday).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Contact Number:</span> {selectedProfile.emergency_contact_number || 'N/A'}</p>
                    <p><span className="font-medium">Address:</span> {selectedProfile.emergency_contact_address || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditProfile(selectedProfile);
                    }}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={() => {
                      setShowViewModal(false);
                      handleViewID(selectedProfile);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    View ID Card
                  </Button>
                  <Button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this profile?')) {
                        handleDeleteProfile(selectedProfile.id);
                        setShowViewModal(false);
                      }
                    }}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

{/* Floating ID Card Modal */}
{showIDModal && selectedIDProfile && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10 rounded-t-xl">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">KKID Card - {selectedIDProfile.full_name}</h2>
          <Badge variant={selectedIDProfile.status === 'approved' ? 'default' : 'secondary'}>
            {selectedIDProfile.status?.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowIDModal(false)}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={printing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content - Fixed Height */}
<div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center min-h-[400px] max-h-[500px]">
  {/* Card Container */}
  <div className="relative perspective-1000" style={{ 
    width: '85.6mm', 
    height: '54mm',
    margin: '0 auto'
  }}>
    {/* Actual Card Content */}
    <div className={`w-full h-full transition-transform duration-500 ${showCardBack ? 'rotate-y-180' : ''}`}>
      {/* Front Side */}
      <div className={`absolute w-full h-full ${showCardBack ? 'opacity-0' : 'opacity-100'}`}>
        <div dangerouslySetInnerHTML={{ __html: createFixedIDCardHTML('front') }} />
      </div>
      
      {/* Back Side */}
      <div className={`absolute w-full h-full ${showCardBack ? 'opacity-100' : 'opacity-0'}`}>
        <div dangerouslySetInnerHTML={{ __html: createFixedIDCardHTML('back') }} />
      </div>
    </div>
  </div>
  
  {/* Flip Hint */}
  <div className="mt-6 text-center">
    <Button
      onClick={() => setShowCardBack(!showCardBack)}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <FlipHorizontal className="h-4 w-4" />
      Flip to {showCardBack ? 'Front' : 'Back'} Side
    </Button>
  </div>
</div>

      {/* Action Buttons - Always visible */}
{/* Action Buttons - Always visible */}
<div className="p-6 border-t bg-white rounded-b-xl">
  <div className="flex flex-wrap gap-3 justify-center">
    <Button
      onClick={handlePrintBothSides}
      disabled={printing}
      className="bg-blue-600 hover:bg-blue-700"
      size="lg"
    >
      <Printer className="h-5 w-5 mr-2" />
      Print Both Sides
    </Button>
    
    <Button
      onClick={handleDownloadPDF}
      disabled={printing}
      variant="outline"
      size="lg"
      className="border-blue-300 hover:bg-blue-50"
    >
      <Download className="h-5 w-5 mr-2" />
      Download PDF
    </Button>
    
    <Button
      onClick={() => handleDownloadPNG(true)}
      disabled={printing}
      variant="outline"
      size="lg"
      className="border-purple-300 hover:bg-purple-50"
    >
      <Download className="h-5 w-5 mr-2" />
      Download Both Sides PNG
    </Button>
  </div>
</div>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminKKID