import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, UploadCloud, MapPin, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CitizenPortal() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-500/30">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="font-bold tracking-tight text-xl">CitizenVoice</div>
        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">Cancel</Link>
      </nav>

      <main className="max-w-2xl mx-auto p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight mb-2">Report an Issue</h1>
          <p className="text-gray-500 mb-8">Your request will be analyzed by AI and sent directly to your MP.</p>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What is the issue?</label>
              <textarea 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none h-32"
                placeholder="e.g., The road near the main school has deep potholes..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all">
                <UploadCloud size={24} />
                <span className="text-sm font-medium">Upload Photo</span>
              </button>
              
              <button type="button" className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-red-500 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all">
                <Mic size={24} />
                <span className="text-sm font-medium">Voice Record</span>
              </button>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl text-blue-800">
              <MapPin size={20} className="text-blue-600" />
              <div className="flex-1 text-sm">
                <p className="font-medium">Location auto-detected</p>
                <p className="opacity-80">MG Road, Ward 4, South District</p>
              </div>
              <button type="button" className="text-xs font-semibold bg-white px-3 py-1.5 rounded-lg shadow-sm">Edit</button>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-black text-white rounded-xl p-4 font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Send size={18} />
                </motion.div>
              ) : (
                <>Submit Request <Send size={18} /></>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
