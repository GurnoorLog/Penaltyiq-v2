import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Search, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  Award, 
  Activity, 
  ArrowUpRight,
  TrendingDown,
  Trash2
} from 'lucide-react';

interface Session {
  id: string;
  date: string;
  scores: {
    plantLegStability: number;
    hipRotation: number;
    strikeLegExtension: number;
    followThrough: number;
    recoveryBalance: number;
  };
  overallScore: number;
  label: string;
  feedback: string;
  tips: string[];
}

interface HistoryTabProps {
  sessions: Session[];
  setScores: React.Dispatch<React.SetStateAction<{
    plantLegStability: number;
    hipRotation: number;
    strikeLegExtension: number;
    followThrough: number;
    recoveryBalance: number;
  }>>;
  setOverallScore: React.Dispatch<React.SetStateAction<number>>;
  setLabel: React.Dispatch<React.SetStateAction<string>>;
  setFeedback: React.Dispatch<React.SetStateAction<string>>;
  setTips: React.Dispatch<React.SetStateAction<string[]>>;
  setFrame: React.Dispatch<React.SetStateAction<number>>;
  setContactFrozen: React.Dispatch<React.SetStateAction<boolean>>;
  setContactFrame: React.Dispatch<React.SetStateAction<number>>;
  setActiveSidebarTab: (tab: 'analysis' | 'capture' | 'metrics' | 'history' | 'coach' | 'settings') => void;
  triggerConfettiCelebration: () => void;
  deleteSession?: (id: string) => void;
}

const SESSION_IMAGES = [
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400",
  "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=400",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=400",
  "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=400",
  "https://images.unsplash.com/photo-1510051640316-dee3f56d229e?q=80&w=400",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=400"
];

