import React from 'react';
import { User } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  country?: string;
  address?: string;
}

interface SettingsTabProps {
  user: UserProfile;
  USERS: UserProfile[];
  handleUserSelect: (user: UserProfile) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  user,
  USERS,
  handleUserSelect
}) => {
  return (
    <div className="bg-white border-2 border-black p-8 rounded-[24px] shadow-[4px_4px_0px_0px_#09090B] space-y-6">
      <div className="border-b border-black/10 pb-4">
        <h2 className="text-2xl heading flex items-center gap-2">
          <User className="w-7 h-7 text-[#D2E823]" />
          <span className="text-black">Athlete Biometric Profiles</span>
        </h2>
        <p className="text-xs font-bold text-neutral-500 uppercase mt-1">Switch athletic models to benchmark elite professional kinetics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {USERS.map((usr) => {
          const isSelected = usr.id === user.id;
          return (
            <button
              key={usr.id}
              onClick={() => handleUserSelect(usr)}
              className={`text-left p-4 rounded-2xl border-2 border-black flex items-center justify-between transition-all cursor-pointer ${isSelected ? 'bg-[#D2E823] translate-x-1 translate-y-1 shadow-none text-black' : 'bg-white hover:bg-[#F8F4E8] hover:translate-x-0.5 hover:translate-y-0.5 text-black'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl bg-neutral-100 border border-black/10 rounded-full p-2 w-11 h-11 flex items-center justify-center">{usr.avatar}</span>
                <div>
                  <div className="font-bold text-xs uppercase font-mono text-black">{usr.name}</div>
                  <div className="text-[9px] text-neutral-500 font-mono">{usr.email}</div>
                </div>
              </div>
              
              <div className="text-right shrink-0">
                <span className="bg-[#09090B] text-[#D2E823] text-[8px] px-2 py-0.5 rounded font-mono font-bold uppercase">{usr.role}</span>
                {isSelected && <div className="text-[8px] text-black font-bold uppercase mt-1">✓ ACTIVE</div>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-[#F8F4E8] p-6 rounded-2xl border-2 border-black space-y-2">
        <h4 className="heading text-sm font-mono uppercase text-black">API Keys & Platform Status</h4>
        <p className="text-xs font-medium leading-relaxed uppercase opacity-75 text-neutral-800">All Gemini Vision and Imagen visual-generative modules are processed via server-side secure proxies. Keys are safely managed under the developer settings panel.</p>
        <div className="flex gap-2 pt-2">
          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2.5 py-1 rounded font-mono font-bold uppercase border border-emerald-300">SERVER STATUS: ONLINE</span>
          <span className="bg-indigo-100 text-indigo-800 text-[9px] px-2.5 py-1 rounded font-mono font-bold uppercase border border-indigo-300">OAUTH CLIENT: CONFIGURED</span>
        </div>
      </div>
    </div>
  );
};
