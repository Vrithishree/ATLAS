export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ScanPhase = 'idle' | 'discovery' | 'assessment' | 'complete';

export interface DiscoveryTask {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface AssessmentCheck {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface Finding {
  id: string;
  severity: Severity;
  vulnerability: string;
  affectedAsset: string;
  cvss: number;
  status: 'Open' | 'Verified' | 'Confirmed';
  discoveredAt: number;
  description: string;
  evidence: string;
}

export interface ConsoleLog {
  id: string;
  timestamp: number;
  level: 'info' | 'success' | 'warning' | 'error' | 'scan';
  message: string;
}

export interface DiscoveryResult {
  dns: { hostname: string; ips: string[]; nameservers: string[] };
  ssl: { issuer: string; validFrom: string; validTo: string; protocol: string };
  ports: { port: number; service: string; state: string }[];
  technologies: string[];
  services: { name: string; version: string }[];
  apis: string[];
  endpoints: string[];
}

export const DISCOVERY_TASKS: DiscoveryTask[] = [
  { id: 'dns', label: 'DNS Enumeration', description: 'Resolving hostnames and nameservers', icon: 'Globe' },
  { id: 'ssl', label: 'SSL Detection', description: 'Analyzing certificate chain', icon: 'Lock' },
  { id: 'ports', label: 'Port Scan', description: 'Scanning 65,535 TCP ports', icon: 'Network' },
  { id: 'tech', label: 'Technology Detection', description: 'Fingerprinting stack and frameworks', icon: 'Cpu' },
  { id: 'services', label: 'Service Enumeration', description: 'Identifying running services', icon: 'Server' },
  { id: 'api', label: 'API Discovery', description: 'Mapping REST and GraphQL endpoints', icon: 'Webhook' },
  { id: 'endpoints', label: 'Endpoint Enumeration', description: 'Crawling routes and paths', icon: 'Route' },
];

export const ASSESSMENT_CHECKS: AssessmentCheck[] = [
  { id: 'owasp', label: 'OWASP Top 10 Checks', description: 'Testing against OWASP vulnerability categories', icon: 'Shield' },
  { id: 'headers', label: 'Header Analysis', description: 'Inspecting security HTTP headers', icon: 'FileText' },
  { id: 'tls', label: 'TLS Review', description: 'Evaluating TLS configuration and ciphers', icon: 'Lock' },
  { id: 'auth', label: 'Authentication Review', description: 'Testing authentication mechanisms', icon: 'KeyRound' },
  { id: 'misconfig', label: 'Misconfiguration Analysis', description: 'Detecting security misconfigurations', icon: 'Settings' },
  { id: 'deps', label: 'Dependency Scan', description: 'Scanning third-party dependencies', icon: 'Package' },
  { id: 'secrets', label: 'Secret Detection', description: 'Searching for leaked credentials', icon: 'Eye' },
  { id: 'cve', label: 'CVE Correlation', description: 'Cross-referencing CVE database', icon: 'Database' },
];

export const DISCOVERY_RESULT: DiscoveryResult = {
  dns: {
    hostname: 'target.acme-corp.com',
    ips: ['203.0.113.42', '203.0.113.43'],
    nameservers: ['ns1.acme-corp.com', 'ns2.acme-corp.com'],
  },
  ssl: {
    issuer: 'DigiCert TLS RSA SHA-256 2020 CA1',
    validFrom: '2025-11-12',
    validTo: '2026-11-17',
    protocol: 'TLS 1.3',
  },
  ports: [
    { port: 80, service: 'http', state: 'open' },
    { port: 443, service: 'https', state: 'open' },
    { port: 22, service: 'ssh', state: 'open' },
    { port: 8080, service: 'http-proxy', state: 'open' },
    { port: 5432, service: 'postgresql', state: 'filtered' },
    { port: 6379, service: 'redis', state: 'filtered' },
  ],
  technologies: ['Nginx 1.24.0', 'React 18.2.0', 'Node.js 20.10', 'Express 4.18', 'PostgreSQL 15.3', 'Redis 7.2'],
  services: [
    { name: 'nginx', version: '1.24.0' },
    { name: 'node', version: '20.10.0' },
    { name: 'postgresql', version: '15.3' },
  ],
  apis: ['/api/v1/users', '/api/v1/auth', '/api/v1/orders', '/api/v1/admin', '/graphql'],
  endpoints: ['/', '/login', '/dashboard', '/api/v1/users', '/api/v1/auth/token', '/admin', '/assets/', '/.env'],
};

export const FINDINGS_POOL: Omit<Finding, 'discoveredAt'>[] = [
  { id: 'f1', severity: 'critical', vulnerability: 'Remote Code Execution via Deserialization', affectedAsset: 'api.target.com:8080', cvss: 9.8, status: 'Confirmed', description: 'Untrusted data deserialization allows arbitrary code execution on the host.', evidence: 'POST /api/v1/import — payload executed via ObjectInputStream.readObject()' },
  { id: 'f2', severity: 'critical', vulnerability: 'SQL Injection in Authentication', affectedAsset: 'api.target.com:443', cvss: 9.1, status: 'Verified', description: 'Login form vulnerable to time-based blind SQL injection bypassing authentication.', evidence: "username=admin'-- — response 200, session issued" },
  { id: 'f3', severity: 'critical', vulnerability: 'Exposed .env File with Production Secrets', affectedAsset: 'target.com/.env', cvss: 9.4, status: 'Confirmed', description: 'Environment file publicly accessible, leaking database and API credentials.', evidence: 'GET /.env — 200 OK, DB_PASSWORD=******** exposed' },
  { id: 'f4', severity: 'high', vulnerability: 'Broken Authentication — Weak Password Policy', affectedAsset: 'target.com/login', cvss: 8.2, status: 'Verified', description: 'Password policy permits 6-character passwords without complexity requirements.', evidence: 'Account created with password "123456" accepted' },
  { id: 'f5', severity: 'high', vulnerability: 'Missing Security Headers (HSTS, CSP)', affectedAsset: 'target.com', cvss: 7.5, status: 'Open', description: 'Critical security headers absent, enabling downgrade and injection attacks.', evidence: 'Strict-Transport-Security: not present; Content-Security-Policy: not present' },
  { id: 'f6', severity: 'high', vulnerability: 'Outdated Nginx 1.24.0 — CVE-2024-7347', affectedAsset: 'target.com:443', cvss: 7.8, status: 'Confirmed', description: 'Known vulnerability in Nginx version allows HTTP/3 request smuggling.', evidence: 'Matched CVE-2024-7347 in NVD, CVSS 7.8' },
  { id: 'f7', severity: 'medium', vulnerability: 'TLS 1.0 and 1.1 Supported', affectedAsset: 'target.com:443', cvss: 6.5, status: 'Open', description: 'Deprecated TLS protocols enabled, exposing connections to downgrade attacks.', evidence: 'nmap --script ssl-enum-protocols: TLSv1.0 enabled' },
  { id: 'f8', severity: 'medium', vulnerability: 'Verbose Error Messages Exposed', affectedAsset: 'api.target.com:8080', cvss: 5.3, status: 'Open', description: 'Stack traces and internal paths disclosed in error responses.', evidence: 'GET /api/v1/unknown — 500 with full stack trace' },
  { id: 'f9', severity: 'medium', vulnerability: 'Missing Rate Limiting on Login', affectedAsset: 'target.com/login', cvss: 6.2, status: 'Verified', description: 'No rate limiting enforced, enabling brute-force credential attacks.', evidence: '100 login attempts in 10s — no 429 response' },
  { id: 'f10', severity: 'medium', vulnerability: 'Redis Port Exposed to Internet', affectedAsset: 'target.com:6379', cvss: 6.8, status: 'Open', description: 'Redis service filtered but reachable from external networks.', evidence: 'Port 6379 filtered, not blocked by firewall' },
  { id: 'f11', severity: 'low', vulnerability: 'Cookie Without Secure Flag', affectedAsset: 'target.com', cvss: 3.7, status: 'Open', description: 'Session cookie transmitted over unencrypted connections.', evidence: 'Set-Cookie: session=abc; HttpOnly (missing Secure)' },
  { id: 'f12', severity: 'low', vulnerability: 'X-Frame-Options Not Set', affectedAsset: 'target.com', cvss: 4.3, status: 'Open', description: 'Clickjacking protection header absent.', evidence: 'X-Frame-Options: not present in response' },
  { id: 'f13', severity: 'low', vulnerability: 'Information Disclosure — Server Header', affectedAsset: 'target.com:443', cvss: 2.4, status: 'Open', description: 'Server header reveals exact software version.', evidence: 'Server: nginx/1.24.0' },
  { id: 'f14', severity: 'info', vulnerability: 'DNS CAA Record Not Configured', affectedAsset: 'target.com', cvss: 0.0, status: 'Open', description: 'No CAA record restricts which CAs may issue certificates.', evidence: 'dig target.com CAA — no answer' },
];

export const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string; ring: string }> = {
  critical: { label: 'Critical', color: '#ff4444', bg: 'rgba(220, 28, 28, 0.15)', ring: '#dc1c1c' },
  high: { label: 'High', color: '#f97316', bg: 'rgba(234, 88, 12, 0.15)', ring: '#ea580c' },
  medium: { label: 'Medium', color: '#eab308', bg: 'rgba(202, 138, 4, 0.15)', ring: '#ca8a04' },
  low: { label: 'Low', color: '#60a5fa', bg: 'rgba(37, 99, 235, 0.15)', ring: '#2563eb' },
  info: { label: 'Info', color: '#22d3ee', bg: 'rgba(6, 182, 212, 0.15)', ring: '#06b6d4' },
};
