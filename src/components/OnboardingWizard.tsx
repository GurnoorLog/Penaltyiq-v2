import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Home, 
  Plus, 
  CheckCircle, 
  User, 
  Search, 
  Square, 
  CheckSquare, 
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
interface OnboardingWizardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    country?: string;
    address?: string;
  };
  onFinish: (data: {
    club: string;
    position: string;
    idol: string;
    goals: string[];
    country?: string;
    address?: string;
  }) => void;
  onBack: () => void;
}


const CLUBS = [
  'FC BARCELONA ACADEMY',
  'MANCHESTER UNITED FC',
  'MY LOCAL CLUB',
  'REAL MADRID JUVENIL',
  'BAYERN MUNICH ACADEMY',
  'PARIS SAINT-GERMAIN FC'
];

const POSITIONS = ['ST', 'CM', 'CB', 'LB', 'RB', 'GK'];

const IDOLS = ['LEO MESSI', 'C. RONALDO', 'HARRY KANE', 'NEYMAR JR', 'ERLING HAALAND', 'K. MBAPPÉ'];

const GOALS = ['HIP ROTATION', 'BALANCE', 'FOLLOW-THROUGH', 'STRIKE ANGLE', 'RUN-UP TIMING', 'ANKLE LOCK'];

interface GoogleClubSearchProps {
  value: string;
  onChange: (val: string) => void;
  selectedClub: string;
  onSelectClub: (clubName: string, country?: string, address?: string) => void;
  onProxyStatusChange?: (active: boolean) => void;
}

