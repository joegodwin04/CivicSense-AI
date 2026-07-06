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
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-blue-400">
            <Sparkles size={20} className="animate-pulse" />
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold text-base mb-1">AI Processing Pipeline Active</h4>
          <p className="text-white/40 text-xs max-w-xs leading-relaxed">
            Gemini is translating, classifying, and prioritizing your submission in real-time...
          </p>
        </div>
      </div>
    );
  }

  if (submitted && resultData) {
    const isDuplicate = resultData.duplicateCount > 0;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-stretch justify-center py-6 gap-5"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4"
          >
            <CheckCircle2 size={32} className="text-emerald-400" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-1">
            {isDuplicate ? 'Report Logged!' : 'Submission Successful!'}
          </h3>
          <p className="text-white/40 text-xs">AI analysis complete</p>
        </div>

        {/* AI Insight Card */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left space-y-4">
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
            <div>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Detected Category</p>
              <p className="text-white font-semibold capitalize text-sm mt-0.5">{resultData.category || 'Other'}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Priority Score</p>
              <p className="text-emerald-400 font-bold text-base mt-0.5">{resultData.priorityScore || '—'}/100</p>
            </div>
          </div>
          
          <div>
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">AI Justification & Recommendation</p>
            <p className="text-white/80 text-xs mt-1 leading-relaxed">{resultData.aiRecommendation || 'No recommendation provided.'}</p>
          </div>

          {resultData.nearbyInfrastructure && resultData.nearbyInfrastructure.length > 0 && (
            <div>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Critical Infrastructure Overlay</p>
              <div className="flex flex-wrap gap-1">
                {resultData.nearbyInfrastructure.slice(0, 3).map((infra, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/25 text-violet-300 text-[10px]">
                    {infra}
                  </span>
                ))}
              </div>
            </div>
          )}

          {isDuplicate && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
              <Users size={14} className="shrink-0" />
              <span>
                <span className="font-bold text-white">{resultData.duplicateCount}</span> other citizens reported this same issue nearby in the last 14 days. Priority score elevated.
              </span>
            </div>
          )}
        </div>

        <Button variant="secondary" size="md" onClick={resetForm} className="mx-auto">
          Submit Another
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Category picker */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Category (Or let AI classify)</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                form.category === cat.id
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  : 'bg-white/[0.03] border-white/[0.06] text-white/50 hover:bg-white/[0.06] hover:text-white/70'
              }`}
            >
              <span className="text-base">{cat.emoji}</span>
              <span className="text-center leading-tight">{cat.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs">
        <span className="text-white/40 font-medium flex items-center gap-1.5">
          <Globe size={13} className="text-violet-400" />
          Submission Language:
        </span>
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            addNotification({
              type: 'info',
              title: 'Language set',
              message: `Gemini AI translation configured for ${e.target.selectedOptions[0].text}.`
            });
          }}
          className="bg-transparent border-none text-white font-semibold focus:outline-none cursor-pointer"
        >
          <option value="auto" className="bg-[#0b1221]">Auto-detect (22+ Languages)</option>
          <option value="en" className="bg-[#0b1221]">English</option>
          <option value="hi" className="bg-[#0b1221]">Hindi (हिन्दी)</option>
          <option value="kn" className="bg-[#0b1221]">Kannada (ಕನ್ನಡ)</option>
          <option value="te" className="bg-[#0b1221]">Telugu (తెలుగు)</option>
          <option value="ta" className="bg-[#0b1221]">Tamil (தமிழ்)</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
          Describe the Issue <span className="text-white/20 normal-case font-normal">(required if no image/voice)</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="e.g. Deep potholes near St. Mark's School causing traffic jams and bike accidents. Water log in low lying areas..."
          rows={4}
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all resize-none"
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${form.description.length > 500 ? 'text-red-400' : 'text-white/20'}`}>
            {form.description.length}/500
          </span>
        </div>
      </div>

      {/* Photo + Voice */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 text-xs font-medium transition-all cursor-pointer ${
            photo
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-white/10 text-white/40 hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-300'
          }`}
        >
          {photoPreview ? (
            <div className="relative w-full flex flex-col items-center gap-1">
              <img src={photoPreview} alt="preview" className="h-12 w-auto rounded-lg object-cover" />
              <span className="truncate max-w-[120px]">Photo added</span>
            </div>
          ) : (
            <>
              <UploadCloud size={22} />
              <span>Upload Photo</span>
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        <button
          type="button"
          onClick={handleRecord}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 text-xs font-medium transition-all cursor-pointer ${
            isRecording
              ? 'border-red-500/40 bg-red-500/10 text-red-300 animate-pulse'
              : audioBlob
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-white/10 text-white/40 hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-300'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff size={22} className="text-red-400" />
              <span>Stop (Recording)</span>
            </>
          ) : audioBlob ? (
            <>
              <CheckCircle2 size={22} className="text-emerald-400" />
              <span>Audio attached</span>
            </>
          ) : (
            <>
              <Mic size={22} />
              <span>Voice Record</span>
            </>
          )}
        </button>
      </div>

      {/* Location */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${location ? 'bg-blue-500/20' : 'bg-white/[0.06]'}`}>
          <MapPin size={16} className={location ? 'text-blue-400' : 'text-white/30'} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          {location ? (
            <>
              <p className="text-white text-xs font-semibold mb-0.5">Location auto-detected</p>
              <p className="text-white/40 text-xs truncate" title={location.address}>{location.address}</p>
            </>
          ) : geoError ? (
            <>
              <p className="text-red-400 text-xs font-semibold">Location unavailable</p>
              <p className="text-white/30 text-xs">{geoError}</p>
            </>
          ) : (
            <>
              <p className="text-white/40 text-xs font-medium">Location not detected</p>
              <p className="text-white/20 text-xs">Click to auto-detect location</p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={detect}
          disabled={geoLoading}
          className="shrink-0 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={12} className={geoLoading ? 'animate-spin' : ''} />
          {geoLoading ? 'Detecting...' : location ? 'Refresh' : 'Detect'}
        </button>
      </div>

      {/* Optional contact */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-left">
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
            Name <span className="text-white/20 normal-case font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Anonymous"
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <div className="text-left">
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
            Phone <span className="text-white/20 normal-case font-normal">(optional)</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+91 XXXXX XXXXX"
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
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
        rounded="rounded-xl"
        className="w-full"
      >
        Submit Request
      </Button>
    </form>
  );
}
