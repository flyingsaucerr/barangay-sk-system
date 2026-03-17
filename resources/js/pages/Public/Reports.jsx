import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Calendar, User, Eye, X } from 'lucide-react';

const MonthlyReportsPublic = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportView, setShowReportView] = useState(false);
  const [reports, setReports] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [statistics, setStatistics] = useState({
    total_reports: 0,
    this_year_reports: 0,
    categories_count: 0,
    years_covered: 0
  });
  const [loading, setLoading] = useState(false);

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

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (yearFilter !== 'all') params.append('year', yearFilter);
      if (monthFilter !== 'all') params.append('month', monthFilter);

      const response = await fetch(`/api/monthly-reports?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setReports(data.data);
      } else {
        console.error('API returned error:', data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Set empty array if API fails
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filters and statistics
  const fetchFiltersAndStats = async () => {
    try {
      const [filtersRes, statsRes] = await Promise.all([
        fetch('/api/monthly-reports-filters'),
        fetch('/api/monthly-reports-statistics')
      ]);

      if (!filtersRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch filters or statistics');
      }

      const filtersData = await filtersRes.json();
      const statsData = await statsRes.json();

      if (filtersData.success) {
        setAvailableYears(filtersData.data.years);
        setAvailableMonths(filtersData.data.months);
      }

      if (statsData.success) {
        setStatistics(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching filters and stats:', error);
      // Set default values if API fails
      setAvailableYears([]);
      setAvailableMonths([]);
    }
  };

  const handleViewReport = async (report) => {
    try {
      const response = await fetch(`/api/monthly-reports/${report.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedReport(data.data);
        setShowReportView(true);
      } else {
        alert('Report not found or not available');
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
      alert('Error loading report details');
    }
  };

  useEffect(() => {
    fetchReports();
    fetchFiltersAndStats();
  }, [searchTerm, yearFilter, monthFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">

      {/* Header Section */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <FileText className="h-12 w-12 text-white" /> {/* Icon */}
          </div>
          <h1 className="text-4xl font-bold mb-4">Monthly Reports</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            View official barangay reports and stay informed about community activities. 
            Stay updated with accurate and timely information for transparency and accountability.
          </p>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-12">

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search reports by title, description, or tags..."
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{statistics.total_reports}</div>
            <div className="text-sm text-muted-foreground">Available Reports</div>
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
              {statistics.years_covered}
            </div>
            <div className="text-sm text-muted-foreground">Years Covered</div>
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
                <div className="space-y-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {report.title}
                  </CardTitle>
                  <Badge className={getCategoryColor(report.category)}>
                    {report.category}
                  </Badge>
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
                    {report.content?.substring(0, 150)}...
                  </p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {Array.isArray(report.tags) && report.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleViewReport(report)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Report
                </Button>
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
              : 'No reports are currently available'}
          </p>
        </div>
      )}

      {/* Report View Modal */}
      {showReportView && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
              <button
                onClick={() => setShowReportView(false)}
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
                  <span>Published: {new Date(selectedReport.upload_date).toLocaleDateString()}</span>
                </div>
                <Badge className={getCategoryColor(selectedReport.category)}>
                  {selectedReport.category}
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
                  {Array.isArray(selectedReport.tags) && selectedReport.tags.map((tag) => (
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

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Report Security
                    </h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>
                        This report is for viewing purposes only. Downloading, copying, or distributing 
                        this content is restricted to maintain data security and integrity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={() => setShowReportView(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default MonthlyReportsPublic;