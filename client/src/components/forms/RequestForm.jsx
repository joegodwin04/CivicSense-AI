// src/components/forms/RequestForm.jsx
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, UploadCloud, Mic, MicOff, MapPin, RefreshCw, CheckCircle2, X, Image } from 'lucide-react';
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
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileRef = useRef();
  const mediaRef = useRef();
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
      recorder.start();
      setIsRecording(true);
      addNotification({ type: 'info', title: 'Recording...', message: 'Click again to stop recording.' });
      recorder.addEventListener('stop', () => {
        stream.getTracks().forEach((t) => t.stop());
        addNotification({ type: 'success', title: 'Recording saved', message: 'Audio attached to your request.' });
      });
    } catch {
      addNotification({ type: 'error', title: 'Microphone blocked', message: 'Please allow microphone access.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) {
      addNotification({ type: 'warning', title: 'Description required', message: 'Please describe the issue.' });
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
      if (location) {
        data.append('latitude', location.latitude);
        data.append('longitude', location.longitude);
        data.append('address', location.address);
      }

      await citizenService.submitRequest(data);
      setSubmitted(true);
      addNotification({ type: 'success', title: 'Request submitted!', message: 'Your report has been sent to the MP\'s office.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Submission failed', message: err?.response?.data?.error || 'Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 gap-5 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
        >
          <CheckCircle2 size={36} className="text-emerald-400" />
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Request Submitted!</h3>
          <p className="text-white/50 text-sm max-w-sm">
            Your report has been received. Gemini AI will analyze and prioritize it for your MP.
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={() => { setForm(INITIAL_FORM); setSubmitted(false); setPhoto(null); setPhotoPreview(null); }}>
          Submit Another
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Category picker */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Category</label>
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

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
          Describe the Issue <span className="text-red-400">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="e.g. The road near MG School has deep potholes causing accidents. Water logging during rains..."
          rows={4}
          required
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
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 text-xs font-medium transition-all ${
            photo
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-white/10 text-white/40 hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-300'
          }`}
        >
          {photoPreview ? (
            <div className="relative w-full flex flex-col items-center gap-1">
              <img src={photoPreview} alt="preview" className="h-12 w-auto rounded-lg object-cover" />
              <span>Photo added</span>
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
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 text-xs font-medium transition-all ${
            isRecording
              ? 'border-red-500/40 bg-red-500/10 text-red-300 animate-pulse'
              : 'border-white/10 text-white/40 hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-300'
          }`}
        >
          {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
          <span>{isRecording ? 'Stop Recording' : 'Voice Record'}</span>
        </button>
      </div>

      {/* Location */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${location ? 'bg-blue-500/20' : 'bg-white/[0.06]'}`}>
          <MapPin size={16} className={location ? 'text-blue-400' : 'text-white/30'} />
        </div>
        <div className="flex-1 min-w-0">
          {location ? (
            <>
              <p className="text-white text-xs font-semibold mb-0.5">Location detected</p>
              <p className="text-white/40 text-xs truncate">{location.address}</p>
            </>
          ) : geoError ? (
            <>
              <p className="text-red-400 text-xs font-semibold">Location unavailable</p>
              <p className="text-white/30 text-xs">{geoError}</p>
            </>
          ) : (
            <>
              <p className="text-white/40 text-xs font-medium">Location not detected</p>
              <p className="text-white/20 text-xs">Click to auto-detect your location</p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={detect}
          disabled={geoLoading}
          className="shrink-0 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw size={12} className={geoLoading ? 'animate-spin' : ''} />
          {geoLoading ? 'Detecting...' : location ? 'Refresh' : 'Detect'}
        </button>
      </div>

      {/* Optional contact */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
            Name <span className="text-white/20 normal-case font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Your name"
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <div>
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
