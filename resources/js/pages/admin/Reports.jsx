import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Calendar, Plus, Edit, Trash2, X, User, Eye } from 'lucide-react';

const API = {
  ADMIN_LIST: '/api/admin/monthly-reports',
  ADMIN_SHOW: (id) => `/api/admin/monthly-reports/${id}`,
  ADMIN_CREATE: '/api/admin/monthly-reports',
  ADMIN_UPDATE: (id) => `/api/admin/monthly-reports/${id}`,
  ADMIN_DELETE: (id) => `/api/admin/monthly-reports/${id}`,
  ADMIN_FILTERS: '/api/admin/monthly-reports-filters',
  ADMIN_STATISTICS: '/api/admin/monthly-reports-statistics',
  
  // Public routes (for reference)
  PUBLIC_LIST: '/api/monthly-reports',
  PUBLIC_SHOW: (id) => `/api/monthly-reports/${id}`,
  PUBLIC_FILTERS: '/api/monthly-reports-filters',
  PUBLIC_STATISTICS: '/api/monthly-reports-statistics',
};

const AdminMonthlyReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [statistics, setStatistics] = useState({
    total_reports: 0,
    this_year_reports: 0,
    categories_count: 0,
    published_reports: 0
  });
  const [loading, setLoading] = useState(false);

  // Form state for new report
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    month: '',
    year: new Date().getFullYear().toString(),
    category: 'Financial',
    tags: '',
    status: 'published'
  });

  const categories = [
    'Financial', 'Projects', 'Health', 'Education', 'Security',
    'Environment', 'Social Services', 'Annual', 'General'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper: safe parse response (avoid crashing on HTML)
  const parseJsonSafe = async (res) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      // not JSON — return a helpful object
      return { success: false, _raw: text, message: `Non-JSON response (${res.status})` };
    }
  };

  // Helper: authorization header
  const getAuthHeaders = (extra = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...extra
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  // Fetch reports (ADMIN)
  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (yearFilter !== 'all') params.append('year', yearFilter);
      if (monthFilter !== 'all') params.append('month', monthFilter);

      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API.ADMIN_LIST}${query}`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        const body = await parseJsonSafe(res);
        throw new Error(body.message || body._raw || `Failed to fetch reports (${res.status})`);
      }

      const data = await parseJsonSafe(res);
      if (data && data.success) {
        setReports(data.data || []);
      } else {
        console.warn('fetchReports response not success:', data);
        setReports(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filters and statistics (ADMIN)
  const fetchFiltersAndStats = async () => {
    try {
      const [filtersRes, statsRes] = await Promise.all([
        fetch(API.ADMIN_FILTERS, { headers: getAuthHeaders() }),
        fetch(API.ADMIN_STATISTICS, { headers: getAuthHeaders() })
      ]);

      if (!filtersRes.ok) {
        const body = await parseJsonSafe(filtersRes);
        console.warn('Filters fetch failed:', body);
      } else {
        const filtersData = await parseJsonSafe(filtersRes);
        if (filtersData.success) {
          setAvailableYears(filtersData.data.years || []);
          setAvailableMonths(filtersData.data.months || []);
        }
      }

      if (!statsRes.ok) {
        const body = await parseJsonSafe(statsRes);
        console.warn('Stats fetch failed:', body);
      } else {
        const statsData = await parseJsonSafe(statsRes);
        if (statsData.success) {
          setStatistics(statsData.data || {});
        }
      }
    } catch (error) {
      console.error('Error fetching filters and stats:', error);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchFiltersAndStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, yearFilter, monthFilter]);

  const getCategoryColor = (category) => {
    const colors = {
      'Financial': 'bg-blue-100 text-blue-800 border-blue-200',
      'Projects': 'bg-green-100 text-green-800 border-green-200',
      'Health': 'bg-red-100 text-red-800 border-red-200',
      'Education': 'bg-purple-100 text-purple-800 border-purple-200',
      'Security': 'bg-orange-100 text-orange-800 border-orange-200',
      'Environment': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Social Services': 'bg-pink-100 text-pink-800 border-pink-200',
      'Annual': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'General': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || colors['General'];
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API.ADMIN_CREATE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const err = await parseJsonSafe(res);
        throw new Error(err.message || err._raw || `Failed to create report (${res.status})`);
      }

      const data = await parseJsonSafe(res);
      if (data.success) {
        setReports(prev => [data.data, ...prev]);
        setShowUploadForm(false);
        resetForm();
        fetchFiltersAndStats();
      } else {
        alert(data.message || 'Error creating report');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      alert(error.message || 'Error creating report');
    }
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setFormData({
      title: report.title || '',
      description: report.description || '',
      content: report.content || '',
      month: report.month || '',
      year: (report.year || new Date().getFullYear()).toString(),
      category: report.category || 'Financial',
      tags: Array.isArray(report.tags) ? report.tags.join(', ') : (report.tags || ''),
      status: report.status || 'published'
    });
    setShowUploadForm(true);
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!editingReport) return;

    try {
      const res = await fetch(API.ADMIN_UPDATE(editingReport.id), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const body = await parseJsonSafe(res);
        throw new Error(body.message || body._raw || `Failed to update report (${res.status})`);
      }

      const data = await parseJsonSafe(res);
      if (data.success) {
        setReports(prev => prev.map(r => r.id === editingReport.id ? data.data : r));
        setShowUploadForm(false);
        setEditingReport(null);
        resetForm();
      } else {
        alert(data.message || 'Error updating report');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert(error.message || 'Error updating report');
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await fetch(API.ADMIN_DELETE(id), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        const body = await parseJsonSafe(res);
        throw new Error(body.message || body._raw || `Failed to delete report (${res.status})`);
      }

      const data = await parseJsonSafe(res);
      if (data.success) {
        setReports(prev => prev.filter(report => report.id !== id));
        fetchFiltersAndStats();
      } else {
        alert(data.message || 'Error deleting report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert(error.message || 'Error deleting report');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      month: '',
      year: new Date().getFullYear().toString(),
      category: 'Financial',
      tags: '',
      status: 'published'
    });
  };

  // Safe helpers for UI rendering
  const safeTags = (report) => Array.isArray(report?.tags) ? report.tags : [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <span>Manage Monthly Reports</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage monthly barangay reports for residents to view
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingReport(null);
            setShowUploadForm(true);
            resetForm();
          }}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full md:w-32">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {availableYears.map(year => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {availableMonths.map(month => (
              <SelectItem key={month} value={month}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{statistics.total_reports}</div>
            <div className="text-sm text-muted-foreground">Total Reports</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {statistics.this_year_reports}
            </div>
            <div className="text-sm text-muted-foreground">This Year</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {statistics.categories_count}
            </div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {statistics.published_reports}
            </div>
            <div className="text-sm text-muted-foreground">Published</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reports...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {report.title}
                    </CardTitle>
                    <Badge className={getCategoryColor(report.category)}>
                      {report.category}
                    </Badge>
                  </div>

                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditReport(report)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardDescription className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{report.month} {report.year}</span>
                  <span>•</span>
                  <span>{report.author}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                  {report.description}
                </p>

                {/* Content Preview */}
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-xs text-gray-600 line-clamp-3 font-mono">
                    {(report.content || '').substring(0, 150)}...
                  </p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {safeTags(report).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewReport(report)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reports.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reports found</h3>
          <p className="text-muted-foreground">
            {searchTerm || yearFilter !== 'all' || monthFilter !== 'all'
              ? 'Try adjusting your search terms or filters'
              : 'No reports have been created yet'}
          </p>
        </div>
      )}

      {/* Add/Edit Report Form */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingReport ? 'Edit Report' : 'Create New Report'}
              </h2>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={editingReport ? handleUpdateReport : handleAddReport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Title *
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter report title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  placeholder="Brief description of the report"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month *
                  </label>
                  <Select
                    value={formData.month}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, month: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <Input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    min="2020"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <Input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Financial, Budget, Expenses"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Content *
                </label>
                <Textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="12"
                  required
                  placeholder="Enter the full content of your report here..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format your content with clear sections and bullet points for better readability.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  {editingReport ? 'Update Report' : 'Create Report'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Report Details Modal */}
      {showViewModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
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
                  <span>{selectedReport.month} {selectedReport.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{selectedReport.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Uploaded: {selectedReport.upload_date ? new Date(selectedReport.upload_date).toLocaleDateString() : '—'}</span>
                </div>
                <Badge className={getCategoryColor(selectedReport.category)}>
                  {selectedReport.category}
                </Badge>
                <Badge variant={selectedReport.status === 'published' ? 'default' : 'secondary'}>
                  {String(selectedReport.status || '').toUpperCase()}
                </Badge>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedReport.description}</p>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {safeTags(selectedReport).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Report Content */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4">Report Content</h3>
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                    {selectedReport.content}
                  </pre>
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
                    handleEditReport(selectedReport);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  <Edit className="mr-2 h-4 w-4 inline" />
                  Edit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default AdminMonthlyReports;
