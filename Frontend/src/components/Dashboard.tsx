import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crosshair, Rocket, ShieldCheck, Activity, Gauge, Target, ArrowRight,
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
  DISCOVERY_TASKS, ASSESSMENT_CHECKS, FINDINGS_POOL, DISCOVERY_RESULT,
  type ConsoleLog, type Finding, type Severity, type DiscoveryResult,
} from '../data';
import type { LucideIcon } from 'lucide-react';

type Phase = 'idle' | 'discovery' | 'assessment' | 'complete';


const emptyCounts = (): Record<Severity, number> => ({ critical: 0, high: 0, medium: 0, low: 0, info: 0 });

const DISCOVERY_LOG_TEMPLATES: Record<string, string[]> = {
  dns: ['Resolving A records for target...', 'Querying NS records...', 'DNS resolution complete: 2 A records found'],
  ssl: ['Fetching TLS certificate chain...', 'Validating certificate issuer: DigiCert', 'TLS 1.3 detected, certificate valid'],
  ports: ['Initializing TCP SYN scan on 65,535 ports...', 'Port 80/tcp open — http', 'Port 443/tcp open — https', 'Port 22/tcp open — ssh', 'Port 8080/tcp open — http-proxy', 'Port scan complete: 4 open, 2 filtered'],
  tech: ['Fingerprinting HTTP response headers...', 'Detected: Nginx 1.24.0', 'Detected: React 18.2.0', 'Detected: Node.js 20.10', 'Detected: PostgreSQL 15.3', 'Technology fingerprinting complete'],
  services: ['Enumerating services on open ports...', 'Service on :443 → nginx 1.24.0', 'Service on :8080 → node 20.10', 'Service enumeration complete'],
  api: ['Discovering API endpoints...', 'Found: /api/v1/users', 'Found: /api/v1/auth', 'Found: /api/v1/orders', 'Found: /graphql', 'API discovery complete: 5 endpoints'],
  endpoints: ['Crawling web endpoints...', 'Found: /login', 'Found: /dashboard', 'Found: /admin', 'Found: /.env (exposed!)', 'Endpoint enumeration complete: 8 paths'],
};

