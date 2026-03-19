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
  Upload, FlipHorizontal, Maximize2, Minimize2, CreditCard
} from "lucide-react";
import { toast } from "sonner";

const KKIDCard = ({ profile, side = 'front' }) => {
  const cardRef = useRef(null);
  
  if (!profile) return null;

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/storage/')) {
      return `${window.location.origin}${url}`;
    }
    if (url.startsWith('storage/')) {
      return `${window.location.origin}/${url}`;
    }
    return url;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).toUpperCase();
    } catch {
      return 'N/A';
    }
  };

  if (side === 'front') {
    return (
      <div 
        ref={cardRef}
        style={{
          width: '85.6mm',
          height: '54mm',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '4mm',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact'
        }}
      >
        {/* Watermark */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          fontSize: '40mm',
          fontWeight: 900,
          color: 'rgba(255, 255, 255, 0.08)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 1
        }}>
          KKID
        </div>

        {/* Header */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '7mm',
          background: 'rgba(255, 255, 255, 0.98)',
          borderBottom: '0.5mm solid #fbbf24',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 1mm'
        }}>
          <div style={{ fontSize: '2.8mm', fontWeight: 900, color: '#1e40af', lineHeight: 1.2 }}>
            KATIPUNAN NG KABATAAN
          </div>
          <div style={{ fontSize: '2mm', fontWeight: 600, color: '#64748b', lineHeight: 1.2 }}>
            OFFICIAL IDENTIFICATION CARD
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{
          position: 'absolute',
          top: '7mm',
          left: 0,
          right: 0,
          bottom: '2.5mm',
          padding: '1.5mm',
          zIndex: 5
        }}>
          <div style={{
            display: 'flex',
            gap: '1.5mm',
            height: '100%'
          }}>
            {/* Left Column - Photo and ID info */}
            <div style={{
              width: '27mm',
              display: 'flex',
              flexDirection: 'column',
              gap: '1mm'
            }}>
              {/* Photo */}
              <div style={{
                width: '27mm',
                height: '30mm',
                backgroundColor: 'white',
                borderRadius: '1mm',
                overflow: 'hidden',
                border: '0.3mm solid #fbbf24',
                boxShadow: '0 1mm 2mm rgba(0,0,0,0.2)'
              }}>
                {profile.photo_url ? (
                  <img 
                    src={getImageUrl(profile.photo_url)} 
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#e0f2fe'
                  }}>
                    <User size={40} color="#94a3b8" />
                  </div>
                )}
              </div>

              {/* KKID Number */}
              <div style={{
                backgroundColor: 'white',
                padding: '1mm',
                borderRadius: '0.8mm',
                textAlign: 'center',
                border: '0.2mm solid #e2e8f0'
              }}>
                <div style={{ fontSize: '1.4mm', fontWeight: 'bold', color: '#64748b', marginBottom: '0.3mm' }}>
                  KKID NUMBER
                </div>
                <div style={{
                  fontSize: '1.7mm',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  fontFamily: 'Courier New, monospace',
                  wordBreak: 'break-all'
                }}>
                  {profile.kkid_number || 'N/A'}
                </div>
              </div>

              {/* Validity */}
              <div style={{
                backgroundColor: '#fef3c7',
                padding: '1mm',
                borderRadius: '0.8mm',
                textAlign: 'center',
                border: '0.2mm solid #fbbf24'
              }}>
                <div style={{ fontSize: '1.3mm', fontWeight: 'bold', color: '#92400e', marginBottom: '0.3mm' }}>
                  VALID UNTIL
                </div>
                <div style={{ fontSize: '1.7mm', fontWeight: 'bold', color: '#b45309' }}>
                  {formatDate(profile.validity_date)}
                </div>
              </div>
            </div>

            {/* Right Column - Personal Information - STACKED VERTICALLY */}
            <div style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '1mm',
              padding: '1.5mm',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1mm 2mm rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              {/* Name - Fixed height section */}
              <div style={{
                fontSize: '3.2mm',
                fontWeight: 900,
                color: '#1e293b',
                lineHeight: 1.2,
                marginBottom: '0.5mm',
                paddingBottom: '0.3mm',
                borderBottom: '0.3mm solid #fbbf24',
                wordBreak: 'break-word',
                maxHeight: '8mm',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {profile.full_name || 'N/A'}
              </div>

              {/* Gender - Fixed height */}
              <div style={{
                fontSize: '1.6mm',
                fontWeight: 'bold',
                color: profile.gender?.toLowerCase() === 'female' ? '#dc2626' : '#2563eb',
                marginBottom: '0.8mm',
                textTransform: 'uppercase',
                height: '2.5mm',
                overflow: 'hidden'
              }}>
                {profile.gender || 'N/A'}
              </div>

              {/* Information Stack - Takes remaining space */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8mm',
                overflow: 'hidden'
              }}>
                {/* Birthday row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  minHeight: '3mm'
                }}>
                  <span style={{
                    width: '12mm',
                    fontSize: '1.5mm',
                    fontWeight: 'bold',
                    color: '#475569',
                    flexShrink: 0
                  }}>
                    Birthday:
                  </span>
                  <span style={{
                    fontSize: '1.5mm',
                    fontWeight: 600,
                    color: '#1e293b',
                    wordBreak: 'break-word',
                    flex: 1,
                    lineHeight: 1.3
                  }}>
                    {formatDate(profile.birthday)}
                  </span>
                </div>

                {/* Contact row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  minHeight: '3mm'
                }}>
                  <span style={{
                    width: '12mm',
                    fontSize: '1.5mm',
                    fontWeight: 'bold',
                    color: '#475569',
                    flexShrink: 0
                  }}>
                    Contact:
                  </span>
                  <span style={{
                    fontSize: '1.5mm',
                    fontWeight: 600,
                    color: '#1e293b',
                    wordBreak: 'break-word',
                    flex: 1,
                    lineHeight: 1.3
                  }}>
                    {profile.contact_number || 'N/A'}
                  </span>
                </div>

                {/* Address row - Gets more space */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  flex: 1,
                  minHeight: '8mm'
                }}>
                  <span style={{
                    width: '12mm',
                    fontSize: '1.5mm',
                    fontWeight: 'bold',
                    color: '#475569',
                    flexShrink: 0,
                    paddingTop: '0.2mm'
                  }}>
                    Address:
                  </span>
                  <div style={{
                    flex: 1,
                    fontSize: '1.4mm',
                    fontWeight: 600,
                    color: '#1e293b',
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                    maxHeight: '100%',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {profile.address || 'N/A'}
                  </div>
                </div>

                {/* Organization row - if exists */}
                {profile.youth_organization && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    minHeight: '3mm',
                    marginTop: '0.5mm'
                  }}>
                    <span style={{
                      width: '12mm',
                      fontSize: '1.5mm',
                      fontWeight: 'bold',
                      color: '#475569',
                      flexShrink: 0
                    }}>
                      Org:
                    </span>
                    <span style={{
                      fontSize: '1.5mm',
                      fontWeight: 600,
                      color: '#1e293b',
                      wordBreak: 'break-word',
                      flex: 1,
                      lineHeight: 1.3
                    }}>
                      {profile.youth_organization}
                    </span>
                  </div>
                )}
              </div>

              {/* Signature Section - Fixed height at bottom */}
              <div style={{
                height: '4mm',
                marginTop: '0.5mm',
                paddingTop: '0.3mm',
                borderTop: '0.2mm dashed #94a3b8',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '1mm', fontWeight: 'bold', color: '#64748b', lineHeight: 1.2 }}>
                  AUTHORIZED SIGNATURE
                </div>
                <div style={{
                  width: '60%',
                  margin: '0 auto',
                  borderBottom: '0.2mm solid #1e293b',
                  height: '1.5mm',
                  marginBottom: '0.2mm'
                }}></div>
                <div style={{ fontSize: '0.9mm', color: '#64748b', fontStyle: 'italic', lineHeight: 1.2 }}>
                  SK Chairman
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: '0.3mm',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: '0.9mm',
          color: 'rgba(255,255,255,0.8)',
          fontFamily: 'Courier New, monospace',
          zIndex: 10
        }}>
          ID #{profile.id?.toString().padStart(6, '0') || '000000'}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      style={{
        width: '85.6mm',
        height: '54mm',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '4mm',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact'
      }}
    >

      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '7mm',
        background: 'rgba(255, 255, 255, 0.98)',
        borderBottom: '0.5mm solid #ef4444',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '3.2mm', fontWeight: 900, color: '#dc2626' }}>
          IN CASE OF EMERGENCY
        </div>
      </div>

      {/* Content */}
      <div style={{
        position: 'absolute',
        top: '7mm',
        left: 0,
        right: 0,
        bottom: '2.5mm',
        padding: '1.5mm',
        zIndex: 5
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '1mm',
          padding: '1.5mm',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1mm 2mm rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '2mm',
            fontWeight: 'bold',
            color: '#dc2626',
            marginBottom: '1mm',
            textAlign: 'center',
            paddingBottom: '0.5mm',
            borderBottom: '0.2mm solid #ef4444'
          }}>
            PLEASE CONTACT
          </div>

          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1mm'
          }}>
            {/* Contact Person */}
            <div>
              <div style={{ fontSize: '1.4mm', fontWeight: 'bold', color: '#64748b', marginBottom: '0.3mm' }}>
                Contact Person
              </div>
              <div style={{
                fontSize: '1.7mm',
                fontWeight: 600,
                color: '#1e293b',
                padding: '0.8mm',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5mm',
                border: '0.2mm solid #e2e8f0',
                textAlign: 'center',
                wordBreak: 'break-word'
              }}>
                {profile.emergency_contact_name || 'N/A'}
              </div>
            </div>

            {/* Relationship */}
            <div>
              <div style={{ fontSize: '1.4mm', fontWeight: 'bold', color: '#64748b', marginBottom: '0.3mm' }}>
                Relationship
              </div>
              <div style={{
                fontSize: '1.7mm',
                fontWeight: 600,
                color: '#1e293b',
                padding: '0.8mm',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5mm',
                border: '0.2mm solid #e2e8f0',
                textAlign: 'center',
                wordBreak: 'break-word'
              }}>
                {profile.emergency_contact_relationship || 'N/A'}
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <div style={{ fontSize: '1.4mm', fontWeight: 'bold', color: '#64748b', marginBottom: '0.3mm' }}>
                Contact Number
              </div>
              <div style={{
                fontSize: '1.9mm',
                fontWeight: 'bold',
                color: '#dc2626',
                padding: '0.8mm',
                backgroundColor: '#fee2e2',
                borderRadius: '0.5mm',
                border: '0.2mm solid #ef4444',
                textAlign: 'center',
                fontFamily: 'Courier New, monospace',
                wordBreak: 'break-word'
              }}>
                {profile.emergency_contact_number || 'N/A'}
              </div>
            </div>

            {/* Address */}
            <div>
              <div style={{ fontSize: '1.4mm', fontWeight: 'bold', color: '#64748b', marginBottom: '0.3mm' }}>
                Address
              </div>
              <div style={{
                fontSize: '1.6mm',
                fontWeight: 600,
                color: '#334155',
                padding: '0.8mm',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5mm',
                border: '0.2mm solid #e2e8f0',
                lineHeight: 1.3,
                wordBreak: 'break-word',
                maxHeight: '8mm',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {profile.emergency_contact_address || 'N/A'}
              </div>
            </div>
          </div>

          {/* Footer Note - Compact */}
          <div style={{
            marginTop: '1mm',
            padding: '0.8mm',
            backgroundColor: '#fef3c7',
            borderRadius: '0.5mm',
            border: '0.2mm solid #fbbf24',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.1mm',
              fontWeight: 'bold',
              color: '#92400e',
              lineHeight: 1.2
            }}>
              If found, please contact emergency person above or return to Barangay Hall.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '0.3mm',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: '0.9mm',
        color: 'rgba(255,255,255,0.8)',
        fontFamily: 'Courier New, monospace',
        zIndex: 10
      }}>
        EMERGENCY CONTACT
      </div>
    </div>
  );
};

const PrintKKIDCard = ({ profile, side = 'front' }) => {
  const cardRef = useRef(null)
  if (!profile) return null;
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/storage/')) {
      return `${window.location.origin}${url}`;
    }
    if (url.startsWith('storage/')) {
      return `${window.location.origin}/${url}`;
    }
    return url;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).toUpperCase();
    } catch {
      return 'N/A';
    }
  };

  if (side === 'front') {
    return (
      <div 
        ref={cardRef}
        style={{
          width: '85.6mm',
          height: '54mm',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '4mm',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact'
        }}
      >
        {/* Watermark */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          fontSize: '40mm',
          fontWeight: 900,
          color: 'rgba(255, 255, 255, 0.08)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 1
        }}>
          KKID
        </div>

        {/* Header - Fixed height */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '7mm',
          background: 'rgba(255, 255, 255, 0.98)',
          borderBottom: '0.5mm solid #fbbf24',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 1mm'
        }}>
          <div style={{ fontSize: '2.8mm', fontWeight: 900, color: '#1e40af', lineHeight: 1.2 }}>
            KATIPUNAN NG KABATAAN
          </div>
          <div style={{ fontSize: '2mm', fontWeight: 600, color: '#64748b', lineHeight: 1.2 }}>
            OFFICIAL IDENTIFICATION CARD
          </div>
        </div>

        {/* Main Content Area - Fixed positioning */}
        <div style={{
          position: 'absolute',
          top: '7mm',
          left: 0,
          right: 0,
          bottom: '2.5mm',
          padding: '1.5mm',
          zIndex: 5
        }}>
          <div style={{
            display: 'flex',
            gap: '1.5mm',
            height: '100%'
          }}>
            {/* Left Column - Photo and ID info */}
            <div style={{
              width: '27mm',
              display: 'flex',
              flexDirection: 'column',
              gap: '1mm'
            }}>
              {/* Photo */}
              <div style={{
                width: '27mm',
                height: '30mm',
                backgroundColor: 'white',
                borderRadius: '1mm',
                overflow: 'hidden',
                border: '0.3mm solid #fbbf24',
                boxShadow: '0 1mm 2mm rgba(0,0,0,0.2)'
              }}>
                {profile.photo_url ? (
                  <img 
                    src={getImageUrl(profile.photo_url)} 
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#e0f2fe'
                  }}>
                    <User size={40} color="#94a3b8" />
                  </div>
                )}
              </div>

              {/* KKID Number */}
              <div style={{
                backgroundColor: 'white',
                padding: '1mm',
                borderRadius: '0.8mm',
                textAlign: 'center',
                border: '0.2mm solid #e2e8f0'
              }}>
                <div style={{ fontSize: '1.4mm', fontWeight: 'bold', color: '#64748b', marginBottom: '0.3mm' }}>
                  KKID NUMBER
                </div>
                <div style={{
                  fontSize: '1.7mm',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  fontFamily: 'Courier New, monospace',
                  wordBreak: 'break-all'
                }}>
                  {profile.kkid_number || 'N/A'}
                </div>
              </div>

              {/* Validity */}
              <div style={{
                backgroundColor: '#fef3c7',
                padding: '1mm',
                borderRadius: '0.8mm',
                textAlign: 'center',
                border: '0.2mm solid #fbbf24'
              }}>
                <div style={{ fontSize: '1.3mm', fontWeight: 'bold', color: '#92400e', marginBottom: '0.3mm' }}>
                  VALID UNTIL
                </div>
                <div style={{ fontSize: '1.7mm', fontWeight: 'bold', color: '#b45309' }}>
                  {formatDate(profile.validity_date)}
                </div>
              </div>
            </div>

            {/* Right Column - Personal Information */}
            <div style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '1mm',
              padding: '1.5mm',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1mm 2mm rgba(0,0,0,0.1)'
            }}>
              {/* Name */}
              <div style={{
                fontSize: '3.2mm',
                fontWeight: 900,
                color: '#1e293b',
                lineHeight: 1.2,
                marginBottom: '0.8mm',
                paddingBottom: '0.5mm',
                borderBottom: '0.3mm solid #fbbf24',
                wordBreak: 'break-word'
              }}>
                {profile.full_name || 'N/A'}
              </div>

              {/* Gender Badge */}
              <div style={{
                fontSize: '1.8mm',
                fontWeight: 'bold',
                color: profile.gender?.toLowerCase() === 'female' ? '#dc2626' : '#2563eb',
                marginBottom: '1mm',
                textTransform: 'uppercase'
              }}>
                {profile.gender || 'N/A'}
              </div>

              {/* Information Grid */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8mm',
                overflow: 'visible'
              }}>
                {/* Birthday */}
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '13mm',
                    fontSize: '1.6mm',
                    fontWeight: 'bold',
                    color: '#475569',
                    flexShrink: 0
                  }}>
                    Birthday:
                  </span>
                  <span style={{
                    fontSize: '1.6mm',
                    fontWeight: 600,
                    color: '#1e293b',
                    wordBreak: 'break-word',
                    flex: 1
                  }}>
                    {formatDate(profile.birthday)}
                  </span>
                </div>

                {/* Contact */}
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '13mm',
                    fontSize: '1.6mm',
                    fontWeight: 'bold',
                    color: '#475569',
                    flexShrink: 0
                  }}>
                    Contact:
                  </span>
                  <span style={{
                    fontSize: '1.6mm',
                    fontWeight: 600,
                    color: '#1e293b',
                    wordBreak: 'break-word',
                    flex: 1
                  }}>
                    {profile.contact_number || 'N/A'}
                  </span>
                </div>

                {/* Address - Optimized */}
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '13mm',
                    fontSize: '1.6mm',
                    fontWeight: 'bold',
                    color: '#475569',
                    flexShrink: 0,
                    paddingTop: '0.3mm'
                  }}>
                    Address:
                  </span>
                  <div style={{
                    flex: 1,
                    fontSize: '1.5mm',
                    fontWeight: 600,
                    color: '#1e293b',
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                    maxHeight: '10mm',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {profile.address || 'N/A'}
                  </div>
                </div>

                {/* Organization (if exists) */}
                {profile.youth_organization && (
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{
                      width: '13mm',
                      fontSize: '1.6mm',
                      fontWeight: 'bold',
                      color: '#475569',
                      flexShrink: 0
                    }}>
                      Org:
                    </span>
                    <span style={{
                      fontSize: '1.6mm',
                      fontWeight: 600,
                      color: '#1e293b',
                      wordBreak: 'break-word',
                      flex: 1
                    }}>
                      {profile.youth_organization}
                    </span>
                  </div>
                )}
              </div>

              {/* Signature Section - Compact */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '0.8mm',
                borderTop: '0.2mm dashed #94a3b8',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.1mm', fontWeight: 'bold', color: '#64748b', marginBottom: '0.3mm' }}>
                  AUTHORIZED SIGNATURE
                </div>
                <div style={{
                  width: '60%',
                  margin: '0 auto',
                  borderBottom: '0.2mm solid #1e293b',
                  height: '2mm',
                  marginBottom: '0.3mm'
                }}></div>
                <div style={{ fontSize: '1mm', color: '#64748b', fontStyle: 'italic' }}>
                  Barangay Chairman
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: '0.3mm',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: '0.9mm',
          color: 'rgba(255,255,255,0.8)',
          fontFamily: 'Courier New, monospace',
          zIndex: 10
        }}>
          ID #{profile.id?.toString().padStart(6, '0') || '000000'}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      style={{
        width: '85.6mm',
        height: '54mm',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '4mm',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact'
      }}
    >

      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '7mm',
        background: 'rgba(255, 255, 255, 0.98)',
        borderBottom: '0.5mm solid #ef4444',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '3.2mm', fontWeight: 900, color: '#dc2626' }}>
          IN CASE OF EMERGENCY
        </div>
      </div>

      {/* Content */}
      <div style={{
        position: 'absolute',
        top: '7mm',
        left: 0,
        right: 0,
        bottom: '2.5mm',
        padding: '1.5mm',
        zIndex: 5
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '1mm',
          padding: '1.5mm',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1mm 2mm rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '2mm',
            fontWeight: 'bold',
            color: '#dc2626',
            marginBottom: '1mm',
            textAlign: 'center',
            paddingBottom: '0.5mm',
            borderBottom: '0.2mm solid #ef4444'
          }}>
            PLEASE CONTACT
          </div>

          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1mm'
          }}>
            {/* Contact Person */}
            <div>
              <div style={{ fontSize: '1.4mm', fontWeight: 'bold', color: '#64748b', marginBottom: '0.3mm' }}>
                Contact Person
              </div>
              <div style={{
                fontSize: '1.7mm',
                fontWeight: 600,
                color: '#1e293b',
                padding: '0.8mm',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5mm',
                border: '0.2mm solid #e2e8f0',
                textAlign: 'center',
                wordBreak: 'break-word'
              }}>
                {profile.emergency_contact_name || 'N/A'}
              </div>
            </div>

            {/* Relationship */}
            <div>
              <div style={{ fontSize: '1.4mm', fontWeight: 'bold', color: '#64748b', marginBottom: '0.3mm' }}>
                Relationship
              </div>
              <div style={{
                fontSize: '1.7mm',
                fontWeight: 600,
                color: '#1e293b',
                padding: '0.8mm',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5mm',
                border: '0.2mm solid #e2e8f0',
                textAlign: 'center',
                wordBreak: 'break-word'
              }}>
                {profile.emergency_contact_relationship || 'N/A'}
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <div style={{ fontSize: '1.4mm', fontWeight: 'bold', color: '#64748b', marginBottom: '0.3mm' }}>
                Contact Number
              </div>
              <div style={{
                fontSize: '1.9mm',
                fontWeight: 'bold',
                color: '#dc2626',
                padding: '0.8mm',
                backgroundColor: '#fee2e2',
                borderRadius: '0.5mm',
                border: '0.2mm solid #ef4444',
                textAlign: 'center',
                fontFamily: 'Courier New, monospace',
                wordBreak: 'break-word'
              }}>
                {profile.emergency_contact_number || 'N/A'}
              </div>
            </div>

            {/* Address */}
            <div>
              <div style={{ fontSize: '1.4mm', fontWeight: 'bold', color: '#64748b', marginBottom: '0.3mm' }}>
                Address
              </div>
              <div style={{
                fontSize: '1.6mm',
                fontWeight: 600,
                color: '#334155',
                padding: '0.8mm',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5mm',
                border: '0.2mm solid #e2e8f0',
                lineHeight: 1.3,
                wordBreak: 'break-word',
                maxHeight: '8mm',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {profile.emergency_contact_address || 'N/A'}
              </div>
            </div>
          </div>

          {/* Footer Note - Compact */}
          <div style={{
            marginTop: '1mm',
            padding: '0.8mm',
            backgroundColor: '#fef3c7',
            borderRadius: '0.5mm',
            border: '0.2mm solid #fbbf24',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.1mm',
              fontWeight: 'bold',
              color: '#92400e',
              lineHeight: 1.2
            }}>
              If found, please contact emergency person above or return to Barangay Hall.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '0.3mm',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: '0.9mm',
        color: 'rgba(255,255,255,0.8)',
        fontFamily: 'Courier New, monospace',
        zIndex: 10
      }}>
        EMERGENCY CONTACT
      </div>
    </div>
  );
};


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
  const photoInputRef = useRef(null);
  const [fileSizeError, setFileSizeError] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateFilter, setExportDateFilter] = useState('all');
  const [exportStatusFilter, setExportStatusFilter] = useState('all');
  const [exporting, setExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

const fetchProfiles = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    
    console.log('Fetching profiles with token:', token ? 'Token exists' : 'No token');
    
    let url = '/api/admin/kkid-profiles'; // Make sure this matches your route
    const params = new URLSearchParams();
    
    if (searchTerm) params.append('search', searchTerm);
    if (statusFilter !== 'all') params.append('status', statusFilter);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    console.log('Fetching from URL:', url);
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.get('content-type'));
    
    // Check if response is HTML
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      console.error('Received HTML instead of JSON:', text.substring(0, 200));
      throw new Error('Server returned HTML instead of JSON. Possible authentication issue or incorrect URL.');
    }
    
    const responseText = await response.text();
    console.log('Response text:', responseText.substring(0, 200));
    
    if (!responseText.trim()) {
      throw new Error('Empty response from server');
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', responseText);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
    }
    
    if (response.ok) {
      if (data.success) {
        setProfiles(data.data || []);
        setStatistics(data.statistics || {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0
        });
      } else {
        toast.error(data.message || 'Failed to fetch profiles');
      }
    } else {
      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        // Redirect to login or refresh
        window.location.href = '/login';
      } else {
        toast.error(`Error ${response.status}: ${data.message || 'Failed to fetch profiles'}`);
      }
    }
  } catch (error) {
    console.error('Error fetching profiles:', error);
    toast.error(error.message || 'Failed to load KKID profiles');
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
  
  toast.dismiss();
  setFileSizeError(null);
  setFileSize(null);
  
  if (!file) {
    setPhotoFile(null);
    setPhotoPreview(null);
    return;
  }

  if (!file.type.startsWith('image/')) {
    toast.error('Please upload an image file (JPG, PNG, GIF, etc.)');
    e.target.value = '';
    setPhotoFile(null);
    setPhotoPreview(null);
    return;
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  setFileSize(fileSizeInMB);
  
  if (file.size > maxSize) {
    setFileSizeError(`File size exceeds the 5MB limit. Your file is ${fileSizeInMB}MB.`);
    toast.error(`File size exceeds the 5MB limit. Your file is ${fileSizeInMB}MB. Please choose a smaller file.`);
    e.target.value = '';
    setPhotoFile(null);
    setPhotoPreview(null);
    return;
  }
  
  const img = new Image();
  img.onload = () => {
    const aspectRatio = img.width / img.height;
    if (aspectRatio < 0.8 || aspectRatio > 1.2) {
      toast.warning('Image is not in a standard ID photo proportion. For best results, use a 2x2 inch photo.');
    }
    setPhotoFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  img.onerror = () => {
    toast.error('Failed to load image. Please try another file.');
    e.target.value = '';
    setPhotoFile(null);
    setPhotoPreview(null);
  };
  
  img.src = URL.createObjectURL(file);
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

const handleExportCSV = async () => {
  setExporting(true);
  
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      toast.error('You are not authenticated. Please login again.');
      setExporting(false);
      return;
    }

    console.log('Exporting with filters:', {
      date_filter: exportDateFilter,
      status: exportStatusFilter,
      search: searchTerm
    });

    const response = await fetch('/api/admin/kkid-profiles/export', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        date_filter: exportDateFilter,
        status: exportStatusFilter,
        search: searchTerm
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.get('content-type'));

    // Check if response is OK
    if (!response.ok) {
      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('authToken');
        return;
      }
      
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text.substring(0, 200));
      throw new Error('Server returned non-JSON response');
    }

    const data = await response.json();
    console.log('Export response data:', data);
    
    if (data.success) {
      // Decode base64 content
      try {
        const binaryString = window.atob(data.data.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob and download
        const blob = new Blob([bytes], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`Successfully exported ${data.data.count} KKID profiles`);
        setShowExportModal(false);
      } catch (decodeError) {
        console.error('Base64 decode error:', decodeError);
        toast.error('Error processing export data');
      }
    } else {
      toast.error(data.message || 'Failed to export data');
    }
  } catch (error) {
    console.error('Export error:', error);
    toast.error(error.message || 'Failed to export KKID profiles');
  } finally {
    setExporting(false);
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
      
      const frontContent = document.getElementById('print-front-content')?.innerHTML || '';
      const backContent = document.getElementById('print-back-content')?.innerHTML || '';
      
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
            ${frontContent}
          </div>
          <div class="print-page">
            ${backContent}
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
          className={`w-full ${fileSizeError ? 'border-red-500 text-red-600 hover:bg-red-50' : ''}`}
        >
          <Upload className="h-4 w-4 mr-2" />
          {photoPreview ? 'Change Photo' : 'Upload Photo'}
        </Button>
        
        {/* File size indicator */}
        {fileSize && !fileSizeError && (
          <p className="text-xs text-green-600 mt-2 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            File size: {fileSize}MB
          </p>
        )}
        
        {/* Error message with visual indicator */}
        {fileSizeError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-600 flex items-start">
              <span className="font-medium mr-1">⚠️</span>
              {fileSizeError}
            </p>
          </div>
        )}
        
        {/* Help text */}
        {!fileSizeError && (
          <p className="text-xs text-gray-500 mt-2">
            Upload a 2x2 inch photo. Max 5MB.
          </p>
        )}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Birthday *
          </label>
          <Input
            type="date"
            value={formData.birthday}
            onChange={(e) => handleInputChange("birthday", e.target.value)}
            onBlur={(e) => {
              const birthDate = new Date(e.target.value);
              const today = new Date();

              let age = today.getFullYear() - birthDate.getFullYear();
              const m = today.getMonth() - birthDate.getMonth();

              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }

              if (age < 15 || age > 30) {
                alert("Age must be between 15 and 30 years old.");
                handleInputChange("birthday", "");
              }
            }}
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
          <Select
            value={formData.civil_status}
            onValueChange={(value) => {
              handleInputChange("civil_status", value);

              // Inline filtering and clearing relationship if invalid
              if (
                (value === "Single" && formData.emergency_contact_relationship === "Spouse") ||
                (value === "Married" && formData.emergency_contact_relationship === "Live-in Partner") ||
                (value === "Widowed" && formData.emergency_contact_relationship === "Spouse")
              ) {
                handleInputChange("emergency_contact_relationship", "");
              }
            }}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number *
          </label>
          <Input
            type="tel"
            value={formData.contact_number}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); 
              if (value.length <= 11) {
                handleInputChange("contact_number", value);
              }
            }}
            required
            placeholder="Enter contact number"
            maxLength={11} 
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
            <Select
              value={formData.emergency_contact_relationship}
              onValueChange={(value) => handleInputChange("emergency_contact_relationship", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {formData.civil_status === "Single"
                  ? <>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                      <SelectItem value="Relative">Relative</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Live-in Partner">Live-in Partner</SelectItem>
                    </>
                  : formData.civil_status === "Married"
                  ? <>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                      <SelectItem value="Relative">Relative</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                    </>
                  : formData.civil_status === "Widowed"
                  ? <>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                      <SelectItem value="Relative">Relative</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                    </>
                  : <>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                      <SelectItem value="Relative">Relative</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Live-in Partner">Live-in Partner</SelectItem>
                    </>
                }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Number *
            </label>
            <Input
              type="tel" 
              value={formData.emergency_contact_number}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 11) {
                  handleInputChange("emergency_contact_number", value);
                }
              }}
              required
              placeholder="Enter emergency contact number"
              maxLength={11} 
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
      {/* Hidden print content */}
      <div style={{ display: 'none' }}>
        <div id="print-front-content">
          {selectedIDProfile && <PrintKKIDCard profile={selectedIDProfile} side="front" />}
        </div>
        <div id="print-back-content">
          {selectedIDProfile && <PrintKKIDCard profile={selectedIDProfile} side="back" />}
        </div>
      </div>

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
        
        <div className="flex gap-2">
          <Button
            onClick={() => setShowExportModal(true)}
            variant="outline"
            className="border-blue-300 hover:bg-blue-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
          
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
                      disabled={profile.status !== 'approved'}
                      title={profile.status !== 'approved' ? 'ID must be approved first' : 'View ID card'}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Print ID
                      {profile.status !== 'approved' && (
                        <span className="ml-1 text-xs text-yellow-600">(Pending)</span>
                      )}
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
                    <CreditCard className="h-4 w-4 mr-2" />
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

            {/* Main Content */}
            <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center min-h-[400px] max-h-[500px]">
              {/* Card Container */}
              <div className="relative" style={{ 
                width: '85.6mm', 
                height: '54mm',
                margin: '0 auto',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.5s',
                transform: showCardBack ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}>
                {/* Front Side */}
                <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                  <KKIDCard profile={selectedIDProfile} side="front" />
                </div>
                
                {/* Back Side */}
                <div className="absolute inset-0" style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}>
                  <KKIDCard profile={selectedIDProfile} side="back" />
                </div>
              </div>
              
              {/* Flip Hint */}
              <div className="mt-6 text-center">
                <Button
                  onClick={() => setShowCardBack(!showCardBack)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={printing}
                >
                  <FlipHorizontal className="h-4 w-4" />
                  Flip to {showCardBack ? 'Front' : 'Back'} Side
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t bg-white rounded-b-xl">
              <div className="flex flex-wrap gap-3 justify-center">
                {selectedIDProfile?.status !== 'approved' && (
                  <div className="text-center mb-2 w-full">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 px-3 py-1">
                      <Info className="h-3 w-3 mr-1" />
                      Only approved IDs can be printed
                    </Badge>
                  </div>
                )}
                <Button
                  onClick={handlePrintBothSides}
                  disabled={printing || selectedIDProfile?.status !== 'approved'}
                  variant="outline"
                  size="lg"
                  className={`border-green-300 hover:bg-green-50 ${
                    selectedIDProfile?.status !== 'approved' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={selectedIDProfile?.status !== 'approved' ? 'Only approved IDs can be printed' : 'Print ID card'}
                >
                  <Printer className="h-5 w-5 mr-2" />
                  Print Both Sides
                </Button>
              </div>
            </div>
          </div>
        </div>
        
      )}
                        {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Export KKID Profiles to CSV</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Date Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <Select value={exportDateFilter} onValueChange={setExportDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Filter
                </label>
                <Select value={exportStatusFilter} onValueChange={setExportStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Info */}
              {searchTerm && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 flex items-center">
                    <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                    Export will include search results for "{searchTerm}"
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleExportCSV}
                  disabled={exporting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export Now
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  disabled={exporting}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKKID;