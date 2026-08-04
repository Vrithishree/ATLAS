import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, Download, Eye, X, Filter, FileJson, Code2,
  Calendar, ShieldAlert, ChevronRight, CheckCircle2,
} from 'lucide-react';
import { Card, SectionTitle, Badge } from '../components/ui';
import { mockAssessments, mockReports } from '../data';
import type { Report } from '../types';

type FormatFilter = 'All' | 'PDF' | 'JSON' | 'SARIF';
type TypeFilter = 'All' | 'Executive' | 'Technical' | 'Compliance';

export function Reports() {
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('All');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [previewReport, setPreviewReport] = useState<Report | null>(null);

  const filtered = useMemo(() => {
    return mockReports.filter(r => {
      const matchSearch = r.target.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
      const matchFormat = formatFilter === 'All' || r.format === formatFilter;
      const matchType = typeFilter === 'All' || r.type === typeFilter;
      return matchSearch && matchFormat && matchType;
    });
  }, [search, formatFilter, typeFilter]);

  const formatOptions: FormatFilter[] = ['All', 'PDF', 'JSON', 'SARIF'];
  const typeOptions: TypeFilter[] = ['All', 'Executive', 'Technical', 'Compliance'];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-crimson-500/10 border border-crimson-500/20 flex items-center justify-center text-crimson-400">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-700 text-crimson-100">Reports</h1>
          <p className="text-sm text-crimson-300/50">Assessment history and generated deliverables</p>
        </div>
      </div>

      {/* Assessment History */}
      <Card className="p-6">
        <SectionTitle icon={<ShieldAlert className="w-4 h-4" />} title="Assessment History" subtitle="All security assessments run through ATLAS" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-crimson-500/10">
                <th className="pb-3 text-xs font-500 text-crimson-300/50 uppercase tracking-wider">Assessment</th>
                <th className="pb-3 text-xs font-500 text-crimson-300/50 uppercase tracking-wider">Target</th>
                <th className="pb-3 text-xs font-500 text-crimson-300/50 uppercase tracking-wider">Type</th>
                <th className="pb-3 text-xs font-500 text-crimson-300/50 uppercase tracking-wider">Date</th>
                <th className="pb-3 text-xs font-500 text-crimson-300/50 uppercase tracking-wider">Findings</th>
                <th className="pb-3 text-xs font-500 text-crimson-300/50 uppercase tracking-wider">Status</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crimson-500/5">
              {mockAssessments.map((a, i) => (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-crimson-500/5 transition-colors group"
                >
                  <td className="py-3">
                    <span className="text-xs font-mono text-crimson-300/40">{a.id}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-sm text-crimson-100 font-mono">{a.target}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-crimson-300/60">{a.scanType}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-crimson-300/50 font-mono flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />{a.date}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      {a.critical > 0 && <span className="text-xs text-red-300 font-mono">{a.critical}C</span>}
                      {a.high > 0 && <span className="text-xs text-orange-300 font-mono">{a.high}H</span>}
                      {a.medium > 0 && <span className="text-xs text-amber-300 font-mono">{a.medium}M</span>}
                      {a.low > 0 && <span className="text-xs text-yellow-200 font-mono">{a.low}L</span>}
                      {(a.critical + a.high + a.medium + a.low) === 0 && <span className="text-xs text-crimson-300/30">—</span>}
                    </div>
                  </td>
                  <td className="py-3">
                    {a.status === 'Completed' && <Badge variant="success"><CheckCircle2 className="w-3 h-3" />{a.status}</Badge>}
                    {a.status === 'In Progress' && <Badge variant="medium">{a.status}</Badge>}
                    {a.status === 'Pending Approval' && <Badge>{a.status}</Badge>}
                  </td>
                  <td className="py-3 text-right">
                    <ChevronRight className="w-4 h-4 text-crimson-300/30 group-hover:text-crimson-300 transition-colors inline-block" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Generated Reports */}
      <Card className="p-6">
        <SectionTitle icon={<FileText className="w-4 h-4" />} title="Generated Reports" subtitle="Search, filter, and download deliverables" />

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-crimson-400/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by target or report ID..."
              className="atlas-input w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-crimson-400/40" />
            <div className="flex gap-1">
              {formatOptions.map(f => (
                <button
                  key={f}
                  onClick={() => setFormatFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-500 transition-colors ${
                    formatFilter === f ? 'bg-crimson-500/15 text-crimson-200 border border-crimson-500/30' : 'text-crimson-300/40 hover:text-crimson-300 border border-transparent'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-crimson-500/10" />
            <div className="flex gap-1">
              {typeOptions.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-500 transition-colors ${
                    typeFilter === t ? 'bg-crimson-500/15 text-crimson-200 border border-crimson-500/30' : 'text-crimson-300/40 hover:text-crimson-300 border border-transparent'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-8 h-8 text-crimson-300/20 mb-2" />
            <p className="text-sm text-crimson-300/40">No reports match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group p-4 rounded-xl glass-card glass-card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-800/60 border border-crimson-500/10 flex items-center justify-center text-crimson-400/60 group-hover:text-crimson-400 group-hover:bg-crimson-500/10 transition-colors">
                    {r.format === 'PDF' ? <FileText className="w-5 h-5" /> : r.format === 'JSON' ? <FileJson className="w-5 h-5" /> : <Code2 className="w-5 h-5" />}
                  </div>
                  <Badge>{r.format}</Badge>
                </div>
                <p className="text-sm font-600 text-crimson-100 truncate">{r.target}</p>
                <p className="text-xs text-crimson-300/40 font-mono mt-0.5">{r.id} · {r.type}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-crimson-500/10">
                  <span className="text-[10px] text-crimson-300/30 font-mono">{r.date} · {r.size}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewReport(r)}
                      className="p-1.5 rounded-md text-crimson-300/40 hover:text-crimson-300 hover:bg-crimson-500/10 transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 rounded-md text-crimson-300/40 hover:text-crimson-300 hover:bg-crimson-500/10 transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewReport(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-thin"
            >
              <Card className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-crimson-500/10 border border-crimson-500/20 flex items-center justify-center text-crimson-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-700 text-crimson-100">{previewReport.target}</h3>
                      <p className="text-xs text-crimson-300/40 font-mono">{previewReport.id} · {previewReport.type} · {previewReport.format}</p>
                    </div>
                  </div>
                  <button onClick={() => setPreviewReport(null)} className="text-crimson-300/40 hover:text-crimson-300 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-sm text-crimson-200/80 leading-relaxed">
                  <div className="p-4 rounded-lg bg-surface-800/40 border border-crimson-500/10">
                    <p className="text-xs font-500 text-crimson-400/60 uppercase tracking-wider mb-2">Executive Summary</p>
                    <p>
                      This report documents the findings of an automated security assessment conducted by ATLAS against
                      {' '}<span className="text-crimson-100 font-mono">{previewReport.target}</span>. The assessment
                      identified multiple vulnerabilities across the target surface, with recommendations for remediation
                      prioritized by business impact and threat intelligence correlation.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-surface-800/40 border border-crimson-500/10 text-center">
                      <p className="text-2xl font-700 text-red-300">2</p>
                      <p className="text-xs text-crimson-300/40 uppercase">Critical</p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-800/40 border border-crimson-500/10 text-center">
                      <p className="text-2xl font-700 text-orange-300">5</p>
                      <p className="text-xs text-crimson-300/40 uppercase">High</p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-800/40 border border-crimson-500/10 text-center">
                      <p className="text-2xl font-700 text-amber-300">11</p>
                      <p className="text-xs text-crimson-300/40 uppercase">Medium</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-800/40 border border-crimson-500/10">
                    <p className="text-xs font-500 text-crimson-400/60 uppercase tracking-wider mb-2">Key Recommendations</p>
                    <ul className="space-y-1.5 text-xs">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" /> Remediate SQL Injection in authentication endpoint immediately</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" /> Rotate JWT signing keys and migrate to asymmetric signing</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" /> Implement output encoding to prevent stored XSS</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" /> Enforce authorization checks on all object access endpoints</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-crimson-500/10">
                  <button className="btn-crimson px-4 py-2 flex items-center gap-2 text-xs font-600">
                    <Download className="w-3.5 h-3.5" /> Download {previewReport.format}
                  </button>
                  <span className="text-xs text-crimson-300/30 font-mono">{previewReport.size}</span>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
