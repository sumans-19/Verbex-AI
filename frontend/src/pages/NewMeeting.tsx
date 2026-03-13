import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  FileAudio, 
  Mic, 
  Info,
  ChevronRight,
  CheckCircle2,
  Zap,
  Users,
  AlertCircle,
  Square
} from 'lucide-react';
import type { Meeting } from '../types.ts';

const API_BASE_URL = 'http://localhost:8000/api';
const WS_BASE_URL = 'ws://localhost:8000/api';

const NewMeeting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'live'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [title, setTitle] = useState('');
  const [hostName, setHostName] = useState('Suman S.');
  const [pastedText, setPastedText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('Initializing...');
  const [processedData, setProcessedData] = useState<any | null>(null);
  const [liveSegments, setLiveSegments] = useState<{phrase: string, time: string}[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveSegments]);

  const tabs = [
    { id: 'upload', label: 'Upload Audio', icon: <Upload size={16} /> },
    { id: 'paste', label: 'Document Upload', icon: <FileAudio size={16} /> },
    { id: 'live', label: 'Live Transcribe', icon: <Mic size={16} /> },
  ];

  const startLiveRecording = async () => {
    if (!title.trim()) {
      setError('Please enter a meeting title');
      return;
    }

    try {
      setError(null);
      setLiveSegments([]);
      
      // Step 1: Create Meeting
      const createResponse = await fetch(`${API_BASE_URL}/meetings/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, host_name: hostName })
      });
      if (!createResponse.ok) throw new Error('Failed to create meeting session');
      const meeting: Meeting = await createResponse.json();

      // Step 2: Initialize Web Media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Step 3: Connect WebSocket
      const socket = new WebSocket(`${WS_BASE_URL}/meetings/${meeting.id}/live`);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsRecording(true);
        mediaRecorder.start(250); // Send chunks every 250ms
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'transcript') {
          setLiveSegments(prev => [...prev, { phrase: data.segment, time: data.timestamp }]);
        } else if (data.type === 'status') {
          setProcessingStatus(data.message);
          setIsProcessing(true);
        } else if (data.type === 'complete') {
          setProcessedData(data);
          setIsProcessing(false);
          setIsRecording(false);
          socket.close();
        } else if (data.type === 'error') {
          setError(data.message);
          stopLiveRecording();
        }
      };

      socket.onerror = () => {
        setError('WebSocket connection error');
        stopLiveRecording();
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      };

    } catch (err: any) {
      setError(err.message || 'Could not start recording');
      setIsRecording(false);
    }
  };

  const stopLiveRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send('STOP');
    }
    
    setIsRecording(false);
  };

  const handleProcess = async () => {
    if (!title.trim()) {
      setError('Please enter a meeting title');
      return;
    }

    if (activeTab === 'upload' && !file) {
      setError('Please select an audio file');
      return;
    }

    if (activeTab === 'paste' && !docFile && !pastedText.trim()) {
      setError('Please provide a document or paste text');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStatus('Creating meeting profile...');

    try {
      const createResponse = await fetch(`${API_BASE_URL}/meetings/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, host_name: hostName })
      });

      if (!createResponse.ok) throw new Error('Failed to create meeting');
      const meeting: Meeting = await createResponse.json();

      if (activeTab === 'paste') {
        setProcessingStatus('AI: Extracting tasks & decisions...');
        const formData = new FormData();
        if (docFile) {
          formData.append('file', docFile);
        } else {
          const blob = new Blob([pastedText], { type: 'text/plain' });
          formData.append('file', blob, 'transcript.txt');
        }

        const uploadResponse = await fetch(`${API_BASE_URL}/meetings/${meeting.id}/upload-text`, {
          method: 'POST',
          body: formData
        });
        if (!uploadResponse.ok) throw new Error('Failed to process document');
        const data = await uploadResponse.json();
        setProcessedData({
           ...data,
           tasks: data.tasks || [],
           decisions: data.decisions || []
        });
      } else if (activeTab === 'upload') {
        setProcessingStatus('Whisper: Transcribing audio...');
        const formData = new FormData();
        formData.append('file', file!);
        const uploadResponse = await fetch(`${API_BASE_URL}/meetings/${meeting.id}/upload-audio`, {
          method: 'POST',
          body: formData
        });
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({ detail: 'Failed' }));
          throw new Error(errorData.detail || 'Failed to process audio');
        }
        const data = await uploadResponse.json();
        setProcessedData(data);
      }

      setProcessingStatus('Success!');
      setTimeout(() => {
          setIsProcessing(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocFile(e.target.files[0]);
      setError(null);
    }
  };

  if (processedData && !isProcessing && !isRecording) {
    return (
      <div className="page p-8 max-w-5xl mx-auto animate-fadeIn">
        <div className="flex items-center justify-between mb-8">
           <div>
              <h2 className="text-3xl font-bold text-primary mb-2">Ingestion Complete</h2>
              <p className="text-slate-500 font-medium">Strategic intelligence has been extracted and registry updated.</p>
           </div>
           <button 
             onClick={() => window.location.reload()}
             className="px-6 py-2.5 bg-accent-teal text-white rounded font-bold uppercase tracking-widest text-xs hover:bg-accent-pine transition-all"
           >
             Done
           </button>
        </div>

        <div className="bg-slate-900 rounded-xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
           <div className="absolute top-0 left-0 w-1 h-full bg-accent-teal"></div>
           <h3 className="text-xs font-bold text-accent-teal uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse"></div>
             Intelligence Summary
           </h3>
           <p className="text-xl font-medium leading-relaxed italic text-slate-100">
             {processedData.tldr || processedData.summary || "Strategizing next steps based on meeting intelligence..."}
           </p>
        </div>

        {processedData.tasks && processedData.tasks.length > 0 && (
           <div className="corporate-card p-6 mb-8 bg-slate-50 border-accent-teal/10">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users size={14} className="text-accent-teal" />
                Department Workload Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {Object.entries(
                   processedData.tasks.reduce((acc: any, t: any) => {
                     const dept = t.owner_dept || "Unassigned";
                     acc[dept] = (acc[dept] || 0) + 1;
                     return acc;
                   }, {})
                 ).map(([dept, count]: [string, any]) => (
                   <div key={dept} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 truncate">{dept}</p>
                      <div className="flex items-end gap-2">
                         <span className="text-2xl font-serif font-bold text-primary">{count}</span>
                         <span className="text-[10px] font-bold text-slate-400 pb-1">TASKS</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
           <div className="flex flex-col h-[600px] border border-slate-100 rounded-xl bg-white/50 overflow-hidden shadow-premium">
              <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between">
                 <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Zap size={14} className="text-amber-500" />
                   Action Items
                 </h4>
                 <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{processedData.tasks?.length || 0} Total</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                 {processedData.tasks?.length > 0 ? (
                    processedData.tasks.map((task: any, idx: number) => (
                       <div key={idx} className={`corporate-card p-5 hover:border-accent-teal/30 transition-all slide-up stagger-${(idx % 5) + 1}`}>
                          <div className="flex justify-between items-start mb-3">
                             <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">
                                Task #{idx + 1}
                             </span>
                             <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-tighter ${
                                task.priority === 'high' ? 'bg-rose-100 text-rose-600' : 
                                task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                             }`}>
                                {task.priority || 'Medium'}
                             </span>
                          </div>
                          <h5 className="font-bold text-primary text-[15px] mb-2">{task.title}</h5>
                          <p className="text-slate-500 text-xs leading-relaxed font-medium mb-4">{task.description}</p>
                          
                          {(task.assignee_name || task.owner_emp_id || task.owner_dept) && (
                             <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4">
                                {task.assignee_name && (
                                   <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-teal-50 text-accent-teal flex items-center justify-center text-[10px] font-bold border border-teal-100">
                                         {task.assignee_name.charAt(0)}
                                      </div>
                                      <div>
                                         <p className="text-[10px] font-bold text-slate-600 leading-none">{task.assignee_name}</p>
                                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Owner</p>
                                      </div>
                                   </div>
                                )}
                                {task.owner_emp_id && (
                                   <div>
                                      <p className="text-[10px] font-bold text-slate-600 leading-none">{task.owner_emp_id}</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">ID</p>
                                   </div>
                                )}
                                {task.owner_dept && (
                                   <div>
                                      <p className="text-[10px] font-bold text-slate-600 leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">{task.owner_dept}</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Dept</p>
                                   </div>
                                )}
                             </div>
                          )}
                       </div>
                    ))
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 grayscale py-20">
                       <Zap size={32} />
                       <p className="text-[10px] font-bold uppercase tracking-widest mt-4">No tasks found</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="flex flex-col h-[600px] border border-slate-100 rounded-xl bg-white/50 overflow-hidden shadow-premium">
              <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between">
                 <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <CheckCircle2 size={14} className="text-emerald-500" />
                   Decisions Made
                 </h4>
                 <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{processedData.decisions?.length || 0} Total</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                 {processedData.decisions?.length > 0 ? (
                    processedData.decisions.map((decision: any, idx: number) => (
                       <div key={idx} className={`corporate-card p-5 border-l-4 border-l-emerald-400 slide-up stagger-${(idx % 5) + 1}`}>
                          <h5 className="font-bold text-primary text-[15px] mb-2">{decision.title}</h5>
                          <p className="text-slate-500 text-xs leading-relaxed font-medium">{decision.description}</p>
                       </div>
                    ))
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 grayscale py-20">
                       <CheckCircle2 size={32} />
                       <p className="text-[10px] font-bold uppercase tracking-widest mt-4">No decisions recorded</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page p-8 max-w-5xl mx-auto">
      <div className="flex flex-col mb-10">
        <h2 className="text-3xl font-bold text-primary mb-2 tracking-tight">Ingest Meeting Intelligence</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">AI-Powered Strategic Data Ingestion</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-3 text-rose-600">
          <AlertCircle size={18} />
          <p className="text-[13px] font-bold uppercase tracking-tight">{error}</p>
        </div>
      )}

      <div className="flex border-b border-slate-200 mb-8 bg-slate-50 p-1 rounded">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (!isRecording) setActiveTab(tab.id as any);
            }}
            disabled={isRecording}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[13px] font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-accent-teal shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-primary'
            } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-panel p-8 min-h-[400px]">
        {activeTab === 'live' ? (
          <div className="flex flex-col items-center justify-center p-10 h-full">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 border-4 ${
              isRecording ? 'border-rose-100 bg-rose-50 animate-pulse' : 'border-slate-100 bg-slate-50'
            }`}>
              <Mic className={`w-10 h-10 ${isRecording ? 'text-rose-500' : 'text-slate-300'}`} />
            </div>
            
            <h3 className="text-xl font-bold text-primary mb-2">
              {isRecording ? 'Meeting in Progress...' : 'Live Intelligence Feed'}
            </h3>
            
            <p className="text-slate-500 text-sm max-w-xs mx-auto text-center font-medium mb-8">
              {isRecording 
                ? 'Streaming real-time audio to Deepgram for instantaneous transcription.' 
                : 'Enter a title and start recording to stream live audio to the analysis engine.'}
            </p>

            {isRecording && (
              <div className="w-full max-w-lg bg-slate-900 rounded-xl p-6 mb-8 shadow-2xl border border-slate-800 h-48 flex flex-col">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                  <span className="text-[9px] font-bold text-accent-teal uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-accent-teal"></div>
                    Direct Feed
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Live Transcribe</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                  {liveSegments.length === 0 && (
                    <p className="text-slate-600 italic text-[11px] font-mono">Waiting for audio segments...</p>
                  )}
                  {liveSegments.map((seg, i) => (
                    <div key={i} className="flex gap-3 animate-fadeIn">
                      <span className="text-[8px] font-bold text-slate-500 font-mono pt-1">[{seg.time}]</span>
                      <p className="text-slate-100 text-[12px] font-medium leading-relaxed">{seg.phrase}</p>
                    </div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              </div>
            )}

            {!isRecording ? (
              <div className="w-full max-w-sm">
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter meeting title..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-[13px] font-bold focus:outline-none mb-4"
                />
                <button 
                  onClick={startLiveRecording}
                  className="w-full bg-accent-teal text-white py-3.5 rounded font-bold flex items-center justify-center gap-2 hover:bg-accent-pine transition-all shadow-md uppercase tracking-widest text-[13px]"
                >
                  <Mic size={16} />
                  Start Live Stream
                </button>
              </div>
            ) : (
              <button 
                onClick={stopLiveRecording}
                className="w-full max-w-sm bg-rose-500 text-white py-3.5 rounded font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-md uppercase tracking-widest text-[13px]"
              >
                <Square size={16} />
                Finish & Extract
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Meeting Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Frontend Q2 Strategy Sync"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-[13px] font-bold focus:outline-none focus:border-accent-teal/40 focus:ring-4 focus:ring-accent-teal/5 transition-all text-primary"
                />
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                  {activeTab === 'upload' ? 'Audio File' : 'Source Document'}
                </label>
                {activeTab === 'upload' ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-slate-300 rounded p-10 text-center hover:border-accent-teal/40 transition-colors cursor-pointer group bg-slate-50 relative"
                  >
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="audio/*,.mp3,.wav,.m4a,.webm,.mp4,.ogg,.mpeg,.mpga,.aac,.flac,.opus" />
                    <Upload className="mx-auto w-8 h-8 text-slate-300 group-hover:text-accent-teal mb-4 transition-colors" />
                    <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest">
                      {file ? file.name : 'Drag and drop audio file'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">WAV, MP3, M4A, MPEG (Max 500MB)</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                     <div 
                        onClick={() => docInputRef.current?.click()}
                        className="border border-dashed border-slate-200 rounded p-6 text-center hover:border-accent-teal/40 transition-colors cursor-pointer group bg-slate-50 relative"
                      >
                        <input type="file" ref={docInputRef} className="hidden" onChange={handleDocChange} accept=".pdf,.docx,.txt" />
                        <FileAudio className="mx-auto w-6 h-6 text-slate-300 group-hover:text-accent-teal mb-2 transition-colors" />
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {docFile ? docFile.name : 'Attach PDF, Word, or Text'}
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                        <div className="relative flex justify-center text-[9px] uppercase font-bold text-slate-400"><span className="bg-white px-2">Or Paste Text</span></div>
                      </div>
                      <textarea 
                        rows={5}
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder="Paste meeting text here..."
                        className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-[13px] font-bold focus:outline-none focus:border-accent-teal/40 focus:ring-4 focus:ring-accent-teal/5 transition-all text-primary"
                      />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-slate-500 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                 <Info size={16} className="text-amber-500 shrink-0" />
                 <p className="text-[12px] leading-relaxed">AI extraction begins immediately after upload. Documents are indexed and summarized for strategic alignment.</p>
              </div>
            </div>

            <div className="flex flex-col justify-center border-l border-slate-100 pl-10">
               <h3 className="font-serif text-xl font-bold text-primary mb-4">Processing Pipeline</h3>
               <div className="space-y-4 mb-10">
                 {[
                   { label: 'Auto Tasks Extraction', icon: <Zap size={14} />, checked: true },
                   { label: 'Decision Log Sync', icon: <CheckCircle2 size={14} />, checked: true },
                   { label: 'Strategic Summation', icon: <Users size={14} />, checked: true },
                 ].map((feat, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded border border-slate-200 bg-white shadow-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{feat.icon}</span>
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">PRO: {feat.label}</span>
                      </div>
                      <div className="w-5 h-5 rounded bg-accent-teal text-white shadow-sm flex items-center justify-center">
                        <CheckCircle2 size={12} />
                      </div>
                   </div>
                 ))}
               </div>

               <button 
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full bg-accent-teal text-white py-3 rounded font-bold flex items-center justify-center gap-2 hover:bg-accent-pine transition-all shadow-md uppercase tracking-widest text-[13px] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isProcessing ? 'Connecting to Network...' : 'Authenticate & Process'}
                 <ChevronRight size={16} />
               </button>
            </div>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="glass-panel max-w-sm w-full p-10 bg-white text-center shadow-premium border-accent-teal/20">
              <div className="w-16 h-16 bg-teal-50 rounded flex items-center justify-center mx-auto mb-8 border border-teal-100">
                 <div className="w-10 h-10 border-2 border-accent-teal border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 tracking-tight uppercase">Ingesting Data</h3>
              <p className="text-[11px] font-bold text-accent-teal uppercase tracking-widest animate-pulse">{processingStatus}</p>
              <div className="mt-8 pt-6 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                VERBEX BACKEND V1.2.0
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default NewMeeting;
