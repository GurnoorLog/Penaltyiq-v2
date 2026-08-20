import React from 'react';
import { Sliders, Sparkles } from 'lucide-react';

interface Scores {
  plantLegStability: number;
  hipRotation: number;
  strikeLegExtension: number;
  followThrough: number;
  recoveryBalance: number;
}

interface MetricsTabProps {
  scores: Scores;
  setScores: React.Dispatch<React.SetStateAction<Scores>>;
  setOverallScore: React.Dispatch<React.SetStateAction<number>>;
  coachingTier: 'gemini' | 'bitnet' | 'offline';
  setCoachingTier: React.Dispatch<React.SetStateAction<'gemini' | 'bitnet' | 'offline'>>;
  isAnalyzing: boolean;
  feedback: string;
  runAICoachAnalysis: () => void;
}

export const MetricsTab: React.FC<MetricsTabProps> = ({
  scores,
  setScores,
  setOverallScore,
  coachingTier,
  setCoachingTier,
  isAnalyzing,
  feedback,
  runAICoachAnalysis
}) => {
  return (
    <div className="bg-white border-2 border-black p-8 rounded-[24px] shadow-[4px_4px_0px_0px_#09090B] space-y-6">
      
      {/* Title Header */}
      <div className="border-b border-black/10 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl heading flex items-center gap-2">
            <Sliders className="w-7 h-7 text-[#D2E823]" />
            <span className="text-black">Biomechanical Fine-Tuning</span>
          </h2>
          <p className="text-xs font-bold text-neutral-500 uppercase mt-1">Manually adjust joint angles and flex coefficients to simulate technique upgrades</p>
        </div>

        <div className="flex bg-[#09090B] p-1 rounded-xl gap-1 border border-black text-white">
          <button
            onClick={() => setCoachingTier('gemini')}
            className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase transition-colors cursor-pointer ${coachingTier === 'gemini' ? 'bg-[#D2E823] text-black' : 'text-white hover:text-[#D2E823]'}`}
          >
            Gemini AI
          </button>
          <button
            onClick={() => setCoachingTier('bitnet')}
            className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase transition-colors cursor-pointer ${coachingTier === 'bitnet' ? 'bg-[#D2E823] text-black' : 'text-white hover:text-[#D2E823]'}`}
          >
            BitNet Local
          </button>
          <button
            onClick={() => setCoachingTier('offline')}
            className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase transition-colors cursor-pointer ${coachingTier === 'offline' ? 'bg-[#D2E823] text-black' : 'text-white hover:text-[#D2E823]'}`}
          >
            Offline
          </button>
        </div>
      </div>

      {/* Core sliders and coaching panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Sliders */}
        <div className="md:col-span-7 space-y-5">
          
          {/* Metric 1 */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1 text-black">
              <span className="uppercase font-mono flex items-center gap-1">
                <span>Plant Leg Stability</span>
                <span className="text-[9px] opacity-55 font-normal">(20% weight)</span>
              </span>
              <span className="font-mono">{scores.plantLegStability}/100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={scores.plantLegStability}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setScores(prev => {
                  const next = { ...prev, plantLegStability: val };
                  setOverallScore(Math.round((next.plantLegStability * 0.2) + (next.hipRotation * 0.2) + (next.strikeLegExtension * 0.25) + (next.followThrough * 0.2) + (next.recoveryBalance * 0.15)));
                  return next;
                });
              }}
              className="w-full h-3 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#09090B]"
            />
          </div>

          {/* Metric 2 */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1 text-black">
              <span className="uppercase font-mono flex items-center gap-1">
                <span>Hip Rotation Snap</span>
                <span className="text-[9px] opacity-55 font-normal">(20% weight)</span>
              </span>
              <span className="font-mono">{scores.hipRotation}/100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={scores.hipRotation}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setScores(prev => {
                  const next = { ...prev, hipRotation: val };
                  setOverallScore(Math.round((next.plantLegStability * 0.2) + (next.hipRotation * 0.2) + (next.strikeLegExtension * 0.25) + (next.followThrough * 0.2) + (next.recoveryBalance * 0.15)));
                  return next;
                });
              }}
              className="w-full h-3 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#09090B]"
            />
          </div>

          {/* Metric 3 */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1 text-black">
              <span className="uppercase font-mono flex items-center gap-1">
                <span>Strike Leg Extension</span>
                <span className="text-[9px] opacity-55 font-normal">(25% weight)</span>
              </span>
              <span className="font-mono">{scores.strikeLegExtension}/100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={scores.strikeLegExtension}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setScores(prev => {
                  const next = { ...prev, strikeLegExtension: val };
                  setOverallScore(Math.round((next.plantLegStability * 0.2) + (next.hipRotation * 0.2) + (next.strikeLegExtension * 0.25) + (next.followThrough * 0.2) + (next.recoveryBalance * 0.15)));
                  return next;
                });
              }}
              className="w-full h-3 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#09090B]"
            />
          </div>

          {/* Metric 4 */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1 text-black">
              <span className="uppercase font-mono flex items-center gap-1">
                <span>Follow-Through Path</span>
                <span className="text-[9px] opacity-55 font-normal">(20% weight)</span>
              </span>
              <span className="font-mono">{scores.followThrough}/100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={scores.followThrough}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setScores(prev => {
                  const next = { ...prev, followThrough: val };
                  setOverallScore(Math.round((next.plantLegStability * 0.2) + (next.hipRotation * 0.2) + (next.strikeLegExtension * 0.25) + (next.followThrough * 0.2) + (next.recoveryBalance * 0.15)));
                  return next;
                });
              }}
              className="w-full h-3 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#09090B]"
            />
          </div>

          {/* Metric 5 */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1 text-black">
              <span className="uppercase font-mono flex items-center gap-1">
                <span>Recovery Balance</span>
                <span className="text-[9px] opacity-55 font-normal">(15% weight)</span>
              </span>
              <span className="font-mono">{scores.recoveryBalance}/100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={scores.recoveryBalance}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setScores(prev => {
                  const next = { ...prev, recoveryBalance: val };
                  setOverallScore(Math.round((next.plantLegStability * 0.2) + (next.hipRotation * 0.2) + (next.strikeLegExtension * 0.25) + (next.followThrough * 0.2) + (next.recoveryBalance * 0.15)));
                  return next;
                });
              }}
              className="w-full h-3 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#09090B]"
            />
          </div>

        </div>

        {/* Right Column Action report box */}
        <div className="md:col-span-5 bg-[#D2E823] border-2 border-black p-6 rounded-2xl flex flex-col justify-between h-full min-h-[300px]">
          <div>
            <div className="flex items-center gap-2 mb-3 text-black">
              <Sparkles className="w-5 h-5 animate-spin text-black" />
              <h4 className="heading text-md">AI COACH FEEDBACK</h4>
            </div>
            
            <div className="bg-white border-2 border-black p-4 rounded-xl min-h-[140px] text-xs font-mono font-bold leading-relaxed text-neutral-800">
              {isAnalyzing ? (
                <div className="flex items-center gap-2.5 text-zinc-500 py-6">
                  <div className="w-4 h-4 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
                  <span>Dissecting kinetic vectors...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{feedback}</p>
              )}
            </div>
          </div>

          <button
            onClick={runAICoachAnalysis}
            disabled={isAnalyzing}
            className="w-full bg-black text-[#D2E823] hover:bg-neutral-800 hover:text-[#D2E823] py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider border-2 border-black flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 disabled:opacity-50 mt-4 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Diagnose Ratios ({coachingTier.toUpperCase()} Mode)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
