import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Users, Clock, Building, Home, Heart, Dumbbell, Search, Calendar, X } from 'lucide-react';

const Facilities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch facilities from Laravel API
  const fetchFacilities = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/facilities', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFacilities(data);
      } else {
        console.error('Failed to fetch facilities');
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const filteredFacilities = facilities.filter(facility =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (facility.amenities && facility.amenities.some(amenity => 
      amenity.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Under Maintenance</Badge>;
      case 'booked':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Booked</Badge>;
      case 'reserved':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Reserved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      case 'maintenance':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>;
      case 'booked':
        return <div className="w-3 h-3 bg-blue-500 rounded-full"></div>;
      case 'reserved':
        return <div className="w-3 h-3 bg-purple-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  const getFacilityImage = (facility) => {
    // If facility has an image, show it
    if (facility.image) {
      const imageUrl = `http://localhost:8000/storage/${facility.image}`;
      return (
        <img
          src={imageUrl}
          alt={facility.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            // Show placeholder on error
            const parent = e.target.parentNode;
            const placeholder = document.createElement('div');
            placeholder.className = `w-full h-48 ${getPlaceholderColor(facility.name)} flex items-center justify-center`;
            placeholder.innerHTML = getPlaceholderIcon(facility.name);
            parent.appendChild(placeholder);
          }}
        />
      );
    }
    
    // Otherwise show placeholder
    return getPlaceholderContent(facility.name);
  };

  const getPlaceholderColor = (facilityName) => {
    const colors = [
      'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 
      'bg-purple-100', 'bg-pink-100', 'bg-indigo-100'
    ];
    return colors[facilityName.length % colors.length];
  };

  const getPlaceholderIcon = (facilityName) => {
    let IconComponent = Building;
    const nameLower = facilityName.toLowerCase();
    
    if (nameLower.includes('hall') || nameLower.includes('multi-purpose')) {
      IconComponent = Building;
    } else if (nameLower.includes('sports') || nameLower.includes('complex') || nameLower.includes('court') || nameLower.includes('gym')) {
      IconComponent = Dumbbell;
    } else if (nameLower.includes('health') || nameLower.includes('medical') || nameLower.includes('clinic')) {
      IconComponent = Heart;
    } else if (nameLower.includes('senior') || nameLower.includes('center') || nameLower.includes('community')) {
      IconComponent = Home;
    }
    
    return `
      <div class="text-center p-4">
        <svg class="h-12 w-12 mx-auto text-gray-400 mb-2" ...></svg>
        <span class="text-gray-500 text-sm">${facilityName}</span>
      </div>
    `;
  };

  const getPlaceholderContent = (facilityName) => {
    const colors = [
      'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 
      'bg-purple-100', 'bg-pink-100', 'bg-indigo-100'
    ];
    const color = colors[facilityName.length % colors.length];
    
    let IconComponent = Building;
    const nameLower = facilityName.toLowerCase();
    
    if (nameLower.includes('hall') || nameLower.includes('multi-purpose')) {
      IconComponent = Building;
    } else if (nameLower.includes('sports') || nameLower.includes('complex') || nameLower.includes('court') || nameLower.includes('gym')) {
      IconComponent = Dumbbell;
    } else if (nameLower.includes('health') || nameLower.includes('medical') || nameLower.includes('clinic')) {
      IconComponent = Heart;
    } else if (nameLower.includes('senior') || nameLower.includes('center') || nameLower.includes('community')) {
      IconComponent = Home;
    }
    
    return (
      <div className={`w-full h-48 ${color} flex items-center justify-center`}>
        <div className="text-center p-4">
          <IconComponent className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <span className="text-gray-500 text-sm">{facilityName}</span>
        </div>
      </div>
    );
  };

  const handleViewDetails = (facility) => {
    setSelectedFacility(facility);
    setShowDetails(true);
  };

  const availableCount = facilities.filter(f => f.status === 'available').length;
  const totalCount = facilities.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading facilities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Building className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Community Facilities</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Discover and explore the various facilities available in our barangay for your events and activities
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search facilities by name, description, location, or amenities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
        </div>

        {/* Facilities Counter */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Showing {filteredFacilities.length} of {totalCount} facilities • 
            <span className="text-green-600 font-semibold"> {availableCount} available now</span>
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((facility) => (
            <Card key={facility.id} className="hover:shadow-lg transition-all duration-300 group border-0 shadow-md overflow-hidden">
              <div className="relative overflow-hidden rounded-t-lg h-48 bg-gray-100">
                {getFacilityImage(facility)}
                <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full shadow-md">
                  {getStatusIcon(facility.status)}
                  {getStatusBadge(facility.status)}
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2">
                  {facility.name}
                </CardTitle>
                
                <CardDescription className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{facility.location}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed line-clamp-3">
                  {facility.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Capacity: {facility.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{facility.hours}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-sm text-gray-700">Key Amenities</h4>
                  <div className="flex flex-wrap gap-1">
                    {facility.amenities && facility.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {facility.amenities && facility.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{facility.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                  onClick={() => handleViewDetails(facility)}
                >
                  View Facility Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results State */}
        {filteredFacilities.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No facilities found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'No facilities are currently available'}
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

        {/* Facility Details Modal */}
        {showDetails && selectedFacility && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">{selectedFacility.name}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Facility Image in Modal */}
                {selectedFacility.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={`http://localhost:8000/storage/${selectedFacility.image}`}
                      alt={selectedFacility.name}
                      className="w-full max-h-96 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Header Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Location:</span>
                    <span>{selectedFacility.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Capacity:</span>
                    <span>{selectedFacility.capacity} people</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Hours:</span>
                    <span>{selectedFacility.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedFacility.status)}
                    <span className="font-medium">Status:</span>
                    {getStatusBadge(selectedFacility.status)}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">About this Facility</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedFacility.description}
                  </p>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Amenities & Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedFacility.amenities && selectedFacility.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
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
          <p className="text-gray-400 mt-2">Facility inquiries: Visit Barangay Hall during office hours</p>
        </div>
      </footer>
    </div>
  );
};

export default Facilities;