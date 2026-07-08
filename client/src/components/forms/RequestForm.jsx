// src/components/forms/RequestForm.jsx
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, UploadCloud, Mic, MicOff, MapPin, RefreshCw, CheckCircle2, AlertTriangle, Users, Sparkles, Globe } from 'lucide-react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { CATEGORIES } from '../../constants';
import { useGeolocation } from '../../hooks/useGeolocation';
import { citizenService } from '../../services/citizenService';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';

const extractAddressComponents = (components) => {
  const info = {
    landmark: '',
    locality: '',
    ward: '',
    city: '',
    district: '',
    state: '',
    postalCode: ''
  };

  if (!components || !Array.isArray(components)) return info;

  components.forEach(c => {
    const types = c.types;
    if (types.includes('premise') || types.includes('point_of_interest') || types.includes('establishment')) {
      info.landmark = c.long_name;
    }
    if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
      info.locality = c.long_name;
    }
    if (types.includes('sublocality_level_2') || types.includes('neighborhood') || types.includes('colony')) {
      info.ward = c.long_name;
    }
    if (types.includes('locality')) {
      info.city = c.long_name;
    }
    if (types.includes('administrative_area_level_2')) {
      info.district = c.long_name;
    }
    if (types.includes('administrative_area_level_1')) {
      info.state = c.long_name;
    }
    if (types.includes('postal_code')) {
      info.postalCode = c.long_name;
    }
  });

  return info;
};

const getHumanReadableAddress = (info, fallbackAddress) => {
  const parts = [];
  if (info.landmark) {
    parts.push(`Near ${info.landmark}`);
  }
  if (info.ward) {
    parts.push(info.ward);
  }
  if (info.locality) {
    parts.push(info.locality);
  }
  
  if (parts.length > 0) {
    return parts.join(', ');
  }
  return fallbackAddress;
};

const INITIAL_FORM = {
  description: '',
  category: '',
  name: '',
  phone: '',
};

