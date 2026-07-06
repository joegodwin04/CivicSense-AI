// src/components/forms/RequestForm.jsx
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, UploadCloud, Mic, MicOff, MapPin, RefreshCw, CheckCircle2, AlertTriangle, Users, Sparkles, Globe } from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { useGeolocation } from '../../hooks/useGeolocation';
import { citizenService } from '../../services/citizenService';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';

const INITIAL_FORM = {
  description: '',
  category: '',
  name: '',
  phone: '',
};

export default function RequestForm() {
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
      data.append('category', form.category || 'other');
      if (form.name) data.append('name', form.name);
      if (form.phone) data.append('phone', form.phone);
      if (photo) data.append('photo', photo);
      if (audioBlob) data.append('audio', audioBlob, 'recording.webm');
      
      if (location) {
        data.append('latitude', location.latitude);
        data.append('longitude', location.longitude);
        data.append('address', location.address);
      }

      const res = await citizenService.submitRequest(data);
      setResultData(res.data);
      setSubmitted(true);
      addNotification({ 
        type: 'success', 
        title: 'Request Analyzed!', 
        message: res.isDuplicate ? 'Duplicate detected & cataloged.' : 'AI analysis finished and queued.' 
      });
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
        
        <div className="flex items-center gap-3 p-3.5 rounded bg-[#0B0F19] border border-white/10">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
            <MapPin size={15} className="text-[#E0A030]" />
          </div>
          <div className="flex-1 min-w-0 text-left text-xs">
            {location ? (
              <>
                <p className="text-white font-bold uppercase text-[9px]">Verified Coordinates</p>
                <p className="text-[#94A3B8] truncate mt-0.5" title={location.address}>{location.address}</p>
              </>
            ) : geoError ? (
              <>
                <p className="text-red-400 font-bold uppercase text-[9px]">Location Error</p>
                <p className="text-white/40 truncate mt-0.5">{geoError}</p>
              </>
            ) : (
              <>
                <p className="text-white/40 font-bold uppercase text-[9px]">Awaiting Location</p>
                <p className="text-white/20 truncate mt-0.5">Click verify to attach map coordinates</p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={detect}
            disabled={geoLoading}
            className="shrink-0 text-xs font-bold text-[#E0A030] hover:text-[#F0B040] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={12} className={geoLoading ? 'animate-spin' : ''} />
            {geoLoading ? 'Verifying...' : location ? 'Refresh' : 'Verify'}
          </button>
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