export const HistoryTab: React.FC<HistoryTabProps> = ({
  sessions,
  setScores,
  setOverallScore,
  setLabel,
  setFeedback,
  setTips,
  setFrame,
  setContactFrozen,
  setContactFrame,
  setActiveSidebarTab,
  triggerConfettiCelebration,
  deleteSession
}) => {
  const [filterType, setFilterType] = useState<'recent' | 'high_score' | 'improvement'>('recent');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  // Dynamic calculations
  const stats = useMemo(() => {
    if (sessions.length === 0) {
      return { avgScore: 0, consistency: 0, trend: 'stable' };
    }
    const sum = sessions.reduce((acc, s) => acc + s.overallScore, 0);
    const avgScore = Number((sum / sessions.length).toFixed(1));

    // Consistency is calculated based on standard deviation or a dynamic rating
    const mean = sum / sessions.length;
    const variance = sessions.reduce((acc, s) => acc + Math.pow(s.overallScore - mean, 2), 0) / sessions.length;
    const stdDev = Math.sqrt(variance);
    // Lower standard deviation means higher consistency (scale out of 100)
    const consistency = Math.max(50, Math.min(99, Math.round(100 - stdDev * 2)));

    // Trend compares latest half to previous half of sessions
    let trend = 'stable';
    if (sessions.length >= 2) {
      const mid = Math.floor(sessions.length / 2);
      const latestHalf = sessions.slice(0, mid);
      const olderHalf = sessions.slice(mid);
      const latestAvg = latestHalf.reduce((acc, s) => acc + s.overallScore, 0) / latestHalf.length;
      const olderAvg = olderHalf.reduce((acc, s) => acc + s.overallScore, 0) / olderHalf.length;
      trend = latestAvg > olderAvg ? 'up' : latestAvg < olderAvg ? 'down' : 'stable';
    }

    return { avgScore, consistency, trend };
  }, [sessions]);

  // Handle Search and Filter
  const processedSessions = useMemo(() => {
    let result = [...sessions];

    // Filter by query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.date.toLowerCase().includes(q) || 
        s.label.toLowerCase().includes(q) || 
        s.feedback.toLowerCase().includes(q)
      );
    }

    // Sort by filter type
    if (filterType === 'recent') {
      // Assuming original order is newest first. If not, can sort or maintain.
      // We keep standard order.
    } else if (filterType === 'high_score') {
      result.sort((a, b) => b.overallScore - a.overallScore);
    } else if (filterType === 'improvement') {
      // Sort so highest scoring is first, or by plant leg stability, etc.
      result.sort((a, b) => b.scores.plantLegStability - a.scores.plantLegStability);
    }

    return result;
  }, [sessions, searchQuery, filterType]);

  // Timeline coordinate calculations (render chronological progression)
  const timelinePoints = useMemo(() => {
    // We want chronologically ordered data (earliest to latest) for the trend line
    const chronological = [...sessions].reverse();
    if (chronological.length === 0) return [];

    const width = 760;
    const height = 140;
    const paddingX = 40;
    const paddingY = 20;

    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;

    const minScore = 50;
    const maxScore = 100;

    return chronological.map((s, idx) => {
      const x = paddingX + (chronological.length > 1 ? (idx / (chronological.length - 1)) * usableWidth : usableWidth / 2);
      // Invert Y because SVG coordinates start from top-left (0,0)
      const y = paddingY + usableHeight - ((s.overallScore - minScore) / (maxScore - minScore)) * usableHeight;
      return { x, y, score: s.overallScore, date: s.date, session: s };
    });
  }, [sessions]);

  // Build the SVG path
  const linePath = useMemo(() => {
    if (timelinePoints.length === 0) return '';
    return timelinePoints.reduce((acc, pt, idx) => {
      return acc + `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
    }, '');
  }, [timelinePoints]);

  // Build the filled glow path under the line
  const areaPath = useMemo(() => {
    if (timelinePoints.length === 0) return '';
    const first = timelinePoints[0];
    const last = timelinePoints[timelinePoints.length - 1];
    return `${linePath} L ${last.x} 140 L ${first.x} 140 Z`;
  }, [timelinePoints, linePath]);

  const handleRecallSession = (sess: Session) => {
    setScores(sess.scores);
    setOverallScore(sess.overallScore);
    setLabel(sess.label);
    setFeedback(sess.feedback);
    setTips(sess.tips);
    setFrame(0);
    setContactFrozen(true);
    setContactFrame(34);
    setActiveSidebarTab('analysis');
    triggerConfettiCelebration();
  };

  return (
    <div className="space-y-8 pb-12" id="history-container-main">
      {/* Dynamic Header Structure */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-4xl glitch tracking-tighter uppercase text-black">Performance History</h2>
          <p className="text-xs font-bold opacity-60 uppercase tracking-widest text-black">
            Tracking biomechanical evolution over {sessions.length} sessions
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_#09090B]">
          <div className="flex flex-col px-4 border-r-2 border-[#09090B]">
            <span className="text-[10px] uppercase opacity-40 font-bold text-black">Avg Score</span>
            <span className="text-2xl font-display text-black">{stats.avgScore}</span>
          </div>
          <div className="flex flex-col px-4">
            <span className="text-[10px] uppercase opacity-40 font-bold text-black">Consistency</span>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-display text-black">{stats.consistency}%</span>
              {stats.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-600 stroke-[3]" />}
              {stats.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-600 stroke-[3]" />}
            </div>
          </div>
        </div>
      </header>

      {/* Biomechanical Trend Timeline Line Chart Card */}
      <section className="bg-[#09090B] border-4 border-black rounded-[24px] p-8 shadow-[6px_6px_0px_0px_#D2E823] text-white">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-[#D2E823] animate-pulse" />
            <h3 className="font-display text-lg text-[#D2E823] uppercase">Biomechanical Trend Timeline</h3>
          </div>
          <div className="hidden sm:flex gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/10 rounded">
              {sessions.length} TRAINING RUNS
            </span>
          </div>
        </div>

        {timelinePoints.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-2xl">
            <Activity className="w-12 h-12 mx-auto text-white/40 mb-3" />
            <span className="font-bold text-sm block uppercase tracking-wide text-white/60">No performance records detected</span>
            <span className="text-xs text-white/40 uppercase mt-1 block">Your kick data will draw a dynamic timeline here</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Interactive Custom SVG Chart Area */}
            <div className="relative w-full overflow-x-auto overflow-y-hidden" style={{ minWidth: '760px' }}>
              <svg width="760" height="140" className="overflow-visible">
                <defs>
                  <linearGradient id="glow-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D2E823" stopOpacity="0.25"></stop>
                    <stop offset="100%" stopColor="#D2E823" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="20" x2="720" y2="20" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                <line x1="40" y1="70" x2="720" y2="70" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                <line x1="40" y1="120" x2="720" y2="120" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />

                {/* Score scale indicators */}
                <text x="15" y="24" className="text-[9px] font-mono fill-white/40 font-bold">100</text>
                <text x="15" y="74" className="text-[9px] font-mono fill-white/40 font-bold">75</text>
                <text x="15" y="124" className="text-[9px] font-mono fill-white/40 font-bold">50</text>

                {/* Filled Gradient path */}
                {timelinePoints.length > 1 && (
                  <path d={areaPath} fill="url(#glow-area)" />
                )}

                {/* Stroke Trend line */}
                {timelinePoints.length > 1 ? (
                  <path d={linePath} fill="none" stroke="#D2E823" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  // Single session fallback dot guide
                  <line x1="40" y1={timelinePoints[0].y} x2="720" y2={timelinePoints[0].y} stroke="rgba(210, 232, 35, 0.2)" strokeWidth="2" strokeDasharray="4" />
                )}

                {/* Interactive Points mapping */}
                {timelinePoints.map((pt, index) => {
                  const isHovered = selectedPointIndex === index;
                  return (
                    <g key={index} className="cursor-pointer" onClick={() => handleRecallSession(pt.session)}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 10 : 6}
                        fill={isHovered ? '#00FFA3' : '#D2E823'}
                        stroke="#09090B"
                        strokeWidth="2"
                        className="transition-all duration-200"
                        onMouseEnter={() => setSelectedPointIndex(index)}
                        onMouseLeave={() => setSelectedPointIndex(null)}
                      />
                      {isHovered && (
                        <g>
                          <rect
                            x={pt.x - 45}
                            y={pt.y - 35}
                            width="90"
                            height="24"
                            rx="4"
                            fill="#09090B"
                            stroke="#D2E823"
                            strokeWidth="1.5"
                          />
                          <text
                            x={pt.x}
                            y={pt.y - 20}
                            textAnchor="middle"
                            className="text-[10px] font-mono font-bold fill-white"
                          >
                            Score: {pt.score}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-white/40 px-10">
              <span>EARLIEST SESSION</span>
              <span>CHRONOLOGICAL RUN PROGRESSION →</span>
              <span>LATEST SESSION</span>
            </div>
          </div>
        )}
      </section>

      {/* Filter and Search Bar Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between" id="history-filter-controls">
        <div className="flex gap-2 bg-white border-4 border-black p-1 rounded-xl shadow-[3px_3px_0px_0px_#09090B]">
          <button
            onClick={() => setFilterType('recent')}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${filterType === 'recent' ? 'bg-[#D2E823] border-2 border-black shadow-sm text-black' : 'hover:bg-[#F8F4E8] text-black/60'}`}
          >
            Recent
          </button>
          <button
            onClick={() => setFilterType('high_score')}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${filterType === 'high_score' ? 'bg-[#D2E823] border-2 border-black shadow-sm text-black' : 'hover:bg-[#F8F4E8] text-black/60'}`}
          >
            High Score
          </button>
          <button
            onClick={() => setFilterType('improvement')}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${filterType === 'improvement' ? 'bg-[#D2E823] border-2 border-black shadow-sm text-black' : 'hover:bg-[#F8F4E8] text-black/60'}`}
          >
            Stability PRs
          </button>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH SESSION REPORTS..."
            className="w-full bg-white border-4 border-black p-3.5 pr-12 rounded-xl text-xs font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#09090B] focus:outline-none focus:bg-[#D2E823]/10 text-black placeholder-black/40"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-black w-5 h-5 pointer-events-none" />
        </div>
      </div>

      {/* Grid of Sessions list */}
      {processedSessions.length === 0 ? (
        <div className="text-center py-16 bg-white border-4 border-dashed border-black/25 rounded-3xl" id="history-empty-search-state">
          <Search className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
          <span className="font-display text-lg block uppercase text-neutral-800">No session results match filters</span>
          <span className="text-xs text-neutral-500 uppercase mt-1 block font-bold font-mono">Try adjusting your search queries or resetting filters</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="history-sessions-grid">
          {processedSessions.map((sess, idx) => {
            const imgUrl = SESSION_IMAGES[idx % SESSION_IMAGES.length];
            return (
              <div
                key={sess.id}
                className="bg-white border-4 border-black p-6 rounded-[24px] shadow-[5px_5px_0px_0px_#09090B] flex flex-col sm:flex-row gap-6 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#09090B] transition-all"
              >
                {/* Session Thumbnail with Overlay */}
                <div className="w-full sm:w-32 h-32 bg-[#09090B] border-2 border-black rounded-xl overflow-hidden shrink-0 relative group">
                  <img referrerPolicy="no-referrer" src={imgUrl} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-500" alt="Soccer Kick representation" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-colors">
                    <div className="w-10 h-10 bg-[#D2E823] border-2 border-black rounded-full flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform">
                      <Play className="text-black w-4 h-4 fill-black translate-x-0.5" />
                    </div>
                  </div>
                </div>

                {/* Session Report details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono font-bold opacity-40 uppercase tracking-wider">
                        SESSION RECONSTRUCTION
                      </span>
                      <h4 className="font-display text-lg leading-tight text-black mt-0.5">{sess.date}</h4>
                    </div>
                    <div className="bg-[#D2E823] border-2 border-black px-3.5 py-1.5 shadow-[2px_2px_0px_0px_#09090B] rotate-2 flex flex-col items-center shrink-0">
                      <span className="text-[8px] font-mono font-bold uppercase text-black leading-none">Score</span>
                      <span className="text-xl font-display tracking-tighter text-black leading-none mt-1">{sess.overallScore}</span>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-neutral-600 font-bold uppercase mb-4 leading-relaxed line-clamp-3">
                    {sess.feedback}
                  </p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-auto border-t border-black/10 pt-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-mono font-bold uppercase text-black/60">
                        <span>Plant Stability</span>
                        <span>{sess.scores.plantLegStability}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#F8F4E8] border border-black rounded-full overflow-hidden">
                        <div className="h-full bg-[#D2E823]" style={{ width: `${sess.scores.plantLegStability}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-mono font-bold uppercase text-black/60">
                        <span>Hip Rotation</span>
                        <span>{sess.scores.hipRotation}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#F8F4E8] border border-black rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${sess.scores.hipRotation}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-mono font-bold uppercase text-black/60">
                        <span>Follow Through</span>
                        <span>{sess.scores.followThrough}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#F8F4E8] border border-black rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500" style={{ width: `${sess.scores.followThrough}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-mono font-bold uppercase text-black/60">
                        <span>Balance</span>
                        <span>{sess.scores.recoveryBalance}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#F8F4E8] border border-black rounded-full overflow-hidden">
                        <div className="h-full bg-[#00FFA3]" style={{ width: `${sess.scores.recoveryBalance}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-3 border-t border-dashed border-black/10">
                    <span className={`text-[9px] font-mono font-bold px-2.5 py-1 border border-black rounded-md text-black shadow-sm uppercase ${sess.label === 'OPTIMAL' ? 'bg-[#00FFA3]' : sess.label === 'GOOD' ? 'bg-[#D2E823]' : 'bg-[#F8F4E8]'}`}>
                      {sess.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {deleteSession && (
                        <button
                          onClick={() => deleteSession(sess.id)}
                          className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white hover:scale-105 border-2 border-black font-display text-[10px] font-bold p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer uppercase shadow-sm"
                          title="Delete Run Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRecallSession(sess)}
                        className="bg-black hover:bg-[#D2E823] text-white hover:text-black hover:scale-105 border-2 border-black font-display text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer uppercase shadow-sm"
                      >
                        Recall Run <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
