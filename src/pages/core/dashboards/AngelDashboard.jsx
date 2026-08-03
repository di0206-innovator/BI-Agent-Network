import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Search, Compass, Users, TrendingUp, ArrowRight, Zap, Target, Award, Rocket, MapPin
} from 'lucide-react';

export default function AngelDashboard({ founderProfile, user }) {
  const [emergingStartups, setEmergingStartups] = useState([]);
  const [studentFounders, setStudentFounders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTag, setFilterTag] = useState('all'); // 'all', 'student', 'local', 'early_traction'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/explore/startups?limit=20');
        if (res.ok) {
          const data = await res.json();
          const all = data.startups || [];
          setEmergingStartups(all.filter(s => s.stage === 'idea' || s.stage === 'mvp' || s.stage === 'pre_seed'));
          setStudentFounders(all.filter(s => (s.pitch || '').toLowerCase().includes('university') || (s.pitch || '').toLowerCase().includes('student') || s.stage === 'idea'));
        }
      } catch (err) {
        console.error('Failed to load Angel discovery data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayedStartups = emergingStartups.filter(s => {
    if (filterTag === 'student') return (s.pitch || '').toLowerCase().includes('student') || (s.pitch || '').toLowerCase().includes('college') || s.stage === 'idea';
    if (filterTag === 'local') return (s.geography || '').toLowerCase().includes((founderProfile.geography || '').toLowerCase()) || true;
    if (filterTag === 'early_traction') return s.stage === 'mvp' || s.stage === 'pre_seed';
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10 space-y-8 animate-fade-in text-text-primary">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-light">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <span className="px-2.5 py-1 bg-accent/20 border border-[#C8E64A]/30 text-text-primary text-[10px] font-bold uppercase rounded tracking-wider font-outfit">
              Angel OS • Discovery Engine
            </span>
            <span className="text-xs font-semibold text-text-muted">Early Stage Radar Active</span>
          </div>
          <h1 className="text-3xl font-outfit font-black tracking-tight text-text-primary">
            {founderProfile.name || 'Angel Investor'}
          </h1>
          <p className="text-text-secondary mt-2 max-w-xl text-sm leading-relaxed">
            Discover student founders, pre-seed innovation, regional syndicates, and high-growth early traction startups before traditional VCs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/explore" className="os-btn-primary">
            <Search size={16} /> Explore All Startups
          </Link>
        </div>
      </div>

      {/* Stats Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 select-none">
        <div className="os-card bg-card p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase text-text-muted tracking-wider mb-1">Student & Campus Radar</p>
            <h3 className="text-2xl font-outfit font-black text-text-primary">{studentFounders.length} <span className="text-xs text-text-muted font-light">Teams</span></h3>
          </div>
          <div className="w-9 h-9 rounded-full bg-accent/15 border border-[#C8E64A]/30 flex items-center justify-center text-text-primary">
            <Sparkles size={16} />
          </div>
        </div>

        <div className="os-card bg-card p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase text-text-muted tracking-wider mb-1">Pre-Seed Pipeline</p>
            <h3 className="text-2xl font-outfit font-black text-text-primary">{emergingStartups.length} <span className="text-xs text-text-muted font-light">Startups</span></h3>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
            <Rocket size={16} />
          </div>
        </div>

        <div className="os-card bg-card p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase text-text-muted tracking-wider mb-1">Local Innovation</p>
            <h3 className="text-2xl font-outfit font-black text-text-primary">{founderProfile.geography || 'Global'}</h3>
          </div>
          <div className="w-9 h-9 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <MapPin size={16} />
          </div>
        </div>

        <div className="os-card bg-card p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase text-text-muted tracking-wider mb-1">Active Syndicates</p>
            <h3 className="text-2xl font-outfit font-black text-text-primary">3 <span className="text-xs text-text-muted font-light">Co-invest</span></h3>
          </div>
          <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500">
            <Users size={16} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Angel Focus & Syndicates */}
        <div className="lg:col-span-1 space-y-6">
          <div className="os-card bg-[#1A1A1A] text-white border-0 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <Zap size={120} />
            </div>
            <div className="relative z-10 space-y-3">
              <span className="px-2 py-0.5 bg-accent text-[#111] font-outfit font-black text-[9px] uppercase tracking-wider rounded">
                Early Stage Angel Advantage
              </span>
              <h3 className="font-outfit font-bold text-lg text-white">Campus & Student Founders</h3>
              <p className="text-text-muted text-xs leading-relaxed">
                Back ambitious technical founders building MVPs at universities and accelerators before seed valuation spikes.
              </p>
              <Link to="/explore" className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-[#111] font-semibold text-xs rounded hover:bg-accent-hover transition-colors shadow-sm">
                View Campus Radar <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="os-card p-0 overflow-hidden flex flex-col">
            <div className="bg-canvas px-4 py-3.5 border-b border-light flex items-center gap-2">
              <Compass size={16} className="text-text-muted" />
              <h3 className="font-outfit font-bold text-sm">Angel Discovery Tools</h3>
            </div>
            <div className="divide-y divide-gray-200/60">
              <ModuleLink to="/explore" icon={Search} title="Emerging Startup Directory" desc="Filter pre-seed & campus startups" />
              <ModuleLink to="/signals" icon={TrendingUp} title="Early Traction Signals" desc="Monitor first 100 customer wins" />
              <ModuleLink to="/bounties" icon={Award} title="Micro-Syndicate Bounties" desc="Fund micro-grants for shipping" />
            </div>
          </div>
        </div>

        {/* Right Column: Emerging Startup Radar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="os-card min-h-[400px] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-light">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-text-muted" />
                <h3 className="font-outfit font-bold text-base text-text-primary">
                  Early Discovery Radar ({displayedStartups.length})
                </h3>
              </div>

              {/* Discovery Tag Filters */}
              <div className="flex flex-wrap gap-1.5 select-none">
                {[
                  { id: 'all', label: 'All Pre-Seed' },
                  { id: 'student', label: '🎓 Student / Campus' },
                  { id: 'early_traction', label: '⚡ MVP / Traction' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFilterTag(t.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                      filterTag === t.id
                        ? 'bg-accent text-[#111]'
                        : 'bg-hover text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : displayedStartups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedStartups.map(startup => (
                  <Link 
                    key={startup.id} 
                    to={`/startups/${startup.id}`} 
                    className="border border-gray-250 rounded-lg p-5 hover:border-DEFAULT transition-all cursor-pointer bg-card flex flex-col justify-between group shadow-sm hover:shadow-md text-left"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-outfit font-bold text-sm text-text-primary group-hover:underline leading-snug">{startup.name}</h4>
                        <span className="px-2 py-0.5 bg-accent/20 border border-[#C8E64A]/30 text-text-primary text-[9px] font-black uppercase rounded-md">
                          {startup.stage}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-3 mb-4 leading-relaxed font-light font-inter">{startup.pitch}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-light select-none">
                      <span className="px-2 py-0.5 bg-hover border border-light text-text-secondary text-[9px] font-bold uppercase rounded-md">
                        {startup.industry || 'Tech'}
                      </span>
                      <span className="px-2 py-0.5 bg-hover border border-light text-text-secondary text-[9px] font-bold uppercase rounded-md">
                        📍 {startup.geography || 'Global'}
                      </span>
                      <span className="ml-auto text-xs font-bold text-text-primary group-hover:translate-x-0.5 transition-transform">
                        Explore →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className="w-12 h-12 bg-hover rounded-full flex items-center justify-center mb-4">
                  <Sparkles size={20} className="text-text-muted" />
                </div>
                <h4 className="font-semibold text-text-primary mb-1">No Emerging Startups Found</h4>
                <p className="text-xs text-text-secondary max-w-sm mb-5 leading-relaxed">
                  Try switching the filter to "All Pre-Seed" or explore the complete ecosystem directory.
                </p>
                <button onClick={() => setFilterTag('all')} className="os-btn">
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function ModuleLink({ to, icon: Icon, title, desc }) {
  return (
    <Link to={to} className="group flex items-start gap-4 p-4 hover:bg-hover transition-colors">
      <div className="p-2 bg-card border border-light rounded-lg text-text-muted group-hover:text-text-primary group-hover:border-DEFAULT transition-colors">
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm text-text-primary mb-0.5 group-hover:text-text-primary transition-colors">{title}</h4>
        <p className="text-xs text-text-secondary">{desc}</p>
      </div>
    </Link>
  );
}
