import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, FileText, Activity, Zap, Layers, MapPin, Target, TrendingUp, BookOpen, ShieldCheck, X } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const COMMAND_ITEMS = [
    { id: 'dash', title: 'Workspace Dashboard', desc: 'Main role-based mission control', category: 'Navigation', icon: Compass, link: '/dashboard' },
    { id: 'graph', title: 'Startup Knowledge Graph', desc: 'Explore connected startup ecosystem nodes', category: 'Navigation', icon: Layers, link: '/explore' },
    { id: 'feed', title: 'Proof-of-Execution Feed', desc: 'Builder milestone updates and proof-of-work', category: 'Navigation', icon: Zap, link: '/feed' },
    { id: 'intel', title: 'Strategic Intelligence & Briefs', desc: 'Multi-agent AI reports & pitch briefs', category: 'Navigation', icon: FileText, link: '/intelligence' },
    { id: 'signals', title: 'Ecosystem Market Signals', desc: 'Macro news, regulatory, & VC signals', category: 'Navigation', icon: Activity, link: '/signals' },
    { id: 'grants', title: 'Capital & Grants Directory', desc: 'Institutional grants & sovereign funds', category: 'Navigation', icon: Target, link: '/opportunities' },
    { id: 'runway', title: 'Runway & Burn Simulator', desc: '12-month burn scenarios & runway planning', category: 'Tools', icon: TrendingUp, link: '/runway' },
    { id: 'equity', title: 'Equity Cap Table Planner', desc: 'Co-founder split & dilution modeler', category: 'Tools', icon: Target, link: '/equity' },
    { id: 'bounties', title: 'Micro Bounty Board', desc: 'Outsource small builder tasks', category: 'Tools', icon: Zap, link: '/bounties' },
    { id: 'memory', title: 'Founder Memory Store', desc: 'Log pivots and validated hypotheses', category: 'Tools', icon: BookOpen, link: '/memory' },
    { id: 'settings', title: 'Account Settings', desc: 'Configure profile & security settings', category: 'Settings', icon: ShieldCheck, link: '/settings' },
  ];

  const filteredItems = COMMAND_ITEMS.filter(item => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(term) ||
      item.desc.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open trigger
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (item) => {
    onClose();
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-fade-in">
      <div 
        className="bg-card border border-light w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-light flex items-center gap-3 bg-canvas select-none">
          <Search size={18} className="text-text-muted shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a command or search (e.g. Intelligence, Runway, Feed)..."
            className="w-full bg-transparent text-sm font-outfit font-semibold text-text-primary placeholder-text-muted focus:outline-none"
          />
          <span className="text-[10px] font-mono font-bold bg-hover px-2 py-1 rounded text-text-muted border border-light">
            ESC
          </span>
          <button 
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-primary rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 p-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected ? 'bg-accent/20 border border-[#C8E64A]/30 text-text-primary' : 'hover:bg-hover text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-black text-[#C8E64A]' : 'bg-canvas text-text-muted'}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 className="font-outfit font-bold text-xs leading-snug">{item.title}</h4>
                      <p className="text-[11px] text-text-secondary font-light">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-hover border border-light px-2 py-0.5 rounded text-text-muted">
                    {item.category}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-text-muted select-none">
              <p className="text-xs font-semibold uppercase font-outfit">No matching commands found</p>
              <p className="text-[11px] mt-1">Try searching for "Dashboard", "Signals", or "Runway".</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-canvas border-t border-light px-4 py-2.5 flex items-center justify-between text-[10px] text-text-muted select-none font-outfit">
          <span>Navigate with <kbd className="font-mono bg-card px-1 rounded border">↑</kbd> <kbd className="font-mono bg-card px-1 rounded border">↓</kbd></span>
          <span>Open with <kbd className="font-mono bg-card px-1 rounded border">Cmd+K</kbd></span>
        </div>
      </div>
    </div>
  );
}
