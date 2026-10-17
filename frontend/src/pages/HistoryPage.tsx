import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, FileText, ArrowRight } from 'lucide-react';

interface HistoryPageProps {
  onSelectAnalysis: (analysis: any) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectAnalysis }) => {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [triageFilter, setTriageFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const res = await fetch('/api/analyses');
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = analyses.filter((a) => {
    const matchesSearch =
      a.id.toString().includes(searchQuery) ||
      a.depth.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.triage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = triageFilter === 'all' || a.triage.toLowerCase() === triageFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <FileText className="w-8 h-8 text-teal-400" />
          Patient Scan History & Reports
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Search, filter, inspect past burn triage evaluations, and download PDF reports.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, depth, or triage status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="min-w-[160px]">
          <select
            value={triageFilter}
            onChange={(e) => setTriageFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Triage Results</option>
            <option value="emergency">Emergency Only</option>
            <option value="primary">Primary Care Only</option>
          </select>
        </div>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((a) => (
          <div key={a.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-slate-200">Scan #{a.id}</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                a.triage === 'EMERGENCY' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {a.triage}
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-800 bg-slate-950">
              <img src={a.image_url} alt="Scan" className="w-full h-full object-cover" />
            </div>

            <div className="text-xs space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Depth:</span>
                <span className="font-bold text-slate-100 capitalize">{a.depth?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Confidence:</span>
                <span className="font-mono text-teal-400">{(a.depth_confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span>{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => onSelectAnalysis(a)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 border border-slate-700"
              >
                <span>Full Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href={`/api/analyses/${a.id}/report`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-xl border border-teal-500/30"
                title="Download PDF Report"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
