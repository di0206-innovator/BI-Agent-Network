import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, TrendingUp, DollarSign, ArrowRight, Zap, Check } from 'lucide-react';

export default function RoiCalculator() {
  const [role, setRole] = useState('founder');
  const [teamCount, setTeamCount] = useState(4);
  const [weeklyManualHours, setWeeklyManualHours] = useState(12);

  // Calculations
  const monthlyHoursSaved = Math.round((weeklyManualHours * 4.33) * 0.75); // 75% efficiency gain with Stratify
  const hourlyRate = role === 'investor' ? 150 : (role === 'institution' ? 100 : 85);
  const annualDollarSaved = Math.round(monthlyHoursSaved * 12 * hourlyRate * (role === 'investor' ? Math.max(1, teamCount * 0.5) : Math.max(1, teamCount * 0.8)));
  const speedupMultiplier = (8.4).toFixed(1);

  return (
    <div className="w-full bg-card border border-DEFAULT rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden select-none">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-DEFAULT pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 mb-2">
            <TrendingUp size={13} className="text-accent" />
            <span className="text-[11px] font-black uppercase tracking-wider text-text-primary font-outfit">
              Quantifiable Ecosystem ROI
            </span>
          </div>
          <h3 className="font-outfit font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
            Calculate Your Efficiency & Cost Savings
          </h3>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            See how much time and capital Stratify saves your team compared to fragmented manual spreadsheets & legal audits.
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex items-center gap-1 p-1 bg-canvas border border-DEFAULT rounded-xl">
          <button
            onClick={() => setRole('founder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-outfit font-bold transition-all cursor-pointer ${
              role === 'founder' ? 'bg-accent text-[#111]' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Founder
          </button>
          <button
            onClick={() => setRole('investor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-outfit font-bold transition-all cursor-pointer ${
              role === 'investor' ? 'bg-accent text-[#111]' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Investor
          </button>
          <button
            onClick={() => setRole('institution')}
            className={`px-3 py-1.5 rounded-lg text-xs font-outfit font-bold transition-all cursor-pointer ${
              role === 'institution' ? 'bg-accent text-[#111]' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Institution
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Input Sliders */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-canvas border border-DEFAULT rounded-2xl p-5 space-y-5">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 font-outfit font-bold">
                <span className="text-text-muted">
                  {role === 'investor' ? 'Portfolio / Pipeline Companies' : (role === 'institution' ? 'Cohort Program Size' : 'Team & Advisor Members')}
                </span>
                <span className="text-accent text-sm font-black">{teamCount} {role === 'investor' ? 'Deals' : 'People'}</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={teamCount}
                onChange={(e) => setTeamCount(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 font-outfit font-bold">
                <span className="text-text-muted">Hours Spent Weekly on Manual Diligence & Reports</span>
                <span className="text-blue-400 text-sm font-black">{weeklyManualHours} Hours / wk</span>
              </div>
              <input
                type="range"
                min={2}
                max={40}
                value={weeklyManualHours}
                onChange={(e) => setWeeklyManualHours(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ROI Output Card */}
        <div className="lg:col-span-6">
          <div className="bg-surface-dark text-white rounded-2xl p-6 border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400 font-outfit">
                Estimated Annual Impact
              </span>
              <span className="px-2.5 py-0.5 bg-accent text-[#111] text-[9px] font-black uppercase rounded font-outfit">
                {speedupMultiplier}x Faster Turnaround
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1 font-outfit">
                  Hours Saved / Month
                </span>
                <span className="text-3xl font-black text-accent font-outfit">
                  ~{monthlyHoursSaved} hrs
                </span>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1 font-outfit">
                  Estimated Value / Year
                </span>
                <span className="text-3xl font-black text-white font-outfit">
                  ${(annualDollarSaved / 1000).toFixed(1)}k
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Ready to reclaim your team's execution bandwidth?
              </span>
              <Link
                to="/walkthrough"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-[#111] text-xs font-outfit font-black uppercase rounded-lg hover:opacity-90 transition-all cursor-pointer"
              >
                Book Walkthrough <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
