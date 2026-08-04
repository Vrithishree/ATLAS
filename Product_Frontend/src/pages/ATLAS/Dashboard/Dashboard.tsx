import { motion } from 'framer-motion';
import {
  Plus, ShieldAlert, FileText, Activity, Clock, TrendingUp,
  Crosshair, ChevronRight, AlertTriangle, CheckCircle2, Loader2,
} from 'lucide-react';
import { Card, SectionTitle, Badge, StatCard } from '../components/ui';
import { DonutChart, BarChart, Sparkline } from '../components/Charts';
import { mockAssessments, mockReports } from '../data';
import type { View, Assessment } from '../types';

interface DashboardProps {
  onStartAssessment: () => void;
  onNavigate: (view: View) => void;
  onSelectAssessment: (a: Assessment) => void;
}

export function Dashboard({ onStartAssessment, onNavigate, onSelectAssessment }: DashboardProps) {
  const recent = mockAssessments.slice(0, 4);
  const pendingPentests = mockAssessments.filter(a => a.status === 'Pending Approval');
  const recentReports = mockReports.slice(0, 4);

  const totalCritical = mockAssessments.reduce((s, a) => s + a.critical, 0);
  const totalHigh = mockAssessments.reduce((s, a) => s + a.high, 0);
  const totalMedium = mockAssessments.reduce((s, a) => s + a.medium, 0);
  const totalLow = mockAssessments.reduce((s, a) => s + a.low, 0);
  const totalVulns = totalCritical + totalHigh + totalMedium + totalLow;

  const donutSegments = [
    { label: 'Critical', value: totalCritical, color: '#ef4444' },
    { label: 'High', value: totalHigh, color: '#f97316' },
    { label: 'Medium', value: totalMedium, color: '#f59e0b' },
    { label: 'Low', value: totalLow, color: '#eab308' },
  ];

  const scanStats = [
    { label: 'Mon', value: 4 },
    { label: 'Tue', value: 7 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 9 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 2 },
    { label: 'Sun', value: 6 },
  ];

  const riskTrend = [42, 58, 51, 67, 72, 64, 78, 85, 71, 68, 74, 80];

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-crimson-500/20 bg-gradient-to-br from-surface-700/60 via-surface-800/40 to-surface-900/40"
      >
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-crimson-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="p-1 rounded-xl bg-crimson-500/10 border border-crimson-500/20">
                <img
                  src="/logo.png"
                  alt="ATLAS Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>

              <div className="flex flex-col">
                <p className="text-xs font-500 text-crimson-400/60 uppercase tracking-[0.2em]">
                  AI-Driven Security Operations
                </p>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-700 text-crimson-100 tracking-tight">
              Welcome back, <span className="gradient-text-crimson">Analyst</span>
            </h1>
            <p className="text-crimson-300/60 text-sm md:text-base leading-relaxed max-w-xl">
              ATLAS is your autonomous security intelligence system. Initiate a new assessment to discover assets,
              identify vulnerabilities, and generate executive reports — all coordinated by a single AI orchestrator.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onStartAssessment}
                className="btn-crimson px-6 py-3 flex items-center gap-2 text-sm font-600"
              >
                <Plus className="w-4 h-4" />
                Start New Assessment
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="btn-ghost px-5 py-3 flex items-center gap-2 text-sm font-500"
              >
                <FileText className="w-4 h-4" />
                View Reports
              </button>
            </div>
          </div>
          <div className="hidden md:flex shrink-0">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-crimson-500/20"
                style={{ borderTopColor: 'rgba(248,59,59,0.5)' }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 rounded-full border border-crimson-500/15"
                style={{ borderRightColor: 'rgba(248,59,59,0.4)' }}
              />
              <div className="text-center">
                <p className="text-3xl font-700 gradient-text-crimson">{totalVulns}</p>
                <p className="text-[10px] text-crimson-300/50 uppercase tracking-wider">Total Findings</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Assessments" value={mockAssessments.filter(a => a.status === 'In Progress').length} icon={<Activity className="w-5 h-5" />} delay={0.05} accent />
        <StatCard label="Pending Pentest Approvals" value={pendingPentests.length} icon={<Clock className="w-5 h-5" />} delay={0.1} />
        <StatCard label="Critical Vulnerabilities" value={totalCritical} icon={<AlertTriangle className="w-5 h-5" />} delay={0.15} />
        <StatCard label="Avg Risk Score" value="74" trend="6% this week" trendUp={false} delay={0.2} icon={<TrendingUp className="w-5 h-5" />} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assessments */}
        <Card className="lg:col-span-2 p-6">
          <SectionTitle
            icon={<Crosshair className="w-4 h-4" />}
            title="Recent Assessments"
            subtitle="Latest security assessments across your assets"
            action={
              <button onClick={() => onNavigate('reports')} className="text-xs text-crimson-400 hover:text-crimson-300 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            }
          />
          <div className="space-y-2">
            {recent.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => onSelectAssessment(a)}
                className="group flex items-center gap-4 p-3 rounded-lg hover:bg-crimson-500/5 border border-transparent hover:border-crimson-500/15 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-800/60 border border-crimson-500/10 flex items-center justify-center text-crimson-400 group-hover:bg-crimson-500/10 transition-colors">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-500 text-crimson-100 truncate">{a.target}</p>
                    <span className="text-[10px] font-mono text-crimson-300/30">{a.id}</span>
                  </div>
                  <p className="text-xs text-crimson-300/40 mt-0.5">{a.scanType} · {a.date} · {a.duration}</p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  {a.critical > 0 && <Badge variant="critical">{a.critical} C</Badge>}
                  {a.high > 0 && <Badge variant="high">{a.high} H</Badge>}
                  {a.medium > 0 && <Badge variant="medium">{a.medium} M</Badge>}
                </div>
                <StatusBadge status={a.status} />
                <ChevronRight className="w-4 h-4 text-crimson-300/30 group-hover:text-crimson-300 transition-colors" />
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Risk Overview */}
        <Card className="p-6">
          <SectionTitle icon={<ShieldAlert className="w-4 h-4" />} title="Risk Overview" subtitle="Severity distribution across all assets" />
          <div className="flex flex-col items-center gap-4">
            <DonutChart segments={donutSegments} centerValue={totalVulns} centerLabel="Findings" />
            <div className="w-full space-y-2">
              {donutSegments.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-crimson-300/70">{s.label}</span>
                  </div>
                  <span className="font-mono text-crimson-200">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Pentest Requests */}
        <Card className="p-6">
          <SectionTitle icon={<Clock className="w-4 h-4" />} title="Pending Pentest Approvals" subtitle="Awaiting authorization" />
          {pendingPentests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-crimson-300/30 mb-2" />
              <p className="text-xs text-crimson-300/40">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPentests.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="p-3 rounded-lg bg-surface-800/40 border border-crimson-500/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-500 text-crimson-100 truncate">{a.target}</p>
                    <Badge variant="medium"><Loader2 className="w-3 h-3 animate-spin" /> Pending</Badge>
                  </div>
                  <p className="text-xs text-crimson-300/40 font-mono">{a.id} · {a.date}</p>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Scan Statistics */}
        <Card className="p-6">
          <SectionTitle icon={<Activity className="w-4 h-4" />} title="Scan Statistics" subtitle="Assessments run this week" />
          <div className="space-y-4">
            <BarChart data={scanStats} height={120} />
            <div className="pt-3 border-t border-crimson-500/10">
              <p className="text-xs text-crimson-300/50 mb-2">Risk Score Trend (12 weeks)</p>
              <Sparkline data={riskTrend} height={50} />
            </div>
          </div>
        </Card>

        {/* Recent Reports */}
        <Card className="p-6">
          <SectionTitle
            icon={<FileText className="w-4 h-4" />}
            title="Recent Reports"
            subtitle="Generated deliverables"
            action={
              <button onClick={() => onNavigate('reports')} className="text-xs text-crimson-400 hover:text-crimson-300 flex items-center gap-1 transition-colors">
                All <ChevronRight className="w-3 h-3" />
              </button>
            }
          />
          <div className="space-y-2">
            {recentReports.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-crimson-500/5 transition-colors cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-surface-800/60 border border-crimson-500/10 flex items-center justify-center text-crimson-400/60 group-hover:text-crimson-400 transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-crimson-100 truncate">{r.target}</p>
                  <p className="text-[10px] text-crimson-300/40 font-mono">{r.type} · {r.format} · {r.size}</p>
                </div>
                <span className="text-[10px] text-crimson-300/30 font-mono">{r.date}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Assessment['status'] }) {
  const map: Record<string, { variant: 'success' | 'medium' | 'default' | 'critical'; icon?: React.ReactNode }> = {
    'Completed': { variant: 'success', icon: <CheckCircle2 className="w-3 h-3" /> },
    'In Progress': { variant: 'medium' },
    'Pending Approval': { variant: 'default' },
    'Failed': { variant: 'critical' },
    'Queued': { variant: 'default' },
  };
  const cfg = map[status] ?? { variant: 'default' as const };
  return <Badge variant={cfg.variant}>{cfg.icon}{status}</Badge>;
}
