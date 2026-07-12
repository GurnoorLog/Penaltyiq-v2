import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Camera, 
  Upload, 
  AlertTriangle, 
  Trash2, 
  PlayCircle, 
  Check, 
  User, 
  Calendar, 
  Clock, 
  Activity, 
  Award, 
  RefreshCw,
  Eye
} from 'lucide-react';

interface CaptureTabProps {
  isCapturing: boolean;
  startCamera: () => void;
  stopCamera: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  galleryVideos: any[];
  setGalleryVideos: React.Dispatch<React.SetStateAction<any[]>>;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  setUploadedVideo: (url: string | null) => void;
  setSelectedPreset: (preset: any) => void;
  setActiveSidebarTab: (tab: 'analysis' | 'capture' | 'metrics' | 'history' | 'coach' | 'settings') => void;
  setIsPlaying: (playing: boolean) => void;
  setFrame: (frame: number) => void;
  setContactFrozen: (frozen: boolean) => void;
  triggerConfettiCelebration: () => void;
  addVideoToGallery: (file: File) => void;
  user: any;
}

export const CaptureTab: React.FC<CaptureTabProps> = ({
  isCapturing,
  startCamera,
  stopCamera,
  videoRef,
  galleryVideos = [],
  setGalleryVideos,
  isRecording,
  startRecording,
  stopRecording,
  setUploadedVideo,
  setSelectedPreset,
  setActiveSidebarTab,
  setIsPlaying,
  setFrame,
  setContactFrozen,
  triggerConfettiCelebration,
  addVideoToGallery,
  user
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPlayerName, setTempPlayerName] = useState<string>('');
  const [tempVideoName, setTempVideoName] = useState<string>('');
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Recording duration timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleUpdateMeta = (videoId: string) => {
    const updated = galleryVideos.map(v => {
      if (v.id === videoId) {
        return { 
          ...v, 
          player: tempPlayerName.trim() || v.player, 
          name: tempVideoName.trim() || v.name 
        };
      }
      return v;
    });
    setGalleryVideos(updated);
    localStorage.setItem(`penaltyiq_gallery_${user.id}`, JSON.stringify(updated.map(v => ({
      ...v,
      url: v.url.startsWith('blob:') ? '' : v.url
    }))));
    setEditingId(null);
  };

  const startEditing = (vid: any) => {
    setEditingId(vid.id);
    setTempPlayerName(vid.player || 'Self');
    setTempVideoName(vid.name || '');
  };

  const handleDeleteVideo = (videoId: string) => {
    const updated = galleryVideos.filter(v => v.id !== videoId);
    setGalleryVideos(updated);
    localStorage.setItem(`penaltyiq_gallery_${user.id}`, JSON.stringify(updated.map(v => ({
      ...v,
      url: v.url.startsWith('blob:') ? '' : v.url
    }))));
  };

  const handleTriggerEvaluation = (vid: any) => {
    setUploadedVideo(vid.url);
    setSelectedPreset(null);
    setFrame(0);
    setContactFrozen(false);
    setIsPlaying(true);
    setActiveSidebarTab('analysis');
    triggerConfettiCelebration();
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addVideoToGallery(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: WEBCAM CAPTURE & RECORDING UNIT */}
      <div className="bg-white border-2 border-black p-8 rounded-[32px] shadow-[4px_4px_0px_0px_#09090B] space-y-6 text-black">
        <div className="border-b border-black/10 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl heading flex items-center gap-2">
              <Camera className="w-7 h-7 text-[#D2E823]" />
              <span className="text-black uppercase">Live Recording Studio</span>
            </h2>
            <p className="text-xs font-bold text-neutral-500 uppercase mt-1">Record self-drills directly or import soccer files to the gallery</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                if (isCapturing) {
                  stopCamera();
                } else {
                  startCamera();
                }
              }}
              className={`flex-1 md:flex-initial border-2 border-black py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#09090B] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-colors ${isCapturing ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#D2E823] hover:bg-black hover:text-[#D2E823]'}`}
            >
              <Camera className="w-4 h-4" />
              <span>{isCapturing ? "Shut Down Camera" : "Boot Webcam Feed"}</span>
            </button>

            <label className="flex-1 md:flex-initial bg-white hover:bg-[#F8F4E8] border-2 border-black py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#09090B] active:translate-x-[1px] active:translate-y-[1px]">
              <Upload className="w-4 h-4" />
              <span>IMPORT KICK FILE</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleLocalFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left instructions or Active Recording Panel */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-[#F8F4E8] border-2 border-black p-6 rounded-2xl">
            <div className="space-y-4">
              <span className="bg-black text-[#D2E823] text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">Slow-Mo Captured Mechanics</span>
              <h3 className="heading text-lg">Self-Recording Protocol</h3>
              <ul className="text-xs font-bold text-neutral-700 uppercase space-y-3 font-mono">
                <li className="flex items-start gap-2">
                  <span className="text-[#D2E823] bg-black rounded-full w-4 h-4 flex items-center justify-center text-[9px] shrink-0 mt-0.5">1</span>
                  <span>Set device 3 meters away at ankle level</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D2E823] bg-black rounded-full w-4 h-4 flex items-center justify-center text-[9px] shrink-0 mt-0.5">2</span>
                  <span>Perform run-up approaching at 45°</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D2E823] bg-black rounded-full w-4 h-4 flex items-center justify-center text-[9px] shrink-0 mt-0.5">3</span>
                  <span>Hold follow-through for 2 seconds</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-black/10">
              {isCapturing ? (
                <div className="space-y-3">
                  {isRecording ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs font-bold text-red-500 uppercase animate-pulse">
                        <span>● Live Recording Active</span>
                        <span>{formatTimer(recordingSeconds)}</span>
                      </div>
                      <button
                        onClick={stopRecording}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                      >
                        🛑 STOP & EXPORT TO VAULT
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="w-full bg-[#D2E823] hover:bg-black hover:text-[#D2E823] text-black font-bold py-3 px-4 rounded-xl text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                      <span>START RECORDING RUN</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center p-3 border border-dashed border-black/25 rounded-xl bg-black/5">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase leading-relaxed">Webcam must be booted to record or trigger slow-motion session captures</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Live Camera View Box */}
          <div className="lg:col-span-8 bg-[#09090B] border-2 border-black rounded-2xl overflow-hidden aspect-video relative flex flex-col justify-between p-6 text-white shadow-inner">
            <div className="absolute inset-0 z-0">
              {isCapturing ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full bg-neutral-900/60 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                  <Camera className="w-16 h-16 mb-4 text-neutral-600 animate-pulse" />
                  <span className="font-display text-lg uppercase text-zinc-400">LENS FEED IS DEACTIVATED</span>
                  <span className="text-[10px] uppercase font-mono max-w-xs mt-2 text-zinc-500 leading-relaxed">Turn on webcam feed using the buttons above to capture live biomechanics</span>
                </div>
              )}
            </div>

            <div className="relative z-10 flex justify-between items-start pointer-events-none">
              <span className="bg-[#D2E823] text-black text-[9px] px-2.5 py-1 rounded-lg font-mono font-bold uppercase shadow">LENS MODE: WEBCAM</span>
              {isRecording && (
                <span className="bg-red-500 text-white text-[9px] px-2.5 py-1 rounded-lg font-mono font-bold animate-pulse uppercase flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-white rounded-full" />
                  REC {formatTimer(recordingSeconds)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: BIOMETRIC VIDEO GALLERY */}
      <div className="bg-white border-2 border-black p-8 rounded-[32px] shadow-[4px_4px_0px_0px_#09090B] space-y-6 text-black">
        <div className="border-b border-black/10 pb-4">
          <h2 className="text-2xl heading flex items-center gap-2">
            <Video className="w-7 h-7 text-[#D2E823]" />
            <span className="text-black uppercase">PenaltyIQ Gallery Vault</span>
          </h2>
          <p className="text-xs font-bold text-neutral-500 uppercase mt-1">Manage videos, customize players being evaluated, and run 3D skeletons</p>
        </div>

        {galleryVideos.length === 0 ? (
          <div className="border-2 border-dashed border-black p-12 text-center rounded-2xl bg-[#F8F4E8]">
            <Video className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
            <h4 className="font-display text-md">Vault Is Empty</h4>
            <p className="text-xs font-mono text-neutral-500 uppercase max-w-sm mx-auto mt-2">Upload an external slow-mo file or record himself to create video items in the gallery vault!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryVideos.map((vid) => {
              const isEditing = editingId === vid.id;
              const hasBiometrics = vid.scores !== undefined;
              return (
                <div 
                  key={vid.id}
                  className="bg-white border-2 border-black rounded-[24px] overflow-hidden shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] transition-all flex flex-col justify-between"
                >
                  {/* Thumbnail Placeholder with play button */}
                  <div className="relative aspect-video bg-[#09090B] border-b-2 border-black flex items-center justify-center group overflow-hidden">
                    <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center opacity-70">
                      <Video className="w-12 h-12 text-neutral-500 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    {vid.url && !vid.url.startsWith('blob:') && (
                      <video src={vid.url} className="absolute inset-0 w-full h-full object-cover opacity-60" muted playsInline />
                    )}
                    
                    <button 
                      onClick={() => handleTriggerEvaluation(vid)}
                      className="relative z-10 p-2.5 bg-[#D2E823] hover:bg-black border-2 border-black rounded-full shadow cursor-pointer group-hover:scale-110 transition-transform"
                    >
                      <Eye className="w-5 h-5 text-black group-hover:text-[#D2E823]" />
                    </button>

                    <div className="absolute bottom-2 left-2 z-10 flex gap-1">
                      <span className="bg-black text-white text-[8px] font-bold font-mono px-2 py-0.5 rounded uppercase">
                        {vid.duration || '0:10'}
                      </span>
                      {vid.isRecording && (
                        <span className="bg-red-500 text-white text-[8px] font-bold font-mono px-2 py-0.5 rounded uppercase">
                          RECORDED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    {isEditing ? (
                      <div className="space-y-3 bg-[#F8F4E8] p-3 rounded-xl border border-black/10">
                        <div>
                          <label className="text-[9px] font-bold text-neutral-500 uppercase font-mono">Video Title</label>
                          <input
                            type="text"
                            value={tempVideoName}
                            onChange={(e) => setTempVideoName(e.target.value)}
                            className="w-full border-2 border-black p-1.5 text-xs font-bold uppercase rounded-lg bg-white mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-neutral-500 uppercase font-mono">Evaluating Player</label>
                          <input
                            type="text"
                            value={tempPlayerName}
                            onChange={(e) => setTempPlayerName(e.target.value)}
                            className="w-full border-2 border-black p-1.5 text-xs font-bold uppercase rounded-lg bg-white mt-1"
                          />
                        </div>
                        <button
                          onClick={() => handleUpdateMeta(vid.id)}
                          className="w-full bg-[#D2E823] hover:bg-black hover:text-[#D2E823] text-black border-2 border-black py-1.5 rounded-lg text-[10px] font-bold uppercase"
                        >
                          Save Changes
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-display text-sm text-black line-clamp-1 uppercase leading-snug">{vid.name}</h4>
                          <button
                            onClick={() => startEditing(vid)}
                            className="text-[10px] font-bold text-neutral-500 hover:text-black uppercase underline shrink-0 cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase text-neutral-600 font-mono">
                          <div className="flex items-center gap-1.5 bg-neutral-100 p-1.5 rounded-lg border border-black/5">
                            <User className="w-3.5 h-3.5 opacity-60 text-black shrink-0" />
                            <span className="truncate">{vid.player || 'Self'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-neutral-100 p-1.5 rounded-lg border border-black/5">
                            <Calendar className="w-3.5 h-3.5 opacity-60 text-black shrink-0" />
                            <span className="truncate">{vid.date.split(' at ')[0]}</span>
                          </div>
                        </div>

                        {/* If has static score pre-saved, show badge */}
                        {hasBiometrics && (
                          <div className="flex items-center justify-between bg-[#D2E823]/10 border border-[#D2E823] p-2 rounded-xl mt-2 text-[10px] font-mono">
                            <span className="font-bold flex items-center gap-1 text-black">
                              <Award className="w-3.5 h-3.5 text-black" /> SCORE OVERALL:
                            </span>
                            <span className="font-black bg-black text-[#D2E823] px-1.5 py-0.5 rounded">{vid.overallScore}/100</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Footer */}
                    <div className="flex gap-2 pt-2 border-t border-black/5 mt-auto">
                      <button
                        onClick={() => handleTriggerEvaluation(vid)}
                        className="flex-1 bg-[#D2E823] hover:bg-black hover:text-[#D2E823] border-2 border-black py-2.5 px-3 rounded-xl font-bold text-[10px] uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Activity className="w-3.5 h-3.5 shrink-0" />
                        <span>AI EVALUATION</span>
                      </button>

                      <button
                        onClick={() => handleDeleteVideo(vid.id)}
                        className="bg-white hover:bg-red-500 hover:text-white border-2 border-black p-2.5 rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]"
                        title="Delete video run"
                      >
                        <Trash2 className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BIOMETRIC CONSENT BANNER */}
      <div className="bg-[#D2E823]/20 border-2 border-[#D2E823] p-4 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-black shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-xs uppercase block text-black">Biometric Consent Statement</span>
          <p className="text-[11px] font-medium leading-relaxed uppercase opacity-80 mt-0.5 text-neutral-800">
            Your video recordings and imported penalty drills are processed completely locally in secure client-side WebGL sandboxes. No facial scans or spatial structures are saved on external servers without coaches' express credential approvals.
          </p>
        </div>
      </div>
    </div>
  );
};