const ASSESSMENT_LOG_TEMPLATES: Record<string, string[]> = {
  owasp: ['Running OWASP Top 10 checks...', 'A01: Broken Access Control — testing...', 'A03: Injection — testing...', 'A07: Identification & Auth failures — testing...', 'OWASP checks complete'],
  headers: ['Analyzing HTTP security headers...', 'Missing: Strict-Transport-Security', 'Missing: Content-Security-Policy', 'Missing: X-Frame-Options', 'Header analysis complete'],
  tls: ['Reviewing TLS configuration...', 'Warning: TLS 1.0 supported', 'Warning: TLS 1.1 supported', 'TLS review complete'],
  auth: ['Testing authentication mechanisms...', 'Weak password policy detected', 'No rate limiting on login', 'Authentication review complete'],
  misconfig: ['Scanning for misconfigurations...', 'Verbose error messages enabled', 'Server header exposes version', 'Misconfiguration analysis complete'],
  deps: ['Scanning third-party dependencies...', 'Nginx 1.24.0 — CVE-2024-7347 matched', 'Dependency scan complete'],
  secrets: ['Searching for leaked secrets...', 'CRITICAL: .env file publicly accessible', 'Secret detection complete'],
  cve: ['Correlating findings with CVE database...', 'CVE-2024-7347 (CVSS 7.8) confirmed', 'CVE correlation complete'],
};

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
  const [findingsRevealIndex, setFindingsRevealIndex] = useState(0);

  // Console
  const [logs, setLogs] = useState<ConsoleLog[]>([]);

  // Report
  const [generating, setGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);

  const timersRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const findingsPoolRef = useRef<Finding[]>([]);
  const phaseRef = useRef<Phase>('idle');
  phaseRef.current = phase;

  const addLog = useCallback((level: ConsoleLog['level'], message: string) => {
    setLogs((prev) => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, timestamp: Date.now(), level, message }]);
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach(clearInterval);
    timersRef.current = [];
  };

  const startAssessment = useCallback(() => {
    setPhase('assessment');
    setAssessmentExpanded(true);
    setActiveCheckIndex(0);
    setCheckProgress(0);
    addLog('info', 'Vulnerability Assessment initiated — 8 security checks queued');
    addLog('scan', 'Loading vulnerability signatures and CVE database...');

    let checkIdx = 0;
    const runCheck = () => {
      if (checkIdx >= ASSESSMENT_CHECKS.length) {
        setAssessmentComplete(true);
        addLog('success', 'Vulnerability Assessment complete — all checks finished');
        setPhase('complete');
        return;
      }
      setActiveCheckIndex(checkIdx);
      const check = ASSESSMENT_CHECKS[checkIdx];
      addLog('scan', `Executing: ${check.label}`);

      const templates = ASSESSMENT_LOG_TEMPLATES[check.id] || [];
      let logIdx = 0;
      let progress = 0;
      const progressTimer = setInterval(() => {
        progress += 4 + Math.random() * 6;
        if (progress >= 100) progress = 100;
        setCheckProgress(progress);
        if (logIdx < templates.length && progress > (logIdx + 1) * (100 / templates.length)) {
          const lvl = templates[logIdx].includes('CRITICAL') ? 'error' : templates[logIdx].includes('Warning') || templates[logIdx].includes('Missing') ? 'warning' : 'scan';
          addLog(lvl, templates[logIdx]);
          logIdx++;
        }
      }, 120);
      timersRef.current.push(progressTimer);

      setTimeout(() => {
        clearInterval(progressTimer);
        setCheckProgress(100);
        setCompletedChecks((prev) => [...prev, checkIdx]);
        addLog('success', `${check.label} — complete`);
        checkIdx++;
        setTimeout(runCheck, 400);
      }, 2200);
    };
    runCheck();
  }, [addLog]);

  const startDiscovery = useCallback(() => {
    setPhase('discovery');
    setActiveTaskIndex(0);
    setTaskProgress(0);
    addLog('info', `Discovery Engine started against ${target}`);
    addLog('scan', 'Initializing reconnaissance modules...');

    let taskIdx = 0;
    const runTask = () => {
      if (taskIdx >= DISCOVERY_TASKS.length) {
        setDiscoveryComplete(true);
        setDiscoveryResult(DISCOVERY_RESULT);
        setDiscoveryCollapsed(true);
        addLog('success', 'Discovery Engine complete — infrastructure fully mapped');
        addLog('info', 'Transitioning to Vulnerability Assessment...');
        setTimeout(startAssessment, 1200);
        return;
      }
      setActiveTaskIndex(taskIdx);
      const task = DISCOVERY_TASKS[taskIdx];
      addLog('scan', `Starting: ${task.label}`);

      const templates = DISCOVERY_LOG_TEMPLATES[task.id] || [];
      let logIdx = 0;
      let progress = 0;
      const progressTimer = setInterval(() => {
        progress += 3 + Math.random() * 7;
        if (progress >= 100) progress = 100;
        setTaskProgress(progress);
        if (logIdx < templates.length && progress > (logIdx + 1) * (100 / templates.length)) {
          const lvl = templates[logIdx].includes('exposed') || templates[logIdx].includes('CRITICAL') ? 'error' : templates[logIdx].includes('complete') ? 'success' : 'scan';
          addLog(lvl, templates[logIdx]);
          logIdx++;
        }
      }, 130);
      timersRef.current.push(progressTimer);

      setTimeout(() => {
        clearInterval(progressTimer);
        setTaskProgress(100);
        setCompletedTasks((prev) => [...prev, taskIdx]);
        addLog('success', `${task.label} — complete`);
        taskIdx++;
        setTimeout(runTask, 350);
      }, 2100);
    };
    runTask();
  }, [addLog, target, startAssessment]);

  // Reveal findings gradually during assessment
  useEffect(() => {
    if (phase !== 'assessment' && phase !== 'complete') return;
    if (findingsRevealIndex >= FINDINGS_POOL.length) return;
    const delay = phase === 'complete' ? 200 : 900;
    const t = setTimeout(() => {
      const pool = FINDINGS_POOL[findingsRevealIndex];
      const finding: Finding = { ...pool, discoveredAt: Date.now() };
      setFindings((prev) => [...prev, finding]);
      setSeverityCounts((prev) => ({ ...prev, [finding.severity]: prev[finding.severity] + 1 }));
      addLog(finding.severity === 'critical' ? 'error' : finding.severity === 'high' ? 'warning' : 'info',
        `Finding: [${finding.severity.toUpperCase()}] ${finding.vulnerability} (CVSS ${finding.cvss})`);
      setFindingsRevealIndex((i) => i + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [findingsRevealIndex, phase, addLog]);

  // Auto-start discovery when phase becomes discovery
  useEffect(() => {
    if (phase === 'discovery') startDiscovery();
  }, [phase, startDiscovery]);

  useEffect(() => () => clearTimers(), []);

  const handleStart = () => {
    setPhase('discovery');
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
