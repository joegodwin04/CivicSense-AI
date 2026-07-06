import { useEffect, useState } from 'react';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import { MapPin, Sparkles } from 'lucide-react';
import api from '../../utils/api';

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

export default function MapComponent() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bangalore constituency default center
  const defaultPosition = { lat: 12.9716, lng: 77.5946 };
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/dashboard/requests');
        // Filter out requests that don't have valid coordinates
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

  const createMarkerIcon = (category, priorityScore) => {
    const color = getCategoryColor(category);
    // Size scales from 16 to 32 based on priorityScore
    const size = Math.round(16 + ((priorityScore || 0) / 100) * 16);
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" fill-opacity="0.65" stroke="#ffffff" stroke-width="1.5"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="3" fill="#ffffff" />
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  if (loading) {
    return (
      <div className="h-full w-full rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center text-white/40 gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500/10 border-t-blue-500 animate-spin" />
        <span className="text-xs">Loading map intelligence...</span>
      </div>
    );
  }

  // If the key is not set, display a beautiful fallback mockup showing the real request pins
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 relative z-0 bg-[#060c18] flex flex-col items-center justify-center p-6 text-center">
        <MapPin size={36} className="text-white/20 mb-3 animate-bounce" />
        <h3 className="text-white font-bold text-sm mb-1">Google Maps Not Initialized</h3>
        <p className="text-white/45 text-xs max-w-xs leading-relaxed mb-4">
          Please add a valid key to <code className="text-blue-400 font-mono">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="text-blue-400 font-mono">client/.env</code>.
        </p>
        
        {/* Render a fallback interactive list representing coordinates */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left text-xs w-full max-w-md">
          <p className="font-semibold text-white/70 mb-2 flex items-center gap-1.5">
            <Sparkles size={12} className="text-blue-400" />
            Detected Hotspots ({requests.length})
          </p>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {requests.length > 0 ? (
              requests.map((r) => (
                <div key={r._id} className="flex justify-between items-center bg-white/[0.02] p-2 rounded border border-white/[0.04] text-[11px]">
                  <div className="truncate max-w-[200px]">
                    <span className="font-bold text-white capitalize mr-1">[{r.category}]</span>
                    <span className="text-white/50">{r.location?.address || 'MG Road'}</span>
                  </div>
                  <span className="text-red-400 font-semibold shrink-0">Score: {r.priorityScore}</span>
                </div>
              ))
            ) : (
              <p className="text-white/20 text-center py-4">No geocoded requests in database yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 relative z-0">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={defaultPosition}
          defaultZoom={13}
          mapId="DEMO_MAP_ID" // Uses default style or can be customized
          disableDefaultUI={true}
          zoomControl={true}
          styles={[
            {
              elementType: 'geometry',
              stylers: [{ color: '#060c18' }],
            },
            {
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#060c18' }],
            },
            {
              elementType: 'labels.text.fill',
              stylers: [{ color: '#525c7a' }],
            },
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#90a0d9' }],
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#525c7a' }],
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{ color: '#081a24' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#131e33' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#1a2842' }],
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#68779c' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#081729' }],
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#2a3d54' }],
            },
          ]}
        >
          {requests.map((req) => {
            const [lng, lat] = req.location?.coordinates || [77.5946, 12.9716];
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
            const [lng, lat] = selectedRequest.location?.coordinates || [77.5946, 12.9716];
            return (
              <InfoWindow
                position={{ lat, lng }}
                onCloseClick={() => setSelectedRequest(null)}
              >
                <div className="p-2 text-slate-900 max-w-[200px]">
                  <div className="font-bold text-xs capitalize mb-0.5">{selectedRequest.category} Issue</div>
                  <div className="text-[11px] text-slate-500 mb-2 line-clamp-2">{selectedRequest.description}</div>
                  <div className="flex gap-1 items-center">
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded">
                      Score: {selectedRequest.priorityScore}
                    </span>
                    {selectedRequest.duplicateCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded">
                        +{selectedRequest.duplicateCount} duplicates
                      </span>
                    )}
                  </div>
                </div>
              </InfoWindow>
            );
          })()}
        </Map>
      </APIProvider>
    </div>
  );
}
