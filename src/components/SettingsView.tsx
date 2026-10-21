import {
  AlertCircle,
  CheckCircle2,
  Database,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

interface SettingsViewProps {
  onResetSeed: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetSeed }) => {
  const [skills, setSkills] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDictionary();
  }, []);

  const loadDictionary = async () => {
    try {
      const data = await api.getSkillDictionary();
      setSkills(data.skills || []);
    } catch (err) {
      console.warn('Failed to fetch dictionary:', err);
    }
  };

  const filteredSkills = skills.filter(
    s =>
      s.canonicalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.aliases.some((a: string) => a.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#293149] pb-4">
        <h2 className="text-xl font-extrabold text-[#F8FAFC]">System Preferences & Configuration</h2>
        <p className="text-xs text-[#A7B0C0] mt-0.5">
          Canonical skill dictionary, candidate privacy rules, and database maintenance
        </p>
      </div>

      {statusMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-[#22C55E] flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Database Maintenance Card */}
      <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/20 text-[#8B5CF6]">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">Demo Data & Database Seeding</h3>
            <p className="text-xs text-[#A7B0C0]">
              Restore the standard evaluation cohort with 6 realistic candidate resumes
            </p>
          </div>
        </div>

        <p className="text-xs text-[#A7B0C0] leading-relaxed">
          Resetting will recreate the default &quot;Java Backend Intern&quot; job profile and populate 6 realistic candidate profiles (Aditya Sharma, Priya Patel, Marcus Chen, Sneha Kulkarni, David Miller, and Elena Rostova) with pre-evaluated competition ranks.
        </p>

        <div className="pt-2">
          <button
            onClick={() => {
              onResetSeed();
              setStatusMsg('Demo candidate cohort and job profiles successfully reseeded.');
              setTimeout(() => setStatusMsg(null), 3500);
            }}
            className="flex items-center space-x-2 rounded-xl border border-[#8B5CF6]/40 bg-[#8B5CF6]/15 px-4 py-2 text-xs font-bold text-[#C4B5FD] hover:bg-[#8B5CF6] hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reseed Default Demo Cohort</span>
          </button>
        </div>
      </div>

      {/* Security & Privacy Settings */}
      <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22C55E]/20 text-[#22C55E]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">Security, Privacy & Anti-Bias Compliance</h3>
            <p className="text-xs text-[#A7B0C0]">Enforced policies for recruiter screening workflows</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#0D1326] border border-[#293149]">
            <span className="font-bold text-[#22C55E] block mb-1">Zero Protected Characteristic Bias</span>
            <p className="text-[#A7B0C0] leading-relaxed text-[11px]">
              Scoring strictly evaluates verified technical skills. Name, gender, age, photographs, and demographics are excluded from algorithm calculations.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D1326] border border-[#293149]">
            <span className="font-bold text-[#22C55E] block mb-1">Protected Local Storage</span>
            <p className="text-[#A7B0C0] leading-relaxed text-[11px]">
              Uploaded files are stored outside public static directories and assigned secure SHA-256 content hashes to prevent path traversal attacks.
            </p>
          </div>
        </div>
      </div>

      {/* Canonical Skill Dictionary Browser */}
      <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">
              Canonical Skill Dictionary & Alias Mappings ({skills.length} Loaded)
            </h3>
            <p className="text-xs text-[#A7B0C0]">
              Transparent phrase matching engine normalizes casing, versions, and aliases
            </p>
          </div>

          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A7B0C0]" />
            <input
              type="text"
              placeholder="Search skill or alias..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[#293149] bg-[#0D1326] pl-9 pr-3 py-1.5 text-xs text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
          {filteredSkills.map((sk, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#293149] bg-[#0D1326] p-3 text-xs flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8FAFC] text-sm">{sk.canonicalName}</span>
                  <span className="rounded bg-[#171D33] px-2 py-0.5 text-[10px] font-mono text-[#8B5CF6] border border-[#293149]">
                    {sk.category}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-[#A7B0C0]">
                  <span className="text-[#A7B0C0]/80 font-semibold">Aliases: </span>
                  <span>{sk.aliases.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
