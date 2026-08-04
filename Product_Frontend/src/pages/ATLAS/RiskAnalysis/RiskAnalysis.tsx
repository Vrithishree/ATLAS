import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, ChevronDown, ChevronRight, Download, FileText, FileJson,
  Network, Route, Wrench, X, Code2, Camera, FlaskConical, Brain,
  TrendingUp, CheckCircle2, AlertTriangle, Target, Zap,
} from 'lucide-react';
import { Card, SectionTitle, Badge } from '../components/ui';
import { DonutChart } from '../components/Charts';
import { SEVERITY_COLORS } from '../types';
import type { Vulnerability, Severity } from '../types';

interface RiskAnalysisProps {
  vulnerabilities: Vulnerability[];
}

type PanelType = 'graph' | 'path' | 'remediation';

export function RiskAnalysis({ vulnerabilities }: RiskAnalysisProps) {
  const [expanded, setExpanded] = useState<string | null>(vulnerabilities[0]?.id ?? null);
  const [activePanel, setActivePanel] = useState<{ type: PanelType; vuln: Vulnerability } | null>(null);

  const counts: Record<Severity, number> = {
    Critical: vulnerabilities.filter(v => v.severity === 'Critical').length,
    High: vulnerabilities.filter(v => v.severity === 'High').length,
    Medium: vulnerabilities.filter(v => v.severity === 'Medium').length,
    Low: vulnerabilities.filter(v => v.severity === 'Low').length,
    Info: 0,
  };

  const donutSegments = [
    { label: 'Critical', value: counts.Critical, color: '#ef4444' },
    { label: 'High', value: counts.High, color: '#f97316' },
    { label: 'Medium', value: counts.Medium, color: '#f59e0b' },
    { label: 'Low', value: counts.Low, color: '#eab308' },
  ];

  const avgCvss = vulnerabilities.length > 0
    ? (vulnerabilities.reduce((s, v) => s + v.cvss, 0) / vulnerabilities.length).toFixed(1)
    : '0.0';

  const sorted = [...vulnerabilities].sort((a, b) => b.cvss - a.cvss);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-crimson-500/10 border border-crimson-500/20 flex items-center justify-center text-crimson-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-700 text-crimson-100">Risk Analysis</h1>
          <p className="text-sm text-crimson-300/50">Ranked vulnerabilities with business context and threat intelligence</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <DonutChart segments={donutSegments} size={90} thickness={12} centerValue={vulnerabilities.length} centerLabel="Total" />
          <div className="space-y-1.5">
            {donutSegments.map(s => (
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-crimson-300/60">{s.label}</span>
                <span className="font-mono text-crimson-200 ml-auto">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-crimson-300/50 uppercase tracking-wider">Average CVSS</p>
          <p className="text-3xl font-700 text-crimson-100 mt-2">{avgCvss}</p>
          <div className="mt-2 h-1.5 rounded-full bg-surface-800/60 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-crimson-500 to-crimson-700" style={{ width: `${(parseFloat(avgCvss) / 10) * 100}%` }} />
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-crimson-300/50 uppercase tracking-wider">Confirmed by AI</p>
          <p className="text-3xl font-700 text-green-400 mt-2">{vulnerabilities.length}</p>
          <p className="text-xs text-crimson-300/40 mt-1">0 false positives</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-crimson-300/50 uppercase tracking-wider">Risk Score</p>
          <p className="text-3xl font-700 gradient-text-crimson mt-2">78</p>
          <p className="text-xs text-amber-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> High Risk</p>
        </Card>
      </div>

      {/* Vulnerability Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-600 text-crimson-200 uppercase tracking-wider">Ranked Vulnerabilities</h2>
          <span className="text-xs text-crimson-300/40 font-mono">{vulnerabilities.length} findings</span>
        </div>
        {sorted.map((v, i) => {
          const isOpen = expanded === v.id;
          const colors = SEVERITY_COLORS[v.severity];
          return (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className={`overflow-hidden ${isOpen ? 'border-crimson-500/25' : ''}`}>
                {/* Card Header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : v.id)}
                  className="w-full text-left p-4 flex items-center gap-4 hover:bg-crimson-500/5 transition-colors"
                >
                  <div className={`w-1.5 h-10 rounded-full ${colors.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-crimson-300/30">{v.id}</span>
                      <Badge variant={v.severity.toLowerCase() as 'critical' | 'high' | 'medium' | 'low'}>{v.severity}</Badge>
                      <span className="text-xs font-mono text-crimson-300/40">CVSS {v.cvss}</span>
                      <span className="text-xs font-mono text-crimson-300/30">·</span>
                      <span className="text-xs font-mono text-crimson-300/40">{v.cwe}</span>
                    </div>
                    <p className="text-sm font-600 text-crimson-100 mt-1.5">{v.title}</p>
                    <p className="text-xs text-crimson-300/40 mt-0.5 font-mono">{v.affected}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-crimson-300/40 uppercase">Confidence</p>
                      <p className="text-sm font-600 text-crimson-100">{v.confidence}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-crimson-300/40 uppercase">Threat Intel</p>
                      <div className="flex items-center gap-1 justify-end">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="text-xs text-green-400">Active</span>
                      </div>
                    </div>
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
                    <ChevronRight className="w-5 h-5 text-crimson-300/40" />
                  </motion.div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-crimson-500/10"
                    >
                      <div className="p-5 space-y-4 bg-surface-800/20">
                        {/* Description */}
                        <div>
                          <p className="text-xs font-500 text-crimson-400/60 uppercase tracking-wider mb-1.5">Description</p>
                          <p className="text-sm text-crimson-200/80 leading-relaxed">{v.description}</p>
                        </div>

                        {/* Impact Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-surface-800/40 border border-crimson-500/10">
                            <p className="text-xs font-500 text-crimson-400/60 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" /> Business Impact
                            </p>
                            <p className="text-xs text-crimson-200/70 leading-relaxed">{v.businessImpact}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-surface-800/40 border border-crimson-500/10">
                            <p className="text-xs font-500 text-crimson-400/60 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <Network className="w-3.5 h-3.5" /> Threat Intelligence
                            </p>
                            <p className="text-xs text-crimson-200/70 leading-relaxed">{v.threatIntel}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            onClick={() => setActivePanel({ type: 'graph', vuln: v })}
                            className="btn-ghost px-4 py-2 flex items-center gap-2 text-xs font-500"
                          >
                            <Network className="w-3.5 h-3.5" />
                            Attack Graph
                          </button>
                          <button
                            onClick={() => setActivePanel({ type: 'path', vuln: v })}
                            className="btn-ghost px-4 py-2 flex items-center gap-2 text-xs font-500"
                          >
                            <Route className="w-3.5 h-3.5" />
                            Attack Path
                          </button>
                          <button
                            onClick={() => setActivePanel({ type: 'remediation', vuln: v })}
                            className="btn-ghost px-4 py-2 flex items-center gap-2 text-xs font-500"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            Remediation
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Executive Summary & Downloads */}
      <Card className="p-6">
        <SectionTitle icon={<FileText className="w-4 h-4" />} title="Executive Summary" subtitle="Final assessment deliverable" />
        <div className="space-y-3 text-sm text-crimson-200/80 leading-relaxed">
          <p>
            ATLAS identified <span className="text-crimson-100 font-500">{vulnerabilities.length} vulnerabilities</span> with an
            average CVSS of <span className="text-crimson-100 font-500">{avgCvss}</span>. The risk landscape is dominated by
            {' '}<span className="text-red-300 font-500">{counts.Critical} critical</span> findings requiring immediate remediation.
          </p>
          <p>
            Active AI pentesting confirmed exploitation paths and discovered additional business logic flaws. Threat intelligence
            correlation indicates active exploitation of similar vulnerabilities in the wild, elevating urgency for remediation.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-crimson-500/10">
          <button className="btn-crimson px-5 py-2.5 flex items-center gap-2 text-sm font-600">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button className="btn-ghost px-5 py-2.5 flex items-center gap-2 text-sm font-500">
            <FileJson className="w-4 h-4" />
            Download JSON
          </button>
          <button className="btn-ghost px-5 py-2.5 flex items-center gap-2 text-sm font-500">
            <Code2 className="w-4 h-4" />
            Download SARIF
          </button>
        </div>
      </Card>

      {/* Side Panel */}
      <SidePanel panel={activePanel} onClose={() => setActivePanel(null)} />
    </div>
  );
}

function SidePanel({ panel, onClose }: { panel: { type: PanelType; vuln: Vulnerability } | null; onClose: () => void }) {
  const titles: Record<PanelType, { title: string; icon: typeof Network; desc: string }> = {
    graph: { title: 'Attack Graph', icon: Network, desc: 'Visualized exploitation relationships' },
    path: { title: 'Attack Path', icon: Route, desc: 'Step-by-step attack chain timeline' },
    remediation: { title: 'Remediation', icon: Wrench, desc: 'Recommended remediation actions' },
  };

  return (
    <AnimatePresence>
      {panel && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-surface-800/95 backdrop-blur-xl border-l border-crimson-500/20 overflow-y-auto scrollbar-thin"
          >
            <div className="sticky top-0 bg-surface-800/95 backdrop-blur-xl border-b border-crimson-500/10 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = titles[panel.type].icon;
                  return (
                    <div className="w-9 h-9 rounded-lg bg-crimson-500/10 border border-crimson-500/20 flex items-center justify-center text-crimson-400">
                      <Icon className="w-4 h-4" />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-sm font-700 text-crimson-100">{titles[panel.type].title}</h3>
                  <p className="text-xs text-crimson-300/40">{titles[panel.type].desc}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-crimson-300/40 hover:text-crimson-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-surface-700/40 border border-crimson-500/10">
                <p className="text-xs font-500 text-crimson-300/50 uppercase tracking-wider">Vulnerability</p>
                <p className="text-sm text-crimson-100 mt-1">{panel.vuln.title}</p>
              </div>

              {panel.type === 'graph' && <AttackGraphView vuln={panel.vuln} />}
              {panel.type === 'path' && <AttackPathView vuln={panel.vuln} />}
              {panel.type === 'remediation' && <RemediationView vuln={panel.vuln} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function AttackGraphView({ vuln }: { vuln: Vulnerability }) {
  const nodes = [
    { id: 'target', label: vuln.affected, x: 50, y: 80, color: '#f83b3b', icon: Target },
    { id: 'exploit', label: vuln.title, x: 50, y: 45, color: '#c11414', icon: Zap },
    { id: 'impact', label: 'Business Impact', x: 25, y: 15, color: '#ef4444', icon: AlertTriangle },
    { id: 'lateral', label: 'Lateral Movement', x: 75, y: 15, color: '#f97316', icon: Network },
  ];

  return (
    <div className="space-y-4">
      <div className="relative h-64 rounded-xl bg-surface-900/40 border border-crimson-500/10 overflow-hidden bg-grid">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <line x1="50%" y1="75%" x2="50%" y2="50%" stroke="#f83b3b" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
          <line x1="50%" y1="42%" x2="25%" y2="20%" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
          <line x1="50%" y1="42%" x2="75%" y2="20%" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
        </svg>
        {nodes.map((n) => {
          const Icon = n.icon;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center border"
                  style={{ backgroundColor: `${n.color}20`, borderColor: `${n.color}50`, color: n.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-crimson-300/60 max-w-[100px] text-center leading-tight">{n.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      <p className="text-xs text-crimson-300/40 leading-relaxed">
        Graph visualization shows exploitation flow from target endpoint through vulnerability to business impact and potential lateral movement.
      </p>
    </div>
  );
}

function AttackPathView({ vuln }: { vuln: Vulnerability }) {
  return (
    <div className="space-y-3">
      {vuln.attackPath.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-3"
        >
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-crimson-500/15 border border-crimson-500/30 flex items-center justify-center text-xs font-600 text-crimson-300">
              {step.step}
            </div>
            {i < vuln.attackPath.length - 1 && <div className="w-px h-8 bg-crimson-500/20 mt-1" />}
          </div>
          <div className="flex-1 pb-3">
            <p className="text-sm text-crimson-100 leading-relaxed">{step.detail}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RemediationView({ vuln }: { vuln: Vulnerability }) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
        <p className="text-xs font-500 text-green-400/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Action
        </p>
        <p className="text-sm text-crimson-100 leading-relaxed">{vuln.remediation}</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-500 text-crimson-300/50 uppercase tracking-wider">Priority Indicators</p>
        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-700/40 border border-crimson-500/10">
          <span className="text-xs text-crimson-300/60">Remediation Priority</span>
          <Badge variant="critical">Immediate</Badge>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-700/40 border border-crimson-500/10">
          <span className="text-xs text-crimson-300/60">Effort Estimate</span>
          <span className="text-xs text-crimson-200 font-mono">Medium</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-700/40 border border-crimson-500/10">
          <span className="text-xs text-crimson-300/60">Risk Reduction</span>
          <span className="text-xs text-green-400 font-mono">~85%</span>
        </div>
      </div>
    </div>
  );
}