const GoogleClubSearchInner: React.FC<GoogleClubSearchProps> = ({
  value,
  onChange,
  selectedClub,
  onSelectClub,
  onProxyStatusChange
}) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!value.trim()) {
      // Show default suggestions from CLUBS list
      const defaultSuggestions = CLUBS.map(club => ({
        place_id: `static_${club}`,
        structured_formatting: {
          main_text: club,
          secondary_text: 'Academy Location'
        },
        description: `${club}, International`
      }));
      setPredictions(defaultSuggestions);
      onProxyStatusChange?.(true); // Treat as active/no-error initially
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`/api/places-autocomplete?input=${encodeURIComponent(value)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.predictions && data.predictions.length > 0) {
            setPredictions(data.predictions);
            onProxyStatusChange?.(true);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Places API proxy failed:", err);
      }
      
      // Fallback: Filter from static CLUBS list
      const filtered = CLUBS.filter(club => 
        club.toLowerCase().includes(value.toLowerCase())
      ).map(club => ({
        place_id: `static_${club}`,
        structured_formatting: {
          main_text: club,
          secondary_text: 'Academy Location'
        },
        description: `${club}, International`
      }));
      setPredictions(filtered);
      onProxyStatusChange?.(false); // Propagate that proxy/maps key is not configured/active
      setLoading(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [value]);

  const handleSelectPrediction = async (prediction: any) => {
    if (prediction.place_id.startsWith('static_')) {
      onSelectClub(prediction.structured_formatting.main_text, 'United Kingdom', 'Manchester, UK');
      return;
    }

    onSelectClub(prediction.structured_formatting.main_text, undefined, prediction.description);
    
    try {
      const response = await fetch(`/api/place-details?placeId=${prediction.place_id}`);
      if (response.ok) {
        const place = await response.json();
        const countryComp = place.address_components?.find((c: any) => c.types.includes('country'));
        const country = countryComp?.long_name || '';
        onSelectClub(prediction.structured_formatting.main_text, country, place.formatted_address || prediction.description);
      }
    } catch (err) {
      console.error("Error fetching place details:", err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="SEARCH REAL CLUB, ACADEMY, OR CITY..." 
          className="w-full bg-white border-3 border-black rounded-xl p-4 font-mono font-bold text-xs uppercase focus:outline-none focus:border-[#D2E823] focus:shadow-[4px_4px_0px_0px_#09090B] transition-all text-black placeholder-neutral-400"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />}
          <Search className="text-xl opacity-40 w-5 h-5 text-black" />
        </div>
      </div>

      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
        {predictions.length > 0 ? (
          predictions.map((p) => {
            const isSelected = selectedClub === p.structured_formatting.main_text;
            return (
              <button
                key={p.place_id}
                onClick={() => handleSelectPrediction(p)}
                type="button"
                className={`w-full p-3.5 rounded-xl border-2 border-black flex items-center justify-between text-left transition-all ${
                  isSelected 
                    ? 'bg-[#D2E823] translate-x-0.5 translate-y-0.5 shadow-none' 
                    : 'bg-[#F8F4E8] hover:bg-white hover:translate-x-[-1px] hover:translate-y-[-1px] shadow-[2px_2px_0px_0px_#09090B]'
                }`}
              >
                <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-black shrink-0" />
                    <span className="font-mono font-bold text-xs text-black uppercase truncate">{p.structured_formatting.main_text}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-sans pl-6 truncate normal-case font-medium">{p.structured_formatting.secondary_text}</span>
                </div>
                {isSelected ? (
                  <CheckCircle className="w-5 h-5 text-black shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 opacity-40 shrink-0 text-black" />
                )}
              </button>
            );
          })
        ) : (
          value.trim() && !loading && (
            <button
              onClick={() => onSelectClub(value.toUpperCase(), 'International', value.toUpperCase())}
              type="button"
              className="w-full p-4 rounded-xl border-2 border-black border-dashed bg-[#F8F4E8] hover:bg-white text-left text-xs font-mono font-bold text-black"
            >
              ✨ USE CUSTOM ENTRY: "{value.toUpperCase()}"
            </button>
          )
        )}
      </div>
    </div>
  );
};



export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ user, onFinish, onBack }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // Selected state
  const [selectedClub, setSelectedClub] = useState<string>('MANCHESTER UNITED FC');
  const [clubSearch, setClubSearch] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>(user.country || '');
  const [selectedAddress, setSelectedAddress] = useState<string>(user.address || '');
  const [position, setPosition] = useState<string>('CM');
  const [idol, setIdol] = useState<string>('C. RONALDO');
  const [idolSearch, setIdolSearch] = useState<string>('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['HIP ROTATION', 'FOLLOW-THROUGH']);

  const [isCelebrating, setIsCelebrating] = useState<boolean>(false);
  const [celebrationText, setCelebrationText] = useState<string>('');
  const [isProxyActive, setIsProxyActive] = useState<boolean>(true);


  // Search filter for clubs
  const filteredClubs = CLUBS.filter(club => 
    club.toLowerCase().includes(clubSearch.toLowerCase())
  );

  // Search filter for idols
  const filteredIdols = IDOLS.filter(i => 
    i.toLowerCase().includes(idolSearch.toLowerCase())
  );

  const handleNext = () => {
    if (currentStep === 1 && !selectedClub) {
      return; // prevent proceeding if no club chosen
    }
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      triggerCelebration();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(prev => prev.filter(g => g !== goal));
    } else {
      setSelectedGoals(prev => [...prev, goal]);
    }
  };

  const triggerCelebration = () => {
    setIsCelebrating(true);
    
    // Confetti pop!
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#D2E823', '#00FFA3', '#09090B', '#FFFFFF']
    });

    // Staggered typing text
    const text = "YOU'RE READY TO DOMINATE THE PITCH";
    let index = 0;
    const interval = setInterval(() => {
      setCelebrationText(prev => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 40);

    setTimeout(() => {
      onFinish({
        club: selectedClub,
        position,
        idol,
        goals: selectedGoals,
        country: selectedCountry || undefined,
        address: selectedAddress || undefined
      });
    }, 4500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8F4E8] text-[#09090B] flex flex-col pt-24 px-6 pb-12 select-none">
      <div className="noise-overlay" />

      {/* Celebration overlay */}
      <AnimatePresence>
        {isCelebrating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#09090B]/95 z-[200] flex flex-col items-center justify-center p-6 text-center text-white"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1.2, rotate: 0 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100 }}
              className="mb-6 text-[#D2E823]"
            >
              <CheckCircle className="w-24 h-24" />
            </motion.div>

            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-display text-5xl md:text-6xl mb-4 text-[#D2E823] tracking-tighter"
              style={{ textShadow: '0 0 20px #D2E823, 0 0 40px rgba(210, 232, 35, 0.5)' }}
            >
              PROFILE COMPLETE!
            </motion.h2>

            <p className="font-display text-lg md:text-2xl text-white tracking-tight h-12 max-w-xl">
              {celebrationText}
            </p>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="font-display text-xs text-[#D2E823] mt-12 tracking-widest"
            >
              REDIRECTING TO DASHBOARD LAB...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top brutalist navigation */}
      <nav className="fixed top-4 left-0 right-0 z-[60] px-4 md:px-8">
        <div className="max-w-4xl mx-auto glass-nav border-4 border-[#09090B] rounded-[12px] h-[80px] flex items-center justify-between px-6 shadow-[6px_6px_0px_0px_#09090B]">
          <div className="text-2xl font-black tracking-tighter font-display">PENALTYIQ</div>
          
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-[10px] font-bold tracking-widest opacity-60 font-mono">
              STEP {currentStep} OF {totalSteps}
            </span>
            <div className="w-32 bg-zinc-200 h-3 border-2 border-[#09090B] rounded-none overflow-hidden">
              <div 
                className="h-full bg-[#D2E823] transition-all duration-500 border-r-2 border-black" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <div className="w-10 h-10 bg-white border-2 border-black rounded-lg flex items-center justify-center font-bold font-mono">
            {user.avatar}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full pt-12">
        <motion.div 
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full"
        >
          <h1 className="text-4xl md:text-5xl font-display text-center mb-8 tracking-tighter glitch select-none text-black">
            BUILD YOUR PROFILE
          </h1>

          <div className="bg-white border-4 border-[#09090B] p-8 md:p-10 rounded-[24px] shadow-[8px_8px_0px_0px_#09090B] relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-3 bg-[#D2E823] border-r-4 border-[#09090B]" />
            
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="font-display text-[10px] opacity-60 block mb-1 tracking-wider text-black">
                      STEP 01 / LOCATION & CLUB
                    </label>
                    <h2 className="text-2xl font-display leading-tight text-black">
                      WHERE DO YOU PLAY?
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <GoogleClubSearchInner
                      value={clubSearch}
                      onChange={setClubSearch}
                      selectedClub={selectedClub}
                      onSelectClub={(clubName, country, address) => {
                        setSelectedClub(clubName);
                        if (country) setSelectedCountry(country);
                        if (address) setSelectedAddress(address);
                      }}
                      onProxyStatusChange={setIsProxyActive}
                    />

                    {!isProxyActive && (
                      <div className="bg-amber-50 border-2 border-amber-600 p-3 rounded-xl flex items-start gap-3 text-black">
                        <div className="text-lg">💡</div>
                        <div className="space-y-1">
                          <h4 className="font-display text-[10px] uppercase font-bold tracking-wider text-amber-800">Google Maps Platform Key Recommended</h4>
                          <p className="text-[10px] text-neutral-600 normal-case font-medium leading-relaxed">
                            Want live suggestions & real-world club addresses around your location? Add <strong>GOOGLE_MAPS_PLATFORM_KEY</strong> to <strong>Settings (⚙️) → Secrets</strong>!
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedClub && (
                      <div className="p-3 bg-[#D2E823]/10 border-2 border-black rounded-xl text-xs text-black font-mono">
                        📍 SELECTED: <span className="font-bold">{selectedClub}</span>
                        {selectedCountry && <span> ({selectedCountry})</span>}
                        {selectedAddress && <span className="block text-[10px] text-neutral-500 font-sans normal-case truncate">{selectedAddress}</span>}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="font-display text-[10px] opacity-60 block mb-1 tracking-wider text-black">
                      STEP 02 / ROLE
                    </label>
                    <h2 className="text-2xl font-display leading-tight text-black">
                      CHOOSE YOUR POSITION
                    </h2>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {POSITIONS.map((pos) => {
                      const isSelected = position === pos;
                      return (
                        <button
                          key={pos}
                          onClick={() => setPosition(pos)}
                          className={`p-6 font-display text-xl rounded-xl border-2 border-black transition-all ${
                            isSelected 
                              ? 'bg-[#D2E823] translate-x-1 translate-y-1 shadow-none' 
                              : 'bg-white hover:bg-[#D2E823]/30 hover:translate-x-[-1px] hover:translate-y-[-1px] shadow-[4px_4px_0px_0px_#09090B] text-black'
                          }`}
                        >
                          {pos}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="font-display text-[10px] opacity-60 block mb-1 tracking-wider text-black">
                      STEP 03 / INSPIRATION
                    </label>
                    <h2 className="text-2xl font-display leading-tight text-black">
                      WHO IS YOUR IDOL?
                    </h2>
                  </div>

                  <input 
                    type="text" 
                    value={idolSearch}
                    onChange={(e) => setIdolSearch(e.target.value)}
                    placeholder="START TYPING A PLAYER..." 
                    className="w-full bg-white border-3 border-black rounded-xl p-4 font-mono font-bold text-xs uppercase focus:outline-none focus:border-[#D2E823] focus:shadow-[4px_4px_0px_0px_#09090B] transition-all text-black placeholder-neutral-400"
                  />

                  <div className="flex flex-wrap gap-2 pt-2">
                    {filteredIdols.map((i) => {
                      const isSelected = idol === i;
                      return (
                        <button
                          key={i}
                          onClick={() => setIdol(i)}
                          className={`px-4 py-2.5 rounded-full font-mono font-bold text-xs border-2 border-black transition-all ${
                            isSelected 
                              ? 'bg-[#D2E823] translate-x-0.5 translate-y-0.5 shadow-none' 
                              : 'bg-white hover:bg-[#D2E823]/20 hover:translate-x-[-1px] hover:translate-y-[-1px] shadow-[2px_2px_0px_0px_#09090B] text-black'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="font-display text-[10px] opacity-60 block mb-1 tracking-wider text-black">
                      STEP 04 / GOALS
                    </label>
                    <h2 className="text-2xl font-display leading-tight text-black">
                      WHAT TO IMPROVE?
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {GOALS.map((goal) => {
                      const isSelected = selectedGoals.includes(goal);
                      return (
                        <button
                          key={goal}
                          onClick={() => toggleGoal(goal)}
                          className={`p-4 rounded-xl border-2 border-black flex items-center gap-3 transition-all ${
                            isSelected 
                              ? 'bg-[#D2E823] translate-x-0.5 translate-y-0.5 shadow-none' 
                              : 'bg-white hover:bg-[#D2E823]/10 hover:translate-x-[-1px] hover:translate-y-[-1px] shadow-[2px_2px_0px_0px_#09090B] text-black'
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 shrink-0 text-black" />
                          ) : (
                            <Square className="w-5 h-5 shrink-0 text-black opacity-40" />
                          )}
                          <span className="font-mono font-bold text-xs tracking-tight text-black">{goal}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom buttons */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t-2 border-neutral-100">
              <button 
                onClick={handlePrev}
                className="border-2 border-black bg-[#09090B] text-white px-6 py-3 rounded-xl font-bold font-mono text-xs uppercase hover:bg-neutral-800 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000]"
              >
                <ArrowLeft className="w-4 h-4" /> BACK
              </button>
              
              <button 
                onClick={handleNext}
                disabled={currentStep === 4 && selectedGoals.length === 0}
                className={`border-2 border-black bg-[#D2E823] text-black px-8 py-3.5 rounded-xl font-display text-xs uppercase hover:bg-[#e5fc28] active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {currentStep === totalSteps ? 'FINISH PROFILE' : 'NEXT STEP'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
