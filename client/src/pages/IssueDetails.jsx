// src/pages/IssueDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, MapPin, User, Sparkles, Shield, AlertTriangle, 
  CheckCircle2, Clock, PlayCircle, XCircle, Mic, HelpCircle, Layers, ExternalLink, Edit2, Check 
} from 'lucide-react';
import api, { getImageUrl } from '../utils/api';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/ui/Badge';
import { CATEGORY_COLORS } from '../utils/colors';

const CATEGORY_LABELS = {
  roads: 'Roads & Infrastructure',
  water: 'Water Supply',
  health: 'Healthcare',
  education: 'Education',
  electricity: 'Electricity',
  sanitation: 'Sanitation',
  other: 'Other'
};

const TIMELINE_ICON = {
  pending: Clock,
  processing: PlayCircle,
  'under-review': Shield,
  resolved: CheckCircle2,
  rejected: XCircle
};

const TIMELINE_COLOR = {
  pending: 'text-orange-400 border-orange-500/30',
  processing: 'text-purple-400 border-purple-500/30',
  'under-review': 'text-cyan-400 border-cyan-500/30',
  resolved: 'text-emerald-400 border-emerald-500/30',
  rejected: 'text-red-400 border-red-500/30'
};

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addNotification } = useApp();
  
  const [request, setRequest] = useState(null);
  const [similarIssues, setSimilarIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit / Resubmit UI state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCat, setEditCat] = useState('other');
  const [editLoading, setEditLoading] = useState(false);

  const [resubmitDesc, setResubmitDesc] = useState('');
  const [resubmitLoading, setResubmitLoading] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/citizen/requests/${id}`);
      setRequest(response.data.data);
      setSimilarIssues(response.data.similarIssues || []);
      
      // Seed edit fields
      setEditTitle(response.data.data.title || '');
      setEditDesc(response.data.data.description || '');
      setEditCat(response.data.data.category || 'other');
    } catch (err) {
      console.error('Error fetching request details:', err);
      setError(err.response?.data?.error || 'Failed to retrieve incident specifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleSaveEdit = async () => {
    if (!editDesc.trim()) {
      addNotification({ type: 'error', title: 'Validation Error', message: 'Description is required.' });
      return;
    }
    setEditLoading(true);
    try {
      await api.put(`/citizen/requests/${id}`, {
        title: editTitle,
        description: editDesc,
        category: editCat
      });
      addNotification({ type: 'success', title: 'Incident Edited', message: 'Your grievance details have been updated successfully.' });
      setIsEditing(false);
      fetchDetails();
    } catch (err) {
      addNotification({ type: 'error', title: 'Edit Failed', message: err.response?.data?.error || 'Could not update request.' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleResubmit = async () => {
    if (!resubmitDesc.trim()) {
      addNotification({ type: 'error', title: 'Validation Error', message: 'Please provide details for resubmission.' });
      return;
    }
    setResubmitLoading(true);
    try {
      await api.post(`/citizen/requests/${id}/resubmit`, {
        description: resubmitDesc
      });
      addNotification({ type: 'success', title: 'Incident Resubmitted', message: 'Your grievance status is now pending review.' });
      setResubmitDesc('');
      fetchDetails();
    } catch (err) {
      addNotification({ type: 'error', title: 'Resubmit Failed', message: err.response?.data?.error || 'Could not resubmit request.' });
    } finally {
      setResubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F2A44] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-[#E0A030] rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-wider text-[#94A3B8] font-bold">Synchronizing Incident Logs...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F2A44] text-white px-6">
        <div className="max-w-md w-full p-8 rounded bg-[#122438] border border-red-500/25 text-center space-y-4">
          <AlertTriangle className="text-red-400 mx-auto" size={32} />
          <h3 className="text-lg font-bold font-serif">Incident Query Failure</h3>
          <p className="text-white/60 text-xs leading-relaxed">{error || 'Requested report details could not be found.'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs font-bold rounded transition-colors mx-auto"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const score = request.priorityScore ?? 0;
  const severityColor = score >= 90 ? '#ef4444' : score >= 70 ? '#f97316' : score >= 50 ? '#eab308' : '#6366f1';
  const severityLabel = score >= 90 ? 'Critical' : score >= 70 ? 'High' : score >= 50 ? 'Medium' : 'Low';
  const categoryColor = CATEGORY_COLORS[request.category?.toLowerCase()] || '#6366f1';

  // Check if current user is owner
  const isOwner = user && request.user && user._id === request.user.toString();

  // Construct status history array (fallback if empty)
  const timeline = request.statusHistory && request.statusHistory.length > 0
    ? request.statusHistory
    : [
        { status: 'pending', updatedAt: request.createdAt, notes: 'Issue registered into constituency triage desk.' }
      ];

  const rejectionNotes = request.status === 'rejected' 
    ? timeline.filter(t => t.status === 'rejected').pop()?.notes 
    : '';

  return (
    <div className="min-h-screen bg-[#0F2A44] relative text-[#E2E8F0] py-8">
      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-16">
        
        {/* Navigation back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/55 hover:text-white text-xs font-bold uppercase tracking-wider mb-6 group transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>

        {/* --- MAIN HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
          <div className="space-y-2 text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider bg-white/5 border-white/10 text-white">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: categoryColor }} />
                {CATEGORY_LABELS[request.category?.toLowerCase()] || request.category}
              </span>
              
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-[#122438] ${
                request.status === 'resolved' 
                  ? 'text-emerald-300 border-emerald-500/20' 
                  : request.status === 'rejected' 
                    ? 'text-red-300 border-red-500/20' 
                    : 'text-orange-300 border-orange-500/20'
              }`}>
                {request.status?.toUpperCase().replace('-', ' ')}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-serif">
              {request.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/50 text-xs font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#E0A030]" />
                Filed {new Date(request.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#E0A030]" />
                {request.location?.address || 'MG Road, Bengaluru'}
              </span>
              {request.phone && (
                <span className="text-white/40">
                  Contact: {request.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rejection alert banner */}
        {request.status === 'rejected' && (
          <div className="mb-6 p-4 rounded bg-red-950/20 border border-red-500/30 text-red-300 text-xs text-left flex items-start gap-3">
            <XCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
            <div className="space-y-1">
              <p className="font-bold uppercase tracking-wide">Incident Rejected</p>
              <p className="text-white/80 leading-relaxed">
                <strong>Reason:</strong> {rejectionNotes || 'Does not fit local ward jurisdiction or contains invalid proof.'}
              </p>
            </div>
          </div>
        )}

        {/* --- INCIDENT SPLIT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          
          {/* LEFT: Incident description, image, voice (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Description Card */}
            <div className="p-6 rounded bg-[#122438] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif">
                  Incident Details
                </h2>
                {isOwner && request.status === 'pending' && !isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-xs text-[#E0A030] hover:text-white transition-colors cursor-pointer font-bold uppercase tracking-wider"
                  >
                    <Edit2 size={12} />
                    Edit Request
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Title</label>
                    <input 
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0F2A44] border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#E0A030] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Category</label>
                    <select
                      value={editCat}
                      onChange={e => setEditCat(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0F2A44] border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#E0A030] transition-colors"
                    >
                      <option value="roads">Roads & Infrastructure</option>
                      <option value="water">Water Supply</option>
                      <option value="health">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="electricity">Electricity</option>
                      <option value="sanitation">Sanitation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Description</label>
                    <textarea 
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 bg-[#0F2A44] border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#E0A030] transition-colors resize-none leading-relaxed"
                    />
                  </div>
                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={editLoading}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#E0A030] hover:bg-[#F0B040] text-[#0F2A44] font-bold text-xs rounded transition-colors cursor-pointer"
                    >
                      {editLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded border border-white/10 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[#E2E8F0] text-sm leading-relaxed whitespace-pre-line">
                    {request.description || 'No description provided.'}
                  </p>
                  
                  {request.imageUrl && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Visual Report Attachment</p>
                      <div className="w-full max-h-[360px] rounded overflow-hidden border border-white/10 bg-black/10">
                        <img 
                          src={getImageUrl(request.imageUrl)} 
                          alt="Incident Visual Evidence" 
                          className="w-full h-full object-contain max-h-[360px] mx-auto" 
                        />
                      </div>
                    </div>
                  )}

                  {request.audioTranscript && (
                    <div className="p-4 rounded bg-[#0F2A44] border border-white/5 flex items-start gap-3">
                      <Mic size={16} className="text-[#E0A030] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[9px] text-[#94A3B8] uppercase tracking-wider font-bold">Voice Report Transcription</p>
                        <p className="text-white/85 text-xs italic">"{request.audioTranscript}"</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Resubmit form if rejected */}
            {isOwner && request.status === 'rejected' && (
              <div className="p-6 rounded bg-[#122438] border border-[#E0A030]/20 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-serif pb-3 border-b border-white/5 flex items-center gap-1.5">
                  <Check size={16} className="text-[#E0A030]" />
                  Resubmit with Updates
                </h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  Provide revised clarifications or describe resolving actions taken. This will move the ticket back to a Pending review status and re-triage the priority.
                </p>
                <div className="space-y-1">
                  <textarea
                    rows={4}
                    value={resubmitDesc}
                    onChange={e => setResubmitDesc(e.target.value)}
                    placeholder="Provide detailed description for resubmission..."
                    className="w-full px-3 py-2 bg-[#0F2A44] border border-white/10 rounded text-white text-xs placeholder-white/30 focus:outline-none focus:border-[#E0A030] transition-colors resize-none leading-relaxed"
                  />
                </div>
                <button
                  onClick={handleResubmit}
                  disabled={resubmitLoading}
                  className="px-4 py-2 bg-[#E0A030] hover:bg-[#F0B040] text-[#0F2A44] font-bold text-xs rounded transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {resubmitLoading ? 'Resubmitting...' : 'Confirm Resubmit'}
                </button>
              </div>
            )}

            {/* AI Insights & Government Schemes */}
            <div className="p-6 rounded bg-[#122438] border border-white/10 space-y-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif pb-3 border-b border-white/5 flex items-center gap-2">
                <Sparkles size={15} className="text-[#E0A030]" />
                Gemini AI Analytics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold">Triage Justification</p>
                  <p className="text-white text-xs leading-relaxed">{request.aiRecommendation || 'Triage summary analysis pending.'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold">Estimated Public Impact</p>
                  <p className="text-white text-xs leading-relaxed">{request.aiImpactEstimate || 'Dynamic impact calculations pending.'}</p>
                </div>
              </div>

              {request.suggestedSchemes && request.suggestedSchemes.length > 0 && (
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold">Suggested Government Funding Schemes</p>
                  <ul className="space-y-2">
                    {request.suggestedSchemes.map((scheme, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-white/80 leading-relaxed bg-[#0F2A44] p-3 border border-white/5 rounded">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#E0A030] mt-1.5 shrink-0" />
                        <span className="flex-1">{scheme}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Nearby Similar Issues */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif">
                Similar Nearby Incidents
              </h2>
              {similarIssues.length === 0 ? (
                <div className="p-6 rounded bg-[#122438]/50 border border-white/10 text-center text-white/40 text-xs">
                  No other active requests in this category within 1 kilometer.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similarIssues.map((issue) => (
                    <Link 
                      key={issue._id} 
                      to={`/requests/${issue._id}`}
                      className="p-4 rounded bg-[#122438] border border-white/10 hover:border-[#E0A030]/30 hover:bg-white/[0.01] transition-all flex justify-between items-start gap-3 group no-underline"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs font-bold text-white group-hover:text-[#E0A030] transition-colors truncate">{issue.title}</p>
                        <p className="text-[10px] text-white/40 truncate">{issue.location?.address || 'Verified Coordinates'}</p>
                        <div className="flex gap-2 items-center pt-1">
                          <span className="text-[9px] font-bold text-red-400 bg-red-950/20 border border-red-500/10 px-1.5 py-0.5 rounded">
                            Score: {issue.priorityScore}
                          </span>
                          {issue.duplicateCount > 0 && (
                            <span className="text-[9px] font-bold text-[#E0A030] bg-[#E0A030]/15 border border-[#E0A030]/20 px-1.5 py-0.5 rounded">
                              +{issue.duplicateCount} citizen reports
                            </span>
                          )}
                        </div>
                      </div>
                      <ExternalLink size={12} className="text-white/20 group-hover:text-white/40 shrink-0 mt-0.5" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT: Triage Score Gauge, Timeline Tracker (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Triage Gauge Card */}
            <div className="p-6 rounded bg-[#122438] border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <p className="text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider mb-6 leading-none self-start">Triage Priority Index</p>
              
              {/* Visual SVG Ring */}
              <div className="relative w-36 h-36 mb-6">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15"
                    fill="none"
                    stroke={severityColor}
                    strokeWidth="3.2"
                    strokeDasharray={`${(score / 100) * 94.2} 94.2`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold font-serif text-white tabular-nums">{score}</span>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none mt-1">Score</span>
                </div>
              </div>

              <div className="space-y-1.5 mb-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider" style={{ color: severityColor }}>
                  {severityLabel} Severity
                </h4>
                <p className="text-white/50 text-xs leading-relaxed max-w-[200px]">
                  Ranked inside the MP queue based on urgency and nearby demographic overlays.
                </p>
              </div>

              {request.duplicateCount > 0 && (
                <div className="mt-4 p-3 rounded bg-[#0F2A44] border border-[#E0A030]/20 flex items-center justify-center gap-2.5 text-xs text-white max-w-full">
                  <Users size={14} className="text-[#E0A030] shrink-0" />
                  <span>
                    Consolidated <strong>{request.duplicateCount}</strong> duplicate reports
                  </span>
                </div>
              )}
            </div>

            {/* Resolution Progress Timeline */}
            <div className="p-6 rounded bg-[#122438] border border-white/10 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif">
                  Resolution Progress
                </h2>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded">
                  Timeline
                </span>
              </div>

              {/* Vertical steps timeline */}
              <div className="relative pl-6 space-y-6 text-left border-l border-white/10 ml-2">
                {timeline.map((step, idx) => {
                  const StepIcon = TIMELINE_ICON[step.status] || Clock;
                  const stepColorClass = TIMELINE_COLOR[step.status] || 'text-white/40 border-white/10';
                  
                  return (
                    <div key={idx} className="relative">
                      {/* Circle Dot Marker */}
                      <span className={`absolute -left-[32px] top-0.5 w-5 h-5 rounded-full bg-[#122438] border flex items-center justify-center ${stepColorClass}`}>
                        <StepIcon size={11} className="current-color" />
                      </span>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white uppercase tracking-wide capitalize">
                            {step.status?.replace('-', ' ')}
                          </span>
                          <span className="text-[10px] text-white/35 font-bold font-mono shrink-0">
                            {new Date(step.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                          {step.notes || 'Status logs recorded.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
