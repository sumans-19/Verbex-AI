import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Loader2, Play, Database, FileDigit } from 'lucide-react';

const NewMeeting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0);

  const handleProcess = () => {
    setIsProcessing(true);
    setStep(1);
    
    // Simulate processing steps
    setTimeout(() => setStep(2), 1000);
    setTimeout(() => setStep(3), 2500);
    setTimeout(() => {
      setStep(4);
      setTimeout(() => setIsProcessing(false), 1500); // Reset after success
    }, 4500);
  };

  const InputField = ({ label, placeholder, type = 'text' }: any) => (
    <div className="space-y-1.5 flex-1">
      <label className="font-mono text-[10px] uppercase tracking-wider text-muted px-1">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder}
        className="w-full bg-[#181b22] border border-[#ffffff18] rounded-lg p-2.5 px-4 text-sm text-text focus:outline-none focus:border-accent-green/50 transition-all font-sans"
      />
    </div>
  );

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-8">
      {/* Tabs */}
      <div className="flex bg-surface p-1 rounded-xl border border-[#ffffff0a] w-fit mx-auto">
        <button 
          onClick={() => setActiveTab('upload')}
          className={`px-8 py-2 rounded-lg text-xs font-mono uppercase tracking-[0.2em] flex items-center gap-2 transition-all ${activeTab === 'upload' ? 'bg-[#22252c] text-accent-green' : 'text-muted hover:text-text'}`}
        >
          <Upload size={14} />
          Upload Audio
        </button>
        <button 
          onClick={() => setActiveTab('paste')}
          className={`px-8 py-2 rounded-lg text-xs font-mono uppercase tracking-[0.2em] flex items-center gap-2 transition-all ${activeTab === 'paste' ? 'bg-[#22252c] text-accent-green' : 'text-muted hover:text-text'}`}
        >
          <FileText size={14} />
          Paste Transcript
        </button>
      </div>

      <div className="bg-surface border border-[#ffffff0f] rounded-2xl overflow-hidden animate-fadeIn">
        <div className="p-8 space-y-8">
          {activeTab === 'upload' ? (
            <div className="border-2 border-dashed border-[#ffffff18] hover:border-accent-green/40 transition-all rounded-xl p-12 text-center group cursor-pointer">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-green/5 border border-accent-green/20 text-accent-green mb-4 group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <h4 className="text-lg font-serif mb-2">Drop audio file or click to browse</h4>
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted">Supports .mp3 .wav .m4a · Max 500MB · Whisper STT</p>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea 
                placeholder="Paste meeting transcript here…"
                className="w-full min-h-[320px] bg-[#181b22] border border-[#ffffff18] rounded-xl p-6 text-sm font-mono text-muted focus:outline-none focus:border-accent-green/50 focus:text-text transition-all resize-none leading-relaxed"
              />
            </div>
          )}

          {/* Metadata Grid */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <InputField label="Meeting Title" placeholder="Sprint 25 Planning..." />
              <InputField label="Host Name" placeholder="Arjun Mehta" />
            </div>
            <div className="flex gap-4">
              <InputField label="Date" type="date" />
              <InputField label="Team / Project" placeholder="Backend Team" />
            </div>
          </div>

          <button 
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full bg-accent-green text-background py-4 rounded-xl text-[14px] font-bold tracking-widest uppercase hover:bg-accent-green/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
            {isProcessing ? 'Processing Conversation...' : 'Process Meeting'}
          </button>
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-10 animate-fadeIn">
            <div className="w-full max-w-[400px] space-y-6">
              <div className="text-center space-y-1 mb-8">
                <h3 className="font-serif text-2xl text-accent-green italic">Analyzing Intelligence</h3>
                <p className="text-xs text-muted font-mono uppercase tracking-widest">Claude extraction in progress</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 1, label: 'Transcript received', completed: step > 1, active: step === 1 },
                  { id: 2, label: 'Whisper STT processing', completed: step > 2, active: step === 2 },
                  { id: 3, label: 'Claude analyzing conversation…', completed: step > 3, active: step === 3 },
                  { id: 4, label: 'Pushing to Jira / GitHub', completed: step >= 4, active: step === 4 }
                ].map((s) => (
                  <div key={s.id} className={`flex items-center justify-between p-4 rounded-lg border border-[#ffffff0f] transition-all ${s.active ? 'bg-accent-green/5 border-accent-green/20' : ''}`}>
                    <div className="flex items-center gap-3">
                      {s.completed ? (
                        <CheckCircle className="text-accent-green" size={18} />
                      ) : s.active ? (
                        <div className="w-4 h-4 rounded-full bg-accent-green animate-pulse" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-[#ffffff10]" />
                      )}
                      <span className={`text-[13px] font-medium transition-colors ${s.active ? 'text-accent-green' : s.completed ? 'text-text' : 'text-muted'}`}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewMeeting;
