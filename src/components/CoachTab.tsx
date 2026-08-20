import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  Paperclip, 
  Mic, 
  Send, 
  ArrowUpRight, 
  Anchor, 
  Clock, 
  TrendingUp, 
  Check, 
  MessageCircle, 
  Activity, 
  Calendar, 
  ChevronRight, 
  GraduationCap,
  Award,
  HelpCircle,
  Video
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BiometricScores {
  plantLegStability: number;
  hipRotation: number;
  strikeLegExtension: number;
  followThrough: number;
  recoveryBalance: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

interface CoachTabProps {
  chatMessages: ChatMessage[];
  sendChatMessage: (question?: string) => void;
  isChatLoading: boolean;
  chatInput: string;
  setChatInput: (input: string) => void;
  micActive: boolean;
  setMicActive: (active: boolean) => void;
  user: { name: string; avatar?: string; position?: string; club?: string; goals?: string[]; country?: string; address?: string };
  scores: BiometricScores;
  overallScore: number;
  label: string;
  feedback: string;
  tips: string[];
  sessions?: any[];
  setActiveSidebarTab?: (tab: any) => void;
  coachSubTab?: 'insights' | 'chat';
  setCoachSubTab?: (tab: 'insights' | 'chat') => void;
}

export const CoachTab: React.FC<CoachTabProps> = ({
  chatMessages,
  sendChatMessage,
  isChatLoading,
  chatInput,
  setChatInput,
  micActive,
  setMicActive,
  user,
  scores: defaultScores,
  overallScore: defaultOverallScore,
  label: defaultLabel,
  feedback: defaultFeedback,
  tips: defaultTips,
  sessions,
  setActiveSidebarTab,
  coachSubTab,
  setCoachSubTab,
}) => {
  // Dual-mode state selector (using bridge or local fallback state)
  const [localSubTab, setLocalSubTab] = useState<'insights' | 'chat'>('insights');
  const subTab = coachSubTab !== undefined ? coachSubTab : localSubTab;
  const setSubTab = setCoachSubTab !== undefined ? setCoachSubTab : setLocalSubTab;
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [isConnectedToAcademy, setIsConnectedToAcademy] = useState<boolean>(false);

  // If there is any session, we use the latest session. Otherwise, we can fallback to props.
  const hasSessions = sessions && sessions.length > 0;
  const latestSession = hasSessions ? sessions[0] : null;

  // Resolve active display metrics
  const scores = latestSession ? latestSession.scores : defaultScores;
  const overallScore = latestSession ? latestSession.overallScore : defaultOverallScore;
  const label = latestSession ? latestSession.label : defaultLabel;
  const feedback = latestSession ? latestSession.feedback : defaultFeedback;
  const tips = latestSession ? latestSession.tips : defaultTips;
  const sessionDate = latestSession ? latestSession.date : 'Just Now';

  // Determine if this is a blank onboarding state with no data yet
  const isBlankState = !hasSessions && defaultFeedback.startsWith("Analyzing your posture...");

  // Dynamic calculations for priority badges in insights
  const minScoreMetric = Object.entries(scores).reduce((acc, curr) => {
    return curr[1] < acc[1] ? curr : acc;
  }, ['plantLegStability', 100] as [string, number]);

  const handleScheduleLiveSession = () => {
    setIsScheduled(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleConnectAcademy = () => {
    setIsConnectedToAcademy(true);
    confetti({
      particleCount: 40,
      spread: 50,
      colors: ['#3b82f6', '#D2E823', '#00FFA3']
    });
  };

  // SVG Gauge Helper
  const renderGauge = (score: number, strokeColor: string) => {
    // Circumference for r=16 is approx 100.5
    const clampedScore = Math.max(0, Math.min(100, score));
    return (
      <div className="relative w-16 h-16 shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" className="stroke-zinc-800 stroke-[2.5] fill-none" />
          <circle 
            cx="18" 
            cy="18" 
            r="16" 
            className="fill-none"
            style={{
              stroke: strokeColor,
              strokeWidth: 2.5,
              strokeLinecap: 'round',
              strokeDasharray: '100',
              strokeDashoffset: 100 - clampedScore,
              transition: 'stroke-dashoffset 1s ease-out'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-mono text-white font-bold">{clampedScore}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="coach-view-container">
      
      {/* Sub-tab segmented control switcher */}
      <div className="flex gap-2 bg-[#F8F4E8] border-2 border-black p-1.5 rounded-xl shadow-[2px_2px_0px_0px_#09090B] max-w-md" id="coach-subtab-navigation">
        <button
          onClick={() => setSubTab('insights')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            subTab === 'insights'
              ? 'bg-[#D2E823] border-2 border-black shadow-[2px_2px_0px_0px_#09090B] text-black'
              : 'hover:bg-white/60 text-black/60'
          }`}
        >
          📊 AI Insights Dashboard
        </button>
        <button
          onClick={() => setSubTab('chat')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            subTab === 'chat'
              ? 'bg-[#D2E823] border-2 border-black shadow-[2px_2px_0px_0px_#09090B] text-black'
              : 'hover:bg-white/60 text-black/60'
          }`}
        >
          💬 Zan-Chat Assistant
        </button>
      </div>

      {subTab === 'insights' ? (
        isBlankState ? (
          <div className="bg-white border-4 border-black p-10 rounded-[32px] shadow-[8px_8px_0px_0px_#000] text-center max-w-2xl mx-auto my-12 relative overflow-hidden" id="coach-insights-empty-state">
            <div className="noise-overlay" />
            <div className="relative z-10 space-y-6">
              <div className="w-20 h-20 bg-[#D2E823] border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#000]">
                <Sparkles className="w-10 h-10 text-black stroke-[2.5]" />
              </div>
              
              <div className="space-y-2 text-black">
                <span className="bg-black text-[#D2E823] text-[10px] px-3 py-1 rounded-full font-mono font-bold uppercase tracking-widest">
                  Awaiting First Session
                </span>
                <h3 className="font-display text-3xl mt-4 tracking-tight uppercase">
                  Welcome to PenaltyIQ Coaching Lab!
                </h3>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                  Biomechanical intelligence core is online
                </p>
              </div>

              <p className="text-neutral-600 text-sm leading-relaxed max-w-md mx-auto normal-case font-sans">
                Hey <span className="font-bold text-black">{user.name || 'Athlete'}</span>, we don't have any biomechanical analysis data for your account yet. Let's record or upload a penalty kick video to generate your real-time 3D skeleton structures, joint angle streams, and custom coaching feedback!
              </p>

              {user.club && (
                <div className="bg-[#F8F4E8] border-2 border-black p-4 rounded-xl text-left max-w-md mx-auto flex items-start gap-4 text-black">
                  <div className="text-2xl pt-1">🧤</div>
                  <div className="space-y-1">
                    <h4 className="font-display text-xs uppercase tracking-wider text-black">Target Academy Focus Locked</h4>
                    <p className="text-[11px] text-neutral-600 font-sans normal-case">
                      Analyzing as a <span className="font-bold text-black">{user.position || 'Specialist'}</span> for <span className="font-bold text-black">{user.club || 'Academy'}</span>.
                    </p>
                    {user.country && (
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest pt-0.5">
                        📍 COUNTRY: {user.country}
                        {user.address && <span className="block text-[9px] text-neutral-400 font-sans normal-case truncate max-w-[260px]">{user.address}</span>}
                      </p>
                    )}
                    <p className="text-[11px] text-neutral-600 font-sans normal-case pt-1">
                      Your goals include: <span className="font-bold text-black">{user.goals?.join(', ') || 'Kinetic improvement'}</span>.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                {setActiveSidebarTab && (
                  <button
                    onClick={() => setActiveSidebarTab('capture')}
                    className="bg-[#D2E823] text-black border-2 border-black py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" /> Go to Capture Lab
                  </button>
                )}
                <button
                  onClick={() => setSubTab('chat')}
                  className="bg-white text-black border-2 border-black py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Ask AI Coach a Question
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in" id="coach-insights-dashboard">
            
            {/* Dashboard Header Bar */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col">
                <h2 className="font-display text-4xl tracking-tighter text-black glitch">Coach Feedback</h2>
                <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mt-2 text-black">
                  AI-Powered Technique Analysis • Session ID: #P-{Math.floor(overallScore * 23 + 1000)}
                </p>
              </div>
              
              <div className="bg-white border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_#09090B] flex items-center gap-6 text-black shrink-0">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold opacity-50">Latest Session</span>
                  <span className="text-sm font-bold">{sessionDate}</span>
                </div>
                <div className="w-[2px] h-8 bg-black/10"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold opacity-50">Overall IQ</span>
                  <span className="text-sm font-display text-[#09090B]">{overallScore}.0</span>
                </div>
              </div>
            </header>

            {/* Metrics Section: 3 cards showing hip rotation, plant stability, contact timing */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Hip Rotation */}
            <div className="premium-dark-card p-6 rounded-2xl border-2 border-black flex flex-col gap-4 text-white">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-[#D2E823] border-2 border-black rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="text-2xl text-black" />
                </div>
                <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_#09090B]">
                  High Priority
                </span>
              </div>
              <div>
                <h4 className="text-white font-display text-lg mb-1">Improve Hip Rotation</h4>
                <p className="text-white/60 text-xs leading-relaxed">
                  Initiate rotation 15ms earlier to maximize core-to-limb kinetic energy transfer. Current rotation index is sluggish.
                </p>
              </div>
              <div className="flex items-center gap-4 mt-2">
                {renderGauge(scores.hipRotation, '#D2E823')}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Target Score</span>
                  <span className="text-sm font-bold text-[#D2E823]">
                    92% ({scores.hipRotation >= 92 ? 'Completed!' : `+${92 - scores.hipRotation}%`})
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Plant Leg Stability */}
            <div className="premium-dark-card p-6 rounded-2xl border-2 border-black flex flex-col gap-4 text-white">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-blue-500 border-2 border-black rounded-lg flex items-center justify-center">
                  <Anchor className="text-2xl text-white" />
                </div>
                <span className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_#09090B]">
                  Medium Priority
                </span>
              </div>
              <div>
                <h4 className="text-white font-display text-lg mb-1">Plant Leg Stability</h4>
                <p className="text-white/60 text-xs leading-relaxed">
                  Maintain a 14° lateral lean. Current drift of 3.2° reduces strike force & accuracy by approximately 8.5%.
                </p>
              </div>
              <div className="flex items-center gap-4 mt-2">
                {renderGauge(scores.plantLegStability, '#3b82f6')}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Target Score</span>
                  <span className="text-sm font-bold text-blue-400">
                    95% ({scores.plantLegStability >= 95 ? 'Completed!' : `+${95 - scores.plantLegStability}%`})
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Contact Timing */}
            <div className="premium-dark-card p-6 rounded-2xl border-2 border-black flex flex-col gap-4 text-white">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-orange-500 border-2 border-black rounded-lg flex items-center justify-center">
                  <Clock className="text-2xl text-white" />
                </div>
                <span className="px-2 py-1 bg-orange-500 text-white text-[10px] font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_#09090B]">
                  Low Priority
                </span>
              </div>
              <div>
                <h4 className="text-white font-display text-lg mb-1">Contact Timing</h4>
                <p className="text-white/60 text-xs leading-relaxed">
                  Strike slightly lower on the ball circumference to increase top-spin effect by 400 RPM for solid downward trajectory.
                </p>
              </div>
              <div className="flex items-center gap-4 mt-2">
                {renderGauge(scores.followThrough, '#f97316')}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Target Score</span>
                  <span className="text-sm font-bold text-orange-400">
                    80% ({scores.followThrough >= 80 ? 'Completed!' : `+${Math.max(0, 80 - scores.followThrough)}%`})
                  </span>
                </div>
              </div>
            </div>

          </section>

          {/* Grid Layout containing detailed narrative analysis and Next Session Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-black">
            
            {/* Detailed narrative analysis */}
            <section className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-white border-2 border-black p-8 rounded-[24px] shadow-[4px_4px_0px_0px_#09090B]">
                <h3 className="font-display text-xl mb-6 flex items-center gap-3">
                  <TrendingUp className="text-[#D2E823] w-6 h-6 stroke-[2.5]" />
                  Detailed Technique Analysis
                </h3>
                
                <div className="space-y-6 text-sm leading-relaxed text-neutral-800 font-bold uppercase font-mono">
                  <div className="p-4 bg-zinc-50 border-2 border-black/10 rounded-xl font-sans normal-case text-neutral-600 font-normal">
                    <p className="text-sm font-bold text-black mb-2 uppercase font-mono">AI Coach Direct Feedback:</p>
                    {feedback}
                  </div>
                  
                  <p className="font-sans normal-case text-neutral-600 font-normal text-sm">
                    Your latest session indicates a significant improvement in overall kinetic trajectory. However, the chain breaks at the hip rotation phase. The AI detected a 18ms lag between your plant foot anchoring and the initial hip snap.
                  </p>
                  
                  <p className="font-sans normal-case text-neutral-600 font-normal text-sm">
                    This discrepancy causes a loss of approximately 14.5 Newton-meters of force. To correct this, focus on a more explosive internal rotation of the femur immediately following the final stride contact.
                  </p>

                  <div className="bg-[#F8F4E8] border-2 border-black p-6 rounded-xl mt-4">
                    <h4 className="text-xs font-bold uppercase mb-4 opacity-50 tracking-widest text-black">
                      Key Improvements Checklist
                    </h4>
                    
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <div className={`w-5 h-5 border-2 border-black flex items-center justify-center shadow-sm ${scores.plantLegStability >= 80 ? 'bg-[#D2E823]' : 'bg-white'}`}>
                          {scores.plantLegStability >= 80 && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </div>
                        <span>Stabilize plant foot placement offset ({scores.plantLegStability >= 80 ? 'Good' : 'Needs Work'})</span>
                      </li>
                      
                      <li className="flex items-center gap-3">
                        <div className={`w-5 h-5 border-2 border-black flex items-center justify-center shadow-sm ${scores.hipRotation >= 80 ? 'bg-[#D2E823]' : 'bg-white'}`}>
                          {scores.hipRotation >= 80 && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </div>
                        <span>Recalibrate hip firing sequence (Main Focus: {scores.hipRotation >= 80 ? 'Good' : 'Sluggish'})</span>
                      </li>
                      
                      <li className="flex items-center gap-3">
                        <div className={`w-5 h-5 border-2 border-black flex items-center justify-center shadow-sm ${scores.strikeLegExtension >= 80 ? 'bg-[#D2E823]' : 'bg-white'}`}>
                          {scores.strikeLegExtension >= 80 && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </div>
                        <span>Increase ankle rigidity during contact ({scores.strikeLegExtension >= 80 ? 'Locked' : 'Loose'})</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Next Session Sidebar Plan */}
            <aside className="flex flex-col gap-6">
              
              <div className="premium-dark-card p-8 rounded-[24px] border-2 border-black flex flex-col gap-6 text-white">
                <h3 className="text-white font-display text-lg">Next Session Plan</h3>
                
                <div className="space-y-6">
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-black bg-[#D2E823] text-black flex items-center justify-center font-display text-xs shrink-0">
                      1
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white text-xs font-bold">Baseline Calibration</span>
                      <p className="text-white/40 text-[10px]">
                        3 kicks at 60% power to calibrate hip sensors.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-black bg-white text-black flex items-center justify-center font-display text-xs shrink-0">
                      2
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white text-xs font-bold">High-Intensity Burst</span>
                      <p className="text-white/40 text-[10px]">
                        10 kicks focusing purely on hip rotation speed.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-black bg-white text-black flex items-center justify-center font-display text-xs shrink-0">
                      3
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white text-xs font-bold">Goalie Simulation</span>
                      <p className="text-white/40 text-[10px]">
                        Target top corners with AI goalie prediction active.
                      </p>
                    </div>
                  </div>

                </div>

                {isScheduled ? (
                  <div className="bg-[#D2E823]/10 border border-[#D2E823]/40 p-4 rounded-xl text-center text-xs text-[#D2E823] font-bold uppercase tracking-wide">
                    🎉 Live Session Scheduled! Check your calendar logs.
                  </div>
                ) : (
                  <button 
                    onClick={handleScheduleLiveSession}
                    className="w-full py-4 bg-[#D2E823] text-black hover:bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] font-display text-sm tracking-tighter hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                  >
                    Schedule Live Session
                  </button>
                )}
              </div>

              {/* Live Academy Pro connection status */}
              <div className="bg-white border-2 border-black p-6 rounded-[24px] shadow-[4px_4px_0px_0px_#09090B] flex flex-col items-center text-center gap-4 text-black">
                <div className="w-12 h-12 bg-[#F8F4E8] border-2 border-black rounded-full flex items-center justify-center">
                  <MessageCircle className="text-2xl text-black" />
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase">Live Coach Link</span>
                  <p className="text-[10px] opacity-60 px-4">
                    Expert human review available for Tier-3 members.
                  </p>
                </div>

                {isConnectedToAcademy ? (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 border border-green-300 rounded-full animate-pulse">
                    🟢 CONNECTED TO ACADEMY PRO
                  </span>
                ) : (
                  <button 
                    onClick={handleConnectAcademy}
                    className="text-xs font-bold text-blue-600 underline hover:text-blue-800 cursor-pointer bg-transparent border-none"
                  >
                    Connect to Academy Pro
                  </button>
                )}
              </div>

            </aside>
          </div>
          </div>
        )
      ) : (
        // Chat assistant mode
        <div className="bg-white border-2 border-black p-6 rounded-[24px] shadow-[4px_4px_0px_0px_#09090B] flex flex-col h-[calc(100vh-230px)] min-h-[480px] text-black animate-fade-in" id="coach-chatbot-pane">
          
          {/* Coach Chat Header */}
          <div className="border-b border-black/10 pb-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00FFA3] animate-pulse" />
              <h3 className="font-display text-md tracking-wider text-black">COACH ZAN-CHAT</h3>
            </div>
            <span className="bg-[#D2E823] text-black border border-black px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold">
              MULTIMODAL CONNECTED
            </span>
          </div>

          {/* Message scroll container */}
          <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 custom-scrollbar">
            {chatMessages.length === 1 && (
              <div className="bg-[#F8F4E8] border-2 border-black p-6 rounded-2xl text-center max-w-md mx-auto my-6 space-y-3 shadow-sm">
                <div className="bg-[#D2E823] p-3 rounded-xl w-fit mx-auto border border-black">
                  <Sparkles className="w-6 h-6 text-black" />
                </div>
                <h4 className="font-display text-sm font-mono uppercase text-black">Interactive Prompt Helper</h4>
                <p className="text-[10px] text-neutral-500 font-bold uppercase">Click a quick drill question card to prompt the coach instantly:</p>
                
                <div className="space-y-1.5 text-left pt-2">
                  <button
                    onClick={() => sendChatMessage("How do I strike with curved spin like Beckham?")}
                    className="w-full text-left bg-white hover:bg-[#D2E823] p-2.5 rounded-xl border border-black text-[11px] font-bold transition-all block uppercase font-mono cursor-pointer text-black"
                  >
                    💫 Curve Strike Mechanics
                  </button>
                  <button
                    onClick={() => sendChatMessage("Give me a drill to improve plant leg stability.")}
                    className="w-full text-left bg-white hover:bg-[#D2E823] p-2.5 rounded-xl border border-black text-[11px] font-bold transition-all block uppercase font-mono cursor-pointer text-black"
                  >
                    🏃 Plant Foot Anchoring Drill
                  </button>
                  <button
                    onClick={() => sendChatMessage("Show me a tactical goal field diagram")}
                    className="w-full text-left bg-white hover:bg-[#D2E823] p-2.5 rounded-xl border border-black text-[11px] font-bold transition-all block uppercase font-mono cursor-pointer text-black"
                  >
                    🖼️ Generate Goal diagram (Imagen)
                  </button>
                </div>
              </div>
            )}

            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <span className="text-[8px] font-mono text-neutral-400 mb-1 font-bold uppercase">
                  {msg.role === 'user' ? user.name : 'COACH SKELETON'}
                </span>
                
                <div className={`p-4 rounded-2xl text-[11px] font-bold border-2 border-black leading-relaxed shadow-sm uppercase font-mono ${msg.role === 'user' ? 'bg-[#D2E823] text-black rounded-tr-none' : 'bg-white text-black rounded-tl-none'}`}>
                  <div className="prose prose-sm max-w-none text-[11px] leading-relaxed uppercase font-mono">
                    <ReactMarkdown 
                      components={{
                        p: ({children}) => <p className="mb-2 last:mb-0 whitespace-pre-line">{children}</p>,
                        strong: ({children}) => (
                          msg.role === 'user' 
                            ? <strong className="font-extrabold text-black underline decoration-black/50 decoration-2">{children}</strong>
                            : <strong className="font-extrabold text-red-600 bg-red-50 px-1 rounded border border-red-200">{children}</strong>
                        ),
                        ol: ({children}) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                        ul: ({children}) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                        li: ({children}) => <li className="mb-1">{children}</li>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  
                  {msg.image && (
                    <div className="mt-3 border-2 border-black rounded-xl overflow-hidden bg-neutral-900">
                      <img
                        referrerPolicy="no-referrer"
                        src={msg.image}
                        alt="Imagen illustration"
                        className="w-full h-auto"
                      />
                      <div className="bg-black text-[#D2E823] p-1.5 text-[8px] font-mono text-center font-bold tracking-wider">
                        ✨ IMAGEN COOPERATIVE GRAPHIC
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex items-center gap-2 mr-auto bg-[#F8F4E8] border border-neutral-300 p-3 rounded-2xl">
                <div className="flex gap-1 shrink-0">
                  <div className="w-2 h-2 bg-[#09090B] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#09090B] rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-[#09090B] rounded-full animate-bounce delay-200" />
                </div>
                <span className="text-[9px] font-bold text-neutral-500 uppercase font-mono tracking-widest">COACH STREAMING REPORT...</span>
              </div>
            )}
          </div>

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendChatMessage();
            }}
            className="relative flex items-center shrink-0 mt-auto border-t border-black/10 pt-3"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="ASK ABOUT FLEX RATIOS, POSTURE STABILIZERS..."
              className="w-full bg-neutral-100 border-2 border-[#09090B] rounded-2xl pl-10 pr-24 py-3 text-xs font-bold placeholder-neutral-400 outline-none focus:border-[#D2E823] focus:bg-white transition-all shadow-sm font-mono text-black"
            />

            <div className="absolute left-3">
              <button
                type="button"
                onClick={() => alert("Biometric file parser online. Upload custom soccer logs directly inside the text line!")}
                className="text-neutral-500 hover:text-black p-1 transition-colors cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute right-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setMicActive(!micActive);
                  if (!micActive) {
                    setChatInput("How do I maximize laces shooting velocity?");
                    confetti({ particleCount: 10 });
                  }
                }}
                className={`p-1 rounded border transition-all cursor-pointer ${micActive ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'text-neutral-500 hover:text-black border-neutral-200'}`}
                title="Simulate Voice mic input"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>

              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="bg-[#D2E823] hover:bg-black hover:text-[#D2E823] text-[#09090B] border border-black px-3 py-1.5 rounded-xl font-bold text-[10px] transition-colors flex items-center gap-1 shadow-sm disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>SEND</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
