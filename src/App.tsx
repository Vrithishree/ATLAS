import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TopNav } from './pages/ATLAS/components/TopNav';
import { ApprovalModal } from './pages/ATLAS/components/ApprovalModal';
import { Dashboard } from './pages/ATLAS/Dashboard/Dashboard';
import { AssessmentWorkspace } from './pages/ATLAS/AssessmentWorkspace/VulnerabilityAssessment';
import { PentestConsole } from './pages/ATLAS/Pentest/PentestConsole';
import { RiskAnalysis } from './pages/ATLAS/RiskAnalysis/RiskAnalysis';
import { Reports } from './pages/ATLAS/Reports/Reports';
import { mockVulnerabilities } from './pages/ATLAS/data';
import type { View, Vulnerability } from './pages/ATLAS/types';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [assessmentActive, setAssessmentActive] = useState(false);
  const [pentestActive, setPentestActive] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [vulns, setVulns] = useState<Vulnerability[]>(mockVulnerabilities);

  const handleStartAssessment = () => {
    setAssessmentActive(true);
    setView('assessment');
  };

  const handleAssessmentComplete = (results: Vulnerability[]) => {
    setVulns(results);
  };

  const handlePentestChoice = (choice: 'request' | 'skip') => {
    if (choice === 'request') {
      setApprovalOpen(true);
    } else {
      setView('risk');
    }
  };

  const handleApprovalGranted = () => {
    setApprovalOpen(false);
    setPentestActive(true);
    setView('pentest');
  };

  const handlePentestComplete = () => {
    setView('risk');
  };

  const handleNavigate = (next: View) => {
    if (next === 'pentest' && !pentestActive) return;
    setView(next);
  };

  return (
    <div className="min-h-screen bg-surface-900 text-crimson-100">
      <TopNav
        view={view}
        onNavigate={handleNavigate}
        assessmentActive={assessmentActive}
        pentestActive={pentestActive}
      />

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {view === 'dashboard' && (
              <Dashboard
                onStartAssessment={handleStartAssessment}
                onNavigate={handleNavigate}
                onSelectAssessment={() => setView('risk')}
              />
            )}
            {view === 'assessment' && (
              <AssessmentWorkspace
                onComplete={handleAssessmentComplete}
                onPentestChoice={handlePentestChoice}
              />
            )}
            {view === 'pentest' && (
              <PentestConsole onComplete={handlePentestComplete} />
            )}
            {view === 'risk' && (
              <RiskAnalysis vulnerabilities={vulns} />
            )}
            {view === 'reports' && <Reports />}
          </motion.div>
        </AnimatePresence>
      </main>

      <ApprovalModal
        open={approvalOpen}
        onClose={() => setApprovalOpen(false)}
        onGranted={handleApprovalGranted}
      />
    </div>
  );
}

export default App;
