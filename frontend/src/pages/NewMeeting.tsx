import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileAudio, 
  CheckCircle2, 
  Loader2, 
  Cpu, 
  CloudRain, 
  Share2,
  Mic,
  Circle,
  Pause,
  Play,
  Info
} from 'lucide-react';

const NewMeeting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'live'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);

  const processingSteps = [
    { label: 'Transcript received', icon: <CheckCircle2 size={16} /> },
    { label: 'Whisper STT processing', icon: <Cpu size={16} /> },
    { label: 'Claude analyzing conversation...', icon: <CloudRain size={16} /> },
    { label: 'Pushing to Jira / GitHub', icon: <Share2 size={16} /> },
  ];

  useEffect(() => {
    let interval: any;
    if (isProcessing && step < processingSteps.length) {
      interval = setInterval(() => {
        setStep(s => s + 1);
      }, 1500);
    } else if (step === processingSteps.length) {
      setTimeout(() => {
        setIsProcessing(false);
        setStep(0);
        alert('Meeting processed successfully!');
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isProcessing, step]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      const phrases = [
        "System: Initializing audio buffer...",
        "Alice: Team, the Q1 migration looks solid.",
        "Bob: Need to check the DB schema first.",
        "Alice: Agreed. Let's assign that to you, Bob.",
        "System: Analyzing voice signatures..."
      ];
      interval = setInterval(() => {
        setLiveTranscript(prev => [...prev, phrases[Math.floor(Math.random() * phrases.length)]].slice(-6));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleProcess = () => {
    setIsProcessing(true);
    setStep(0);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setLiveTranscript(["System: Listening..."]);
    }
  };

  return (
    <div className="page p-8 max-w-5xl mx-auto">
      <div className="card-border bg-white shadow-xl overflow-hidden">
        <div className="flex bg-slate-100 p-1 m-4 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
              activeTab === 'upload' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'
            }`}
          >
            <Upload size={16} />
            Upload Audio
          </button>
        <div className="flex border-b border-slate-200 mb-8 bg-slate-50/50 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-accent-blue shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="glass-panel p-8 min-h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Meeting Title</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Q2 Strategy Sync"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-accent-blue/50 focus:ring-4 focus:ring-accent-blue/5 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Host Name</label>
                  <input 
                    type="text" 
                    placeholder="Suman S."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-accent-blue/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Team / Project</label>
                  <input 
                    type="text" 
                    placeholder="Engineering"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-accent-blue/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Meeting Data</label>
              <div className="flex-1 min-h-[160px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center group hover:border-accent-blue/30 transition-all cursor-pointer">
                {activeTab === 'upload' ? (
                  <>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 mb-4 group-hover:text-accent-blue group-hover:scale-110 transition-all">
                      <Upload size={24} />
                    </div>
                    <p className="text-[14px] font-bold text-primary">Drop audio file or browse</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">MP3, WAV, M4A up to 50MB</p>
                  </>
                ) : activeTab === 'paste' ? (
                  <textarea 
                    placeholder="Paste your meeting transcript here..."
                    className="w-full h-full bg-transparent border-none focus:ring-0 text-[13px] font-mono leading-relaxed resize-none"
                  ></textarea>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      {isRecording && <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping"></div>}
                      <button 
                        onClick={toggleRecording}
                        className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                          isRecording ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-primary text-white shadow-lg shadow-slate-200'
                        }`}
                      >
                        {isRecording ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                      </button>
                    </div>
                    
                    <div className="w-full bg-slate-100/50 rounded-xl p-4 text-left font-mono text-[11px] text-slate-600 min-h-[100px]">
                       {liveTranscript.map((line, i) => (
                         <div key={i} className="mb-1">{line}</div>
                       ))}
                       {isRecording && <div className="inline-block w-1.5 h-3 bg-accent-blue animate-pulse ml-1"></div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              {isProcessing ? (
                <div className="space-y-3">
                  {processingSteps.map((s, i) => (
                    <div key={i} className={`flex items-center gap-3 text-[13px] font-semibold transition-all duration-300 ${
                      i < step ? 'text-emerald-600' : i === step ? 'text-accent-blue' : 'text-slate-300'
                    }`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-current/10`}>
                        {i < step ? <CheckCircle2 size={12} /> : i === step ? <Loader2 size={12} className="animate-spin" /> : <Circle size={4} />}
                      </div>
                      {s.label}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <Info size={16} />
                  <p className="text-[12px] font-medium italic">All data is processed using Claude-3-Sonnet with enterprise encryption.</p>
                </div>
              )}
            </div>

            <button 
              onClick={handleProcess}
              disabled={isProcessing}
              className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center gap-3 shrink-0"
            >
              {isProcessing ? 'Processing Intelligence...' : 'Process Meeting'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ChevronRight was imported from lucide-react in previous files, adding it here for standalone safety
const ChevronRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default NewMeeting;
