import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Calendar, Eye, Building, Search, Filter, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";


const PublicDisclosure = () => {
  const [disclosures, setDisclosures] = useState([]);
  const [filteredDisclosures, setFilteredDisclosures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDisclosure, setSelectedDisclosure] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "All",
    "Annual Barangay Youth Investment Program",
    "CBYDP", 
    "Annual Budget Resolution",
    "Register Cash in Bank and other Financial Transactions",
    "Monthly Itemized List of Purchased Request",
  ];

  // Fetch disclosures from API - public endpoint
  const fetchDisclosures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/disclosures');
      
      if (!response.ok) {
        throw new Error('Failed to fetch disclosures');
      }
      
      const data = await response.json();
      // Filter only published disclosures for public view
      const publishedDisclosures = data.filter(d => d.is_published !== false);
      setDisclosures(publishedDisclosures);
      setFilteredDisclosures(publishedDisclosures);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching disclosures:', err);
      
      // Fallback to sample data if API fails
      const sampleDisclosures = [
        {
          id: 1,
          title: "Annual Barangay Development Plan 2024",
          description: "Comprehensive plan outlining barangay programs, projects, and activities for the fiscal year 2024.",
          date: "January 2024",
          category: "CBYDP",
          full_details: `# Annual Barangay Development Plan 2024

## Executive Summary
This comprehensive development plan outlines our barangay's strategic direction for 2024, focusing on sustainable development, community welfare, and infrastructure improvement.

## Key Objectives
- Enhance community safety and security
- Improve healthcare access for all residents
- Develop youth programs and facilities
- Upgrade public infrastructure
- Promote environmental sustainability

## Budget Allocation
- Infrastructure Projects: 40%
- Social Services: 25%
- Youth Development: 15%
- Environmental Programs: 10%
- Administrative Costs: 10%

## Implementation Timeline
- Q1: Planning and Community Consultation
- Q2: Infrastructure Projects Commencement
- Q3: Social Program Rollout
- Q4: Evaluation and 2025 Planning

This plan has been developed through extensive community consultation and represents our commitment to transparent governance.`
        },
        {
          id: 2,
          title: "Monthly Activity Report - January 2024",
          description: "Detailed reports of barangay activities, programs, and accomplishments for January 2024.",
          date: "February 1, 2024",
          category: "Monthly Itemized List of Purchased Request",
          full_details: `# Monthly Activity Report - January 2024

## Activities Completed
1. **Community Clean-up Drive** (Jan 15)
   - 150 volunteers participated
   - Collected 2.5 tons of waste
   - 15 streets cleaned

2. **Medical Mission** (Jan 20-21)
   - 300 residents served
   - Free check-ups and medicines
   - Partnership with local health center

3. **Youth Basketball Tournament** (Jan 27-28)
   - 12 teams participated
   - Age groups: 13-15 and 16-18
   - Championship winners awarded

## Infrastructure Projects
- Street Light Installation: 25 units completed
- Drainage Cleaning: 5 km completed
- Road Repair: Zone 3 main road

## Financial Summary
- Total Expenses: ₱250,000
- Remaining Budget: ₱1,750,000
- Community Projects: 85% on track

## Upcoming Activities
- February: Tree Planting Activity
- March: Summer Youth Program Launch
- April: Community Health Fair`
        },
        {
          id: 3,
          title: "Youth Development Programs 2024-2026",
          description: "Comprehensive three-year plan for youth education, leadership, and skills development programs.",
          date: "2024–2026",
          category: "Annual Barangay Youth Investment Program",
          full_details: `# Youth Development Programs 2024-2026

## Vision
To empower the youth as active partners in community development and nation-building.

## Program Components

### 1. Educational Support
- **Tutorial Programs**: Weekend classes for elementary and high school students
- **College Scholarship**: 10 full scholarships annually
- **Computer Literacy**: Basic computer skills training

### 2. Leadership Development
- **Youth Council**: Monthly leadership training
- **Community Projects**: Youth-led initiatives
- **Mentorship Program**: Pairing with community leaders

### 3. Skills Training
- **Technical Skills**: Basic carpentry, electrical, plumbing
- **Digital Skills**: Graphic design, programming basics
- **Entrepreneurship**: Small business management

### 4. Sports and Recreation
- **Basketball League**: Year-round tournaments
- **Dance and Arts**: Cultural preservation programs
- **Outdoor Activities**: Camping and team building

## Implementation Timeline
**2024**: Program Launch and Infrastructure Setup
**2025**: Expansion and Specialization
**2026**: Sustainability and Leadership Transition

## Expected Outcomes
- 80% youth participation in programs
- 50 youth leaders trained annually
- 30 small business startups supported
- Improved academic performance
- Reduced youth idleness and delinquency`
        },
        {
          id: 4,
          title: "Financial Transparency Report Q1 2024",
          description: "Quarterly financial report showing income, expenses, and budget utilization for Q1 2024.",
          date: "April 2024",
          category: "Annual Budget Resolution",
          full_details: `# Financial Transparency Report - Q1 2024

## Income Summary
- National Allocation: ₱1,500,000
- Local Revenue: ₱350,000
- Community Donations: ₱75,000
- **Total Income**: ₱1,925,000

## Expense Breakdown

### Personnel Services
- Salaries and Benefits: ₱450,000
- Training and Development: ₱50,000
- **Subtotal**: ₱500,000

### Maintenance and Operations
- Office Supplies: ₱25,000
- Utilities: ₱45,000
- Equipment Maintenance: ₱30,000
- **Subtotal**: ₱100,000

### Development Projects
- Infrastructure: ₱600,000
- Social Programs: ₱300,000
- Youth Development: ₱150,000
- Environmental: ₱75,000
- **Subtotal**: ₱1,125,000

### Total Expenses: ₱1,725,000
### Remaining Balance: ₱200,000

## Project Status
- **Completed**: 8 projects (45%)
- **Ongoing**: 6 projects (35%)
- **Planned**: 4 projects (20%)

## Auditor's Note
All financial transactions have been reviewed and verified. Complete documentation available upon request at the barangay hall.`
        },
        {
          id: 5,
          title: "Community Health and Safety Initiatives",
          description: "Overview of health programs, emergency response, and safety measures implemented in the community.",
          date: "Ongoing",
          category: "Register Cash in Bank and other Financial Transactions",
          full_details: `# Community Health and Safety Initiatives

## Health Programs

### Regular Services
- **Weekly Clinic**: Every Saturday, 8AM-12PM
- **Immunization**: Monthly vaccination drives
- **Dental Mission**: Quarterly dental check-ups
- **Mental Health**: Counseling services available

### Emergency Response
- **Emergency Hotline**: 0917-123-4567
- **Response Team**: 24/7 volunteer team
- **First Aid Training**: Monthly workshops
- **Disaster Preparedness**: Quarterly drills

## Safety Measures

### Infrastructure Safety
- Street Light Maintenance: Monthly inspection
- Road Safety: Speed bumps and signage
- Public Space: Regular safety audits

### Community Watch
- **Barangay Tanods**: 15 trained personnel
- **Neighborhood Watch**: Community participation
- **CCTV Installation**: 20 strategic locations

## Health Statistics
- Vaccination Rate: 95% of target population
- Clinic Visits: 200+ monthly
- Emergency Responses: 15-20 monthly
- Health Education: 4 seminars monthly

## Upcoming Initiatives
- Community Health Fair (May 2024)
- Advanced First Aid Training
- Mental Health Awareness Campaign
- Senior Citizen Health Monitoring`
        },
        
      ];
      
      setDisclosures(sampleDisclosures);
      setFilteredDisclosures(sampleDisclosures);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisclosures();
  }, []);

  // Filter disclosures based on search and category
  useEffect(() => {
    let results = disclosures;

    // Apply category filter
    if (selectedCategory !== "All") {
      results = results.filter(disclosure => disclosure.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(disclosure => 
        disclosure.title.toLowerCase().includes(term) ||
        disclosure.description.toLowerCase().includes(term) ||
        disclosure.category.toLowerCase().includes(term)
      );
    }

    setFilteredDisclosures(results);
  }, [searchTerm, selectedCategory, disclosures]);

  const handleViewDetails = (disclosure) => {
    setSelectedDisclosure(disclosure);
    setShowDetails(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
  };

  const DisclosureCard = ({ disclosure }) => (
    <Card className="hover:shadow-lg transition-all duration-300 group border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-3 group-hover:text-blue-600 transition-colors">
              {disclosure.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{disclosure.date}</span>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {disclosure.category}
              </Badge>
            </div>
          </div>
          <FileText className="h-10 w-10 text-blue-600 opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-gray-600 leading-relaxed">{disclosure.description}</p>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => handleViewDetails(disclosure)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Full Details
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading transparency documents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                Temporary Information Display
              </h3>
              <p className="text-yellow-700">
                Showing sample transparency documents while we update our live data.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">

        {/* Header Section */}
        <div className="bg-blue-600 text-white py-12">
                <div className="container mx-auto px-4 text-center">
                  <div className="flex justify-center mb-4">
                    <Building className="h-12 w-12 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold mb-4">Public Disclosures</h1>
                  <p className="text-xl opacity-90 max-w-2xl mx-auto">
                    Access official documents, reports, and transparency records from our barangay administration. 
                     We believe in open governance and community engagement.
                  </p>
                </div>
              </div>
                    <div className="container mx-auto px-4 py-12">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {disclosures.length}
              </div>
              <div className="text-gray-600 font-medium">
                Public Documents
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {categories.length - 1}
              </div>
              <div className="text-gray-600 font-medium">
                Categories
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                100%
              </div>
              <div className="text-gray-600 font-medium">
                Transparency
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </div>
            
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              
              {(searchTerm || selectedCategory !== "All") && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-gray-500"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border shadow-sm">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={`text-sm ${
                      selectedCategory === category 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredDisclosures.length} of {disclosures.length} documents
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Disclosures Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {filteredDisclosures.map((disclosure) => (
            <DisclosureCard key={disclosure.id} disclosure={disclosure} />
          ))}
        </div>

        {filteredDisclosures.length === 0 && (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== "All" 
                ? "Try adjusting your search or filter criteria"
                : "No transparency documents are currently available"
              }
            </p>
            {(searchTerm || selectedCategory !== "All") && (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Community Engagement Section */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-2xl border-0">
          <CardContent className="p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">
                Your Right to Know
              </h3>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                We are committed to transparent governance and community involvement. 
                All documents are made available to ensure accountability and build trust with our residents.
              </p>
              <p className="text-sm text-blue-200 mt-6">
                Have questions about our disclosures? Visit the barangay hall or contact us directly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Documents are updated regularly to ensure transparency and accountability.
          </p>
        </div>

        {/* Details Modal */}
        {showDetails && selectedDisclosure && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDisclosure.title}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{selectedDisclosure.date}</span>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {selectedDisclosure.category}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Short Description */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">{selectedDisclosure.description}</p>
                </div>

                {/* Full Content */}
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed text-lg">
                    {selectedDisclosure.full_details}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Close Document
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDisclosure;