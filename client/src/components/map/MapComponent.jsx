// src/components/map/MapComponent.jsx
import { useEffect, useState, useRef } from 'react';
import { APIProvider, Map, Marker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Sparkles, Navigation, Search, Layers, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { CATEGORY_COLORS } from '../../utils/colors';

const getCategoryColor = (category) => {
  switch (category?.toLowerCase()) {
    case 'roads':
      return '#3b82f6'; // blue
    case 'water':
      return '#06b6d4'; // cyan
    case 'health':
      return '#ef4444'; // red
    case 'education':
      return '#8b5cf6'; // purple
    case 'electricity':
      return '#f59e0b'; // orange
    case 'sanitation':
      return '#10b981'; // green
    default:
      return '#8b5cf6'; // violet
  }
};

const defaultPosition = { lat: 12.9716, lng: 77.5946 };

// Inner Map component to gain access to useMap hook
function InnerMap({ requests, selectedRequest, setSelectedRequest }) {
  const map = useMap();
  const [isHeatmap, setIsHeatmap] = useState(false);
  const heatmapLayerRef = useRef(null);

  useEffect(() => {
    if (!map || !window.google) return;

    // Clean up existing heatmap if any
    if (heatmapLayerRef.current) {
      heatmapLayerRef.current.setMap(null);
      heatmapLayerRef.current = null;
    }

    if (isHeatmap) {
      const points = requests.map(r => {
        const [lng, lat] = r.location?.coordinates || [0, 0];
        return {
          location: new window.google.maps.LatLng(lat, lng),
          weight: r.priorityScore || 1
        };
      }).filter(p => p.location.lat() !== 0);

      heatmapLayerRef.current = new window.google.maps.visualization.HeatmapLayer({
        data: points,
        map: map,
        radius: 30
      });
    }

    return () => {
      if (heatmapLayerRef.current) {
        heatmapLayerRef.current.setMap(null);
      }
    };
  }, [map, requests, isHeatmap]);

  const handleLocateMe = () => {
    if (!map) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.panTo(pos);
          map.setZoom(14);
        },
        () => {
          console.warn('Geolocation access denied or failed.');
        }
      );
    }
  };

  const createMarkerIcon = (category, priorityScore) => {
    const color = getCategoryColor(category);
    const size = Math.round(16 + ((priorityScore || 0) / 100) * 14);
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" fill-opacity="0.75" stroke="#ffffff" stroke-width="1.5"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="3" fill="#ffffff" />
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  return (
    <>
      {/* Map Layers Toggles Overlay */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setIsHeatmap(!isHeatmap)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded shadow-md text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
            isHeatmap
              ? 'bg-[#E0A030] border-[#E0A030] text-[#0F2A44]'
              : 'bg-[#122438] border-white/10 text-white hover:bg-white/5'
          }`}
        >
          <Layers size={12} />
          {isHeatmap ? 'Disable Heatmap' : 'Enable Heatmap'}
        </button>

        <button
          onClick={handleLocateMe}
          className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#122438] border border-white/10 text-white hover:bg-white/5 shadow-md text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
        >
          <Navigation size={12} className="text-[#E0A030]" />
          My Location
        </button>
      </div>

      <Map
        defaultCenter={defaultPosition}
        defaultZoom={13}
        mapId="DEMO_MAP_ID"
        disableDefaultUI={true}
        zoomControl={true}
        styles={[
          { elementType: 'geometry', stylers: [{ color: '#060c18' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#060c18' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#525c7a' }] },
          { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#90a0d9' }] },
          { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#525c7a' }] },
          { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#081a24' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#131e33' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a2842' }] },
          { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#68779c' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#081729' }] },
          { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#2a3d54' }] },
        ]}
      >
        {/* Render markers only if heatmap is off */}
        {!isHeatmap && requests.map((req) => {
          const [lng, lat] = req.location?.coordinates || [0, 0];
          if (lat === 0 || lng === 0) return null;
          return (
            <Marker
              key={req._id}
              position={{ lat, lng }}
              icon={createMarkerIcon(req.category, req.priorityScore)}
              onClick={() => setSelectedRequest(req)}
            />
          );
        })}

        {selectedRequest && (() => {
          const [lng, lat] = selectedRequest.location?.coordinates || [0, 0];
          return (
            <InfoWindow
              position={{ lat, lng }}
              onCloseClick={() => setSelectedRequest(null)}
            >
              <div className="p-2.5 text-slate-900 max-w-[220px] text-left">
                <div className="font-bold text-xs capitalize mb-0.5 text-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: getCategoryColor(selectedRequest.category) }} />
                  {selectedRequest.category} Issue
                </div>
                <div className="text-[11px] text-slate-500 mb-2 line-clamp-2 leading-relaxed">{selectedRequest.description}</div>
                <div className="flex gap-2 items-center mb-3">
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded">
                    Score: {selectedRequest.priorityScore}
                  </span>
                  {selectedRequest.duplicateCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded">
                      +{selectedRequest.duplicateCount} citizen reports
                    </span>
                  )}
                </div>
                <Link
                  to={`/requests/${selectedRequest._id}`}
                  className="inline-flex items-center gap-1 text-[10px] text-[#0F2A44] hover:text-blue-700 font-bold uppercase tracking-wider border-t border-slate-100 pt-2 w-full no-underline"
                >
                  <span>Open Full Analysis</span>
                  <ArrowRight size={10} />
                </Link>
              </div>
            </InfoWindow>
          );
        })()}
      </Map>
    </>
  );
}

export default function MapComponent() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all'); // 'all' | 'critical' | 'high' | 'medium'

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/citizen/requests');
        const geocoded = (response.data.data || []).filter(
          (req) => req.location?.coordinates && req.location.coordinates.length === 2
        );
        setRequests(geocoded);
      } catch (err) {
        console.error('Failed to load map requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full rounded-2xl bg-[#122438] border border-white/10 flex flex-col items-center justify-center text-white/40 gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-[#E0A030]/10 border-t-[#E0A030] animate-spin" />
        <span className="text-xs uppercase tracking-wider font-bold">Synchronizing map nodes...</span>
      </div>
    );
  }

  // Fallback Mockup Render if maps api key is missing
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 relative z-0 bg-[#060c18] flex flex-col items-center justify-center p-6 text-center">
        <MapPin size={36} className="text-white/20 mb-3 animate-bounce" />
        <h3 className="text-white font-bold text-sm mb-1">Google Maps API Offline</h3>
        <p className="text-white/45 text-xs max-w-xs leading-relaxed mb-4">
          Please add a valid key to <code className="text-blue-400 font-mono">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="text-blue-400 font-mono">client/.env</code>.
        </p>
      </div>
    );
  }

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchesSearch = !searchQuery || 
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location?.address?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = filterCategory === 'all' || r.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    
    let matchesPriority = true;
    if (filterPriority === 'critical') matchesPriority = (r.priorityScore ?? 0) >= 90;
    else if (filterPriority === 'high') matchesPriority = (r.priorityScore ?? 0) >= 70 && (r.priorityScore ?? 0) < 90;
    else if (filterPriority === 'medium') matchesPriority = (r.priorityScore ?? 0) >= 50 && (r.priorityScore ?? 0) < 70;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 relative z-0">
      
      {/* Top Filter Overlay Box */}
      <div className="absolute top-4 right-4 z-10 bg-[#122438]/95 border border-white/10 p-3 rounded-lg flex flex-wrap items-center gap-3 shadow-md backdrop-blur max-w-[90%] md:max-w-2xl text-left">
        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search map details..."
            className="pl-7 pr-3 py-1 bg-[#0B0F19] border border-white/10 rounded text-white text-[11px] placeholder-white/30 focus:outline-none focus:border-[#E0A030] transition-all w-32 md:w-40"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-2 py-1 bg-[#0B0F19] border border-white/10 rounded text-white text-[11px] focus:outline-none focus:border-[#E0A030] cursor-pointer"
        >
          <option value="all">All Themes</option>
          <option value="roads">Roads</option>
          <option value="water">Water Supply</option>
          <option value="health">Healthcare</option>
          <option value="education">Education</option>
          <option value="electricity">Electricity</option>
          <option value="sanitation">Sanitation</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-2 py-1 bg-[#0B0F19] border border-white/10 rounded text-white text-[11px] focus:outline-none focus:border-[#E0A030] cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="under-review">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="px-2 py-1 bg-[#0B0F19] border border-white/10 rounded text-white text-[11px] focus:outline-none focus:border-[#E0A030] cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical (≥90)</option>
          <option value="high">High (70-89)</option>
          <option value="medium">Medium (50-69)</option>
        </select>
      </div>

      <APIProvider apiKey={apiKey} libraries={['visualization']}>
        <InnerMap 
          requests={filteredRequests} 
          selectedRequest={selectedRequest}
          setSelectedRequest={setSelectedRequest}
        />
      </APIProvider>
    </div>
  );
}