export default function RequestForm({ onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resultData, setResultData] = useState(null);
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [language, setLanguage] = useState('auto');
  
  const fileRef = useRef();
  const mediaRef = useRef();
  const chunksRef = useRef([]);

  const { location, loading: geoLoading, error: geoError, detect } = useGeolocation();
  const { addNotification } = useApp();

  const [isManual, setIsManual] = useState(false);
  const [manualLocation, setManualLocation] = useState({
    address: '',
    latitude: '',
    longitude: ''
  });

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const defaultPosition = { lat: 12.9716, lng: 77.5946 };
  const [markerPosition, setMarkerPosition] = useState(null);

  const [parsedLocation, setParsedLocation] = useState({
    landmark: '',
    locality: '',
    ward: '',
    city: '',
    district: '',
    state: '',
    postalCode: ''
  });

  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [geocodingError, setGeocodingError] = useState(null);

  useEffect(() => {
    if (isManual && location) {
      setMarkerPosition({ lat: location.latitude, lng: location.longitude });
    }
  }, [isManual, location]);

  useEffect(() => {
    if (markerPosition) {
      setManualLocation(prev => ({
        ...prev,
        latitude: markerPosition.lat.toString(),
        longitude: markerPosition.lng.toString()
      }));
    }
  }, [markerPosition]);

  const [addressSearch, setAddressSearch] = useState('');
  const [searchingAddress, setSearchingAddress] = useState(false);

  const handleSearchAddress = () => {
    if (!addressSearch.trim() || !window.google) return;
    setSearchingAddress(true);
    setGeocodingLoading(true);
    setGeocodingError(null);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: addressSearch }, (results, status) => {
      setSearchingAddress(false);
      setGeocodingLoading(false);
      if (status === 'OK' && results[0]) {
        const { lat, lng } = results[0].geometry.location;
        const coords = { lat: lat(), lng: lng() };
        setMarkerPosition(coords);
        
        const parsed = extractAddressComponents(results[0].address_components);
        setParsedLocation(parsed);
        const readable = getHumanReadableAddress(parsed, results[0].formatted_address);

        setManualLocation(prev => ({
          ...prev,
          address: readable,
          latitude: coords.lat.toString(),
          longitude: coords.lng.toString()
        }));
        
        addNotification({
          type: 'success',
          title: 'Address Located',
          message: `Coordinates locked to: ${readable}`
        });
      } else {
        setGeocodingError('Search failed to resolve address.');
        addNotification({
          type: 'error',
          title: 'Search Failed',
          message: 'Could not resolve address. Try another search term.'
        });
      }
    });
  };

  useEffect(() => {
    if (geoError) {
      setIsManual(true);
    }
  }, [geoError]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addNotification({ type: 'error', title: 'File too large', message: 'Please select a photo under 5MB.' });
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRecord = async () => {
    if (isRecording) {
      mediaRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        addNotification({ 
          type: 'success', 
          title: 'Recording saved', 
          message: 'Audio transcript request ready.' 
        });
      };

      recorder.start();
      setIsRecording(true);
      addNotification({ 
        type: 'info', 
        title: 'Recording...', 
        message: 'Click microphone again to stop.' 
      });
    } catch (err) {
      addNotification({ type: 'error', title: 'Microphone blocked', message: 'Please allow microphone access.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim() && !photo && !audioBlob) {
      addNotification({ 
        type: 'warning', 
        title: 'Input required', 
        message: 'Please provide a text description, photo, or voice recording.' 
      });
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('description', form.description);
      if (form.category) {
        data.append('category', form.category);
      }
      data.append('language', language);
      if (form.name) data.append('name', form.name);
      if (form.phone) data.append('phone', form.phone);
      if (photo) data.append('photo', photo);
      if (audioBlob) data.append('audio', audioBlob, 'recording.webm');
      
      if (isManual) {
        if (!markerPosition) {
          addNotification({
            type: 'warning',
            title: 'Location Pin Required',
            message: 'Please click on the map or search to choose a location.'
          });
          setSubmitting(false);
          return;
        }
        if (!manualLocation.address.trim()) {
          addNotification({
            type: 'warning',
            title: 'Address Required',
            message: 'Please provide an address/landmark name.'
          });
          setSubmitting(false);
          return;
        }
        data.append('latitude', markerPosition.lat);
        data.append('longitude', markerPosition.lng);
        data.append('address', manualLocation.address);
        data.append('landmark', parsedLocation.landmark || '');
        data.append('locality', parsedLocation.locality || '');
        data.append('ward', parsedLocation.ward || '');
        data.append('city', parsedLocation.city || '');
        data.append('district', parsedLocation.district || '');
        data.append('state', parsedLocation.state || '');
        data.append('postalCode', parsedLocation.postalCode || '');
      } else {
        if (!location) {
          addNotification({
            type: 'warning',
            title: 'Location Required',
            message: 'Please verify your current location first, or switch to manual map placement.'
          });
          setSubmitting(false);
          return;
        }
        data.append('latitude', location.latitude);
        data.append('longitude', location.longitude);
        data.append('address', location.address || '');

        if (location.raw && location.raw.results && location.raw.results[0]) {
          const parsed = extractAddressComponents(location.raw.results[0].address_components);
          data.append('landmark', parsed.landmark || '');
          data.append('locality', parsed.locality || '');
          data.append('ward', parsed.ward || '');
          data.append('city', parsed.city || '');
          data.append('district', parsed.district || '');
          data.append('state', parsed.state || '');
          data.append('postalCode', parsed.postalCode || '');
        }
      }

      const res = await citizenService.submitRequest(data);
      setResultData(res.data);
      setSubmitted(true);
      addNotification({ 
        type: 'success', 
        title: 'Request Analyzed!', 
        message: res.isDuplicate ? 'Duplicate detected & linked.' : 'AI analysis finished and queued.' 
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      addNotification({ 
        type: 'error', 
        title: 'Submission failed', 
        message: err?.response?.data?.error || 'Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setSubmitted(false);
    setResultData(null);
    setPhoto(null);
    setPhotoPreview(null);
    setAudioBlob(null);
    setIsRecording(false);
  };

  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#E0A030] animate-spin" />
        <div>
          <h4 className="text-white font-bold text-sm mb-1">AI Triage Processing</h4>
          <p className="text-[#94A3B8] text-xs max-w-xs leading-relaxed">
            Gemini is translating, classifying, and prioritizing your report parameters...
          </p>
        </div>
      </div>
    );
  }

  if (submitted && resultData) {
    const isDuplicate = resultData.duplicateCount > 0;
    return (
      <div className="flex flex-col items-stretch justify-center py-4 gap-5">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-center mb-3">
            <CheckCircle2 size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white font-serif mb-1">
            {isDuplicate ? 'Report Logged' : 'Report Logged Successfully'}
          </h3>
          <p className="text-[#94A3B8] text-xs">AI analysis complete</p>
        </div>

        {/* AI Insight Card */}
        <div className="p-5 rounded bg-[#0F2A44] border border-white/10 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <p className="text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">Detected Category</p>
              <p className="text-white font-bold capitalize text-sm mt-0.5">{resultData.category || 'Other'}</p>
            </div>
            <div className="text-right">
              <p className="text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">Priority Score</p>
              <p className="text-[#E0A030] font-bold text-base mt-0.5">{resultData.priorityScore || '—'}/100</p>
            </div>
          </div>
          
          <div>
            <p className="text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">Representative Decision Summary</p>
            <p className="text-white text-xs mt-1 leading-relaxed">{resultData.aiRecommendation || 'No recommendation provided.'}</p>
          </div>

          {resultData.nearbyInfrastructure && resultData.nearbyInfrastructure.length > 0 && (
            <div>
              <p className="text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider mb-1.5">Critical Proximity Overlays</p>
              <div className="flex flex-wrap gap-1.5">
                {resultData.nearbyInfrastructure.slice(0, 3).map((infra, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#E0A030] text-[10px] font-semibold uppercase tracking-wide">
                    {infra.split('(')[0].trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {isDuplicate && (
            <div className="p-3.5 rounded bg-[#122438] border border-[#E0A030]/20 text-white text-xs flex items-center gap-2.5">
              <Users size={15} className="text-[#E0A030] shrink-0" />
              <span>
                <span className="font-bold text-[#E0A030]">{resultData.duplicateCount}</span> other citizens reported this same issue nearby. Incidents consolidated.
              </span>
            </div>
          )}
        </div>

        <Button variant="primary" size="md" onClick={resetForm} className="mx-auto">
          Submit Another Report
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Step 1: Language */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-white uppercase tracking-wider">
          Step 1: Select Language
        </label>
        <div className="relative">
          <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E0A030]" />
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              addNotification({
                type: 'info',
                title: 'Language set',
                message: `Triage language configured for ${e.target.selectedOptions[0].text}.`
              });
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-[#0B0F19] border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#E0A030] transition-colors appearance-none cursor-pointer"
          >
            <option value="auto">Auto-detect (22 Indian Languages)</option>
            <option value="en">English</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="kn">Kannada (ಕನ್ನಡ)</option>
            <option value="te">Telugu (తెలుగు)</option>
            <option value="ta">Tamil (தமிழ்)</option>
          </select>
        </div>
      </div>

      {/* Step 2: Category */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-white uppercase tracking-wider">
          Step 2: Choose Category <span className="text-[#94A3B8] font-normal normal-case">(optional)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
              className={`flex items-center justify-center gap-2 p-2.5 rounded border text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                form.category === cat.id
                  ? 'bg-[#E0A030]/15 border-[#E0A030] text-[#E0A030]'
                  : 'bg-[#0B0F19] border-white/10 text-white hover:border-white/20'
              }`}
            >
              <span>{cat.emoji}</span>
              <span className="truncate">{cat.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Description & Attachments */}
      <div className="space-y-3.5">
        <label className="block text-xs font-bold text-white uppercase tracking-wider">
          Step 3: Provide Issue Details
        </label>
        
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Describe what needs attention (e.g. Broken water pipe, street light not working, potholes on the crossroad...)"
          rows={3}
          className="w-full bg-[#0B0F19] border border-white/10 rounded px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E0A030] transition-colors resize-none"
        />
        
        <div className="flex justify-between items-center text-xs text-[#94A3B8]">
          <span>Speak, upload photo, or type details above</span>
          <span className={form.description.length > 500 ? 'text-red-400 font-bold' : ''}>
            {form.description.length}/500
          </span>
        </div>

        {/* Large Touch Target Attachment Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`flex items-center justify-center gap-2.5 border border-dashed rounded p-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer min-h-[52px] ${
              photo
                ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                : 'border-white/15 text-white hover:border-white/30 bg-[#0B0F19]'
            }`}
          >
            {photoPreview ? (
              <div className="flex items-center gap-2">
                <img src={photoPreview} alt="" className="h-6 w-6 rounded object-cover" />
                <span className="truncate max-w-[80px]">Photo Added</span>
              </div>
            ) : (
              <>
                <UploadCloud size={16} className="text-[#E0A030]" />
                <span>Upload Photo</span>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          <button
            type="button"
            onClick={handleRecord}
            className={`flex items-center justify-center gap-2.5 border border-dashed rounded p-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer min-h-[52px] ${
              isRecording
                ? 'border-red-500 bg-red-950/20 text-red-300'
                : audioBlob
                ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                : 'border-white/15 text-white hover:border-white/30 bg-[#0B0F19]'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff size={16} className="text-red-400 animate-pulse" />
                <span>Stop Rec</span>
              </>
            ) : audioBlob ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Audio Added</span>
              </>
            ) : (
              <>
                <Mic size={16} className="text-[#E0A030]" />
                <span>Voice Record</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step 4: Geolocation */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-white uppercase tracking-wider">
          Step 4: Location Verification
        </label>
        
        <div className="flex flex-col gap-3 p-3.5 rounded bg-[#0B0F19] border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <MapPin size={15} className="text-[#E0A030]" />
            </div>
            <div className="flex-1 min-w-0 text-left text-xs">
              {location && !isManual ? (
                <>
                  <p className="text-white font-bold uppercase text-[9px]">Verified Coordinates</p>
                  <p className="text-[#94A3B8] truncate mt-0.5" title={location.address}>{location.address}</p>
                </>
              ) : geoError && !isManual ? (
                <>
                  <p className="text-red-400 font-bold uppercase text-[9px]">Location Error</p>
                  <p className="text-white/40 truncate mt-0.5">{geoError}</p>
                </>
              ) : isManual ? (
                <>
                  <p className="text-[#E0A030] font-bold uppercase text-[9px]">Manual Location Mode</p>
                  <p className="text-white/40 truncate mt-0.5">Please specify location details below</p>
                </>
              ) : (
                <>
                  <p className="text-white/40 font-bold uppercase text-[9px]">Awaiting Location</p>
                  <p className="text-white/20 truncate mt-0.5">Click verify to attach map coordinates</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {!isManual && (
                <button
                  type="button"
                  onClick={detect}
                  disabled={geoLoading}
                  className="text-xs font-bold text-[#E0A030] hover:text-[#F0B040] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={12} className={geoLoading ? 'animate-spin' : ''} />
                  {geoLoading ? 'Verifying...' : location ? 'Refresh' : 'Verify'}
                </button>
              )}
              {isManual && (
                <button
                  type="button"
                  onClick={() => {
                    setIsManual(false);
                  }}
                  className="text-xs font-bold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                >
                  Use Auto
                </button>
              )}
            </div>
          </div>

          {/* Manual Input Fields Box */}
          {isManual && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-t border-white/5 pt-3 mt-1 space-y-3 text-left"
            >
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">
                    Address / Landmark / Ward Name *
                  </label>
                  {geocodingLoading && (
                    <span className="text-[10px] text-[#E0A030] font-bold animate-pulse">Retrieving Address...</span>
                  )}
                  {geocodingError && (
                    <span className="text-[10px] text-red-400 font-bold">{geocodingError}</span>
                  )}
                </div>
                <input
                  type="text"
                  required={isManual}
                  value={manualLocation.address}
                  onChange={(e) => setManualLocation(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. Ward 4, Outer Ring Road, near Metro station"
                  className="w-full bg-[#0F2A44] border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#E0A030] transition-colors"
                />
              </div>
              {apiKey && apiKey !== 'YOUR_API_KEY_HERE' ? (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">
                    Pin Location on Map *
                  </label>
                  
                  {/* Geocoding Search Input Bar */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={addressSearch}
                      onChange={e => setAddressSearch(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchAddress();
                        }
                      }}
                      placeholder="Search location/area name..."
                      className="flex-1 bg-[#0B0F19] border border-white/10 rounded px-2.5 py-1.5 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#E0A030] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleSearchAddress}
                      disabled={searchingAddress || !addressSearch.trim()}
                      className="px-3.5 py-1.5 bg-[#E0A030] hover:bg-[#F0B040] disabled:bg-[#E0A030]/20 text-[#0F2A44] font-bold text-xs rounded transition-colors cursor-pointer"
                    >
                      {searchingAddress ? '...' : 'Search'}
                    </button>
                  </div>

                  <div style={{ height: '220px', width: '100%', borderRadius: '8px', overflow: 'hidden' }} className="border border-white/10 relative z-0 mt-1">
                    <APIProvider apiKey={apiKey}>
                      <Map
                        center={markerPosition || defaultPosition}
                        defaultZoom={13}
                        onClick={(e) => {
                          if (e.detail?.latLng) {
                            const { lat, lng } = e.detail.latLng;
                            const coords = { lat, lng };
                            setMarkerPosition(coords);
                            setGeocodingLoading(true);
                            setGeocodingError(null);
                            
                            if (window.google) {
                              const geocoder = new window.google.maps.Geocoder();
                              geocoder.geocode({ location: coords }, (results, status) => {
                                setGeocodingLoading(false);
                                if (status === 'OK' && results[0]) {
                                  const parsed = extractAddressComponents(results[0].address_components);
                                  setParsedLocation(parsed);
                                  const readable = getHumanReadableAddress(parsed, results[0].formatted_address);
                                  
                                  setManualLocation(prev => ({
                                    ...prev,
                                    address: readable,
                                    latitude: lat.toString(),
                                    longitude: lng.toString()
                                  }));
                                } else {
                                  setGeocodingError('Geocoding failed for clicked location.');
                                }
                              });
                            } else {
                              setGeocodingLoading(false);
                            }
                          }
                        }}
                        disableDefaultUI={true}
                        zoomControl={true}
                        mapId="PICKER_MAP_ID"
                      >
                        {markerPosition && (
                          <Marker position={markerPosition} />
                        )}
                      </Map>
                    </APIProvider>
                  </div>
                  
                  {/* Use My Location Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        setGeocodingLoading(true);
                        setGeocodingError(null);
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const coords = {
                              lat: position.coords.latitude,
                              lng: position.coords.longitude
                            };
                            setMarkerPosition(coords);
                            
                            if (window.google) {
                              const geocoder = new window.google.maps.Geocoder();
                              geocoder.geocode({ location: coords }, (results, status) => {
                                setGeocodingLoading(false);
                                if (status === 'OK' && results[0]) {
                                  const parsed = extractAddressComponents(results[0].address_components);
                                  setParsedLocation(parsed);
                                  const readable = getHumanReadableAddress(parsed, results[0].formatted_address);
                                  setManualLocation(prev => ({
                                    ...prev,
                                    address: readable,
                                    latitude: coords.lat.toString(),
                                    longitude: coords.lng.toString()
                                  }));
                                  addNotification({
                                    type: 'success',
                                    title: 'Location Captured',
                                    message: 'Synchronized browser coordinates successfully.'
                                  });
                                } else {
                                  setGeocodingError('Geocoding failed for current coordinates.');
                                }
                              });
                            } else {
                              setGeocodingLoading(false);
                            }
                          },
                          (err) => {
                            setGeocodingLoading(false);
                            addNotification({
                              type: 'error',
                              title: 'Location Blocked',
                              message: 'Please allow browser location permissions.'
                            });
                          }
                        );
                      }
                    }}
                    className="w-full mt-1.5 px-3 py-2 bg-[#0F2A44] border border-white/10 hover:bg-white/5 transition-colors rounded text-white text-xs flex items-center justify-center gap-2 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Navigation size={13} className="text-[#E0A030]" />
                    Use My Location
                  </button>

                  <div className="text-[10px] text-white/50 bg-[#0F2A44]/50 p-2 rounded border border-white/5 flex items-center justify-between">
                    {markerPosition ? (
                      <span>Coordinates: <strong>{markerPosition.lat.toFixed(5)}, {markerPosition.lng.toFixed(5)}</strong></span>
                    ) : (
                      <span className="text-amber-400 font-semibold">Click on the map to set coordinates.</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">
                      Latitude (Optional)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={manualLocation.latitude}
                      onChange={(e) => setManualLocation(prev => ({ ...prev, latitude: e.target.value }))}
                      placeholder="e.g. 12.9716"
                      className="w-full bg-[#0F2A44] border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#E0A030] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">
                      Longitude (Optional)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={manualLocation.longitude}
                      onChange={(e) => setManualLocation(prev => ({ ...prev, longitude: e.target.value }))}
                      placeholder="e.g. 77.5946"
                      className="w-full bg-[#0F2A44] border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#E0A030] transition-colors"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {!isManual && !location && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsManual(true)}
                className="text-[10px] text-white/40 hover:text-[#E0A030] transition-colors underline cursor-pointer"
              >
                Or enter location details manually
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contact details */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
        <div className="text-left space-y-1.5">
          <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">
            Your Name <span className="text-[#94A3B8] font-normal normal-case">(optional)</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Anonymous"
            className="w-full bg-[#0B0F19] border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#E0A030] transition-colors"
          />
        </div>
        <div className="text-left space-y-1.5">
          <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">
            Phone Number <span className="text-[#94A3B8] font-normal normal-case">(optional)</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+91 XXXXX XXXXX"
            className="w-full bg-[#0B0F19] border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#E0A030] transition-colors"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={submitting}
        icon={Send}
        iconPosition="right"
        rounded="rounded"
        className="w-full uppercase font-bold tracking-wider"
      >
        Submit Official Report
      </Button>
    </form>
  );
}
