import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crosshair, Rocket, ShieldCheck, Activity, Gauge, Target,
} from 'lucide-react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import DiscoveryEngine from './DiscoveryEngine';
import VulnerabilityAssessment from './VulnerabilityAssessment';
import FindingsTable from './FindingsTable';
import ExecutiveReport from './ExecutiveReport';
import LiveConsole from './LiveConsole';
import BrandLogo from './BrandLogo';
import {
  DISCOVERY_TASKS, ASSESSMENT_CHECKS,
  type ConsoleLog, type Finding, type Severity, type DiscoveryResult,
} from '../data';
import type { LucideIcon } from 'lucide-react';

type Phase = 'idle' | 'discovery' | 'assessment' | 'complete';

const API_BASE_URL = 'http://localhost:8000';

const emptyCounts = (): Record<Severity, number> => ({ critical: 0, high: 0, medium: 0, low: 0, info: 0 });

interface ScanApiResponse {
  status: string;
  target: string;
  discoveryResult: DiscoveryResult;
  findings: Finding[];
}

export default function Dashboard(){
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [target, setTarget] = useState('https://target.acme-corp.com');

  // Discovery state
  const [activeTaskIndex, setActiveTaskIndex] = useState(-1);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [taskProgress, setTaskProgress] = useState(0);
  const [discoveryComplete, setDiscoveryComplete] = useState(false);
  const [discoveryCollapsed, setDiscoveryCollapsed] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);

  // Assessment state
  const [activeCheckIndex, setActiveCheckIndex] = useState(-1);
  const [completedChecks, setCompletedChecks] = useState<number[]>([]);
  const [checkProgress, setCheckProgress] = useState(0);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [assessmentExpanded, setAssessmentExpanded] = useState(false);

  // Findings
  const [findings, setFindings] = useState<Finding[]>([]);
  const [severityCounts, setSeverityCounts] = useState<Record<Severity, number>>(emptyCounts());

  // Console
  const [logs, setLogs] = useState<ConsoleLog[]>([]);

  // Report
  const [generating, setGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);

  const addLog = useCallback((level: ConsoleLog['level'], message: string) => {
    setLogs((prev) => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, timestamp: Date.now(), level, message }]);
  }, []);

  const runScan = useCallback(async (targetValue: string) => {
    setPhase('discovery');
    setActiveTaskIndex(0);
    setTaskProgress(0);
    addLog('info', `Vulnerability assessment initiated against ${targetValue}`);

    try {
      addLog('scan', `Sending scan request to ${API_BASE_URL}/api/run-simulation ...`);

      const response = await fetch(`${API_BASE_URL}/api/run-simulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: targetValue }),
      });

      if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
          const errBody = await response.json();
          if (errBody?.detail) detail = errBody.detail;
        } catch {
          // response body wasn't JSON; fall back to status text
        }
        throw new Error(detail);
      }

      const data: ScanApiResponse = await response.json();

      // Mark discovery as fully complete
      setDiscoveryResult(data.discoveryResult);
      setCompletedTasks(DISCOVERY_TASKS.map((_, idx) => idx));
      setActiveTaskIndex(DISCOVERY_TASKS.length);
      setTaskProgress(100);
      setDiscoveryComplete(true);
      setDiscoveryCollapsed(true);
      addLog('success', 'Discovery Engine complete — infrastructure fully mapped');

      // Mark assessment as fully complete
      setPhase('assessment');
      setAssessmentExpanded(true);
      setCompletedChecks(ASSESSMENT_CHECKS.map((_, idx) => idx));
      setActiveCheckIndex(ASSESSMENT_CHECKS.length);
      setCheckProgress(100);
      setAssessmentComplete(true);

      // Populate findings + severity counts from live response
      const liveFindings = data.findings || [];
      setFindings(liveFindings);
      const counts = emptyCounts();
      liveFindings.forEach((f) => {
        if (f.severity in counts) counts[f.severity] += 1;
      });
      setSeverityCounts(counts);

      liveFindings.forEach((f) => {
        addLog(f.severity === 'critical' ? 'error' : f.severity === 'high' ? 'warning' : 'info',
          `Finding: [${f.severity.toUpperCase()}] ${f.vulnerability} (CVSS ${f.cvss})`);
      });

      addLog('success', `Scan complete — ${liveFindings.length} findings identified`);
      setPhase('complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error contacting scan backend';
      addLog('error', `Scan failed: ${message}`);
      setPhase('idle');
      setActiveTaskIndex(-1);
      setDiscoveryComplete(false);
    }
  }, [addLog]);

  const handleStart = () => {
    runScan(target);
  };

  const handleGenerate = () => {
    setGenerating(true);
    addLog('info', 'Generating executive report...');
    setTimeout(() => {
      setGenerating(false);
      setReportReady(true);
      addLog('success', 'Executive report generated successfully');
    }, 2500);
  };

  const handleDownload = () => {
    addLog('success', 'Report downloaded — atlas-vulnerability-report.pdf');
  };

  const totalFindings = findings.length;
  const scanning = phase === 'discovery' || phase === 'assessment';
  const phaseLabel = phase === 'idle' ? 'Idle' : phase === 'discovery' ? 'Discovery Running' : phase === 'assessment' ? 'Assessment Running' : 'Assessment Complete';

  return (
    <div className="min-h-screen bg-surface-500 relative">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-crimson-700/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-crimson-500/5 rounded-full blur-[150px] pointer-events-none" />

      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} scanning={scanning} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[256px]'}`}>
        <TopNav scanning={scanning} phase={phaseLabel} />

        <main className="p-5 md:p-8 max-w-[1600px] mx-auto space-y-6">
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl glass-card-bright p-8 md:p-10"
          >
            {/* Watermark logo */}
            <div className="absolute -right-10 -top-10 opacity-[0.04] pointer-events-none">
              <img src="/logo.png" alt="" className="w-72 h-72 object-contain" />
            </div>
            <div className="absolute right-20 top-20 opacity-[0.03] pointer-events-none">
              <BrandLogo size={120} withGlow={false} />
            </div>

            <div className="relative z-10 max-w-2xl">
              <h1 className="font-cinzel font-700 text-3xl md:text-4xl text-crimson-100 mb-3 leading-tight">
                AI-Powered <span className="gradient-text-crimson">Vulnerability</span> Assessment
              </h1>
              <p className="text-sm text-crimson-300/60 leading-relaxed mb-6 max-w-xl">
                Initiate an automated vulnerability assessment by providing the target application URL.
              </p>

              {/* Target input */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Target size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-crimson-400/60" />
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    disabled={phase !== 'idle'}
                    className="atlas-input w-full rounded-lg pl-10 pr-4 py-3 text-sm font-mono"
                    placeholder="https://example.com"
                  />
                </div>
                <motion.button
                  whileHover={phase === 'idle' ? { scale: 1.02 } : {}}
                  whileTap={phase === 'idle' ? { scale: 0.98 } : {}}
                  onClick={handleStart}
                  disabled={phase !== 'idle'}
                  className={`btn-crimson px-6 py-3 rounded-lg text-sm font-600 text-white flex items-center justify-center gap-2 ${phase !== 'idle' ? 'opacity-40 cursor-not-allowed' : 'glow-red'}`}
                >
                  <Rocket size={16} />
                  {phase === 'idle' ? 'Start Scan' : 'Assessment in Progress...'}
                </motion.button>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <HeroStat icon={Crosshair} label="Discovery Engines" value="7" />
                <HeroStat icon={ShieldCheck} label="Security Checks" value="8" />
                <HeroStat icon={Activity} label="Assessment Status" value={phaseLabel} highlight={scanning} />
                <HeroStat icon={Gauge} label="Detected Findings" value={String(totalFindings)} />
              </div>
            </div>
          </motion.section>

          {/* Discovery + Console */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <DiscoveryEngine
                tasks={DISCOVERY_TASKS}
                activeTaskIndex={activeTaskIndex}
                completedTasks={completedTasks}
                taskProgress={taskProgress}
                discoveryComplete={discoveryComplete}
                discoveryResult={discoveryResult}
                collapsed={discoveryCollapsed && discoveryComplete}
              />
            </div>
            <div className="xl:col-span-1">
              <LiveConsole logs={logs} onClear={() => setLogs([])} active={scanning} />
            </div>
          </div>

          {/* Vulnerability Assessment */}
          <AnimatePresence>
            {assessmentExpanded && (
              <VulnerabilityAssessment
                checks={ASSESSMENT_CHECKS}
                activeCheckIndex={activeCheckIndex}
                completedChecks={completedChecks}
                checkProgress={checkProgress}
                assessmentComplete={assessmentComplete}
                findings={[]}
                severityCounts={severityCounts}
                totalFindings={totalFindings}
                expanded={assessmentExpanded}
              />
            )}
          </AnimatePresence>

          {/* Findings summary cards */}
          <AnimatePresence>
            {(assessmentComplete || findings.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
                  const metaMap: Record<string, { color: string; icon: LucideIcon }> = {
                    critical: { color: '#ff4444', icon: ShieldCheck },
                    high: { color: '#f97316', icon: Activity },
                    medium: { color: '#eab308', icon: Gauge },
                    low: { color: '#60a5fa', icon: Crosshair },
                  };
                  const meta = metaMap[sev]!;
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={sev}
                      whileHover={{ y: -2 }}
                      className="glass-card-bright rounded-xl p-4 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20" style={{ background: meta.color }} />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <Icon size={16} style={{ color: meta.color }} />
                          <span className="text-[10px] uppercase tracking-wider" style={{ color: meta.color }}>{sev}</span>
                        </div>
                        <motion.span
                          key={severityCounts[sev]}
                          initial={{ scale: 1.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-3xl font-700 font-cinzel block"
                          style={{ color: meta.color }}
                        >
                          {severityCounts[sev]}
                        </motion.span>
                        <span className="text-[10px] text-crimson-300/40 uppercase tracking-wider">vulnerabilities</span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Findings table */}
          <AnimatePresence>
            {findings.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <FindingsTable findings={findings} complete={assessmentComplete} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Executive report */}
          <AnimatePresence>
            {assessmentComplete && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <ExecutiveReport
                  findings={findings}
                  severityCounts={severityCounts}
                  totalFindings={totalFindings}
                  target={target}
                  assessmentComplete={assessmentComplete}
                  generating={generating}
                  reportReady={reportReady}
                  onGenerate={handleGenerate}
                  onDownload={handleDownload}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <footer className="pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-crimson-300/30">
            <span>ATLAS - Automated Tracing & Live Attack Simulator</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

function HeroStat({ icon: Icon, label, value, highlight }: { icon: LucideIcon; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="glass-card rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={12} className={highlight ? 'text-crimson-400' : 'text-crimson-300/40'} />
        <span className="text-[9px] uppercase tracking-wider text-crimson-300/40">{label}</span>
      </div>
      <span className={`text-sm font-600 ${highlight ? 'text-crimson-300' : 'text-crimson-100/80'}`}>{value}</span>
    </div>
  );
}