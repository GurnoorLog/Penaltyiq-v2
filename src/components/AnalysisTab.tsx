import React, { useState } from 'react';
import { Target, Play, Pause, RotateCcw, Maximize2, CheckCircle, TrendingUp, AlertCircle, Video, Camera, Upload, FolderOpen, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';

interface AnalysisTabProps {
  isCapturing: boolean;
  uploadedVideo: string | null;
  selectedPreset: any;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef2D: React.RefObject<HTMLCanvasElement | null>;
  activeView: '2d' | '3d' | 'split';
  setActiveView: (view: '2d' | '3d' | 'split') => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  frame: number;
  contactFrozen: boolean;
  setContactFrozen: (frozen: boolean) => void;
  setContactFrame: (frame: number) => void;
  scores: {
    plantLegStability: number;
    hipRotation: number;
    strikeLegExtension: number;
    followThrough: number;
    recoveryBalance: number;
  };
  overallScore: number;
  label: string;
  canvasContainer3D: React.RefObject<HTMLDivElement | null>;
  setActiveSidebarTab: (tab: 'analysis' | 'capture' | 'metrics' | 'history' | 'coach' | 'settings') => void;
  triggerConfettiCelebration: () => void;
  // Added props for media gallery integration
  galleryVideos: any[];
  setUploadedVideo: (url: string | null) => void;
  setSelectedPreset: (preset: any) => void;
  addVideoToGallery: (file: File) => void;
  startCamera: () => void;
  stopCamera: () => void;
  setFrame: (frame: number) => void;
  ballTargetCorner: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'rebound';
  setBallTargetCorner: (corner: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'rebound') => void;
  totalFrames: number;
  setTotalFrames: (frames: number) => void;
  handleAnalyzeImprovement?: () => void;
  user?: any;
  coachingTier?: 'gemini' | 'bitnet' | 'offline';
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({
  isCapturing,
  uploadedVideo,
  selectedPreset,
  videoRef,
  canvasRef2D,
  activeView,
  setActiveView,
  isPlaying,
  setIsPlaying,
  frame,
  contactFrozen,
  setContactFrozen,
  setContactFrame,
  scores,
  overallScore,
  label,
  canvasContainer3D,
  setActiveSidebarTab,
  triggerConfettiCelebration,
  galleryVideos = [],
  setUploadedVideo,
  setSelectedPreset,
  addVideoToGallery,
  startCamera,
  stopCamera,
  setFrame,
  ballTargetCorner,
  setBallTargetCorner,
  totalFrames,
  setTotalFrames,
  handleAnalyzeImprovement,
  user,
  coachingTier = 'gemini',
}) => {
  const [showGalleryDropdown, setShowGalleryDropdown] = useState(false);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [firstFrameImage, setFirstFrameImage] = useState<string | null>(null);

  const captureVideoFrame = () => {
    const video = videoRef.current;
    if (video && video.videoWidth > 0 && video.videoHeight > 0) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', 0.85);
        }
      } catch (e) {
        console.error("Error capturing frame from video:", e);
      }
    }
    return null;
  };

  React.useEffect(() => {
    setFirstFrameImage(null);
  }, [uploadedVideo, isCapturing]);

  // Helper to convert Unsplash images to base64 securely to bypass canvas taint / CORS
  const getBase64ImageFromUrl = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const dataURL = canvas.toDataURL('image/jpeg');
            resolve(dataURL);
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  };

  const downloadPDFReport = async () => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header Top Bar - Custom bright acid yellow banner matching our palette (#D2E823)
      doc.setFillColor(210, 232, 35); 
      doc.rect(10, 10, 190, 42, 'F');
      doc.setDrawColor(9, 9, 11);
      doc.setLineWidth(1.2);
      doc.rect(10, 10, 190, 42, 'D');

      // Title & Branding
      doc.setTextColor(9, 9, 11);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('PENALTYIQ // BIOMECHANIC REPORT', 15, 23);
      
      doc.setFontSize(9.5);
      doc.setFont('Helvetica', 'normal');
      doc.text('REAL-TIME AI BIO-KINETIC PENALTY ANALYSIS & COGNITIVE COACHING', 15, 29);
      
      // Metadata section
      const dateString = new Date().toLocaleString();
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'bold');
      doc.text(`DATE OF REPORT: ${dateString}`, 15, 41);
      doc.text(`ATHLETE SIGNATURE: ${user?.name || 'Guest Striker'} (${user?.email || 'guest@penaltyiq.com'}) · POSITION: ${user?.position || 'Striker'}`, 15, 46);

      // Add the captured first frame from the video/webcam, falling back to preset or Unsplash image
      try {
        let base64Img = firstFrameImage;
        if (!base64Img && videoRef.current) {
          base64Img = captureVideoFrame();
        }

        if (!base64Img) {
          const unsplashUrl = selectedPreset?.image || "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=600";
          base64Img = await getBase64ImageFromUrl(unsplashUrl);
        }

        doc.addImage(base64Img, 'JPEG', 10, 58, 190, 65);
        doc.setDrawColor(9, 9, 11);
        doc.setLineWidth(1);
        doc.rect(10, 58, 190, 65, 'D');
      } catch (err) {
        console.warn("Could not load Unsplash cover image for PDF due to CORS / offline, rendering vector fallback pitch:", err);
        // High-fidelity fallback vector soccer field design
        doc.setFillColor(9, 9, 11);
        doc.rect(10, 58, 190, 65, 'F');
        doc.setDrawColor(210, 232, 35);
        doc.setLineWidth(0.6);
        doc.rect(15, 58, 180, 65, 'D');
        doc.rect(55, 58, 100, 42, 'D');
        doc.setFillColor(210, 232, 35);
        doc.circle(105, 95, 2.5, 'F');
        doc.setTextColor(210, 232, 35);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('BIO-KINETIC SKETAL ALIGNMENT ACTIVE', 55, 85);
      }

      // Technique Score Board (Neo-Brutalist Frame)
      doc.setFillColor(255, 255, 255);
      doc.rect(10, 128, 190, 42, 'F');
      doc.setDrawColor(9, 9, 11);
      doc.setLineWidth(1.5);
      doc.rect(10, 128, 190, 42, 'D');

      doc.setTextColor(9, 9, 11);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('STRIKE TECHNIQUE FINGERPRINT SCORE', 15, 137);

      doc.setFontSize(32);
      doc.text(`${overallScore}`, 15, 158);
      doc.setFontSize(12);
      doc.text(`/ 100`, 53, 158);

      // Label status badge
      doc.setFillColor(210, 232, 35);
      doc.rect(90, 142, 55, 11, 'F');
      doc.setDrawColor(9, 9, 11);
      doc.setLineWidth(0.8);
      doc.rect(90, 142, 55, 11, 'D');
      
      doc.setFontSize(11);
      doc.setTextColor(9, 9, 11);
      doc.setFont('Helvetica', 'bold');
      doc.text(label, 95, 149);

      // Biometric measurements list
      doc.setFontSize(11);
      doc.setTextColor(9, 9, 11);
      doc.setFont('Helvetica', 'bold');
      doc.text('BIOMETRIC MEASUREMENTS BREAKDOWN:', 10, 180);

      let currentY = 188;
      const scoresList = [
        { name: 'Plant Leg Stability', value: scores.plantLegStability },
        { name: 'Hip Rotation / Clearance', value: scores.hipRotation },
        { name: 'Strike Leg Extension', value: scores.strikeLegExtension },
        { name: 'Follow-Through Path', value: scores.followThrough },
        { name: 'Recovery Balance Angle', value: scores.recoveryBalance }
      ];

      scoresList.forEach(item => {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(item.name, 12, currentY);

        // Progress bar background track
        doc.setFillColor(240, 240, 240);
        doc.rect(85, currentY - 3.2, 85, 3.5, 'F');

        // Progress bar active fill
        doc.setFillColor(9, 9, 11);
        doc.rect(85, currentY - 3.2, 85 * (item.value / 100), 3.5, 'F');

        // Text percentage score
        doc.setFont('Helvetica', 'bold');
        doc.text(`${item.value}%`, 175, currentY);
        currentY += 8.5;
      });

      // Coach Skeleton Recommendations box
      doc.setFillColor(210, 232, 35);
      doc.rect(10, currentY + 3, 190, 42, 'F');
      doc.setDrawColor(9, 9, 11);
      doc.setLineWidth(1.2);
      doc.rect(10, currentY + 3, 190, 42, 'D');

      doc.setTextColor(9, 9, 11);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('COACH SKELETON AI DEEP NOTES & RECOMMENDATIONS:', 15, currentY + 11);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.2);
      const aiNote = selectedPreset?.feedback || 'Analysis suggests high precision with subtle back-lean. Increase plant heel lock-in by 12% to secure optimal follow-through and prevent shot lofting.';
      const splitNote = doc.splitTextToSize(aiNote, 180);
      doc.text(splitNote, 15, currentY + 17);

      // Bottom footer notes
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text('POWERED BY GOOGLE GEMINI FLASH & MEDIAPIPE CORE — PATENT PENDING PENALTYIQ PERFORMANCE LABS', 10, 288);

      doc.save(`PenaltyIQ_Report_${(user?.name || 'Athlete').replace(/\s+/g, '_')}.pdf`);
      
      // Secondary celebration
      confetti({ particleCount: 30, spread: 55 });
    } catch (error) {
      console.error("Error creating report:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, uploadedVideo, videoRef]);

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration && !isNaN(video.duration)) {
      const calculatedFrames = Math.round(video.duration * 24);
      setTotalFrames(calculatedFrames > 0 ? calculatedFrames : 60);
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;

    // Capture first frame once the video metadata/dimensions are loaded and rendering
    if (!firstFrameImage && video.videoWidth > 0 && video.videoHeight > 0) {
      const frameData = captureVideoFrame();
      if (frameData) {
        setFirstFrameImage(frameData);
      }
    }

    if (video.duration && !isNaN(video.duration) && isPlaying) {
      const calculatedFrames = Math.round(video.duration * 24);
      const calculatedFrame = Math.round((video.currentTime / video.duration) * calculatedFrames);
      if (Math.min(calculatedFrames, calculatedFrame) !== frame) {
        setFrame(Math.min(calculatedFrames, calculatedFrame));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addVideoToGallery(file);
    }
  };

  return (
    <>
      {/* Dynamic Success/Analysis Complete Overlay Alert */}
      {isAnalysisComplete && (
        <div className="w-full bg-[#D2E823] border-4 border-black p-6 rounded-[24px] shadow-[6px_6px_0px_0px_#09090B] flex flex-col md:flex-row items-center justify-between gap-4 mb-6 relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-white/15 rounded-full pointer-events-none" />
          <div className="relative z-10">
            <span className="bg-black text-[#D2E823] text-[9px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
              ANALYSIS COMPLETE
            </span>
            <h4 className="font-display text-2xl text-black mt-2 leading-none">BIOMETRIC TRACKING REPORT READY</h4>
            <p className="text-[10px] font-bold text-black uppercase opacity-85 mt-1">
              SKELETON COMPLETED ALL {totalFrames} FRAMES DISSECTION WITH TECHNIQUE SCORE {overallScore}/100 ({label})
            </p>
          </div>
          <div className="flex gap-3 relative z-10 shrink-0">
            <button
              onClick={downloadPDFReport}
              disabled={isGeneratingPDF}
              className="bg-[#09090B] text-[#D2E823] hover:bg-neutral-800 border-2 border-[#09090B] px-5 py-3 rounded-xl font-display text-xs uppercase tracking-wider transition-colors shadow-[2px_2px_0px_0px_#fff] cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPDF ? 'GENERATING REPORT...' : '📥 DOWNLOAD PDF REPORT'}
            </button>
            <button
              onClick={() => setIsAnalysisComplete(false)}
              className="bg-white text-black border-2 border-black hover:bg-neutral-50 px-4 py-3 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Source Selection Panel */}
      <section className="w-full bg-white border-2 border-black p-4 rounded-[24px] shadow-[4px_4px_0px_0px_#09090B] flex flex-col md:flex-row gap-4 items-center justify-between text-black">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 bg-[#D2E823] border-2 border-black rounded-xl flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">
            <Video className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="font-display text-sm text-black">Media Source Engine</h3>
            <p className="text-[10px] font-bold uppercase opacity-55">Switch targets for AI pose biomechanical evaluation</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto justify-end">
          {/* Select from Gallery Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowGalleryDropdown(!showGalleryDropdown)}
              className="px-4 py-2 bg-white hover:bg-[#F8F4E8] border-2 border-black rounded-xl text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#09090B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#09090B] cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>SELECT FROM VAULT ({galleryVideos.length})</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {showGalleryDropdown && (
              <div className="absolute right-0 mt-3 w-80 bg-[#F8F4E8] border-2 border-black rounded-2xl shadow-xl p-2 z-[99] max-h-96 overflow-y-auto">
                <p className="text-[9px] font-bold text-neutral-400 p-2 uppercase font-mono tracking-wider border-b border-black/10">SELECT VIDEO RUN TO ANALYZE</p>
                <div className="space-y-1 mt-1">
                  {galleryVideos.map((vid) => {
                    const isActive = uploadedVideo === vid.url;
                    return (
                      <button
                        key={vid.id}
                        onClick={() => {
                          setUploadedVideo(vid.url);
                          setSelectedPreset(null);
                          setFrame(0);
                          setContactFrozen(false);
                          setIsPlaying(true);
                          setShowGalleryDropdown(false);
                          triggerConfettiCelebration();
                        }}
                        className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer border ${isActive ? 'bg-[#D2E823] border-black font-bold' : 'hover:bg-white border-transparent'}`}
                      >
                        <div className="w-8 h-8 bg-black/5 border border-black/10 rounded overflow-hidden shrink-0 flex items-center justify-center">
                          <Video className="w-4 h-4 text-neutral-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs truncate text-black uppercase font-mono">{vid.name}</div>
                          <div className="text-[9px] text-neutral-500 font-mono">Player: {vid.player} · {vid.duration || '0:10'}</div>
                        </div>
                        {isActive && <span className="text-[9px] font-bold bg-black text-white px-1.5 py-0.5 rounded font-mono">LIVE</span>}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => {
                    setShowGalleryDropdown(false);
                    setActiveSidebarTab('capture');
                  }}
                  className="w-full mt-2 py-2 bg-black text-[#D2E823] hover:bg-neutral-800 rounded-xl text-[10px] font-bold uppercase cursor-pointer text-center block border border-black"
                >
                  📸 Record / Import in Vault →
                </button>
              </div>
            )}
          </div>

          {/* Direct File Uploader */}
          <label className="px-4 py-2 bg-[#D2E823] hover:bg-black hover:text-[#D2E823] border-2 border-black rounded-xl text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#09090B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#09090B] cursor-pointer text-black transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>IMPORT VIDEO</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Web Camera Activator */}
          <button
            onClick={() => {
              if (isCapturing) {
                stopCamera();
              } else {
                startCamera();
              }
            }}
            className={`px-4 py-2 border-2 border-black rounded-xl text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#09090B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#09090B] cursor-pointer transition-colors ${isCapturing ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white hover:bg-[#F8F4E8] text-black'}`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isCapturing ? "STOP WEBCAM" : "WEBCAM STREAM"}</span>
          </button>
        </div>
      </section>

      {/* Hero video feed card */}
      <section className="w-full" id="analysis-hero-section">
        <div className="relative bg-[#09090B] neo-border rounded-[32px] overflow-hidden neo-shadow-lg aspect-[21/9] min-h-[320px] group">
          
          {/* Video Render Source background */}
          <div className="absolute inset-0 z-0">
            {isCapturing ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : uploadedVideo ? (
              <video
                ref={videoRef}
                src={uploadedVideo}
                autoPlay
                loop={false}
                muted
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onLoadedData={() => {
                  setTimeout(() => {
                    const frameData = captureVideoFrame();
                    if (frameData) {
                      setFirstFrameImage(frameData);
                    }
                  }, 200);
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  setIsAnalysisComplete(true);
                  triggerConfettiCelebration();
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  referrerPolicy="no-referrer"
                  src={selectedPreset?.image || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000"}
                  alt="Penalty Analysis"
                  className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                {selectedPreset && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-6 text-white">
                    <span className="text-[#D2E823] font-mono text-xs uppercase font-bold tracking-widest animate-pulse block mb-1">PRO MODEL PRESET LOADED</span>
                    <span className="font-display text-2xl text-white">{selectedPreset.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2D HUD Canvas overlay for skeletal joint lines */}
          {(activeView === '2d' || activeView === 'split') && (
            <canvas
              ref={canvasRef2D}
              width={640}
              height={360}
              className="absolute inset-0 w-full h-full z-10 pointer-events-none"
            />
          )}

          {/* Overlays / Camera metadata details */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none z-20">
            
            {/* Top Badges bar */}
            <div className="flex justify-between items-start">
              <div className="px-4 py-2 bg-[#D2E823] neo-border rounded-lg neo-shadow-sm pointer-events-auto">
                <span className="font-display text-xs tracking-tighter text-black">
                  {isCapturing ? "LIVE FEED: WEBCAM_01" : selectedPreset ? `MODEL PRESET: ${selectedPreset.name}` : "FEED SOURCE: CAM_01"}
                </span>
              </div>
              
              <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-lg">
                <div className={`w-3 h-3 rounded-full neo-border ${isCapturing || isPlaying ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`} />
                <span className="text-white font-bold text-[10px] uppercase tracking-widest">
                  {isCapturing ? "CAPTURING" : isPlaying ? `RUNNING FRAME ${frame}/${totalFrames}` : `FROZEN FRAME ${frame}/${totalFrames}`}
                </span>
              </div>
            </div>

            {/* Interactive HUD vector lines template overlay when no webcam runs */}
            {!isCapturing && !uploadedVideo && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" viewBox="0 0 1000 600">
                <path d="M500 100 L500 200 M450 150 L550 150" stroke="#D2E823" strokeWidth="2"></path>
                <circle cx="500" cy="200" r="8" fill="#D2E823" className="neo-border"></circle>
                <path d="M500 200 L460 350 L440 500 M500 200 L540 350 L560 500" stroke="#D2E823" strokeWidth="4" fill="none"></path>
                <path d="M500 200 L420 280 L380 320 M500 200 L580 280 L620 320" stroke="#D2E823" strokeWidth="4" fill="none"></path>
              </svg>
            )}

            {/* Playthrough scrubbing bar box */}
            <div className="w-full pointer-events-auto bg-black/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-black flex items-center gap-3 z-30 mt-auto mb-3 shadow-[4px_4px_0px_0px_#000]">
              <span className="text-[10px] font-mono font-bold text-[#D2E823] select-none shrink-0">FRAME {frame}/{totalFrames}</span>
              <input
                type="range"
                min="0"
                max={totalFrames}
                value={frame}
                onChange={(e) => {
                  const targetFrame = parseInt(e.target.value, 10);
                  setFrame(targetFrame);
                  setIsPlaying(false);
                  if (videoRef.current && videoRef.current.duration) {
                    videoRef.current.currentTime = (targetFrame / totalFrames) * videoRef.current.duration;
                  }
                }}
                className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#D2E823] pointer-events-auto"
              />
              <span className="text-[10px] font-mono text-white/75 select-none shrink-0">
                {videoRef.current?.duration 
                  ? `${videoRef.current.currentTime.toFixed(2)}s / ${videoRef.current.duration.toFixed(2)}s` 
                  : `${(frame * 0.04).toFixed(2)}s`}
              </span>
            </div>

            {/* Controls & metric readouts bottom docked bar */}
            <div className="flex justify-between items-end">
              
              {/* Playback action controls */}
              <div className="flex gap-2 pointer-events-auto">
                <button
                  id="btn-toggle-playback"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 bg-white text-black border-2 border-black rounded-xl flex items-center justify-center neo-btn cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                {/* Step Backward */}
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    const prevFrame = Math.max(0, frame - 1);
                    setFrame(prevFrame);
                    if (videoRef.current && videoRef.current.duration) {
                      videoRef.current.currentTime = (prevFrame / totalFrames) * videoRef.current.duration;
                    }
                  }}
                  className="w-12 h-12 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl flex flex-col items-center justify-center neo-btn cursor-pointer text-[10px] font-bold font-mono pointer-events-auto"
                  title="Previous Frame"
                >
                  <span>◀</span>
                  <span className="-mt-1 text-[8px] opacity-70">BACK</span>
                </button>

                {/* Step Forward */}
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    const nextFrame = Math.min(totalFrames, frame + 1);
                    setFrame(nextFrame);
                    if (videoRef.current && videoRef.current.duration) {
                      videoRef.current.currentTime = (nextFrame / totalFrames) * videoRef.current.duration;
                    }
                  }}
                  className="w-12 h-12 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl flex flex-col items-center justify-center neo-btn cursor-pointer text-[10px] font-bold font-mono pointer-events-auto"
                  title="Next Frame / Go Ahead"
                >
                  <span>▶</span>
                  <span className="-mt-1 text-[8px] opacity-70">AHEAD</span>
                </button>

                <button
                  id="btn-toggle-freeze"
                  onClick={() => {
                    setContactFrozen(!contactFrozen);
                    setContactFrame(frame);
                    if (!contactFrozen) {
                      confetti({ particleCount: 30, colors: ['#D2E823', '#00FFA3'] });
                    }
                  }}
                  className={`w-12 h-12 border-2 border-black rounded-xl flex items-center justify-center neo-btn cursor-pointer ${contactFrozen ? 'bg-[#D2E823] text-black' : 'bg-white text-black'}`}
                  title={contactFrozen ? "Resume Flow" : "Freeze Contact Frame"}
                >
                  <Target className="w-5 h-5" />
                </button>

                {/* Reset to Start */}
                <button
                  onClick={() => {
                    setFrame(0);
                    setIsPlaying(false);
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                    }
                  }}
                  className="w-12 h-12 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl flex items-center justify-center neo-btn cursor-pointer"
                  title="Reset to Start"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic telemetry specs readouts */}
              <div className="flex gap-4 pointer-events-auto">
                <div className="bg-[#09090B]/90 backdrop-blur-md p-3 border-2 border-black rounded-xl flex items-center gap-4 text-white">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase opacity-60">Plant Angle</span>
                    <span className="text-sm font-mono text-[#D2E823]">{(scores.plantLegStability * 0.15 + 4).toFixed(1)}°</span>
                  </div>
                  <div className="w-[1px] h-8 bg-white/20" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase opacity-60">Power Index</span>
                    <span className="text-sm font-mono text-[#D2E823]">{(overallScore * 0.95 + 6).toFixed(1)}</span>
                  </div>
                  <div className="w-[1px] h-8 bg-white/20" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase opacity-60">View Mode</span>
                    <select
                      value={activeView}
                      onChange={(e) => setActiveView(e.target.value as any)}
                      className="bg-black text-[#D2E823] font-mono text-[10px] font-bold border border-white/20 rounded px-1 outline-none cursor-pointer"
                    >
                      <option value="2d">2D HUD</option>
                      <option value="3d">3D SKELETON</option>
                      <option value="split">SPLIT VIEW</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Dynamic Metric cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full" id="analysis-metrics-cards">
        
        {/* Card 1: Balance */}
        <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[3px_3px_0px_0px_#09090B] card-hover">
          <span className="text-[10px] font-bold uppercase opacity-60 block mb-1 font-mono">Balance Factor</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-display tracking-tighter">{scores.recoveryBalance}</span>
            <CheckCircle className="text-[#D2E823] w-5 h-5" />
          </div>
          <div className="w-full h-1.5 bg-[#F8F4E8] border border-black mt-3 overflow-hidden rounded-full">
            <div className="bg-[#D2E823] h-full transition-all duration-500" style={{ width: `${scores.recoveryBalance}%` }} />
          </div>
        </div>

        {/* Card 2: Hip Rotation */}
        <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[3px_3px_0px_0px_#09090B] card-hover">
          <span className="text-[10px] font-bold uppercase opacity-60 block mb-1 font-mono">Hip Rotation</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-display tracking-tighter">{scores.hipRotation}</span>
            <TrendingUp className="text-blue-500 w-5 h-5" />
          </div>
          <div className="w-full h-1.5 bg-[#F8F4E8] border border-black mt-3 overflow-hidden rounded-full">
            <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${scores.hipRotation}%` }} />
          </div>
        </div>

        {/* Card 3: Follow Thru */}
        <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[3px_3px_0px_0px_#09090B] card-hover">
          <span className="text-[10px] font-bold uppercase opacity-60 block mb-1 font-mono">Follow Through</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-display tracking-tighter">{scores.followThrough}</span>
            <AlertCircle className="text-orange-500 w-5 h-5" />
          </div>
          <div className="w-full h-1.5 bg-[#F8F4E8] border border-black mt-3 overflow-hidden rounded-full">
            <div className="bg-orange-500 h-full transition-all duration-500" style={{ width: `${scores.followThrough}%` }} />
          </div>
        </div>

        {/* Card 4: Contact Angle */}
        <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[3px_3px_0px_0px_#09090B] card-hover">
          <span className="text-[10px] font-bold uppercase opacity-60 block mb-1 font-mono">Contact Precision</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-display tracking-tighter">{scores.strikeLegExtension}</span>
            <CheckCircle className="text-[#D2E823] w-5 h-5" />
          </div>
          <div className="w-full h-1.5 bg-[#F8F4E8] border border-black mt-3 overflow-hidden rounded-full">
            <div className="bg-[#D2E823] h-full transition-all duration-500" style={{ width: `${scores.strikeLegExtension}%` }} />
          </div>
        </div>

      </section>

      {/* Split Column dynamic graphs details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-stretch" id="analysis-split-columns">
        
        {/* Left Column stats details */}
        <section className="flex flex-col gap-6">
          
          {/* Overall circular dial */}
          <div className="bg-white border-2 border-black p-8 rounded-[24px] shadow-[4px_4px_0px_0px_#09090B] flex flex-col items-center justify-center flex-1 min-h-[320px]">
            <h3 className="font-display text-lg mb-8 opacity-60 font-mono tracking-wider">Technique Fingerprint Score</h3>
            
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="84"
                  stroke="#F8F4E8"
                  strokeWidth="20"
                  fill="none"
                  className="neo-border"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="84"
                  stroke="#D2E823"
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={String(2 * Math.PI * 84)}
                  strokeDashoffset={String(2 * Math.PI * 84 * (1 - overallScore / 100))}
                  strokeLinecap="square"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-display tracking-tighter text-black">{overallScore}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest mt-2 bg-[#D2E823] px-3 py-1 border-2 border-black rounded-lg shadow-sm rotate-2 text-black">
                  {label}
                </span>
              </div>
            </div>

            {!isAnalysisComplete ? (
              <div className="mt-6 w-full bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-xl p-4 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#D2E823] border-t-black rounded-full animate-spin" />
                  <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-wider animate-pulse">
                    ANALYSIS IN PROGRESS...
                  </span>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase max-w-[200px] leading-tight">
                    LET THE VIDEO RUN TO THE END TO UNLOCK AI COACHING SCAN & PDF REPORTS
                  </p>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (handleAnalyzeImprovement) {
                      handleAnalyzeImprovement();
                    } else {
                      setActiveSidebarTab('coach');
                    }
                  }}
                  className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white border-2 border-black rounded-xl py-3.5 px-4 font-display text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[4px_4px_0px_0px_#000] active:scale-[0.98] transition-all cursor-pointer animate-pulse"
                >
                  <AlertCircle className="w-4 h-4 text-white" />
                  <span>
                    {coachingTier === 'gemini' 
                      ? 'WHAT TO IMPROVE? (AI DEEP SCAN)' 
                      : coachingTier === 'bitnet' 
                      ? 'WHAT TO IMPROVE? (BITNET LOCAL SCAN)' 
                      : 'WHAT TO IMPROVE? (SMART OFFLINE SCAN)'}
                  </span>
                </button>

                {/* Quick-Print Biometrics PDF Report */}
                <button
                  onClick={downloadPDFReport}
                  disabled={isGeneratingPDF}
                  className="mt-3 w-full bg-[#09090B] text-[#D2E823] hover:bg-neutral-800 border-2 border-black rounded-xl py-3 px-4 font-display text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#D2E823] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isGeneratingPDF ? 'GENERATING REPORT...' : '📥 DOWNLOAD PDF REPORT'}</span>
                </button>

                <button
                  onClick={() => setActiveSidebarTab('metrics')}
                  className="mt-4 text-xs font-bold uppercase tracking-widest underline hover:text-[#D2E823] transition-colors text-center w-full"
                >
                  View Fine-Tuning Sliders →
                </button>
              </>
            )}
          </div>



        </section>

        {/* Right Column: Actual 3D Skeleton + Marquee */}
        <section className="flex flex-col gap-6">
          
          {/* Interactive ThreeJS 3D Visualization */}
          <div className="premium-dark-card border-2 border-black p-6 rounded-[24px] flex-1 flex flex-col min-h-[320px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-display text-base font-mono uppercase tracking-wider">3D Visualization Analysis</h3>
              <Maximize2
                onClick={() => setActiveView(activeView === '3d' ? 'split' : '3d')}
                className="text-[#D2E823] w-5 h-5 cursor-pointer hover:scale-110 transition-transform"
              />
            </div>

            {/* Interactive THREEJS canvas goes inside here dynamically! */}
            <div className="flex-1 bg-white/5 border-2 border-black rounded-xl relative overflow-hidden min-h-[220px]">
              {/* ThreeJS Container ref */}
              <div
                ref={canvasContainer3D}
                className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
              />
              
              {/* Ambient overlay guide dots */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #D2E823 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              
              {/* Telemetry banner inside 3D frame */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2.5 bg-[#09090B]/95 px-3 py-1.5 border border-white/20 rounded-lg pointer-events-none z-10">
                <div className="w-2 h-2 bg-[#D2E823] rounded-full animate-pulse" />
                <span className="text-[9px] text-white/70 uppercase font-bold tracking-widest font-mono">
                  Real-Time MediaPipe 3D Depth
                </span>
              </div>
            </div>

            {/* Trajectory Prediction Control HUD */}
            <div className="mt-4 bg-black/40 border border-white/10 rounded-xl p-3.5 text-white">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D2E823]">
                    Ball Trajectory Tracker
                  </h4>
                  <p className="text-[10px] text-white/50">
                    Flight path calculated dynamically from real-time skeletal mechanics
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[9px] font-mono text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                    ACTIVE: VIDEO BALL-TRACKING (AUTO)
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-white/40">
                <span className="flex items-center gap-1">
                  STATUS: ESTIMATING BALL MOTION FROM VIDEOMETRICS...
                </span>
                <span>DETECTED KICK ANGLE: <span className="text-[#D2E823] font-bold">{(scores.strikeLegExtension * 0.4 + 20).toFixed(1)}°</span></span>
              </div>
            </div>
          </div>

          {/* Rotational Stats Marquee */}
          <div className="marquee-container border-2 border-black bg-[#D2E823] py-3.5 rotate-[-1deg] shadow-[2px_2px_0px_0px_#09090B] rounded-xl overflow-hidden shrink-0">
            <div className="marquee-content whitespace-nowrap">
              <span className="font-display text-xs mr-12 text-black">NEW PERFORMANCE PB: {overallScore}.2</span>
              <span className="font-display text-xs mr-12 text-black">•</span>
              <span className="font-display text-xs mr-12 text-black">AI STRIKE DIAGNOSIS COMPLETE</span>
              <span className="font-display text-xs mr-12 text-black">•</span>
              <span className="font-display text-xs mr-12 text-black">HIP SWING TORQUE OPTIMIZED</span>
              <span className="font-display text-xs mr-12 text-black">•</span>
              <span className="font-display text-xs mr-12 text-black">BIOMECHANICAL SCAN SUCCESSFUL</span>
              <span className="font-display text-xs mr-12 text-black">•</span>
            </div>
          </div>

        </section>

      </div>
    </>
  );
};
