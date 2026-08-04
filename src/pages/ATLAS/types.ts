export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export type ScanType = 'Web Application' | 'REST API' | 'Internal Network';

export type AssessmentStatus =
  | 'Completed'
  | 'In Progress'
  | 'Pending Approval'
  | 'Failed'
  | 'Queued';

export type ApprovalState = 'Pending' | 'Granted' | 'Denied';

export interface Approver {
  name: string;
  role: string;
  state: ApprovalState;
  timestamp?: string;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity;
  cvss: number;
  confidence: number;
  cwe: string;
  affected: string;
  description: string;
  businessImpact: string;
  threatIntel: string;
  remediation: string;
  attackPath: { step: string; detail: string }[];
  evidence?: {
    request?: string;
    response?: string;
    poc?: string;
  };
}

export interface Assessment {
  id: string;
  target: string;
  scanType: ScanType;
  status: AssessmentStatus;
  date: string;
  duration: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  riskScore: number;
  hasPentest: boolean;
  vulnerabilities?: Vulnerability[];
}

export interface Report {
  id: string;
  assessmentId: string;
  target: string;
  date: string;
  format: 'PDF' | 'JSON' | 'SARIF';
  size: string;
  type: 'Executive' | 'Technical' | 'Compliance';
}

export interface LogEntry {
  id: string;
  time: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
  agent?: string;
}

export type View =
  | 'dashboard'
  | 'assessment'
  | 'pentest'
  | 'risk'
  | 'reports';

export const SEVERITY_COLORS: Record<Severity, { text: string; bg: string; border: string; dot: string }> = {
  Critical: { text: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/40', dot: 'bg-red-500' },
  High: { text: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/40', dot: 'bg-orange-500' },
  Medium: { text: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/40', dot: 'bg-amber-500' },
  Low: { text: 'text-yellow-200', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-500' },
  Info: { text: 'text-crimson-200', bg: 'bg-crimson-500/5', border: 'border-crimson-500/20', dot: 'bg-crimson-400' },
};
